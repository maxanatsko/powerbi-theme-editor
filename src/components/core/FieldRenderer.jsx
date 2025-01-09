import React from 'react';
import { fieldComponents } from '../fields';
import { resolveFieldType } from '../../utils/schemaUtils';

export const FieldRenderer = ({ path, schema, value, onChange, required }) => {
  const fieldType = resolveFieldType(schema);
  const Component = fieldComponents[fieldType];

  if (!Component) {
    console.warn(`No component found for field type: ${fieldType}`, { path, schema });
    return null;
  }

  // Check if this field is required in its parent object
  const pathParts = path.split('.');
  const fieldName = pathParts[pathParts.length - 1];
  const parentPath = pathParts.slice(0, -1).join('.');

  // If this is a root level field, check root schema required array
  const isRequired = pathParts.length === 1 
    ? schema.required?.includes(fieldName)
    : false;

  return (
    <div 
      data-field-path={path}
      id={`field-${path.replace(/\./g, '-')}`}
      className="field-container"
    >
      <Component
        path={path}
        schema={schema}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};