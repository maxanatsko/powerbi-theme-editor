import React from 'react';

export const BooleanField = ({ path, schema, value, onChange, required }) => {
  const id = `field-${path}`;
  
  return (
    <div className="flex items-center my-2">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        checked={value || false}
        onChange={(e) => onChange(path, e.target.checked)}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {schema.title || path.split('.').pop()}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
};