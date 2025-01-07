import React from 'react';
import { X, Plus } from 'lucide-react';

export const ColorInput = ({ path, value, onChange }) => (
  <div className="flex items-center space-x-2">
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(path, e.target.value)}
      className="w-8 h-8 rounded cursor-pointer"
    />
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(path, e.target.value)}
      className="flex-1 px-2 py-1 border rounded"
      placeholder="#000000"
    />
  </div>
);

export const ArrayInput = ({
  path,
  value,
  onChange,
  itemSchema,
  getValue,
  formData,
  allowAdd = true,
  allowDelete = true
}) => {
  console.log('ArrayInput render:', { path, value, itemSchema });
  
  // Ensure value is always an array
  const arrayValue = Array.isArray(value) ? value : [];

  const handleAddItem = () => {
    // Create a default value based on the item schema type
    let defaultValue;
    switch (itemSchema.type) {
      case 'string':
        defaultValue = '';
        break;
      case 'number':
      case 'integer':
        defaultValue = 0;
        break;
      case 'boolean':
        defaultValue = false;
        break;
      case 'object':
        defaultValue = {};
        break;
      default:
        defaultValue = null;
    }
    
    const newValue = [...arrayValue, defaultValue];
    onChange(path, newValue);
  };

  const handleRemoveItem = (index) => {
    const newValue = arrayValue.filter((_, i) => i !== index);
    onChange(path, newValue);
  };

  const handleItemChange = (index, newItemValue) => {
    const newArray = [...arrayValue];
    newArray[index] = newItemValue;
    onChange(path, newArray);
  };

  return (
    <div className="space-y-2">
      {arrayValue.map((item, index) => (
        <div key={index} className="flex items-start space-x-2">
          <SchemaField
            path={`${path}.${index}`}
            schema={itemSchema}
            value={item}
            onChange={(_, value) => handleItemChange(index, value)}
            isExpanded={true}
            onToggle={() => {}}
            nestingLevel={0}
            getValue={getValue}
            formData={formData}
          />
          {allowDelete && (
            <button
              onClick={() => handleRemoveItem(index)}
              className="mt-1 p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {allowAdd && (
        <button
          onClick={handleAddItem}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      )}
    </div>
  );
};

export const EnumInput = ({ path, value, onChange, options = [] }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(path, e.target.value)}
    className="w-full px-2 py-1 border rounded"
  >
    <option value="">Select...</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export const OneOfInput = ({ path, value, onChange, options }) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(path, e.target.value)}
      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const AnyOfInput = ({ path, value, onChange, options }) => {
  return (
    <select
      id={path.replace(/\./g, '-')}
      value={value || ''}
      onChange={(e) => onChange(path, e.target.value)}
      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
    >
      <option value="">Select an option</option>
      {options.map((option, index) => (
        <option key={index} value={option.const || option.title || option}>
          {option.title || option.const || option}
        </option>
      ))}
    </select>
  );
};

export const TextInput = ({ path, value, onChange }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(path, e.target.value)}
    className="w-full px-2 py-1 border rounded"
  />
);

export const NumberInput = ({ path, value, onChange }) => (
  <input
    type="number"
    value={value ?? ''}
    onChange={(e) => onChange(path, parseFloat(e.target.value))}
    className="w-full px-2 py-1 border rounded"
  />
);

export const BooleanInput = ({ path, value, onChange }) => (
  <input
    type="checkbox"
    checked={value || false}
    onChange={(e) => onChange(path, e.target.checked)}
    className="w-4 h-4 border rounded"
  />
);