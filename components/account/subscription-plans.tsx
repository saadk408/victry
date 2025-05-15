// File: /components/account/subscription-plans.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { User } from "@/models/user";
import { Check, X, Zap, FileText, Shield, Clock, Loader2 } from "lucide-react";

// Define plan features for each tier
const planFeatures = {
  free: [
    { feature: "Create and export up to 3 resumes", included: true },
    { feature: "Basic ATS compatibility checking", included: true },
    { feature: "Limited AI tailoring suggestions", included: true },
    { feature: "PDF export capability", included: true },
    { feature: "Unlimited resume versions", included: false },
    { feature: "Advanced ATS optimization", included: false },
    { feature: "Full AI tailoring capabilities", included: false },
    { feature: "Cover letter generation", included: false },
    { feature: "Version history and tracking", included: false },
  ],
  premium: [
    { feature: "Create and export unlimited resumes", included: true },
    { feature: "Advanced ATS optimization", included: true },
    { feature: "Full AI tailoring capabilities", included: true },
    { feature: "Cover letter generation", included: true },
    { feature: "Version history and tracking", included: true },
    { feature: "Premium resume templates", included: true },
    { feature: "Priority email support", included: true },
  ],
  campaign: [
    { feature: "All Premium features", included: true },
    { feature: "Limited to 90-day access", included: true },
    { feature: "Perfect for active job searches", included: true },
    { feature: "One-time payment (no subscription)", included: true },
  ],
  application: [
    { feature: "All Premium features for single use", included: true },
    { feature: "One tailored resume & cover letter", included: true },
    { feature: "One-time payment (no subscription)", included: true },
    { feature: "Access expires after export", included: true },
  ],
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price
  annualPrice?: number; // Optional annual price
  features: typeof planFeatures.free;
  popular?: boolean;
  oneTime?: boolean;
  duration?: string;
}

// Define subscription plans
const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For occasional job seekers",
    price: 0,
    features: planFeatures.free,
  },
  {
    id: "premium-monthly",
    name: "Premium",
    description: "For serious job hunters",
    price: 9.99,
    annualPrice: 89.99, // ~$7.50/month when paid annually
    features: planFeatures.premium,
    popular: true,
  },
  {
    id: "campaign",
    name: "Job Search Campaign",
    description: "90-day full access",
    price: 29.99,
    features: planFeatures.campaign,
    oneTime: true,
    duration: "90 days",
  },
  {
    id: "application",
    name: "Single Application",
    description: "One-time use",
    price: 14.99,
    features: planFeatures.application,
    oneTime: true,
    duration: "one-time",
  },
];

interface SubscriptionPlansProps {
  currentUser?: User;
  showTitle?: boolean;
  compact?: boolean;
  onPlanSelect?: (planId: string) => void;
}

