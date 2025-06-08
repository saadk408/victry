/**
 * Client-Safe Analytics Utility
 * 
 * Created: 2025-06-08
 * Purpose: Replaces direct imports of analytics-service in client components
 * 
 * Background:
 * During the client/server separation fix, we discovered that client components
 * were importing `/lib/services/analytics-service.ts` which uses server-side
 * Supabase clients with `next/headers`. This caused Next.js build errors.
 * 
 * This utility provides a browser-safe alternative for analytics tracking
 * in client components while maintaining the same API surface.
 * 
 * Usage:
 * - Client components: Import and use `clientAnalytics` from this file
 * - Server components/API routes: Continue using `/lib/services/analytics-service`
 * 
 * Future Enhancement:
 * This currently logs to console in development. When an analytics API endpoint
 * is implemented, update the `sendEvent` method to call `/api/analytics`.
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
  | "session_ended";

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  properties?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Client-safe analytics utility for tracking events in browser components
 * This avoids importing server-side analytics service in client components
 */
class ClientAnalytics {
  private queue: AnalyticsEvent[] = [];
  private isOnline = true;

  constructor() {
    // Listen for online/offline status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEventType, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    if (this.isOnline) {
      this.sendEvent(analyticsEvent);
    } else {
      this.queue.push(analyticsEvent);
    }
  }

  /**
   * Send event to analytics endpoint (when implemented)
   */
  private async sendEvent(event: AnalyticsEvent) {
    try {
      // TODO: Implement analytics API endpoint
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event);
      }
      
      // Future implementation:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      // Silently fail for analytics - don't break user experience
      console.warn('Failed to send analytics event:', error);
    }
  }

  /**
   * Flush queued events when back online
   */
  private async flushQueue() {
    const events = [...this.queue];
    this.queue = [];
    
    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  // Convenience methods for common events
  trackResumeCreated(resumeId: string, templateId: string) {
    this.trackEvent('resume_created', { resumeId, templateId });
  }

  trackResumeUpdated(resumeId: string, section?: string) {
    this.trackEvent('resume_updated', { resumeId, section });
  }

  trackResumeExported(resumeId: string, format: string) {
    this.trackEvent('resume_exported', { resumeId, format });
  }

  trackTailoringSettingChanged(setting: string, value: any) {
    this.trackEvent('tailoring_setting_changed', { setting, value });
  }

  trackAISuggestionAccepted(category: string, suggestionLength?: number) {
    this.trackEvent('ai_suggestion_accepted', { category, suggestionLength });
  }

  trackAISuggestionRejected(category: string, suggestionLength?: number) {
    this.trackEvent('ai_suggestion_rejected', { category, suggestionLength });
  }

  trackAISuggestionUndone(category: string, timeElapsed?: number) {
    this.trackEvent('ai_suggestion_undone', { category, timeElapsed });
  }

  trackFeatureViewed(feature: string) {
    this.trackEvent('feature_viewed', { feature });
  }

  trackSkillAdded(skillName: string, hasCategory: boolean, hasLevel: boolean) {
    this.trackEvent('skill_added', { skillName, hasCategory, hasLevel });
  }

  trackSkillRemoved(skillName: string) {
    this.trackEvent('skill_removed', { skillName });
  }
}

// Export singleton instance
export const clientAnalytics = new ClientAnalytics();