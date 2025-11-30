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
