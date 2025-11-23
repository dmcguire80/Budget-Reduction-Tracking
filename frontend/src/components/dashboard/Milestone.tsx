/**
 * Milestone Component
 *
 * Displays achievement milestones with celebration visual
 */

import React from 'react';
import { formatDate } from '@utils/format';
import type { Milestone as MilestoneType } from '../../types/dashboard.types';

interface MilestoneProps {
  milestone: MilestoneType;
  onDismiss?: (id: string) => void;
}

const Milestone: React.FC<MilestoneProps> = ({ milestone, onDismiss }) => {
  const handleDismiss = () => {
    if (onDismiss && milestone.isDismissible) {
      onDismiss(milestone.id);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-success-50 to-primary-50 border-2 border-success-200 rounded-lg p-4 shadow-sm">
      {/* Celebration Icon Background */}
      <div className="absolute top-2 right-2 text-6xl opacity-10 select-none">
        🎉
      </div>

      {/* Content */}
      <div className="relative flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-white text-xl">
              {milestone.icon}
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {milestone.title}
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {milestone.description}
              </p>
              <p className="text-xs text-gray-500">
                Achieved on {formatDate(milestone.date)}
              </p>
            </div>

            {/* Dismiss Button */}
            {milestone.isDismissible && onDismiss && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss milestone"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sparkle Effects */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning-400 rounded-full animate-ping" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-success-400 rounded-full animate-pulse" />
    </div>
  );
};

export default Milestone;
