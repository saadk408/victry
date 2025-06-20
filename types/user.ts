// File: /models/user.ts
/**
 * Data models and utilities for user-related functionality.
 * This module defines the core User interface and related types used throughout the application.
 */

/**
 * Subscription tier options for user accounts
 */
export type SubscriptionTier = "free" | "premium" | "enterprise";

/**
 * Subscription status options
 */
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trial"
  | "cancelled"
  | "past_due";

/**
 * User interface language options
 */
export type LanguagePreference = "en" | "es" | "fr" | "de" | "zh" | "ja";

/**
 * User preferences configuration
 */
export interface UserPreferences {
  /** Default resume template ID */
  defaultTemplate?: string;
  /** Whether to receive email notifications */
  emailNotifications?: boolean;
  /** Interface language preference */
  language?: LanguagePreference;
  /** Whether to automatically save drafts */
  autosave?: boolean;
  /** Default export format for resumes */
  defaultExportFormat?: "pdf" | "docx" | "txt";
  /** Whether to show ATS optimization tips */
  showATSTips?: boolean;
  /** Whether to sync with LinkedIn */
  syncWithLinkedIn?: boolean;
  /** Dashboard view preference */
  dashboardView?: "grid" | "list";
  /** Resume editor layout preference */
  editorLayout?: "standard" | "compact" | "expanded";
  /** AI assistance level */
  aiAssistanceLevel?: "minimal" | "moderate" | "extensive";
}

/**
 * Billing information for premium users
 */
export interface BillingInfo {
  /** Customer ID in payment processor */
  customerId?: string;
  /** Active subscription ID */
  subscriptionId?: string;
  /** Payment method details (last 4 digits, type) */
  paymentMethod?: {
    type: "card" | "paypal" | "bank";
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    brand?: string;
  };
  /** Billing address */
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Whether billing is handled through App Store or Google Play */
  isAppStoreBilling?: boolean;
  /** Tax ID information for business accounts */
  taxId?: {
    type: "vat" | "gst" | "ein" | "other";
    value: string;
  };
}

/**
 * Usage metrics to track user activity and limit usage based on subscription
 */
export interface UsageMetrics {
  /** Number of resumes created */
  resumesCreated: number;
  /** Number of tailored resumes created */
  tailoredResumesCreated: number;
  /** Number of ATS checks performed */
  atsChecksPerformed: number;
  /** Number of AI tailoring operations performed */
  aiTailoringOps: number;
  /** Timestamp of last activity */
  lastActivityAt: string;
  /** Total number of exports made */
  totalExports: number;
  /** Total number of job descriptions saved */
  savedJobDescriptions: number;
  /** Creation timestamp for calculating monthly usage */
  periodStartAt: string;
}

/**
 * Professional profile information beyond basic account details
 */
export interface ProfessionalProfile {
  /** User's professional title */
  title?: string;
  /** Years of professional experience */
  yearsOfExperience?: number;
  /** Current company */
  currentCompany?: string;
  /** Industry sector */
  industry?: string;
  /** Location information */
  location?: {
    city?: string;
    state?: string;
    country?: string;
    isRemote?: boolean;
  };
  /** Education level */
  educationLevel?:
    | "high_school"
    | "associate"
    | "bachelor"
    | "master"
    | "doctorate"
    | "other";
  /** Key skills (up to 5) */
  keySkills?: string[];
  /** LinkedIn profile URL */
  linkedInUrl?: string;
  /** Personal website URL */
  websiteUrl?: string;
  /** Whether profile is imported from LinkedIn */
  importedFromLinkedIn?: boolean;
  /** Desired job title for recommendations */
  desiredJobTitle?: string;
  /** Desired industries */
  desiredIndustries?: string[];
}

/**
 * Notification preferences for different types of notifications
 */
export interface NotificationPreferences {
  /** Email notification settings */
  email: {
    /** Product updates and new features */
    productUpdates: boolean;
    /** Resume building tips */
    resumeTips: boolean;
    /** Job match alerts */
    jobMatches: boolean;
    /** Application reminders */
    applicationReminders: boolean;
    /** Account security */
    security: boolean;
    /** Billing notifications */
    billing: boolean;
  };
  /** In-app notification settings */
  inApp: {
    /** Product updates and new features */
    productUpdates: boolean;
    /** Resume building tips */
    resumeTips: boolean;
    /** Job match alerts */
    jobMatches: boolean;
    /** Application reminders */
    applicationReminders: boolean;
    /** AI suggestions */
    aiSuggestions: boolean;
  };
  /** Whether to send a weekly summary email */
  weeklyDigest: boolean;
  /** Notification frequency preference */
  frequency: "immediate" | "daily" | "weekly" | "none";
}

