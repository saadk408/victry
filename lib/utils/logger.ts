// File: /lib/utils/logger.ts
import { ErrorCategory, ErrorCode } from "./error-utils";

/**
 * Log levels for the logger
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * Log entry interface for all log messages
 */
export interface LogEntry {
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Timestamp of the log */
  timestamp: string;
  /** Module or component that generated the log */
  source?: string;
  /** User ID if applicable */
  userId?: string;
  /** Request ID if applicable */
  requestId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Error object if applicable */
  error?: unknown;
  /** Error category if applicable */
  errorCategory?: ErrorCategory;
  /** Error code if applicable */
  errorCode?: ErrorCode;
  /** Stack trace if applicable */
  stack?: string;
}

/**
 * Logger options interface
 */
export interface LoggerOptions {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Default source for log entries */
  defaultSource?: string;
  /** Whether to include timestamps */
  includeTimestamps?: boolean;
  /** Whether to include stack traces for errors */
  includeStacks?: boolean;
  /** Array of log transports */
  transports?: LogTransport[];
}

/**
 * Log transport interface for sending logs to different destinations
 */
export interface LogTransport {
  /** Transport name */
  name: string;
  /** Method to log entries */
  log: (entry: LogEntry) => void | Promise<void>;
  /** Minimum log level for this transport */
  minLevel?: LogLevel;
}

/**
 * Default console transport for logging to the console
 */
export const consoleTransport: LogTransport = {
  name: "console",
  log: (entry: LogEntry) => {
    const { level, message, source, timestamp, userId, requestId, metadata, error, stack } = entry;
    
    // Format metadata for console output
    const formattedMetadata = metadata ? ` ${JSON.stringify(metadata)}` : "";
    
    // Format the log message
    const prefix = source ? `[${source}]` : "";
    const userInfo = userId ? `(User: ${userId})` : "";
    const requestInfo = requestId ? `(Request: ${requestId})` : "";
    const idInfo = userInfo || requestInfo ? ` ${userInfo}${requestInfo}` : "";
    const timestampInfo = timestamp ? `${timestamp} - ` : "";
    
    const logMessage = `${timestampInfo}${level.toUpperCase()}: ${prefix}${idInfo} ${message}${formattedMetadata}`;
    
    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        if (error) console.error("Error:", error);
        if (stack) console.error("Stack:", stack);
        break;
      default:
        console.log(logMessage);
    }
  }
};

/**
 * Development environment log filter (only shows errors and warnings by default)
 */
export const developmentFilter = (entry: LogEntry): boolean => {
  if (process.env.NODE_ENV === "development") {
    // Show all logs in development if LOG_LEVEL environment variable is set to "debug"
    if (process.env.LOG_LEVEL === "debug") {
      return true;
    }
    
    // Show errors, fatal errors, and warnings by default in development
    return [LogLevel.ERROR, LogLevel.FATAL, LogLevel.WARN].includes(entry.level);
  }
  
  return true;
};

/**
 * Default logger options
 */
const defaultOptions: LoggerOptions = {
  minLevel: LogLevel.INFO,
  includeTimestamps: true,
  includeStacks: true,
  transports: [consoleTransport],
};

/**
 * Utility for filtering log entries based on level
 * @param entry The log entry to filter
 * @param minLevel The minimum log level to allow
 * @returns Whether the entry should be logged
 */
function shouldLog(entry: LogEntry, minLevel: LogLevel): boolean {
  const levelValues: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.FATAL]: 4,
  };
  
  return levelValues[entry.level] >= levelValues[minLevel];
}

/**
 * Utility for formatting error stack traces
 * @param error The error to format
 * @returns The formatted stack trace
 */
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  
  return undefined;
}

/**
 * Logger class for centralized logging
 */
export class Logger {
  private options: LoggerOptions;
  private source?: string;
  
  /**
   * Creates a new logger instance
   * @param options Logger options
   */
  constructor(options: LoggerOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.source = options.defaultSource;
  }
  
  /**
   * Creates a child logger with a specific source
   * @param source The source for the child logger
   * @returns A new logger instance with the specified source
   */
  child(source: string): Logger {
    return new Logger({
      ...this.options,
      defaultSource: source,
    });
  }
  
