/**
 * Auth Error Component
 *
 * Display authentication-specific errors with user-friendly messages
 */

import clsx from 'clsx';

export interface AuthErrorProps {
  error: string | null | undefined;
  className?: string;
}

/**
 * Map common error codes to user-friendly messages
 */
const mapErrorMessage = (error: string): string => {
  const errorLower = error.toLowerCase();

  // Common authentication error mappings
  const errorMappings: Record<string, string> = {
    'invalid credentials': 'Invalid email or password. Please try again.',
    'invalid email or password': 'Invalid email or password. Please try again.',
    'user not found': 'No account found with this email address.',
    'incorrect password': 'Incorrect password. Please try again.',
    'email already exists': 'An account with this email already exists.',
    'email already in use': 'This email is already registered. Please login instead.',
    'weak password': 'Password is too weak. Please use a stronger password.',
    'invalid email': 'Please enter a valid email address.',
    'token expired': 'Your session has expired. Please login again.',
    'invalid token': 'Your session is invalid. Please login again.',
    'unauthorized': 'You are not authorized. Please login.',
    'forbidden': 'You do not have permission to perform this action.',
    'network error': 'Network error. Please check your connection and try again.',
    'server error': 'Server error. Please try again later.',
    'too many requests': 'Too many login attempts. Please try again later.',
    'account locked': 'Your account has been locked. Please contact support.',
    'email not verified': 'Please verify your email address before logging in.',
  };

  // Check for matching error message
  for (const [key, message] of Object.entries(errorMappings)) {
    if (errorLower.includes(key)) {
      return message;
    }
  }

  // Return original error if no mapping found
  return error;
};

/**
 * Auth Error Component
 */
const AuthError = ({ error, className }: AuthErrorProps) => {
  if (!error) {
    return null;
  }

  const friendlyMessage = mapErrorMessage(error);

  return (
    <div
      className={clsx(
        'rounded-lg border border-danger-200 bg-danger-50 p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-danger-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-danger-800">Authentication Error</h3>
          <p className="mt-1 text-sm text-danger-700">{friendlyMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
