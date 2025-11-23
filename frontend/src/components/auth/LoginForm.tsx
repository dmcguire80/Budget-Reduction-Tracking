/**
 * Login Form Component
 *
 * Form for user login with email and password
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@hooks/useAuth';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import AuthError from './AuthError';
import { loginSchema, type LoginFormData } from '@validators/auth.schemas';

export interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * Login Form Component
 */
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error display */}
      <AuthError error={error} />

      {/* Email field */}
      <Input
        {...register('email')}
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        error={errors.email?.message}
        autoComplete="email"
        required
        icon={
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      {/* Password field */}
      <div>
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          autoComplete="current-password"
          required
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {/* Show/Hide password toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showPassword ? 'Hide' : 'Show'} password
        </button>
      </div>

      {/* Submit button */}
      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
