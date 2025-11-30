/**
 * QuickActions Component
 *
 * Grid of quick action buttons for common tasks
 */

import React from 'react';
import { Card, CardHeader, CardBody } from '@components/common/Card';
import type { QuickAction } from '../../types/dashboard.types';

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600
                hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                group
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2
                  ${action.color || 'bg-primary-100 text-primary-600'}
                  group-hover:scale-110 transition-transform duration-200
                `}
              >
                {action.icon}
              </div>

              {/* Label */}
              <span className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-1">
                {action.label}
              </span>

              {/* Description */}
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {action.description}
              </span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickActions;
