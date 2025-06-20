// File: /app/_components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  Home,
  FileText,
  Briefcase,
  Settings,
  User,
  PlusCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { User as UserModel } from "@/models/user";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumesExpanded, setResumesExpanded] = useState(true);
  const [jobsExpanded, setJobsExpanded] = useState(false);

  const supabase = createClient();

  // Fetch user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser(
            userData || { id: session.user.id, email: session.user.email },
          );
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  // Expand sections based on current path
  useEffect(() => {
    if (pathname.startsWith("/resume")) {
      setResumesExpanded(true);
    }

    if (pathname.startsWith("/jobs") || pathname.includes("job-description")) {
      setJobsExpanded(true);
    }
  }, [pathname]);

  // Check if link is active
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  // Logout functionality
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Navigation item component
  const NavItem = ({
    href,
    label,
    icon,
    active = false,
    onClick = () => {},
  }: {
    href?: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
  }) => {
    const content = (
      <div
        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
        }`}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }

    return (
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  };

  // Group header component
  const GroupHeader = ({
    label,
    expanded,
    onClick,
  }: {
    label: string;
    expanded: boolean;
    onClick: () => void;
  }) => (
    <button
      className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-accent-foreground"
      onClick={onClick}
    >
      {label}
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );

  if (isLoading) {
    return (
      <aside className="h-screen w-64 border-r bg-muted/50 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Victry</h2>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-screen w-64 overflow-y-auto border-r bg-muted/50 p-4">
      <div className="mb-6">
        <Link href="/">
          <h2 className="text-lg font-semibold text-foreground">Victry</h2>
        </Link>
      </div>

      {user ? (
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <NavItem
              href="/dashboard"
              label="Dashboard"
              icon={<Home className="h-5 w-5" />}
              active={isActive("/dashboard")}
            />

            {/* Resumes Section */}
            <div>
              <GroupHeader
                label="Resumes"
                expanded={resumesExpanded}
                onClick={() => setResumesExpanded(!resumesExpanded)}
              />

              {resumesExpanded && (
                <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
                  <NavItem
                    href="/resume"
                    label="All Resumes"
                    icon={<FileText className="h-4 w-4" />}
                    active={pathname === "/resume"}
                  />
                  <NavItem
                    href="/resume/create"
                    label="Create New"
                    icon={<PlusCircle className="h-4 w-4" />}
                    active={pathname === "/resume/create"}
                  />
                </div>
              )}
            </div>

            {/* Job Descriptions Section */}
            <div>
              <GroupHeader
                label="Job Descriptions"
                expanded={jobsExpanded}
                onClick={() => setJobsExpanded(!jobsExpanded)}
              />

              {jobsExpanded && (
                <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
                  <NavItem
                    href="/jobs"
                    label="All Jobs"
                    icon={<Briefcase className="h-4 w-4" />}
                    active={pathname === "/jobs"}
                  />
                  <NavItem
                    href="/jobs/add"
                    label="Add New"
                    icon={<PlusCircle className="h-4 w-4" />}
                    active={pathname === "/jobs/add"}
                  />
                </div>
              )}
            </div>

            <NavItem
              href="/analytics"
              label="Analytics"
              icon={<BarChart2 className="h-5 w-5" />}
              active={isActive("/analytics")}
            />
          </div>

          {/* User Related Links */}
          <div className="space-y-1 border-t border-border pt-4">
            <NavItem
              href="/account"
              label="Account Settings"
              icon={<Settings className="h-5 w-5" />}
              active={isActive("/account")}
            />

            <NavItem
              label="Sign Out"
              icon={<LogOut className="h-5 w-5" />}
              onClick={handleLogout}
            />
          </div>

          {/* User Info */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center px-3 py-2">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-foreground">
                  {user.firstName || user.email?.split("@")[0] || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.subscriptionTier || "Free"} Plan
                </p>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="space-y-2">
          <NavItem
            href="/login"
            label="Log In"
            icon={<LogOut className="h-5 w-5" />}
            active={pathname === "/login"}
          />
          <NavItem
            href="/register"
            label="Sign Up"
            icon={<User className="h-5 w-5" />}
            active={pathname === "/register"}
          />
        </nav>
      )}
    </aside>
  );
}
