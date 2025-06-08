import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LinkedInOAuthButtonProps {
  loading?: boolean;
  onClick: () => void | Promise<void>;
  variant?: "signin" | "signup";
  fullWidth?: boolean;
  disabled?: boolean;
  priority?: boolean; // For PRD's LinkedIn-first approach
}

export function LinkedInOAuthButton({ 
  loading = false,
  onClick,
  variant = "signin",
  fullWidth = true,
  disabled = false,
  priority = false
}: LinkedInOAuthButtonProps) {
  const text = variant === "signin" 
    ? "Sign in with LinkedIn" 
    : "Continue with LinkedIn";

  return (
    <Button
      type="button"
      variant={priority ? "default" : "outline"}
      className={`
        flex items-center justify-center gap-3
        min-h-[44px] px-4 py-2.5
        ${priority 
          ? 'bg-[#0077B5] hover:bg-[#005885] text-white border-0' 
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-[#0077B5]'
        }
        font-medium transition-all duration-200
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={text}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            fill={priority ? "#FFFFFF" : "#0077B5"}
          />
        </svg>
      )}
      <span className={loading ? 'ml-2' : ''}>{text}</span>
    </Button>
  );
}