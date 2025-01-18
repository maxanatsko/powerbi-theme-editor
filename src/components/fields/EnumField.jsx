import React from 'react';
import { resolveEnumOptions } from '../../utils/schemaUtils';
import { getPathDisplayInfo } from '../../utils/pathUtils';
import { FormField } from '../core/FormField';

export const EnumField = ({ path, schema, value, onChange, required }) => {
    const options = resolveEnumOptions(schema);
    const { label } = getPathDisplayInfo(path);
    const displayLabel = schema.title || label;
  
    return (
      <FormField
        label={displayLabel}
        description={schema.description}
        required={required}
      >
        <select
          value={value || ''}
          onChange={(e) => onChange(path, e.target.value)}
          className="w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-200
            bg-theme-light-bg-input dark:bg-theme-dark-bg-input
            text-theme-light-text-primary dark:text-theme-dark-text-primary
            border border-theme-light-border-default dark:border-theme-dark-border-default
            focus:outline-none focus:ring-2
            focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
            focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
            hover:border-theme-light-border-hover dark:hover:border-theme-dark-border-hover"
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.const} value={option.const}>
              {option.title}
            </option>
          ))}
        </select>
      </FormField>
    );
};