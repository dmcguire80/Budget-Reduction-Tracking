/**
 * Register Form Component
 *
 * Form for user registration with name, email, password, and password confirmation
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@hooks/useAuth';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import AuthError from './AuthError';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { registerSchema, type RegisterFormData } from '@validators/auth.schemas';

export interface RegisterFormProps {
  onSuccess?: () => void;
}

/**
 * Register Form Component
 */
const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data.email, data.password, data.name);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error display */}
      <AuthError error={error} />

      {/* Name field */}
      <Input
        {...register('name')}
        type="text"
        label="Full Name"
        placeholder="John Doe"
        error={errors.name?.message}
        autoComplete="name"
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
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

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
          placeholder="Create a strong password"
          error={errors.password?.message}
          autoComplete="new-password"
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

        {/* Password strength indicator */}
        <PasswordStrengthIndicator password={password} showRequirements />
      </div>

      {/* Confirm Password field */}
      <div>
        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
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
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Show/Hide confirm password toggle */}
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showConfirmPassword ? 'Hide' : 'Show'} password
        </button>
      </div>

      {/* Submit button */}
      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
