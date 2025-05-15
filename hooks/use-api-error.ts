// File: /hooks/use-api-error.ts
import { useState, useCallback } from "react";
import { ApiErrorResponse } from "@/types/api";
import { ErrorCode } from "@/lib/utils/error-utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

/**
 * Options for the useApiError hook
 */
export interface UseApiErrorOptions {
  /**
   * Whether to show toast notifications for errors
   * @default true
   */
  showToast?: boolean;

  /**
   * Whether to redirect to login for authentication errors
   * @default true
   */
  redirectOnAuthError?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: ApiErrorResponse) => void;

  /**
   * Custom toast variant for errors
   * @default "destructive"
   */
  toastVariant?: "default" | "destructive";

  /**
   * Duration in milliseconds for the toast
   * @default 3000
   */
  toastDuration?: number;
}

/**
 * Hook for handling API errors in components
 * @param options Options for error handling
 * @returns Object with error state and error handling methods
 */
export function useApiError(options: UseApiErrorOptions = {}) {
  const {
    showToast = true,
    redirectOnAuthError = true,
    onError,
    toastVariant = "destructive",
    toastDuration = 3000,
  } = options;

  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Handles an API error
   * @param error The error to handle
   */
  const handleError = useCallback(
    (apiError: unknown) => {
      let errorResponse: ApiErrorResponse;

      // Parse the error if it's not already an ApiErrorResponse
      if (
        typeof apiError === "object" &&
        apiError !== null &&
        "error" in apiError &&
        typeof (apiError as ApiErrorResponse).error === "string"
      ) {
        errorResponse = apiError as ApiErrorResponse;
      } else if (apiError instanceof Error) {
        errorResponse = {
          error: apiError.message,
        };
      } else if (typeof apiError === "string") {
        errorResponse = {
          error: apiError,
        };
      } else {
        errorResponse = {
          error: "An unexpected error occurred",
        };
      }

      // Set the error state
      setError(errorResponse);

      // Call custom error handler if provided
      if (onError) {
        onError(errorResponse);
      }

      // Show toast notification if enabled
      if (showToast) {
        toast({
          title: "Error",
          description: errorResponse.error,
          variant: toastVariant,
          duration: toastDuration,
        });
      }

      // Redirect to login for authentication errors if enabled
      if (
        redirectOnAuthError &&
        errorResponse.code &&
        [
          ErrorCode.AUTH_NOT_AUTHENTICATED,
          ErrorCode.AUTH_SESSION_EXPIRED,
          ErrorCode.AUTH_INVALID_CREDENTIALS,
        ].includes(errorResponse.code as ErrorCode)
      ) {
        // Get the current path to redirect back after login
        const currentPath = window.location.pathname;
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
      }
    },
    [showToast, redirectOnAuthError, onError, toast, toastVariant, toastDuration, router]
  );

  /**
   * Clears the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrapper for API calls that handles loading state and errors
   * @param apiCall The API call function to execute
   * @returns The result of the API call
   */
  const withErrorHandling = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      clearError();

      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, clearError]
  );

  return {
    /** Current error state */
    error,
    /** Whether an API call is in progress */
    isLoading,
    /** Function to handle an API error */
    handleError,
    /** Function to clear the error state */
    clearError,
    /** Wrapper for API calls that handles loading state and errors */
    withErrorHandling,
    /** Function to set loading state manually */
    setIsLoading,
  };
}

/**
 * Helper function to extract field-specific error messages
 * @param error The API error response
 * @param fieldName The field name to get error for
 * @returns The error message for the field, or undefined if no error
 */
export function getFieldError(
  error: ApiErrorResponse | null,
  fieldName: string
): string | undefined {
  if (!error || !error.validationErrors) {
    return undefined;
  }

  const fieldError = error.validationErrors.find(
    (validationError) => validationError.field === fieldName
  );

  return fieldError?.message;
}