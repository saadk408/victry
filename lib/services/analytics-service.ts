// File: /services/analytics-service.ts
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { debounce } from "@/lib/utils/utils";

/**
 * Types of analytics events that can be tracked in the application
 * Categorized by feature area for better organization
 */
export type AnalyticsEventType =
  // AI suggestion interaction events
  | "ai_suggestion_shown"
  | "ai_suggestion_accepted"
  | "ai_suggestion_rejected"
  | "ai_suggestion_undone"

  // Resume interactions
  | "resume_created"
  | "resume_updated"
  | "resume_deleted"
  | "resume_exported"
  | "resume_template_changed"
  | "resume_section_added"
  | "resume_section_removed"
  | "skill_added"
  | "skill_removed"

  // AI tailoring events
  | "tailoring_started"
  | "tailoring_completed"
  | "tailoring_setting_changed"
  | "tailoring_score_viewed"

  // Job description events
  | "job_description_added"
  | "job_description_analyzed"
  | "job_description_matched"

  // User engagement events
  | "feature_viewed"
  | "tooltip_shown"
  | "help_article_viewed"
  | "feedback_submitted"
  | "subscription_viewed"
  | "pricing_viewed"
  | "template_browsed"

  // Session events
  | "session_started"
  | "session_ended"
  | "onboarding_step_completed"
  | "conversion_event";

/**
 * Structure of an analytics event
 */
export interface AnalyticsEvent {
  /** Type of event being tracked */
  eventType: AnalyticsEventType;

  /** User ID (if available) */
  userId?: string;

  /** Additional data about the event */
  metadata?: Record<string, any>;

  /** When the event occurred */
  createdAt?: string;

  /** Session ID to group related events */
  sessionId?: string;

  /** Client information */
  client?: {
    /** Browser or device identifier */
    userAgent?: string;

    /** Screen resolution */
    screen?: string;

    /** Browser language */
    language?: string;

    /** Referrer URL */
    referrer?: string;
  };

  /** Current page or route when event occurred */
  path?: string;
}

/**
 * Options for analytics service configuration
 */
interface AnalyticsOptions {
  /** Whether analytics is enabled by default */
  enabled?: boolean;

  /** Whether to use local storage for events when offline */
  enableOfflineTracking?: boolean;

  /** Maximum number of events to batch before sending */
  batchSize?: number;

  /** Whether to track events for anonymous users */
  trackAnonymousUsers?: boolean;

  /** Domains to exclude from referrer tracking */
  excludedReferrerDomains?: string[];
}

/**
 * Service for tracking user interactions with the application
 * Records events to Supabase for analysis
 */
export class AnalyticsService {
  private supabase = createClient();
  private sessionId: string;
  private isEnabled: boolean;
  private trackAnonymousUsers: boolean;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize: number;
  private offlineEnabled: boolean;
  private excludedReferrerDomains: string[];
  private isOnline: boolean = true;
  private userProps: Record<string, any> = {};

  /**
   * Reserved metadata properties that have special handling
   */
  private readonly RESERVED_PROPS = [
    "userId",
    "sessionId",
    "timestamp",
    "eventType",
  ];

  /**
   * Local storage key for offline events
   */
  private readonly OFFLINE_EVENTS_KEY = "victry_offline_analytics";

  /**
   * Local storage key for analytics preference
   */
  private readonly ANALYTICS_ENABLED_KEY = "victry_analytics_enabled";

  /**
   * Maximum age for stored events in milliseconds (7 days)
   */
  private readonly MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  /**
   * Initialize analytics service
   * @param options Configuration options
   */
  constructor(options: AnalyticsOptions = {}) {
    // Generate a unique session ID for grouping related events
    this.sessionId = this.generateSessionId();

    // Set configuration options with defaults
    this.isEnabled = options.enabled !== undefined ? options.enabled : true;
    this.batchSize = options.batchSize || 10;
    this.offlineEnabled =
      options.enableOfflineTracking !== undefined
        ? options.enableOfflineTracking
        : true;
    this.trackAnonymousUsers =
      options.trackAnonymousUsers !== undefined
        ? options.trackAnonymousUsers
        : true;
    this.excludedReferrerDomains = options.excludedReferrerDomains || [
      "localhost",
      "victry.com",
      "victry.app",
    ];

    // Check stored user preference
    this.loadUserPreference();

    // Initialize online/offline detection
    this.setupOnlineListener();

    // Attempt to process any stored offline events
    this.processOfflineEvents();

    // Set up automatic flush when page is unloaded
    this.setupUnloadListener();

    // Track session start event
    this.trackSessionStart();
  }

