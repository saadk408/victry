import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoogleOAuthButtonProps {
  loading?: boolean;
  onClick: () => void | Promise<void>;
  variant?: "signin" | "signup";
  fullWidth?: boolean;
  disabled?: boolean;
}

export function GoogleOAuthButton({ 
  loading = false,
  onClick,
  variant = "signin",
  fullWidth = true,
  disabled = false
}: GoogleOAuthButtonProps) {
  const text = variant === "signin" 
    ? "Sign in with Google" 
    : "Continue with Google";

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        flex items-center justify-center gap-3
        min-h-[44px] px-4 py-2.5
        bg-background hover:bg-muted
        border border-border hover:border-input
        text-foreground font-medium
        transition-all duration-200
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
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54L20.0303 3.11C17.9603 1.19 15.2403 0 12.0003 0C7.31033 0 3.25033 2.69 1.28033 6.60L5.27033 9.71C6.29033 6.89 8.91033 4.75 12.0003 4.75Z"
            fill="#EA4335"
          />
          <path
            d="M23.49 12.27C23.49 11.48 23.42 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.33 17.24 16.07 18.09L19.93 21.19C22.19 19.09 23.49 15.94 23.49 12.27Z"
            fill="#4285F4"
          />
          <path
            d="M5.26999 14.29C5.02999 13.57 4.89999 12.8 4.89999 12C4.89999 11.2 5.02999 10.43 5.26999 9.71L1.27999 6.6C0.47999 8.24 0.00999451 10.06 0.00999451 12C0.00999451 13.94 0.47999 15.76 1.27999 17.4L5.26999 14.29Z"
            fill="#FBBC05"
          />
          <path
            d="M12.0004 24C15.2404 24 17.9604 22.92 19.9404 21.19L16.0804 18.09C15.0004 18.82 13.6204 19.25 12.0004 19.25C8.91035 19.25 6.29035 17.11 5.27035 14.29L1.28035 17.4C3.25035 21.31 7.31035 24 12.0004 24Z"
            fill="#34A853"
          />
        </svg>
      )}
      <span className={loading ? 'ml-2' : ''}>{text}</span>
    </Button>
  );
}