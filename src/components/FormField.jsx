import React from 'react';
import { useSchemaDefinitions } from '../hooks/useSchemaDefinitions';

const FormField = ({ field, schema, value, onChange }) => {
  const { resolveReference, validateAgainstDefinition } = useSchemaDefinitions();

  // Resolve any schema reference to get actual definition
  const resolvedSchema = schema.$ref ? resolveReference(schema.$ref) : schema;
  
  if (!resolvedSchema) {
    console.warn(`Could not resolve schema for field ${field}`);
    return null;
  }

  // Helper to determine input type based on schema/definition
  const getInputType = (schema) => {
    switch (schema.type) {
      case 'string':
        if (schema.pattern?.includes('#')) return 'color';
        if (schema.oneOf) return 'select';
        return 'text';
      case 'number':
        return 'number';
      case 'boolean':
        return 'checkbox';
      case 'object':
        return 'object';
      default:
        return 'text';
    }
  };

  // Render appropriate input based on type
  const renderInput = () => {
    const inputType = getInputType(resolvedSchema);

    switch (inputType) {
      case 'color':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-2 border rounded"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-2 border rounded"
          >
            <option value="">Select...</option>
            {resolvedSchema.oneOf?.map((option, idx) => (
              <option key={idx} value={option.const}>
                {option.title || option.const}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={resolvedSchema.minimum}
            max={resolvedSchema.maximum}
            className="w-full h-8 px-2 border rounded"
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4"
          />
        );

      case 'object':
        // For objects, render a nested form or expandable section
        return (
          <div className="ml-4 border-l pl-4">
            {Object.entries(resolvedSchema.properties || {}).map(([propName, propSchema]) => (
              <FormField
                key={propName}
                field={propName}
                schema={propSchema}
                value={value?.[propName]}
                onChange={(newValue) => {
                  const updatedObj = { ...(value || {}), [propName]: newValue };
                  onChange(updatedObj);
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-2 border rounded"
          />
        );
    }
  };

  // Validation handling
  const handleChange = (newValue) => {
    if (validateAgainstDefinition(newValue, resolvedSchema)) {
      onChange(newValue);
    } else {
      console.warn(`Invalid value for field ${field}:`, newValue);
      // Could add UI feedback for validation failures
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {resolvedSchema.title || field}
        {resolvedSchema.required && <span className="text-red-500">*</span>}
      </label>
      {resolvedSchema.description && (
        <p className="text-sm text-gray-500 mb-1">{resolvedSchema.description}</p>
      )}
      {renderInput()}
    </div>
  );
};

export default FormField;