# Redis Rate Limiting Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for migrating from in-memory rate limiting to a distributed Redis-based solution. This migration will enable horizontal scaling, persistent rate limit tracking across deployments, and improved resilience for the Victry application.

**Estimated Time**: 20-24 hours
**Priority**: High
**Dependencies**: None (can be implemented independently)

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technical Implementation](#technical-implementation)
3. [Migration Strategy](#migration-strategy)
4. [Redis Provider Selection](#redis-provider-selection)
5. [Monitoring & Observability](#monitoring--observability)
6. [Error Handling & Resilience](#error-handling--resilience)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Deployment Plan](#deployment-plan)
11. [Operational Procedures](#operational-procedures)
12. [Success Metrics](#success-metrics)
13. [Risk Assessment](#risk-assessment)

## Architecture Overview

### Current State
- In-memory rate limiting using Node.js Map
- State lost on server restart
- Cannot scale horizontally
- No persistence across deployments
- Limited to single instance

### Target State
- Redis-based distributed rate limiting
- Persistent state across restarts
- Horizontal scaling support
- Multi-region capability
- Real-time synchronization

### Key Components
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Server 1  │     │   API Server 2  │     │   API Server N  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Redis Cluster      │
                    │   (Rate Limit Store)    │
                    └─────────────────────────┘
```

## Technical Implementation

### 1. Interface Design

```typescript
// lib/utils/rate-limiter/types.ts
export interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export interface RateLimiter {
  checkLimit(identifier: string, config: RateLimiterConfig): Promise<RateLimitResult>;
  reset(identifier: string): Promise<void>;
  resetPattern(pattern: string): Promise<number>;
  cleanup(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

### 2. Redis Implementation

```typescript
// lib/utils/rate-limiter/redis-limiter.ts
import { Redis, Pipeline } from 'ioredis';
import { RateLimiter, RateLimiterConfig, RateLimitResult } from './types';

export class RedisRateLimiter implements RateLimiter {
  private redis: Redis;
  private readonly prefix = 'rate_limit:';
  private luaScript: string;
  private scriptSha: string | null = null;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        return targetErrors.some(e => err.message.includes(e));
      },
      enableAutoPipelining: true,
      maxRetriesPerRequest: 2,
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 10000,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      lazyConnect: true,
    });

    // Initialize Lua script for atomic operations
    this.luaScript = `
      local key = KEYS[1]
      local window_ms = tonumber(ARGV[1])
      local max_requests = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local window_start = now - window_ms
      
      -- Remove old entries outside the window
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      
      -- Count requests in current window
      local current_requests = redis.call('ZCARD', key)
      
      if current_requests < max_requests then
        -- Allow request
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
        
        local remaining = max_requests - current_requests - 1
        local reset_at = now + window_ms
        
        return {1, max_requests, remaining, reset_at, 0}
      else
        -- Deny request
        local oldest_score = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2]
        local reset_at = oldest_score and (tonumber(oldest_score) + window_ms) or (now + window_ms)
        local retry_after = math.ceil((reset_at - now) / 1000)
        
        return {0, max_requests, 0, reset_at, retry_after}
      end
    `;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('error', (err) => {
      console.error('[RedisRateLimiter] Redis error:', err);
    });

    this.redis.on('connect', () => {
      console.log('[RedisRateLimiter] Connected to Redis');
      this.loadScript();
    });

    this.redis.on('ready', () => {
      console.log('[RedisRateLimiter] Redis connection ready');
    });
  }

  private async loadScript(): Promise<void> {
    try {
      this.scriptSha = await this.redis.script('LOAD', this.luaScript);
      console.log('[RedisRateLimiter] Lua script loaded:', this.scriptSha);
    } catch (error) {
      console.error('[RedisRateLimiter] Failed to load Lua script:', error);
    }
  }

  async checkLimit(identifier: string, config: RateLimiterConfig): Promise<RateLimitResult> {
    const key = `${this.prefix}${config.keyPrefix || ''}${identifier}`;
    const now = Date.now();

    try {
      let result: [number, number, number, number, number];

      if (this.scriptSha) {
        try {
          result = await this.redis.evalsha(
            this.scriptSha,
            1,
            key,
            config.windowMs,
            config.maxRequests,
            now
          ) as [number, number, number, number, number];
        } catch (error: any) {
          if (error.message.includes('NOSCRIPT')) {
            // Script not in cache, reload it
            await this.loadScript();
            result = await this.redis.eval(
              this.luaScript,
              1,
              key,
              config.windowMs,
              config.maxRequests,
              now
            ) as [number, number, number, number, number];
          } else {
            throw error;
          }
        }
      } else {
        result = await this.redis.eval(
          this.luaScript,
          1,
          key,
          config.windowMs,
          config.maxRequests,
          now
        ) as [number, number, number, number, number];
      }

      return {
        allowed: result[0] === 1,
        limit: result[1],
        remaining: result[2],
        resetAt: new Date(result[3]),
        retryAfter: result[4] > 0 ? result[4] : undefined,
      };
    } catch (error) {
      console.error('[RedisRateLimiter] Check limit error:', error);
      throw new Error(`Rate limit check failed: ${error.message}`);
    }
  }

  async reset(identifier: string): Promise<void> {
    const pattern = `${this.prefix}*${identifier}`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
    }
  }

  async resetPattern(pattern: string): Promise<number> {
    const keys = await this.redis.keys(`${this.prefix}${pattern}`);
    
    if (keys.length === 0) return 0;

    const pipeline = this.redis.pipeline();
    keys.forEach(key => pipeline.del(key));
    const results = await pipeline.exec();
    
    return results?.length || 0;
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
```

### 3. Fallback Strategy

```typescript
// lib/utils/rate-limiter/hybrid-limiter.ts
import { RateLimiter, RateLimiterConfig, RateLimitResult } from './types';
import { RedisRateLimiter } from './redis-limiter';
import { InMemoryRateLimiter } from './in-memory-limiter';

export class HybridRateLimiter implements RateLimiter {
  private primary: RateLimiter;
  private fallback: RateLimiter;
  private primaryHealthy = true;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 seconds

  constructor(redisUrl: string) {
    this.primary = new RedisRateLimiter(redisUrl);
    this.fallback = new InMemoryRateLimiter();
    this.startHealthCheckLoop();
  }

  private startHealthCheckLoop(): void {
    setInterval(async () => {
      try {
        this.primaryHealthy = await this.primary.healthCheck();
      } catch {
        this.primaryHealthy = false;
      }
    }, this.healthCheckInterval);
  }

  async checkLimit(identifier: string, config: RateLimiterConfig): Promise<RateLimitResult> {
    // Check primary health periodically
    const now = Date.now();
    if (now - this.lastHealthCheck > this.healthCheckInterval) {
      this.lastHealthCheck = now;
      try {
        this.primaryHealthy = await this.primary.healthCheck();
      } catch {
        this.primaryHealthy = false;
      }
    }

    // Use primary if healthy
    if (this.primaryHealthy) {
      try {
        return await this.primary.checkLimit(identifier, config);
      } catch (error) {
        console.error('[HybridRateLimiter] Primary failed, falling back:', error);
        this.primaryHealthy = false;
        
        // Log to monitoring service
        await this.logFailover('primary_failure', error);
      }
    }

    // Fallback to in-memory
    console.warn('[HybridRateLimiter] Using fallback in-memory limiter');
    return this.fallback.checkLimit(identifier, config);
  }

  private async logFailover(event: string, error?: any): Promise<void> {
    // Send to monitoring service
    try {
      await fetch('/api/monitoring/rate-limiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          error: error?.message,
          stack: error?.stack,
        }),
      });
    } catch {
      // Ignore monitoring errors
    }
  }

  async reset(identifier: string): Promise<void> {
    const promises: Promise<void>[] = [];
    
    if (this.primaryHealthy) {
      promises.push(this.primary.reset(identifier));
    }
    promises.push(this.fallback.reset(identifier));
    
    await Promise.allSettled(promises);
  }

  async resetPattern(pattern: string): Promise<number> {
    let count = 0;
    
    if (this.primaryHealthy) {
      try {
        count += await this.primary.resetPattern(pattern);
      } catch {
        // Ignore primary errors
      }
    }
    
    count += await this.fallback.resetPattern(pattern);
    return count;
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      this.primary.cleanup(),
      this.fallback.cleanup(),
    ]);
  }

  async healthCheck(): Promise<boolean> {
    return this.primaryHealthy || true; // Always return true since we have fallback
  }
}
```

### 4. Factory Pattern

```typescript
// lib/utils/rate-limiter/factory.ts
import { RateLimiter } from './types';
import { HybridRateLimiter } from './hybrid-limiter';
import { InMemoryRateLimiter } from './in-memory-limiter';

let instance: RateLimiter | null = null;

export function createRateLimiter(): RateLimiter {
  if (instance) return instance;

  const redisUrl = process.env.REDIS_URL;
  const enableRedis = process.env.ENABLE_REDIS_RATE_LIMIT === 'true';

  if (redisUrl && enableRedis) {
    console.log('[RateLimiterFactory] Creating hybrid rate limiter with Redis');
    instance = new HybridRateLimiter(redisUrl);
  } else {
    console.log('[RateLimiterFactory] Creating in-memory rate limiter');
    instance = new InMemoryRateLimiter();
  }

  // Cleanup on process termination
  process.on('SIGTERM', async () => {
    if (instance) {
      await instance.cleanup();
      instance = null;
    }
  });

  return instance;
}

// Helper functions for common rate limiting scenarios
export async function checkPasswordResetRateLimit(email: string): Promise<RateLimitResult> {
  const limiter = createRateLimiter();
  return limiter.checkLimit(email, {
    windowMs: 3600000, // 1 hour
    maxRequests: 3,
    keyPrefix: 'password_reset:',
  });
}

export async function checkAPIRateLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
  const limiter = createRateLimiter();
  return limiter.checkLimit(`${userId}:${endpoint}`, {
    windowMs: 60000, // 1 minute
    maxRequests: 60,
    keyPrefix: 'api:',
  });
}

export async function checkGlobalRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = createRateLimiter();
  return limiter.checkLimit(ip, {
    windowMs: 900000, // 15 minutes
    maxRequests: 1000,
    keyPrefix: 'global:',
  });
}
```

## Migration Strategy

### Phase 1: Preparation (Week 1, Days 1-2)
1. **Environment Setup**
   - Set up Redis provider account (Upstash recommended)
   - Configure Redis connection URLs for all environments
   - Add environment variables to CI/CD

2. **Code Implementation**
   - Implement all rate limiter classes
   - Add comprehensive logging
   - Create monitoring endpoints

3. **Feature Flag Setup**
   ```bash
   # .env.local
   REDIS_URL=redis://localhost:6379
   ENABLE_REDIS_RATE_LIMIT=false
   ```

### Phase 2: Testing (Week 1, Days 3-4)
1. **Local Testing**
   - Run Redis locally via Docker
   - Test all rate limiting scenarios
   - Verify fallback behavior

2. **Staging Deployment**
   - Deploy with feature flag disabled
   - Enable for internal testing
   - Load test with k6 or similar

### Phase 3: Gradual Rollout (Week 2, Days 1-3)
1. **10% Rollout**
   ```typescript
   // middleware.ts
   const enableRedis = Math.random() < 0.1; // 10% of requests
   ```

2. **50% Rollout**
   - Monitor metrics closely
   - Check Redis connection pool
   - Verify no performance degradation

3. **100% Rollout**
   - Full production deployment
   - Continue monitoring for 48 hours

### Phase 4: Cleanup (Week 2, Days 4-5)
1. Remove feature flags
2. Remove old in-memory only implementation
3. Update documentation
4. Create runbooks

## Redis Provider Selection

### Detailed Comparison

| Feature | Upstash | Redis Cloud | Supabase Redis | Self-Hosted |
|---------|---------|-------------|----------------|-------------|
| **Pricing** | $0.2/100K commands | $50+/month | Beta (free) | Infrastructure costs |
| **Scaling** | Automatic | Manual | Limited | Manual |
| **Regions** | Global edge | 50+ regions | Limited | Your choice |
| **Persistence** | Yes | Yes | Unknown | Configurable |
| **Max Connections** | Unlimited | Based on plan | Limited | Configurable |
| **TLS** | Yes | Yes | Yes | Manual setup |
| **Monitoring** | Built-in | Advanced | Basic | DIY |
| **Backup** | Automatic | Configurable | Unknown | Manual |
| **SLA** | 99.9% | 99.99% | No SLA | N/A |

### Recommendation: Upstash

**Reasons:**
1. **Cost-effective**: Pay only for what you use
2. **Serverless**: No connection pool management
3. **Global edge**: Low latency worldwide
4. **Simple setup**: Works immediately
5. **REST API**: Fallback option available

**Configuration:**
```bash
# Upstash Redis URL format
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

## Monitoring & Observability

### 1. Metrics Collection

```typescript
// lib/utils/rate-limiter/metrics.ts
interface RateLimiterMetrics {
  requests_total: number;
  requests_allowed: number;
  requests_blocked: number;
  redis_errors: number;
  fallback_activations: number;
  latency_ms: number[];
}

export class RateLimiterMonitor {
  private metrics: RateLimiterMetrics = {
    requests_total: 0,
    requests_allowed: 0,
    requests_blocked: 0,
    redis_errors: 0,
    fallback_activations: 0,
    latency_ms: [],
  };

  async trackRequest(result: RateLimitResult, duration: number): Promise<void> {
    this.metrics.requests_total++;
    
    if (result.allowed) {
      this.metrics.requests_allowed++;
    } else {
      this.metrics.requests_blocked++;
    }
    
    this.metrics.latency_ms.push(duration);
    
    // Keep only last 1000 latency measurements
    if (this.metrics.latency_ms.length > 1000) {
      this.metrics.latency_ms.shift();
    }

    // Send to monitoring service every 100 requests
    if (this.metrics.requests_total % 100 === 0) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    const p50 = this.percentile(this.metrics.latency_ms, 0.5);
    const p95 = this.percentile(this.metrics.latency_ms, 0.95);
    const p99 = this.percentile(this.metrics.latency_ms, 0.99);

    // Send to your monitoring service
    await fetch('/api/monitoring/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'rate_limiter',
        metrics: {
          ...this.metrics,
          latency_p50: p50,
          latency_p95: p95,
          latency_p99: p99,
        },
        timestamp: new Date().toISOString(),
      }),
    });
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}
```

### 2. Dashboard Queries

```sql
-- Redis performance dashboard
SELECT 
  date_trunc('minute', timestamp) as time,
  avg(latency_p50) as p50,
  avg(latency_p95) as p95,
  avg(latency_p99) as p99,
  sum(requests_total) as total_requests,
  sum(requests_blocked) as blocked_requests,
  sum(redis_errors) as errors
FROM rate_limiter_metrics
WHERE timestamp > now() - interval '1 hour'
GROUP BY 1
ORDER BY 1 DESC;

-- Alert on high block rate
SELECT 
  sum(requests_blocked)::float / sum(requests_total) as block_rate
FROM rate_limiter_metrics
WHERE timestamp > now() - interval '5 minutes'
HAVING block_rate > 0.1; -- Alert if >10% blocked
```

### 3. Alerts Configuration

```yaml
# monitoring/alerts.yml
alerts:
  - name: high_rate_limit_blocks
    query: rate_limiter_block_rate > 0.1
    duration: 5m
    severity: warning
    
  - name: redis_connection_failures
    query: rate_limiter_redis_errors > 10
    duration: 2m
    severity: critical
    
  - name: high_rate_limiter_latency
    query: rate_limiter_latency_p99 > 50
    duration: 5m
    severity: warning
```

## Error Handling & Resilience

### 1. Circuit Breaker Pattern

```typescript
// lib/utils/rate-limiter/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private resetTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.error(`[CircuitBreaker] Opening circuit after ${this.failures} failures`);
    }
  }
}
```

### 2. Retry Strategy

```typescript
// lib/utils/rate-limiter/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 100,
    backoff = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}
```

## Security Considerations

### 1. Connection Security
```typescript
// Ensure TLS for production
const redisOptions = {
  tls: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.REDIS_CA_CERT,
  } : undefined,
};
```

### 2. Key Namespacing
```typescript
// Prevent key collisions and unauthorized access
const key = `${ENVIRONMENT}:${APPLICATION}:rate_limit:${identifier}`;
```

### 3. Input Sanitization
```typescript
function sanitizeIdentifier(identifier: string): string {
  // Remove Redis special characters
  return identifier.replace(/[*?\[\]]/g, '_');
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
// __tests__/unit/rate-limiter/redis-limiter.test.ts
import { RedisRateLimiter } from '@/lib/utils/rate-limiter/redis-limiter';
import Redis from 'ioredis-mock';

jest.mock('ioredis', () => require('ioredis-mock'));

describe('RedisRateLimiter', () => {
  let limiter: RedisRateLimiter;
  
  beforeEach(() => {
    limiter = new RedisRateLimiter('redis://localhost:6379');
  });
  
  afterEach(async () => {
    await limiter.cleanup();
  });
  
  it('should allow requests within limit', async () => {
    const result = await limiter.checkLimit('test-user', {
      windowMs: 60000,
      maxRequests: 10,
    });
    
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });
  
  it('should block requests exceeding limit', async () => {
    const config = { windowMs: 60000, maxRequests: 2 };
    
    // Exhaust limit
    await limiter.checkLimit('test-user', config);
    await limiter.checkLimit('test-user', config);
    
    // Should be blocked
    const result = await limiter.checkLimit('test-user', config);
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
  
  it('should reset limits correctly', async () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    
    // Hit limit
    await limiter.checkLimit('test-user', config);
    const blocked = await limiter.checkLimit('test-user', config);
    expect(blocked.allowed).toBe(false);
    
    // Reset
    await limiter.reset('test-user');
    
    // Should allow again
    const result = await limiter.checkLimit('test-user', config);
    expect(result.allowed).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/integration/rate-limiting.test.ts
import { createRateLimiter } from '@/lib/utils/rate-limiter/factory';
import { Redis } from 'ioredis';

describe('Rate Limiting Integration', () => {
  let redis: Redis;
  
  beforeAll(() => {
    redis = new Redis(process.env.REDIS_URL!);
  });
  
  afterAll(async () => {
    await redis.flushdb();
    await redis.quit();
  });
  
  it('should handle concurrent requests correctly', async () => {
    const limiter = createRateLimiter();
    const promises = [];
    
    // Send 20 concurrent requests
    for (let i = 0; i < 20; i++) {
      promises.push(
        limiter.checkLimit('concurrent-test', {
          windowMs: 60000,
          maxRequests: 10,
        })
      );
    }
    
    const results = await Promise.all(promises);
    const allowed = results.filter(r => r.allowed).length;
    const blocked = results.filter(r => !r.allowed).length;
    
    expect(allowed).toBe(10);
    expect(blocked).toBe(10);
  });
  
  it('should handle Redis failures gracefully', async () => {
    // Simulate Redis failure
    await redis.quit();
    
    const limiter = createRateLimiter();
    const result = await limiter.checkLimit('failover-test', {
      windowMs: 60000,
      maxRequests: 10,
    });
    
    // Should fallback to in-memory
    expect(result.allowed).toBe(true);
  });
});
```

### 3. Load Tests

```javascript
// k6/rate-limiter-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up
    { duration: '1m', target: 1000 },  // Stay at 1000 RPS
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'], // 95% of requests under 50ms
    errors: ['rate<0.1'],             // Error rate under 10%
  },
};

export default function () {
  const res = http.post('http://localhost:3000/api/auth/forgot-password', {
    email: `test-${__VU}-${__ITER}@example.com`,
  });
  
  const success = check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has rate limit headers': (r) => 
      r.headers['X-RateLimit-Limit'] && 
      r.headers['X-RateLimit-Remaining'],
  });
  
  errorRate.add(!success);
  sleep(0.1);
}
```

## Performance Optimization

### 1. Connection Pooling
```typescript
// Use connection pool for better performance
const redis = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 },
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
  },
  enableReadyCheck: true,
  maxRetriesPerRequest: 2,
});
```

### 2. Pipeline Operations
```typescript
// Batch multiple operations
async function checkMultipleIdentifiers(
  identifiers: string[],
  config: RateLimiterConfig
): Promise<RateLimitResult[]> {
  const pipeline = redis.pipeline();
  
  identifiers.forEach(id => {
    pipeline.eval(luaScript, 1, 
      `${prefix}${id}`,
      config.windowMs,
      config.maxRequests,
      Date.now()
    );
  });
  
  const results = await pipeline.exec();
  return results.map(([err, data]) => {
    if (err) throw err;
    return parseResult(data);
  });
}
```

### 3. Caching Strategy
```typescript
// Cache rate limit results briefly to reduce Redis calls
const cache = new Map<string, { result: RateLimitResult; expires: number }>();

