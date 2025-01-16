import React from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const StringField = ({ path, schema, value = '', onChange, required }) => {
  const isSchemaField = path === '$schema';
  const { label, tooltip } = getPathDisplayInfo(path);
  
  return (
    <div className="my-2">
      <label 
        className="block text-sm font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary mb-1"
        title={tooltip}
      >
        {schema.title || label}
        {required && <span className="text-theme-light-state-error dark:text-theme-dark-state-error ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        className={`w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-200
          ${isSchemaField 
            ? 'bg-theme-light-bg-input dark:bg-theme-dark-bg-input cursor-not-allowed' 
            : 'bg-theme-light-bg-input dark:bg-theme-dark-bg-input'}
          border border-theme-light-border-default dark:border-theme-dark-border-default
          text-theme-light-text-primary dark:text-theme-dark-text-primary
          placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder
          focus:outline-none focus:ring-2 
          focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
          focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
          hover:border-theme-light-border-hover dark:hover:border-theme-dark-border-hover`}
        placeholder={schema.description}
        readOnly={isSchemaField}
      />
      {schema.description && (
        <p className="mt-1 text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary">{schema.description}</p>
      )}
    </div>
  );
};