/**
 * NotFound Page
 *
 * 404 error page for routes that don't exist
 */

import { Link } from 'react-router-dom';
import { ROUTES, APP_NAME } from '@config/constants';
import Button from '@components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-primary-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. The page might have
            been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" size="lg">
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
              Go to Dashboard
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
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
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact support.
          </p>
          <p className="text-xs text-gray-500 mt-2">{APP_NAME}</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