async function checkLimitWithCache(
  identifier: string,
  config: RateLimiterConfig
): Promise<RateLimitResult> {
  const cacheKey = `${identifier}:${config.windowMs}:${config.maxRequests}`;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expires > Date.now()) {
    return cached.result;
  }
  
  const result = await limiter.checkLimit(identifier, config);
  
  // Cache for 1 second if blocked
  if (!result.allowed) {
    cache.set(cacheKey, {
      result,
      expires: Date.now() + 1000,
    });
  }
  
  return result;
}
```

## Deployment Plan

### 1. Pre-deployment Checklist
- [ ] Redis provider account created
- [ ] Connection URLs configured in all environments
- [ ] TLS certificates verified
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Load tests passed
- [ ] Runbooks written

### 2. Deployment Steps
```bash
# 1. Deploy with feature flag disabled
ENABLE_REDIS_RATE_LIMIT=false npm run deploy

# 2. Verify deployment health
curl https://api.victry.com/health

# 3. Enable for 10% of traffic
ENABLE_REDIS_RATE_LIMIT=true 
REDIS_ROLLOUT_PERCENTAGE=10 npm run deploy

# 4. Monitor for 1 hour
# Check dashboards and alerts

# 5. Increase to 50%
REDIS_ROLLOUT_PERCENTAGE=50 npm run deploy

