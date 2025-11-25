/**
 * Error Boundary Component
 *
 * Catches and displays errors in React component tree
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import Button from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by Error Boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-danger-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. Please try again or
                contact support if the problem persists.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-danger-800 mb-2">
                  Error Details (Development Mode)
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-danger-700">Message:</p>
                    <p className="text-xs text-danger-600 font-mono">
                      {this.state.error.message}
                    </p>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-xs font-medium text-danger-700">
                        Component Stack:
                      </p>
                      <pre className="text-xs text-danger-600 font-mono overflow-auto max-h-40 mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={this.handleReset}>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/'}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </Button>
            </div>

            {/* Report Issue */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                If this problem persists, please{' '}
                <a
                  href="mailto:support@example.com"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
