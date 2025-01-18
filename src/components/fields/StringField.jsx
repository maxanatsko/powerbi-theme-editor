import React from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';
import { FormField } from '../core/FormField';

export const StringField = ({ path, schema, value = '', onChange, required }) => {
  const isSchemaField = path === '$schema';
  const { label, tooltip } = getPathDisplayInfo(path);
  
  return (
    <FormField
      label={schema.title || label}
      description={schema.description}
      required={required}
    >
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
    </FormField>
  );
};