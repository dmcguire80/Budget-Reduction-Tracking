/**
 * Card Component
 *
 * Reusable card container with optional header, body, and footer sections
 */

import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Main Card Component
 */
export const Card = ({ children, noPadding = false, className, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-md border border-gray-200',
        { 'p-0': noPadding },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header
 */
export const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={clsx('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Body
 */
export const CardBody = ({ children, noPadding = false, className, ...props }: CardBodyProps) => {
  return (
    <div
      className={clsx({ 'px-6 py-4': !noPadding }, className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer
 */
export const CardFooter = ({ children, className, ...props }: CardFooterProps) => {
  return (
    <div
      className={clsx('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
