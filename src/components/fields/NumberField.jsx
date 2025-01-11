import React from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const NumberField = ({ path, schema, value = 0, onChange, required }) => {
  const { label } = getPathDisplayInfo(path);
  
  const displayLabel = schema.title || label;
  
  return (
    <div className="my-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {displayLabel}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(path, e.target.value ? Number(e.target.value) : '')}
        min={schema.minimum}
        max={schema.maximum}
        step={schema.type === 'integer' ? 1 : 'any'}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {schema.description && (
        <p className="mt-1 text-sm text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};