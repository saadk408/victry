// File: /components/account/profile-editor.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User } from "@/models/user";
import { isValidEmail } from "@/lib/utils/validation";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface ProfileEditorProps {
  initialTab?: string;
  onSave?: () => void;
}

export function ProfileEditor({
  initialTab = "personal",
  onSave,
}: ProfileEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  // State for user profile
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [defaultTemplate, setDefaultTemplate] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Redirect to login if not authenticated
          router.push("/login?returnUrl=/account");
          return;
        }

        // Fetch user profile from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        if (!userData) {
          throw new Error("User profile not found");
        }

        // Transform database user to application model
        const userProfile: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          subscriptionTier: userData.subscription_tier as
            | "free"
            | "premium"
            | "enterprise",
          subscriptionStatus: userData.subscription_status as
            | "active"
            | "inactive"
            | "trial",
          trialEnds: userData.trial_ends,
          preferences: userData.preferences || {},
          emailVerified: userData.email_verified,
        };

        // Set user state and form state
        setUser(userProfile);
        setFirstName(userProfile.firstName || "");
        setLastName(userProfile.lastName || "");
        setEmail(userProfile.email);
        setTheme(userProfile.preferences?.theme || "system");
        setDefaultTemplate(userProfile.preferences?.defaultTemplate || "");
        setEmailNotifications(
          userProfile.preferences?.emailNotifications !== false,
        );
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user profile",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [supabase, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate inputs
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!user) {
        throw new Error("User not loaded");
      }

      // Check if email changed and update it in auth if needed
      if (email !== user.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email,
        });

        if (updateAuthError) {
          throw updateAuthError;
        }
      }

      // Prepare preferences object
      const preferences = {
        theme,
        defaultTemplate,
        emailNotifications,
      };

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local user state
      setUser({
        ...user,
        firstName,
        lastName,
        email,
        preferences,
        updatedAt: new Date().toISOString(),
      });

      // Show success message
      setSuccess("Profile updated successfully");

      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);

      // Clear success message after a few seconds
      if (success) {
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading your profile...</span>
        </div>
      ) : error && !user ? (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
          <div className="flex items-start">
            <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading profile</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.refresh()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Success Message */}
          {success && (
            <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-4 text-green-700">
              <div className="flex">
                <Check className="mr-2 h-5 w-5" />
                <p>{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
              <div className="flex">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="personal" className="flex-1">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1">
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 py-4">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <p className="mb-4 text-sm text-gray-600">
                Update your personal information and how you appear on the
                platform.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                />
                <p className="text-xs text-gray-500">
                  This is the email used for login and notifications.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 py-4">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <p className="mb-4 text-sm text-gray-600">
                Customize your experience with these preferences.
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-gray-500">
                      Select your preferred theme for the application.
                    </p>
                  </div>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as "light" | "dark" | "system")
                    }
                    className="rounded-md border border-gray-300 p-2"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="defaultTemplate">
                      Default Resume Template
                    </Label>
                    <p className="text-sm text-gray-500">
                      Choose your default template for new resumes.
                    </p>
                  </div>
                  <select
                    id="defaultTemplate"
                    value={defaultTemplate}
                    onChange={(e) => setDefaultTemplate(e.target.value)}
                    className="rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Choose a default template</option>
                    <option value="modern">Modern</option>
                    <option value="professional">Professional</option>
                    <option value="creative">Creative</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications about account activity and
                      updates.
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-4 py-4">
              <h2 className="text-lg font-semibold">Account Information</h2>
              <p className="mb-4 text-sm text-gray-600">
                View and manage your account details.
              </p>

              <div className="space-y-4">
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Subscription Plan
                      </h4>
                      <p className="font-medium">
                        {user?.subscriptionTier === "free"
                          ? "Free Plan"
                          : user?.subscriptionTier === "premium"
                            ? "Premium Plan"
                            : "Enterprise Plan"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Subscription Status
                      </h4>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user?.subscriptionStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : user?.subscriptionStatus === "trial"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user?.subscriptionStatus === "active"
                          ? "Active"
                          : user?.subscriptionStatus === "trial"
                            ? "Trial"
                            : "Inactive"}
                      </div>
                    </div>

                    {user?.subscriptionStatus === "trial" && user.trialEnds && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">
                          Trial Ends
                        </h4>
                        <p>{new Date(user.trialEnds).toLocaleDateString()}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Member Since
                      </h4>
                      <p>
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => router.push("/account/subscription")}
                    >
                      Manage Subscription
                    </Button>
                    {user?.subscriptionTier === "free" && (
                      <Button size="sm" onClick={() => router.push("/pricing")}>
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="mb-2 text-sm font-semibold">
                    Need to change your password?
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { error } =
                          await supabase.auth.resetPasswordForEmail(email);
                        if (error) throw error;
                        alert("Password reset link sent to your email");
                      } catch (err) {
                        console.error("Error sending password reset:", err);
                        alert("Failed to send password reset email");
                      }
                    }}
                  >
                    Send Password Reset Email
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-red-600">
                    Danger Zone
                  </h3>
                  <p className="mb-2 text-sm text-gray-600">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete your account? This action cannot be undone.",
                        )
                      ) {
                        router.push("/account/delete");
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end border-t pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