export function SubscriptionPlans({
  currentUser,
  showTitle = true,
  compact = false,
  onPlanSelect,
}: SubscriptionPlansProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(currentUser || null);
  const [loading, setLoading] = useState(!currentUser);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch user data if not provided
  useEffect(() => {
    if (currentUser) return;

    async function fetchUser() {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false); // Stop loading if no session
          return;
        }

        // Fetch all columns needed for the User model
        const { data, error } = await supabase
          .from("users")
          .select("*") // Ensure all required fields are fetched
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("User data not found."); // Handle case where user exists in auth but not users table

        // Map all fields from DB (snake_case) to User model (camelCase)
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subscriptionTier: data.subscription_tier as User["subscriptionTier"], // Assuming type assertion is safe
          subscriptionStatus:
            data.subscription_status as User["subscriptionStatus"], // Assuming type assertion is safe
          trialEnds: data.trial_ends ?? undefined,
          preferences: (data.preferences as User["preferences"]) ?? {},
          professionalProfile:
            data.professional_profile as User["professionalProfile"],
          billingInfo: data.billing_info as User["billingInfo"],
          usageMetrics: data.usage_metrics as User["usageMetrics"],
          notificationPreferences:
            data.notification_preferences as User["notificationPreferences"],
          onboardingStatus: data.onboarding_status as User["onboardingStatus"],
          privacySettings: data.privacy_settings as User["privacySettings"],
          emailVerified: data.email_verified, // Add required field
          lastLoginAt: data.last_login_at ?? undefined,
          scheduledForDeletionAt: data.scheduled_for_deletion_at ?? undefined,
          authProvider: data.auth_provider as User["authProvider"],
          authProviderUserId: data.auth_provider_user_id ?? undefined,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Could not load user subscription information");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [currentUser, supabase]);

  // Determine if user can upgrade (free tier or trial)
  const canUpgrade =
    user &&
    (user.subscriptionTier === "free" ||
      user.subscriptionStatus === "trial" ||
      user.subscriptionStatus === "inactive");

  // Get current plan display name
  const getCurrentPlanName = () => {
    if (!user) return "Loading...";

    switch (user.subscriptionTier) {
      case "free":
        return "Free Plan";
      case "premium":
        return "Premium Plan";
      case "enterprise":
        return "Enterprise Plan";
      default:
        return "Unknown Plan";
    }
  };

  // Format price display
  const formatPrice = (price: number, cycle?: "monthly" | "annual") => {
    if (price === 0) return "Free";

    return `$${price.toFixed(2)}${
      cycle === "annual" ? "/year" : cycle === "monthly" ? "/month" : ""
    }`;
  };

  // Calculate savings percentage for annual billing
  const calculateSavings = (monthlyPrice: number, annualPrice?: number) => {
    if (!annualPrice) return 0;
    const monthlyCost = monthlyPrice * 12;
    return Math.round(((monthlyCost - annualPrice) / monthlyCost) * 100);
  };

  // Handle plan selection/upgrade
  const handleSelectPlan = async (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }

    if (!user) {
      // Redirect to login if not logged in
      router.push(
        `/login?returnUrl=${encodeURIComponent("/account/subscription")}`,
      );
      return;
    }

    // Get the plan details
    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (!selectedPlan) return;

    setUpgrading(planId);

    try {
      // In a real implementation, this would initiate the payment flow
      // For now, we'll just simulate a redirect to a payment page

      // Create checkout session in database to track the upgrade attempt
      const { error } = await supabase.from("checkout_sessions").insert({
        user_id: user.id,
        plan_id: planId,
        amount:
          billingCycle === "annual" && selectedPlan.annualPrice
            ? selectedPlan.annualPrice
            : selectedPlan.price,
        currency: "usd",
        billing_cycle: selectedPlan.oneTime ? "one-time" : billingCycle,
        status: "created",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Redirect to checkout page
      // In a real implementation, this would likely be a Stripe Checkout page
      router.push(`/checkout?plan=${planId}&cycle=${billingCycle}`);
    } catch (err) {
      console.error("Error initiating upgrade:", err);
      setError("Failed to initiate upgrade. Please try again.");
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500">
            Choose the perfect plan for your job search journey
          </p>
        </div>
      )}

      {error && (
        <div className="mx-auto mb-6 max-w-3xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {user && !compact && (
        <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="mr-3 rounded-full bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                Your current plan:{" "}
                <span className="font-bold">{getCurrentPlanName()}</span>
              </h3>
              {user.subscriptionTier === "premium" && (
                <p className="mt-1 text-sm text-blue-700">
                  You have access to all premium features.
                </p>
              )}
              {user.subscriptionStatus === "trial" && user.trialEnds && (
                <p className="mt-1 text-sm text-blue-700">
                  Your trial period ends on{" "}
                  {new Date(user.trialEnds).toLocaleDateString()}
                </p>
              )}
              {canUpgrade && (
                <p className="mt-1 text-sm text-blue-700">
                  Upgrade to unlock all premium features!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle - Only show for subscription plans */}
      {!compact && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              className={`rounded px-4 py-2 text-sm font-medium ${
                billingCycle === "monthly"
                  ? "bg-white text-blue-700 shadow"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly Billing
            </button>
            <button
              className={`flex items-center rounded px-4 py-2 text-sm font-medium ${
                billingCycle === "annual"
                  ? "bg-white text-blue-700 shadow"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("annual")}
            >
              Annual Billing
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div
        className={`grid ${
          compact
            ? "mx-auto max-w-md grid-cols-1 gap-4"
            : "mx-auto max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {plans.map((plan) => {
          // Skip annual pricing display in compact mode
          if (compact && plan.id.includes("annual")) return null;

          // Determine if this is the user's current plan
          const isCurrentPlan =
            user?.subscriptionTier === "premium" &&
            plan.id.includes("premium") &&
            user.subscriptionStatus === "active";

          // Determine the price to display based on billing cycle
          const displayPrice =
            billingCycle === "annual" && plan.annualPrice
              ? plan.annualPrice
              : plan.price;

          // Calculate savings if applicable
          const savingsPercent = plan.annualPrice
            ? calculateSavings(plan.price, plan.annualPrice)
            : 0;

          return (
            <div
              key={plan.id}
              className={`overflow-hidden rounded-lg ${
                plan.popular
                  ? "relative border-2 border-blue-500"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && !compact && (
                <div className="bg-blue-500 py-1 text-center text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-gray-600">{plan.description}</p>

                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatPrice(
                        displayPrice,
                        plan.oneTime ? undefined : billingCycle,
                      )}
                    </span>
                    {!plan.oneTime && (
                      <span className="ml-1 text-gray-500">
                        {billingCycle === "monthly" ? "/month" : "/year"}
                      </span>
                    )}
                  </div>

                  {billingCycle === "annual" &&
                    savingsPercent > 0 &&
                    !compact && (
                      <p className="mt-1 text-sm text-green-600">
                        Save {savingsPercent}% with annual billing
                      </p>
                    )}

                  {plan.oneTime && plan.duration && (
                    <p className="mt-1 text-sm text-gray-500">
                      {plan.duration === "one-time"
                        ? "Single use"
                        : `Valid for ${plan.duration}`}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : plan.id === "free"
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          : ""
                    }`}
                    disabled={
                      isCurrentPlan ||
                      (plan.id === "free" &&
                        user?.subscriptionTier !== "free") ||
                      upgrading === plan.id
                    }
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {upgrading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : plan.id === "free" ? (
                      "Free Plan"
                    ) : user ? (
                      "Upgrade"
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </div>

                {!compact && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      What&apos;s included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                          ) : (
                            <X className="mr-2 h-5 w-5 flex-shrink-0 text-gray-300" />
                          )}
                          <span
                            className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}
                          >
                            {feature.feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      {!compact && (
        <div className="mx-auto mt-12 max-w-4xl rounded-lg border border-gray-100 bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Why Choose Premium?
          </h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Zap className="h-6 w-6 text-blue-700" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                Unlimited Access
              </h4>
              <p className="text-sm text-gray-600">
                Create unlimited tailored resumes for every job you apply to,
                maximizing your chances of success.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Shield className="h-6 w-6 text-green-700" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                Advanced AI Tools
              </h4>
              <p className="text-sm text-gray-600">
                Get unrestricted access to our AI-powered tailoring tools that
                optimize your resume for each job application.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-orange-100 p-3">
                <Clock className="h-6 w-6 text-orange-700" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                Time Savings
              </h4>
              <p className="text-sm text-gray-600">
                Premium users save an average of 3-4 hours per job application
                with our comprehensive tools.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ or testimonials could go here */}
    </div>
  );
}
