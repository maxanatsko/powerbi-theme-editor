import React, { useState, useRef } from 'react';

export const Tooltip = ({ children, content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
    if (e.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
    >
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-sm rounded shadow-lg whitespace-normal max-w-xs w-max
            bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface 
            text-theme-light-text-primary dark:text-theme-dark-text-primary
            border border-theme-light-border-default dark:border-theme-dark-border-default
            -translate-x-1/2 left-1/2 top-full mt-1
            ${className}`}
        >
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
              bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
              border-l border-t border-theme-light-border-default dark:border-theme-dark-border-default"
          />
          <div className="relative z-10">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};