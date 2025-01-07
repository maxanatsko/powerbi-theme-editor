import React from 'react';
import { fieldComponents } from '../fields';
import { resolveFieldType } from '../../utils/schemaUtils';

export const FieldRenderer = ({ path, schema, value, onChange }) => {
  const fieldType = resolveFieldType(schema);
  const Component = fieldComponents[fieldType];

  if (!Component) {
    console.warn(`No component found for field type: ${fieldType}`, { path, schema });
    return null;
  }

  return (
    <Component
      path={path}
      schema={schema}
      value={value}
      onChange={onChange}
    />
  );
};