# 6. Monitor for 2 hours
# Check performance metrics

# 7. Full rollout
REDIS_ROLLOUT_PERCENTAGE=100 npm run deploy

# 8. Remove feature flags after 48 hours
```

### 3. Rollback Plan
```bash
# Immediate rollback
ENABLE_REDIS_RATE_LIMIT=false npm run deploy

# Or use circuit breaker (automatic)
# The hybrid limiter will automatically fallback
```

## Operational Procedures

### 1. Daily Operations
```bash
# Check Redis health
redis-cli -u $REDIS_URL ping

# Check rate limiter metrics
curl https://api.victry.com/api/monitoring/rate-limiter

# View current limits for a user
redis-cli -u $REDIS_URL KEYS "rate_limit:*user@example.com*"
```

### 2. Emergency Procedures

#### Redis Outage
1. Circuit breaker automatically activates
2. Fallback to in-memory limiter
3. Page on-call engineer
4. Check Redis provider status page
5. Consider scaling up instances

#### High Block Rate
1. Check for abuse patterns
2. Temporarily increase limits if legitimate
3. Add IP to allowlist if necessary
4. Review rate limit configurations

#### Performance Degradation
1. Check Redis latency metrics
2. Review connection pool usage
3. Consider adding Redis replicas
4. Enable caching if not already

### 3. Maintenance Tasks

#### Weekly
- Review rate limiter metrics
- Check for unusual patterns
- Update allowlists/blocklists

#### Monthly
- Analyze cost vs usage
- Review and adjust limits
- Update documentation
- Performance optimization review

## Success Metrics

### Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Availability | 99.9% | Uptime monitoring |
| Latency (p99) | <5ms | Performance monitoring |
| Error Rate | <0.1% | Error tracking |
| Failover Time | <100ms | Circuit breaker metrics |

### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Blocked Attacks | Track trend | Security dashboard |
| False Positives | <1% | User complaints |
| Cost per Request | <$0.000001 | Provider billing |
| User Satisfaction | No degradation | Support tickets |

### Monitoring Dashboard
```sql
-- Key metrics query
SELECT 
  date_trunc('hour', timestamp) as hour,
  count(*) as total_requests,
  sum(case when allowed then 1 else 0 end) as allowed_requests,
  sum(case when not allowed then 1 else 0 end) as blocked_requests,
  avg(latency_ms) as avg_latency,
  percentile_cont(0.99) within group (order by latency_ms) as p99_latency,
  sum(case when fallback_used then 1 else 0 end) as fallback_count
