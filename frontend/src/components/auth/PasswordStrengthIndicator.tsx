/**
 * Password Strength Indicator Component
 *
 * Visual indicator showing password strength with requirements checklist
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import { VALIDATION } from '@config/constants';
import type { PasswordStrength, PasswordStrengthResult } from '@/types/auth';

export interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  const requirements = {
    minLength: password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
    hasNumber: /[0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score (0-5)
  const score = Object.values(requirements).filter(Boolean).length;

  // Determine strength level
  let strength: PasswordStrength;
  if (score <= 2) {
    strength = 'weak' as PasswordStrength;
  } else if (score === 3) {
    strength = 'medium' as PasswordStrength;
  } else if (score === 4) {
    strength = 'strong' as PasswordStrength;
  } else {
    strength = 'very_strong' as PasswordStrength;
  }

  return {
    strength,
    score,
    requirements,
  };
};

/**
 * Password Strength Indicator Component
 */
const PasswordStrengthIndicator = ({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) => {
  const strengthResult = useMemo(() => calculatePasswordStrength(password), [password]);

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  const { strength, requirements } = strengthResult;

  // Strength colors and labels
  const strengthConfig = {
    weak: {
      color: 'bg-danger-500',
      label: 'Weak',
      textColor: 'text-danger-600',
      width: 'w-1/4',
    },
    medium: {
      color: 'bg-warning-500',
      label: 'Medium',
      textColor: 'text-warning-600',
      width: 'w-1/2',
    },
    strong: {
      color: 'bg-success-500',
      label: 'Strong',
      textColor: 'text-success-600',
      width: 'w-3/4',
    },
    very_strong: {
      color: 'bg-success-600',
      label: 'Very Strong',
      textColor: 'text-success-700',
      width: 'w-full',
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength meter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Password strength:</span>
          <span className={clsx('text-xs font-semibold', config.textColor)}>
            {config.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-300 ease-in-out',
              config.color,
              config.width
            )}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700">Requirements:</p>
          <ul className="space-y-1">
            <RequirementItem
              met={requirements.minLength}
              label={`At least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`}
            />
            <RequirementItem met={requirements.hasLowercase} label="Lowercase letter" />
            <RequirementItem met={requirements.hasUppercase} label="Uppercase letter" />
            <RequirementItem met={requirements.hasNumber} label="Number" />
            <RequirementItem
              met={requirements.hasSpecialChar}
              label="Special character (optional)"
              optional
            />
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Requirement Item Component
 */
interface RequirementItemProps {
  met: boolean;
  label: string;
  optional?: boolean;
}

const RequirementItem = ({ met, label, optional = false }: RequirementItemProps) => {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div
        className={clsx(
          'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
          met ? 'bg-success-100' : 'bg-gray-100'
        )}
      >
        {met ? (
          <svg
            className="w-3 h-3 text-success-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="3" />
          </svg>
        )}
      </div>
      <span className={clsx(met ? 'text-gray-700' : 'text-gray-500', optional && 'italic')}>
        {label}
      </span>
    </li>
  );
};

export default PasswordStrengthIndicator;
