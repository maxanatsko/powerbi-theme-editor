import React from 'react';

const SearchResults = ({ results, onResultClick }) => {
  if (!results.length) return null;

  return (
    <div className="absolute z-50 w-full mt-1 rounded-md shadow-lg max-h-96 overflow-y-auto
      bg-theme-light-bg-base dark:bg-theme-dark-bg-base
      border border-theme-light-border-default dark:border-theme-dark-border-default">
      {results.map((result, index) => (
        <div
          key={`${result.path}-${index}`}
          className="p-3 cursor-pointer border-b last:border-b-0 transition-colors duration-200
            border-theme-light-border-default dark:border-theme-dark-border-default
            hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover"
          onClick={() => onResultClick(result)}
        >
          <div className="flex items-start">
            <span className={`text-xs px-2 py-1 rounded ${result.matchType === 'property'
              ? 'bg-theme-light-accent-primary/10 dark:bg-theme-dark-accent-primary/10 text-theme-light-accent-primary dark:text-theme-dark-accent-primary'
              : 'bg-theme-light-state-success/10 dark:bg-theme-dark-state-success/10 text-theme-light-state-success dark:text-theme-dark-state-success'
            }`}>
              {result.matchType}
            </span>
            <div className="ml-2 flex-1">
              <p className="text-sm font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">{result.path}</p>
              <p className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary mt-1">
                {result.context}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;