FROM rate_limiter_logs
WHERE timestamp > now() - interval '24 hours'
GROUP BY 1
ORDER BY 1 DESC;
```

## Risk Assessment

### High Risks
1. **Redis Provider Outage**
   - Mitigation: Hybrid approach with fallback
   - Impact: Degraded to in-memory limiting
   
2. **Network Latency**
   - Mitigation: Edge locations, connection pooling
   - Impact: Slower API responses

3. **Cost Overrun**
   - Mitigation: Monitoring, alerts, cost caps
   - Impact: Budget issues

### Medium Risks
1. **Configuration Errors**
   - Mitigation: Staging testing, gradual rollout
   - Impact: Too restrictive/permissive limits

2. **Lua Script Bugs**
   - Mitigation: Comprehensive testing
   - Impact: Incorrect rate limiting

### Low Risks
1. **Clock Skew**
   - Mitigation: NTP synchronization
   - Impact: Minor counting errors

2. **Memory Leaks**
   - Mitigation: Regular restarts, monitoring
   - Impact: Performance degradation

## Conclusion

This comprehensive implementation plan provides a production-ready path to distributed rate limiting with Redis. The hybrid approach ensures zero downtime during migration and continued operation during Redis outages. With proper monitoring and gradual rollout, this implementation will provide better scalability, reliability, and performance for the Victry application.

### Next Steps
1. Review and approve this plan
2. Set up Upstash Redis account
3. Implement code changes
4. Begin testing phase
5. Schedule production rollout