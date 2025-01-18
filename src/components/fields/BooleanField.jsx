import React from 'react';
import { FormField } from '../core/FormField';

export const BooleanField = ({ path, schema, value, onChange, required }) => {
  const id = `field-${path}`;
  
  return (
    <FormField
      label={schema.title || path.split('.').pop()}
      description={schema.description}
      required={required}
    >
      <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded transition-colors duration-200
          text-theme-light-accent-primary dark:text-theme-dark-accent-primary
          border-theme-light-border-default dark:border-theme-dark-border-default
          focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus"
        checked={value || false}
        onChange={(e) => onChange(path, e.target.checked)}
      />
      <label htmlFor={id} className="ml-2 block text-sm
        text-theme-light-text-primary dark:text-theme-dark-text-primary">
        Click to toggle
      </label>
      </div>
    </FormField>
  );
};