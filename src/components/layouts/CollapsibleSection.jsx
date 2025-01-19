import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { LabelWithTooltip } from '../core/LabelWithTooltip';

export const CollapsibleSection = ({
  label,
  description,
  defaultExpanded = true,
  children,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`w-full bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface rounded-lg mb-4 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-2 p-4 rounded-lg
          hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover
          text-theme-light-text-primary dark:text-theme-dark-text-primary
          transition-colors duration-200"
        aria-expanded={isExpanded}
      >
        <ChevronRight
          className={`w-5 h-5 transition-transform ${
            isExpanded ? 'transform rotate-90' : ''
          }`}
        />
        <LabelWithTooltip 
          label={label}
          description={description}
          className="flex-grow text-left"
        />
      </button>
      
      {isExpanded && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};