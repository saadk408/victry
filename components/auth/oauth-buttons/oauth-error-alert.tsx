interface OAuthErrorAlertProps {
  provider: 'google' | 'linkedin';
  error: string;
  onRetry: () => void;
}

export function OAuthErrorAlert({ provider, error, onRetry }: OAuthErrorAlertProps) {
  const providerName = provider === 'google' ? 'Google' : 'LinkedIn';
  
  const errorMessages: Record<string, string> = {
    'User cancelled flow': `${providerName} sign-in was cancelled. Please try again.`,
    'OAuth error': `Unable to connect to ${providerName}. Please try again later.`,
    'Email already exists': `This email is already registered. Try signing in instead.`,
    'default': `Something went wrong with ${providerName} sign-in. Please try again.`
  };

  const message = errorMessages[error] || errorMessages.default;

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-500 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}