/**
 * User model types
 */

/**
 * Subscription tiers available in the application
 */
export enum SubscriptionTier {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise"
}

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  passwordHash?: string;
  refreshToken?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  profileImage?: string;
  
  /**
   * User's subscription tier
   */
  subscriptionTier: SubscriptionTier;
  
  /**
   * Subscription status
   */
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  
  /**
   * User's professional profile information
   */
  professionalProfile?: {
    title?: string;
    industry?: string;
    yearsOfExperience?: number;
    location?: string;
    about?: string;
    skills?: string[];
    education?: {
      degree: string;
      institution: string;
      year: number;
    }[];
    preferredJobTypes?: string[];
    salaryExpectation?: {
      min: number;
      max: number;
      currency: string;
      period: "hourly" | "yearly";
    };
  };
  
  /**
   * User preferences
   */
  preferences?: {
    theme?: "light" | "dark" | "system";
    emailNotifications?: {
      applicationReminders: boolean;
      jobAlerts: boolean;
      productUpdates: boolean;
      tips: boolean;
    };
    defaultResumeId?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
  };
  
  /**
   * Usage metrics
   */
  usageMetrics?: {
    resumesCreated: number;
    resumesTailored: number;
    applicationsTracked: number;
    lastActivity?: string;
    aiCreditsUsed?: number;
    aiCreditsTotal?: number;
  };
  
  /**
   * User roles and permissions
   */
  roles?: ("user" | "admin" | "support" | "analyst")[];
  
  /**
   * Account status
   */
  accountStatus: "active" | "suspended" | "pending" | "deactivated";
}