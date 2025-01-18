import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

export const FormField = ({ label, description, tooltip, required, children, className = '' }) => {
  // Only show tooltip if we have actual content
  const tooltipContent = description || tooltip;
  const showTooltip = typeof tooltipContent === 'string' && tooltipContent.trim().length > 0;
  return (
    <div className={`my-2 ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
        <label className="block text-sm font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">
          {label}
          {required && <span className="text-theme-light-state-error dark:text-theme-dark-state-error ml-0.5">*</span>}
        </label>
        {showTooltip && (
          <Tooltip content={tooltipContent}>
            <button
              className="inline-flex items-center justify-center rounded-full p-1 text-theme-light-text-secondary dark:text-theme-dark-text-secondary hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-light-accent-primary dark:focus-visible:ring-theme-dark-accent-primary"
              aria-label="Show description"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
};