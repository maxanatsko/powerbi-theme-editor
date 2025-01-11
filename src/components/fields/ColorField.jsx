import React from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const ColorField = ({ path, schema, value = '#000000', onChange, required }) => {
  const { label } = getPathDisplayInfo(path);
  const displayLabel = schema.title || label;

  const handleChange = (newValue) => {
    // Ensure the color is in the correct format (#RRGGBB or #RRGGBBAA)
    const colorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    if (colorRegex.test(newValue)) {
      onChange(path, newValue);
    }
  };

  return (
    <div className="my-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {displayLabel}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value.slice(0, 7)} // Only use RGB part for color input
          onChange={(e) => handleChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="#RRGGBB or #RRGGBBAA"
        />
      </div>
      {schema.description && (
        <p className="mt-1 text-sm text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};