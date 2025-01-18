import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

export const FieldDescription = ({ label, tooltip }) => {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-lg font-semibold text-theme-light-text-primary dark:text-theme-dark-text-primary">
        {label}
      </h3>
      {tooltip && (
        <Tooltip content={tooltip}>
          <button 
            className="inline-flex items-center justify-center rounded-full p-1 text-theme-light-text-secondary dark:text-theme-dark-text-secondary hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-light-accent-primary dark:focus-visible:ring-theme-dark-accent-primary"
            aria-label="Show description"
          >
            <Info className="h-4 w-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};