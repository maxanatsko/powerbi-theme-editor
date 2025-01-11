import React from 'react';
import { resolveEnumOptions } from '../../utils/schemaUtils';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const EnumField = ({ path, schema, value, onChange, required }) => {
    const options = resolveEnumOptions(schema);
    const { label } = getPathDisplayInfo(path);
    const displayLabel = schema.title || label;
  
    return (
      <div className="my-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {displayLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(path, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.const} value={option.const}>
              {option.title}
            </option>
          ))}
        </select>
        {schema.description && (
          <p className="mt-1 text-sm text-gray-500">{schema.description}</p>
        )}
      </div>
    );
};