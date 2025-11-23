/**
 * Login Page
 *
 * User login page (placeholder)
 */

import { Link } from 'react-router-dom';
import { Card, CardBody } from '@components/common/Card';
import { APP_NAME, ROUTES } from '@config/constants';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{APP_NAME}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardBody className="space-y-6">
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Login Page - Coming Soon
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Authentication functionality will be implemented by Agent 7
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-md bg-info-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-info-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-info-800">
                      For Development
                    </h3>
                    <div className="mt-2 text-sm text-info-700">
                      <p>
                        This is a placeholder page. The login functionality will include:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Email and password login</li>
                        <li>JWT authentication</li>
                        <li>Remember me option</li>
                        <li>Password reset link</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to={ROUTES.REGISTER}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to={ROUTES.HOME}
            className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
