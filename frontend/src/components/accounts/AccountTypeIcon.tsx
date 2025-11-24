/**
 * Account Type Icon Component
 *
 * Visual icons for different account types
 */

import clsx from 'clsx';
import { AccountType } from '@/types';

export interface AccountTypeIconProps {
  accountType: AccountType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AccountTypeIcon = ({ accountType, size = 'md', className }: AccountTypeIconProps) => {
  const sizeStyles = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const colorStyles = {
    CREDIT_CARD: 'text-blue-600',
    PERSONAL_LOAN: 'text-purple-600',
    AUTO_LOAN: 'text-green-600',
    MORTGAGE: 'text-orange-600',
    STUDENT_LOAN: 'text-indigo-600',
    OTHER: 'text-gray-600',
  };

  const icons = {
    CREDIT_CARD: '💳',
    PERSONAL_LOAN: '📄',
    AUTO_LOAN: '🚗',
    MORTGAGE: '🏠',
    STUDENT_LOAN: '🎓',
    OTHER: '💰',
  };

  return (
    <span
      className={clsx(sizeStyles[size], colorStyles[accountType], className)}
      role="img"
      aria-label={accountType}
    >
      {icons[accountType]}
    </span>
  );
};

export default AccountTypeIcon;
