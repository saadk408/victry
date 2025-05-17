// File: /lib/hooks/use-api-error.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ErrorCategory, ErrorCode } from '@/lib/utils/error-utils';

/**
 * API error response type
 */
interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    category: ErrorCategory;
    details?: unknown;
    path?: string;
    timestamp?: string;
    traceId?: string;
  };
}

/**
 * Result of the useApiError hook
 */
interface UseApiErrorResult {
  handleError: (error: unknown) => void;
  clearError: () => void;
  error: ApiErrorResponse['error'] | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Hook for handling API errors in components
 * Provides a consistent way to handle errors and display user-friendly messages
 */
export function useApiError(): UseApiErrorResult {
  const [error, setError] = useState<ApiErrorResponse['error'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle an error from an API request
   */
  const handleError = useCallback(async (error: unknown) => {
    setIsLoading(false);
    console.error('API Error:', error);

    let apiError: ApiErrorResponse['error'] | null = null;

    // Handle fetch errors
    if (error instanceof Response) {
      try {
        const errorData = await error.json() as ApiErrorResponse;
        if (errorData.error) {
          apiError = errorData.error;
        }
      } catch (parseError) {
        apiError = {
          code: ErrorCode.UNKNOWN_ERROR,
          message: error.statusText || 'An unexpected error occurred',
          category: ErrorCategory.UNKNOWN,
        };
      }
    } else if (error instanceof Error) {
      // Handle standard JS errors
      apiError = {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error.message || 'An unexpected error occurred',
        category: ErrorCategory.UNKNOWN,
        details: error.stack,
      };
    } else if (typeof error === 'object' && error !== null && 'error' in error) {
      // Handle structured API errors
      const typedError = error as { error: any };
      if (typedError.error && typeof typedError.error === 'object') {
        apiError = typedError.error as ApiErrorResponse['error'];
      }
    } else {
      // Fallback for unknown error types
      apiError = {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error ? String(error) : 'An unexpected error occurred',
        category: ErrorCategory.UNKNOWN,
      };
    }

    if (apiError) {
      setError(apiError);
      
      // Display toast notification for user-friendly feedback
      let title = 'Error';
      let description = apiError.message;
      let variant: 'default' | 'destructive' = 'destructive';

      // Customize toast based on error category
      switch (apiError.category) {
        case ErrorCategory.AUTH:
          title = 'Authentication Error';
          break;
        case ErrorCategory.VALIDATION:
          title = 'Validation Error';
          variant = 'default';
          break;
        case ErrorCategory.NOT_FOUND:
          title = 'Not Found';
          break;
        case ErrorCategory.RATE_LIMIT:
          title = 'Rate Limit Exceeded';
          description = 'Please try again later.';
          break;
        case ErrorCategory.EXTERNAL_SERVICE:
          title = 'Service Unavailable';
          description = 'There was an issue with one of our services. Please try again later.';
          break;
        default:
          title = 'Something went wrong';
          break;
      }

      toast({
        title,
        description,
        variant,
      });
    }
  }, [toast]);

  return {
    handleError,
    clearError,
    error,
    isLoading,
    setIsLoading,
  };
}