  /**
   * Logs a message at the specified level
   * @param level The log level
   * @param message The log message
   * @param metadata Additional metadata
   */
  log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown> & {
      userId?: string;
      requestId?: string;
      error?: unknown;
      errorCategory?: ErrorCategory;
      errorCode?: ErrorCode;
    }
  ): void {
    // Skip if this level is below the minimum level
    if (!shouldLog({ level, message, timestamp: new Date().toISOString() }, this.options.minLevel!)) {
      return;
    }
    
    // Extract metadata
    const { userId, requestId, error, errorCategory, errorCode, ...restMetadata } = metadata || {};
    
    // Create log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: this.options.includeTimestamps ? new Date().toISOString() : "",
      source: this.source,
      userId,
      requestId,
      metadata: Object.keys(restMetadata).length > 0 ? restMetadata : undefined,
      error,
      errorCategory,
      errorCode,
    };
    
    // Add stack trace if available
    if (this.options.includeStacks && error) {
      entry.stack = getErrorStack(error);
    }
    
    // Send to all transports
    if (this.options.transports) {
      for (const transport of this.options.transports) {
        // Skip if this transport has a minimum level and the entry is below it
        if (transport.minLevel && !shouldLog(entry, transport.minLevel)) {
          continue;
        }
        
        // Log the entry
        try {
          transport.log(entry);
        } catch (transportError) {
          console.error(`Error in transport ${transport.name}:`, transportError);
        }
      }
    }
  }
  
  /**
   * Logs a debug message
   * @param message The log message
   * @param metadata Additional metadata
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }
  
  /**
   * Logs an info message
   * @param message The log message
   * @param metadata Additional metadata
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }
  
  /**
   * Logs a warning message
   * @param message The log message
   * @param metadata Additional metadata
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }
  
  /**
   * Logs an error message
   * @param message The log message
   * @param error The error object
   * @param metadata Additional metadata
   */
  error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown> & {
      errorCategory?: ErrorCategory;
      errorCode?: ErrorCode;
    }
  ): void {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      error,
      errorCategory: metadata?.errorCategory,
      errorCode: metadata?.errorCode,
    });
  }
  
  /**
   * Logs a fatal error message
   * @param message The log message
   * @param error The error object
   * @param metadata Additional metadata
   */
  fatal(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown> & {
      errorCategory?: ErrorCategory;
      errorCode?: ErrorCode;
    }
  ): void {
    this.log(LogLevel.FATAL, message, {
      ...metadata,
      error,
      errorCategory: metadata?.errorCategory,
      errorCode: metadata?.errorCode,
    });
  }
}

/**
 * Create a server transport for sending logs to a logging server
 * @param url The URL of the logging server
 * @param apiKey Optional API key for authentication
 * @param minLevel Minimum log level to send to the server
 * @returns A log transport for sending logs to a server
 */
export function createServerTransport(
  url: string,
  apiKey?: string,
  minLevel: LogLevel = LogLevel.ERROR
): LogTransport {
  return {
    name: "server",
    minLevel,
    log: async (entry: LogEntry) => {
      try {
        // Clone the entry to avoid modifying the original
        const entryToSend = { ...entry };
        
        // Convert Error objects to strings
        if (entryToSend.error instanceof Error) {
          entryToSend.error = {
            name: entryToSend.error.name,
            message: entryToSend.error.message,
            stack: entryToSend.error.stack,
          };
        }
        
        // Send the log to the server
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "X-API-Key": apiKey } : {}),
          },
          body: JSON.stringify(entryToSend),
        });
      } catch (error) {
        // Don't use the logger here to avoid infinite loops
        console.error("Error sending log to server:", error);
      }
    },
  };
}

/**
 * Create a file transport for writing logs to a file (Node.js only)
 * @param filePath The path to the log file
 * @param minLevel Minimum log level to write to the file
 * @returns A log transport for writing logs to a file
 */
export function createFileTransport(
  filePath: string,
  minLevel: LogLevel = LogLevel.INFO
): LogTransport {
  return {
    name: "file",
    minLevel,
    log: (entry: LogEntry) => {
      // Only available in Node.js environment
      if (typeof window === "undefined") {
        try {
          // Import fs module dynamically
          import("fs").then(fs => {
            // Format the log entry
            const formattedEntry = JSON.stringify(entry) + "\n";
            
            // Append to the log file
            fs.appendFileSync(filePath, formattedEntry);
          }).catch(error => {
            console.error("Error importing fs module:", error);
          });
        } catch (error) {
          console.error("Error writing log to file:", error);
        }
      }
    },
  };
}

/**
 * Create a singleton logger instance with the specified options
 * @param options Logger options
 * @returns A logger instance
 */
let _logger: Logger | null = null;
export function getLogger(options?: LoggerOptions): Logger {
  if (!_logger) {
    _logger = new Logger(options);
  }
  
  return _logger;
}

/**
 * Create a test transport for capturing logs in tests
 * @returns A log transport for capturing logs in tests
 */
export function createTestTransport(): LogTransport & { logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  
  return {
    name: "test",
    logs,
    log: (entry: LogEntry) => {
      logs.push(entry);
    },
  };
}

// Export a default logger instance
export const logger = getLogger();
export default logger;