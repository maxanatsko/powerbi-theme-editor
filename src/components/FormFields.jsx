import React from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { getLatestSchema, RAW_GITHUB_URL } from './schemaVersions';
import ColorArrayField from './ColorArrayField';  // Add this import

export const SchemaInput = ({ path, value, onChange }) => {
  React.useEffect(() => {
    // Only fetch and set if no schema is currently set
    if (!value) {
      getLatestSchema()
        .then(schema => {
          // Build the complete raw GitHub URL
          const fullSchemaUrl = `${RAW_GITHUB_URL}/${schema.$schema}`;
          onChange(path, fullSchemaUrl);
        })
        .catch(error => {
          console.error('Failed to fetch latest schema:', error);
        });
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        disabled={true}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 cursor-not-allowed"
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <AlertCircle className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export const ColorInput = ({ path, value, onChange }) => {
  const [isValid, setIsValid] = React.useState(true);
  
  // Validate hex color
  const validateColor = (color) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  // Handle text input change
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const valid = validateColor(newValue);
    setIsValid(valid);
    
    // Only update if valid or empty
    if (valid || newValue === '') {
      onChange(path, newValue);
    }
  };

  // Handle color picker change
  const handlePickerChange = (e) => {
    const newValue = e.target.value;
    setIsValid(true);
    onChange(path, newValue);
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={handlePickerChange}
          className="w-10 h-10 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={handleTextChange}
          className={`flex-1 px-3 py-2 border rounded ${
            !isValid ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholder="#000000"
        />
      </div>
      {!isValid && (
        <span className="text-xs text-red-500">
          Please enter a valid hex color (e.g., #FF0000 or #F00)
        </span>
      )}
    </div>
  );
};

export const ArrayInput = ({
  path,
  value,
  onChange,
  itemSchema,
  getValue,
  formData,
  allowAdd = true,
  allowDelete = true,
  renderField  // Add this prop
}) => {
  console.log('ArrayInput render:', { path, value, itemSchema });
  
  // Handle color arrays
  const isColorArray = 
    path.endsWith('dataColors') || 
    path.toLowerCase().includes('colors') ||
    (itemSchema?.type === 'string' && 
     (itemSchema?.format === 'color' || 
      path.toLowerCase().includes('color')));

  if (isColorArray) {
    return (
      <ColorArrayField
        value={value}
        onChange={(newValue) => onChange(path, newValue)}
        label={path.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}
      />
    );
  }

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
          {renderField(`${path}.${index}`, itemSchema, 0)}
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