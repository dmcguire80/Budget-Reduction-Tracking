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