/**
 * Onboarding status for tracking user progress through initial setup
 */
export interface OnboardingStatus {
  /** Whether onboarding is complete */
  isComplete: boolean;
  /** Specific onboarding steps completed */
  steps: {
    profileSetup: boolean;
    firstResumeCreated: boolean;
    templateSelected: boolean;
    jobDescriptionAdded: boolean;
    atsCheckPerformed: boolean;
    exportCompleted: boolean;
  };
  /** When onboarding was completed, if applicable */
  completedAt?: string;
  /** User source/referral information */
  source?: string;
}

/**
 * Analytics consent and privacy settings
 */
export interface PrivacySettings {
  /** Whether user has consented to analytics tracking */
  analyticsConsent: boolean;
  /** Whether user allows data to be used for AI training */
  aiTrainingConsent: boolean;
  /** Whether user has opted in to marketing emails */
  marketingConsent: boolean;
  /** Whether user has agreed to terms of service */
  termsAccepted: boolean;
  /** Whether user data should be excluded from sharing with third parties */
  doNotShare: boolean;
  /** Date when consents were last updated */
  consentUpdatedAt: string;
}

/**
 * Core User data model for the application
 */
export interface User {
  /** Unique identifier for the user */
  id: string;

  /** User's email address (used for login) */
  email: string;

  /** User's first name (optional) */
  firstName?: string;

  /** User's last name (optional) */
  lastName?: string;

  /** Account creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** User's subscription tier */
  subscriptionTier: SubscriptionTier;

  /** Current subscription status */
  subscriptionStatus: SubscriptionStatus;

  /** When trial period ends (if applicable) */
  trialEnds?: string;

  /** User preferences and settings */
  preferences: UserPreferences;

  /** Professional profile information */
  professionalProfile?: ProfessionalProfile;

  /** Billing information for paid subscriptions */
  billingInfo?: BillingInfo;

  /** Usage metrics for monitoring and limits */
  usageMetrics?: UsageMetrics;

  /** Notification preferences */
  notificationPreferences?: NotificationPreferences;

  /** Onboarding status tracking */
  onboardingStatus?: OnboardingStatus;

  /** Privacy settings and consents */
  privacySettings?: PrivacySettings;

  /** Email verification status */
  emailVerified: boolean;

  /** Last login timestamp */
  lastLoginAt?: string;

  /** Account deletion scheduled timestamp (if applicable) */
  scheduledForDeletionAt?: string;

  /** Login provider information (if using OAuth) */
  authProvider?: "email" | "google" | "apple" | "linkedin" | "github";

  /** External provider user ID (if using OAuth) */
  authProviderUserId?: string;
}

/**
 * Maps a database user record to our application User model
 * @param dbUser User data from Supabase database
 * @returns Formatted User object for application use
 */
export function mapDbUserToUser(dbUser: Record<string, any>): User {
  // Default user preferences if none exist
  const defaultPreferences: UserPreferences = {
    emailNotifications: true,
    autosave: true,
    showATSTips: true,
    defaultExportFormat: "pdf",
    language: "en",
  };

  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name || undefined,
    lastName: dbUser.last_name || undefined,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    subscriptionTier: (dbUser.subscription_tier as SubscriptionTier) || "free",
    subscriptionStatus:
      (dbUser.subscription_status as SubscriptionStatus) || "inactive",
    trialEnds: dbUser.trial_ends || undefined,
    preferences: dbUser.preferences
      ? { ...defaultPreferences, ...dbUser.preferences }
      : defaultPreferences,
    emailVerified: Boolean(dbUser.email_verified),
    lastLoginAt: dbUser.last_login_at,
    professionalProfile: dbUser.professional_profile,
    usageMetrics: dbUser.usage_metrics,
    authProvider: dbUser.auth_provider,
    authProviderUserId: dbUser.auth_provider_user_id,
  };
}

