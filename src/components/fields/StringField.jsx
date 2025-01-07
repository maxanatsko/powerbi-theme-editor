import React from 'react';

export const StringField = ({ path, schema, value = '', onChange }) => {
  return (
    <div className="my-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {schema.title || path}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={schema.description}
      />
      {schema.description && (
        <p className="mt-1 text-sm text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};