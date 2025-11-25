/**
 * Login Page
 *
 * User login page with form and links to register
 */

import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter } from '@components/common/Card';
import LoginForm from '@components/auth/LoginForm';
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
          <CardBody>
            <LoginForm />
          </CardBody>

          <CardFooter className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Additional info */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