/**
 * Maps application User model to database format for storage
 * @param user User data from application
 * @returns Formatted user object for database storage
 */
export function mapUserToDbUser(user: User): Record<string, any> {
  return {
    id: user.id,
    email: user.email,
    first_name: user.firstName || null,
    last_name: user.lastName || null,
    created_at: user.createdAt,
    updated_at: user.updatedAt || new Date().toISOString(),
    subscription_tier: user.subscriptionTier,
    subscription_status: user.subscriptionStatus,
    trial_ends: user.trialEnds || null,
    preferences: user.preferences || null,
    email_verified: user.emailVerified,
    last_login_at: user.lastLoginAt || null,
    professional_profile: user.professionalProfile || null,
    usage_metrics: user.usageMetrics || null,
    auth_provider: user.authProvider || null,
    auth_provider_user_id: user.authProviderUserId || null,
    scheduled_for_deletion_at: user.scheduledForDeletionAt || null,
  };
}

/**
 * Creates a new User object with default values
 * @param email User's email address
 * @param id Optional user ID (generated if not provided)
 * @returns New User object with default values
 */
export function createNewUser(email: string, id?: string): User {
  const now = new Date().toISOString();
  // Calculate trial end date (30 days from now)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  return {
    id: id || crypto.randomUUID(),
    email,
    createdAt: now,
    updatedAt: now,
    subscriptionTier: "free",
    subscriptionStatus: "trial",
    trialEnds: trialEnd.toISOString(),
    preferences: {
      emailNotifications: true,
      autosave: true,
      showATSTips: true,
    },
    emailVerified: false,
    onboardingStatus: {
      isComplete: false,
      steps: {
        profileSetup: false,
        firstResumeCreated: false,
        templateSelected: false,
        jobDescriptionAdded: false,
        atsCheckPerformed: false,
        exportCompleted: false,
      },
    },
    usageMetrics: {
      resumesCreated: 0,
      tailoredResumesCreated: 0,
      atsChecksPerformed: 0,
      aiTailoringOps: 0,
      totalExports: 0,
      savedJobDescriptions: 0,
      lastActivityAt: now,
      periodStartAt: now,
    },
    privacySettings: {
      analyticsConsent: true,
      aiTrainingConsent: true,
      marketingConsent: true,
      termsAccepted: true,
      doNotShare: false,
      consentUpdatedAt: now,
    },
    notificationPreferences: {
      email: {
        productUpdates: true,
        resumeTips: true,
        jobMatches: true,
        applicationReminders: true,
        security: true,
        billing: true,
      },
      inApp: {
        productUpdates: true,
        resumeTips: true,
        jobMatches: true,
        applicationReminders: true,
        aiSuggestions: true,
      },
      weeklyDigest: true,
      frequency: "immediate",
    },
  };
}

/**
 * Get the user's display name (first name, full name, or email)
 * @param user User object
 * @returns User's display name based on available information
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else {
    // Fall back to email prefix if no name is available
    return user.email.split("@")[0];
  }
}

/**
 * Checks if the user's trial period has ended
 * @param user User object
 * @returns Whether the trial period has ended
 */
export function hasTrialEnded(user: User): boolean {
  if (user.subscriptionStatus !== "trial" || !user.trialEnds) {
    return true;
  }

  const trialEndDate = new Date(user.trialEnds);
  const now = new Date();

  return now > trialEndDate;
}

/**
 * Checks if the user has reached their resume limit based on subscription
 * @param user User object
 * @returns Whether the user has reached their resume limit
 */
export function hasReachedResumeLimit(user: User): boolean {
  if (!user.usageMetrics) {
    return false;
  }

  const limits = getSubscriptionLimits(user.subscriptionTier);
  return user.usageMetrics.resumesCreated >= limits.maxResumes;
}

/**
 * Checks if the user has reached their tailored resume limit based on subscription
 * @param user User object
 * @returns Whether the user has reached their tailored resume limit
 */
export function hasReachedTailoredResumeLimit(user: User): boolean {
  if (!user.usageMetrics) {
    return false;
  }

  const limits = getSubscriptionLimits(user.subscriptionTier);
  return user.usageMetrics.tailoredResumesCreated >= limits.maxTailoredResumes;
}

