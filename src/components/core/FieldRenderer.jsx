import React, { memo } from 'react';
import { ObjectField } from '../fields/ObjectField';
import { StringField } from '../fields/StringField';
import { NumberField } from '../fields/NumberField';
import { BooleanField } from '../fields/BooleanField';
import { EnumField } from '../fields/EnumField';
import { ArrayField } from '../fields/ArrayField';

export const FieldRenderer = memo(({ path, schema, value, onChange, required = false }) => {
  // Skip if no schema
  if (!schema) {
    console.log('No schema for path:', path);
    return null;
  }

  // Handle allOf
  if (schema.allOf) {
    // Merge allOf schemas
    const mergedSchema = schema.allOf.reduce((acc, curr) => ({
      ...acc,
      ...curr,
      properties: {
        ...(acc.properties || {}),
        ...(curr.properties || {})
      }
    }), {});
    
    return (
      <FieldRenderer
        path={path}
        schema={mergedSchema}
        value={value}
        onChange={onChange}
        required={required}
      />
    );
  }

  // Determine field type
  let fieldType = schema.type;
  if (schema.enum || (schema.oneOf && schema.oneOf.every(item => item.const))) {
    fieldType = 'enum';
  }

  // Render appropriate field component
  switch (fieldType) {
    case 'object':
      return (
        <ObjectField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
        />
      );
    
    case 'string':
      return (
        <StringField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
          required={required}
        />
      );
    
    case 'number':
    case 'integer':
      return (
        <NumberField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
          required={required}
        />
      );
    
    case 'boolean':
      return (
        <BooleanField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
          required={required}
        />
      );
    
    case 'enum':
      return (
        <EnumField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
          required={required}
        />
      );
    
    case 'array':
      return (
        <ArrayField
          path={path}
          schema={schema}
          value={value}
          onChange={onChange}
          required={required}
        />
      );
    
    default:
      console.warn(`Unknown field type: ${fieldType} for path: ${path}`);
      return (
        <div className="p-2 bg-yellow-50 border rounded">
          Unknown field type: {fieldType}
        </div>
      );
  }
});

FieldRenderer.displayName = 'FieldRenderer';