  /**
   * Generate a unique session ID
   * @returns UUID for the session
   */
  private generateSessionId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  /**
   * Load user preference for analytics from local storage
   */
  private loadUserPreference(): void {
    try {
      const storedPreference = localStorage.getItem(this.ANALYTICS_ENABLED_KEY);
      if (storedPreference !== null) {
        this.isEnabled = storedPreference === "true";
      }
    } catch (e) {
      // Ignore errors (e.g., if localStorage is not available)
      console.warn("Failed to load analytics preference from localStorage", e);
    }
  }

  /**
   * Set up listener for online/offline events
   */
  private setupOnlineListener(): void {
    if (typeof window !== "undefined") {
      // Initial state
      this.isOnline = navigator.onLine;

      // Listen for online status changes
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.processOfflineEvents();
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Set up listener for page unload to flush remaining events
   */
  private setupUnloadListener(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        // Track session end
        this.trackSessionEnd();

        // Flush any remaining events
        if (this.eventQueue.length > 0) {
          this.flushEvents(true);
        }
      });
    }
  }

  /**
   * Track session start event
   */
  private trackSessionStart(): void {
    const path =
      typeof window !== "undefined" ? window.location.pathname : undefined;
    const referrer =
      typeof document !== "undefined" ? document.referrer : undefined;

    this.trackEvent("session_started", {
      path,
      referrer: this.sanitizeReferrer(referrer),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewportSize:
        typeof window !== "undefined"
          ? `${window.innerWidth}x${window.innerHeight}`
          : undefined,
    });
  }

  /**
   * Track session end event
   */
  private trackSessionEnd(): void {
    const now = new Date();
    const sessionStartTime = new Date(
      parseInt(this.sessionId.split("-")[0], 16) * 1000,
    );
    const sessionDurationMs = now.getTime() - sessionStartTime.getTime();

    this.trackEvent("session_ended", {
      durationMs: sessionDurationMs,
      durationFormatted: this.formatDuration(sessionDurationMs),
      eventsCount: this.eventQueue.length,
    });
  }

  /**
   * Format duration in milliseconds to human-readable string
   * @param ms Duration in milliseconds
   * @returns Formatted duration string
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  }

  /**
   * Sanitize referrer URL to remove sensitive information
   * @param referrer Original referrer URL
   * @returns Sanitized referrer or undefined
   */
  private sanitizeReferrer(referrer?: string): string | undefined {
    if (!referrer) return undefined;

    try {
      const url = new URL(referrer);

      // Check if it's from excluded domains
      if (
        this.excludedReferrerDomains.some((domain) =>
          url.hostname.includes(domain),
        )
      ) {
        return undefined;
      }

      // Remove query params and hash for privacy
      return `${url.protocol}//${url.hostname}${url.pathname}`;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Get current user ID from Supabase session
   * @returns Promise resolving to user ID or undefined
   */
  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      return user?.id;
    } catch (error) {
      console.warn("Failed to get current user:", error);
      return undefined;
    }
  }

  /**
   * Get client information for event context
   * @returns Client information object
   */
  private getClientInfo(): AnalyticsEvent["client"] {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return undefined;
    }

    return {
      userAgent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      referrer: this.sanitizeReferrer(document.referrer),
    };
  }

  /**
   * Process any stored offline events
   */
  private async processOfflineEvents(): Promise<void> {
    if (!this.isOnline || !this.offlineEnabled) return;

    try {
      const storedEvents = localStorage.getItem(this.OFFLINE_EVENTS_KEY);
      if (!storedEvents) return;

      const events: AnalyticsEvent[] = JSON.parse(storedEvents);
      if (!events.length) return;

      // Filter out expired events
      const now = Date.now();
      const validEvents = events.filter((event) => {
        const eventTime = event.createdAt
          ? new Date(event.createdAt).getTime()
          : now;
        return now - eventTime < this.MAX_EVENT_AGE_MS;
      });

      // Clear storage even if we fail to send
      localStorage.removeItem(this.OFFLINE_EVENTS_KEY);

      if (!validEvents.length) return;

      // Add events to queue
      this.eventQueue.push(...validEvents);

      // Attempt to flush events
      await this.flushEvents();
    } catch (error) {
      console.error("Failed to process offline events:", error);
      // Clear storage to prevent repeated failures
      localStorage.removeItem(this.OFFLINE_EVENTS_KEY);
    }
  }

  /**
   * Store events for offline processing
   * @param events Events to store
   */
  private storeOfflineEvents(events: AnalyticsEvent[]): void {
    if (!this.offlineEnabled) return;

    try {
      // Get any existing offline events
      const storedEventsJson = localStorage.getItem(this.OFFLINE_EVENTS_KEY);
      const storedEvents: AnalyticsEvent[] = storedEventsJson
        ? JSON.parse(storedEventsJson)
        : [];

      // Combine with new events
      const combinedEvents = [...storedEvents, ...events];

      // Filter out expired events
      const now = Date.now();
      const validEvents = combinedEvents.filter((event) => {
        const eventTime = event.createdAt
          ? new Date(event.createdAt).getTime()
          : now;
        return now - eventTime < this.MAX_EVENT_AGE_MS;
      });

      // Store events
      localStorage.setItem(
        this.OFFLINE_EVENTS_KEY,
        JSON.stringify(validEvents),
      );
    } catch (error) {
      console.error("Failed to store offline events:", error);
    }
  }

  /**
   * Flush queued events to Supabase
   * @param isUnload Whether this flush is happening during page unload
   * @returns Promise resolving to success status
   */
  private async flushEvents(isUnload: boolean = false): Promise<boolean> {
    if (!this.isEnabled || !this.eventQueue.length) {
      return false;
    }

    // If offline, store events for later
    if (!this.isOnline) {
      this.storeOfflineEvents(this.eventQueue);
      this.eventQueue = [];
      return false;
    }

    try {
      // Get current user if not already set in events
      let userId: string | undefined;

      // Only make auth call if we have events missing userId
      if (this.eventQueue.some((event) => !event.userId)) {
        userId = await this.getCurrentUserId();
      }

      // Process events for submission
      const events = this.eventQueue.map((event) => ({
        ...event,
        userId: event.userId || userId,
        createdAt: event.createdAt || new Date().toISOString(),
        sessionId: event.sessionId || this.sessionId,
      }));

      // Filter out events without userId if anonymous tracking is disabled
      const eventsToSend = this.trackAnonymousUsers
        ? events
        : events.filter((event) => !!event.userId);

      if (!eventsToSend.length) {
        this.eventQueue = [];
        return false;
      }

      // During page unload, we need to use a synchronous method
      if (isUnload && navigator.sendBeacon) {
        const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/analytics_events`;
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!endpoint || !apiKey) return false;

        const blob = new Blob([JSON.stringify(eventsToSend)], {
          type: "application/json",
        });

        navigator.sendBeacon(endpoint, blob);

        this.eventQueue = [];
        return true;
      }

      // Transform to match Supabase's expected column names
      const formattedEvents = eventsToSend
        .filter((event) => !!event.userId) // Ensure user_id is not undefined
        .map((event) => ({
          user_id: event.userId as string, // Type assertion since we filtered out undefined
          event_type: event.eventType,
          metadata: {
            ...event.metadata,
            session_id: event.sessionId,
            path: event.path,
            client: event.client,
          },
          created_at: event.createdAt,
        }));

      if (formattedEvents.length === 0) {
        this.eventQueue = [];
        return false;
      }

      // Normal async submission
      const { error } = await this.supabase
        .from("analytics_events")
        .insert(formattedEvents);

      if (error) {
        console.error("Error recording analytics events:", error);

        // Store events for offline processing if enabled
        if (this.offlineEnabled) {
          this.storeOfflineEvents(eventsToSend);
        }

        return false;
      }

      // Clear queue on success
      this.eventQueue = [];
      return true;
    } catch (error) {
      console.error("Failed to flush analytics events:", error);

      // Store events for offline processing if enabled
      if (this.offlineEnabled) {
        this.storeOfflineEvents(this.eventQueue);
        this.eventQueue = [];
      }

      return false;
    }
  }

  /**
   * Debounced version of flushEvents to prevent too many requests
   */
  private debouncedFlush = debounce(() => {
    this.flushEvents();
  }, 1000);

  /**
   * Track an analytics event
   *
   * @param eventType - Type of event to track
   * @param metadata - Additional data about the event
   * @returns Promise resolving to success status
   */
  async trackEvent(
    eventType: AnalyticsEventType,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      // Create event object
      const event: AnalyticsEvent = {
        eventType,
        sessionId: this.sessionId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          ...this.userProps, // Include user properties
        },
        path:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        client: this.getClientInfo(),
      };

      // Add to queue
      this.eventQueue.push(event);

      // Flush events if queue exceeds batch size
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      } else {
        // Otherwise use debounced flush
        this.debouncedFlush();
      }

      return true;
    } catch (error) {
      console.error("Failed to track analytics event:", error);
      return false;
    }
  }

  /**
   * Set user properties that will be included with all events
   * @param properties User properties to set
   */
  setUserProperties(properties: Record<string, any>): void {
    // Filter out reserved property names
    const safeProps = Object.entries(properties).reduce(
      (acc, [key, value]) => {
        if (!this.RESERVED_PROPS.includes(key)) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    this.userProps = {
      ...this.userProps,
      ...safeProps,
    };
  }

  /**
   * Clear user properties
   */
  clearUserProperties(): void {
    this.userProps = {};
  }

  /**
   * Track AI suggestion shown to user
   *
   * @param category - Type of suggestion
   * @param contentLength - Length of suggestion content
   */
  async trackAISuggestionShown(
    category: string,
    contentLength: number,
  ): Promise<void> {
    await this.trackEvent("ai_suggestion_shown", {
      category,
      contentLength,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI suggestion accepted by user
   *
   * @param category - Type of suggestion
   * @param contentLength - Length of suggestion content
   */
  async trackAISuggestionAccepted(
    category: string,
    contentLength: number,
  ): Promise<void> {
    await this.trackEvent("ai_suggestion_accepted", {
      category,
      contentLength,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI suggestion rejected by user
   *
   * @param category - Type of suggestion
   * @param contentLength - Length of suggestion content
   */
  async trackAISuggestionRejected(
    category: string,
    contentLength: number,
  ): Promise<void> {
    await this.trackEvent("ai_suggestion_rejected", {
      category,
      contentLength,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI suggestion acceptance being undone
   *
   * @param category - Type of suggestion
   * @param timeElapsed - Milliseconds between acceptance and undo
   */
  async trackAISuggestionUndone(
    category: string,
    timeElapsed: number,
  ): Promise<void> {
    await this.trackEvent("ai_suggestion_undone", {
      category,
      timeElapsedMs: timeElapsed,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume creation
   * @param resumeId ID of the created resume
   * @param templateId Template used for creation
   */
  async trackResumeCreated(
    resumeId: string,
    templateId: string,
  ): Promise<void> {
    await this.trackEvent("resume_created", {
      resumeId,
      templateId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume update
   * @param resumeId ID of the updated resume
   * @param sectionUpdated Section that was updated
   */
  async trackResumeUpdated(
    resumeId: string,
    sectionUpdated?: string,
  ): Promise<void> {
    await this.trackEvent("resume_updated", {
      resumeId,
      sectionUpdated,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume export
   * @param resumeId ID of the exported resume
   * @param format Export format (pdf, docx, etc.)
   */
  async trackResumeExported(resumeId: string, format: string): Promise<void> {
    await this.trackEvent("resume_exported", {
      resumeId,
      format,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume template change
   * @param resumeId ID of the resume
   * @param oldTemplateId Previous template ID
   * @param newTemplateId New template ID
   */
  async trackTemplateChanged(
    resumeId: string,
    oldTemplateId: string,
    newTemplateId: string,
  ): Promise<void> {
    await this.trackEvent("resume_template_changed", {
      resumeId,
      oldTemplateId,
      newTemplateId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track job description added
   * @param jobDescriptionId ID of the job description
   * @param source Source of the job description (manual, url, paste)
   */
  async trackJobDescriptionAdded(
    jobDescriptionId: string,
    source: "manual" | "url" | "paste",
  ): Promise<void> {
    await this.trackEvent("job_description_added", {
      jobDescriptionId,
      source,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track job description analysis
   * @param jobDescriptionId ID of the job description
   * @param analysisTime Time taken for analysis in milliseconds
   */
  async trackJobDescriptionAnalyzed(
    jobDescriptionId: string,
    analysisTime: number,
  ): Promise<void> {
    await this.trackEvent("job_description_analyzed", {
      jobDescriptionId,
      analysisTimeMs: analysisTime,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume tailoring started
   * @param resumeId ID of the resume being tailored
   * @param jobDescriptionId ID of the job description
   * @param settings Tailoring settings
   */
  async trackTailoringStarted(
    resumeId: string,
    jobDescriptionId: string,
    settings: {
      intensity: number;
      preserveVoice: boolean;
      focusKeywords: boolean;
    },
  ): Promise<void> {
    await this.trackEvent("tailoring_started", {
      resumeId,
      jobDescriptionId,
      settings,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track resume tailoring completed
   * @param resumeId ID of the resume that was tailored
   * @param jobDescriptionId ID of the job description
   * @param timeElapsed Time taken for tailoring in milliseconds
   * @param score ATS score of the tailored resume
   */
  async trackTailoringCompleted(
    resumeId: string,
    jobDescriptionId: string,
    timeElapsed: number,
    score: number,
  ): Promise<void> {
    await this.trackEvent("tailoring_completed", {
      resumeId,
      jobDescriptionId,
      timeElapsedMs: timeElapsed,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track onboarding step completion
   * @param step Step identifier
   * @param success Whether the step was completed successfully
   */
  async trackOnboardingStep(step: string, success: boolean): Promise<void> {
    await this.trackEvent("onboarding_step_completed", {
      step,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track feature view
   * @param featureName Name of the feature
   * @param source Source of the interaction
   */
  async trackFeatureViewed(
    featureName: string,
    source?: string,
  ): Promise<void> {
    await this.trackEvent("feature_viewed", {
      feature: featureName,
      source,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track conversion event
   * @param conversionType Type of conversion
   * @param value Value associated with conversion (if applicable)
   */
  async trackConversion(conversionType: string, value?: number): Promise<void> {
    await this.trackEvent("conversion_event", {
      conversionType,
      value,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Enable or disable analytics tracking
   *
   * @param enabled - Whether analytics should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem(this.ANALYTICS_ENABLED_KEY, enabled.toString());
    } catch (e) {
      // Ignore errors
      console.warn("Failed to save analytics preference to localStorage", e);
    }
  }

  /**
   * Check if analytics is currently enabled
   * @returns Whether analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Manually flush any queued events
   * @returns Promise resolving to success status
   */
  async flush(): Promise<boolean> {
    return this.flushEvents();
  }

  /**
   * Reset the current session, generating a new session ID
   * This should be called when a user logs in or out
   */
  resetSession(): void {
    // Track the end of the current session
    this.trackSessionEnd();

    // Flush all queued events to ensure they're associated with the correct session
    this.flushEvents();

    // Generate a new session ID
    this.sessionId = this.generateSessionId();

    // Track the start of the new session
    this.trackSessionStart();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService({
  enabled: true,
  enableOfflineTracking: true,
  batchSize: 10,
  trackAnonymousUsers: true,
});