/**
 * Get the usage limits for a given subscription tier
 * @param tier Subscription tier
 * @returns Object containing the usage limits for the tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): {
  maxResumes: number;
  maxTailoredResumes: number;
  maxAtsChecks: number;
  maxAiTailoringOps: number;
  coverLetterGeneration: boolean;
  advancedAtsFeatures: boolean;
  premiumTemplates: boolean;
} {
  switch (tier) {
    case "free":
      return {
        maxResumes: 3,
        maxTailoredResumes: 1,
        maxAtsChecks: 3,
        maxAiTailoringOps: 5,
        coverLetterGeneration: false,
        advancedAtsFeatures: false,
        premiumTemplates: false,
      };
    case "premium":
      return {
        maxResumes: 10,
        maxTailoredResumes: 20,
        maxAtsChecks: 50,
        maxAiTailoringOps: 100,
        coverLetterGeneration: true,
        advancedAtsFeatures: true,
        premiumTemplates: true,
      };
    case "enterprise":
      return {
        maxResumes: 100,
        maxTailoredResumes: 200,
        maxAtsChecks: 500,
        maxAiTailoringOps: 1000,
        coverLetterGeneration: true,
        advancedAtsFeatures: true,
        premiumTemplates: true,
      };
    default:
      return {
        maxResumes: 3,
        maxTailoredResumes: 1,
        maxAtsChecks: 3,
        maxAiTailoringOps: 5,
        coverLetterGeneration: false,
        advancedAtsFeatures: false,
        premiumTemplates: false,
      };
  }
}

/**
 * Check if a feature is available for a user based on their subscription
 * @param user User object
 * @param feature Feature to check
 * @returns Whether the feature is available
 */
export function hasFeatureAccess(
  user: User,
  feature:
    | "coverLetterGeneration"
    | "advancedAtsFeatures"
    | "premiumTemplates"
    | "multiVersionManagement"
    | "applicationTracking"
    | "aiEnhancement",
): boolean {
  // Free features available to all users
  const freeFeatures = ["basic_ats_check", "standard_templates"];
  if (freeFeatures.includes(feature)) return true;

  // Enterprise users have access to all features
  if (user.subscriptionTier === "enterprise") return true;

  // Premium users have access to most features
  if (user.subscriptionTier === "premium") {
    const premiumFeatures = [
      "coverLetterGeneration",
      "advancedAtsFeatures",
      "premiumTemplates",
      "multiVersionManagement",
      "applicationTracking",
      "aiEnhancement",
    ];
    return premiumFeatures.includes(feature);
  }

  // Free users with active trial get access to premium features
  if (user.subscriptionStatus === "trial" && !hasTrialEnded(user)) {
    return true;
  }

  // Default to no access for features not explicitly granted
  return false;
}

/**
 * Reset user usage metrics for a new billing period
 * @param user User object
 * @returns Updated user with reset usage metrics
 */
export function resetUsageMetrics(user: User): User {
  const now = new Date().toISOString();

  // Default values in case user.usageMetrics is undefined
  const currentMetrics = user.usageMetrics || {
    resumesCreated: 0,
    tailoredResumesCreated: 0,
    atsChecksPerformed: 0,
    aiTailoringOps: 0,
    totalExports: 0,
    savedJobDescriptions: 0,
    lastActivityAt: now,
    periodStartAt: now,
  };

  return {
    ...user,
    usageMetrics: {
      // Keep totals or initialize them to 0 if they're undefined
      totalExports: currentMetrics.totalExports || 0,
      savedJobDescriptions: currentMetrics.savedJobDescriptions || 0,
      // Reset period-specific counts
      resumesCreated: 0,
      tailoredResumesCreated: 0,
      atsChecksPerformed: 0,
      aiTailoringOps: 0,
      lastActivityAt: now,
      periodStartAt: now,
    },
    updatedAt: now,
  };
}

/**
 * Create a sanitized version of the user object for client-side use
 * Removes sensitive information not needed in the frontend
 * @param user User object
 * @returns Sanitized user object safe for client-side use
 */
export function sanitizeUserForClient(user: User): Omit<User, "billingInfo"> & {
  hasBillingInfo: boolean;
} {
  const { billingInfo, ...safeUser } = user;

  return {
    ...safeUser,
    hasBillingInfo: Boolean(billingInfo),
  };
}
