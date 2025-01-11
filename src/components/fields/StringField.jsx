import React from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const StringField = ({ path, schema, value = '', onChange, required }) => {
  const isSchemaField = path === '$schema';
  const { label, tooltip } = getPathDisplayInfo(path);
  
  return (
    <div className="my-2">
      <label 
        className="block text-sm font-medium text-gray-700 mb-1"
        title={tooltip}
      >
        {schema.title || label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          ${isSchemaField ? 'bg-gray-100' : 'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
        placeholder={schema.description}
        readOnly={isSchemaField}
      />
      {schema.description && (
        <p className="mt-1 text-sm text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};