import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isObjectControl, and } from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import { Paper } from '@mui/material';

const ObjectControlRenderer = ({ 
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
  visible 
}) => {
  if (!visible) {
    return null;
  }

  // Handle wildcard properties
  const resolveWildcardProperties = (schema) => {
    if (!schema || typeof schema !== 'object') return schema;

    const wildcardKey = Object.keys(schema.properties || {}).find(k => k === '*');
    if (wildcardKey) {
      return schema.properties[wildcardKey];
    }

    return schema;
  };

  // Get actual schema to render
  const effectiveSchema = resolveWildcardProperties(schema);
  console.debug('ObjectRenderer - effective schema:', effectiveSchema);

  const detailUiSchema = {
    type: 'VerticalLayout',
    elements: Object.keys(effectiveSchema.properties || {}).map(property => ({
      type: 'Control',
      scope: `#/properties/${property}`
    }))
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <JsonFormsDispatch
        schema={schema}
        uischema={detailUiSchema}
        path={effectivePath}
        renderers={renderers}
        cells={cells}
        enabled={enabled}
      />
    </Paper>
  );
};

export const objectControlTester = rankWith(
  3,  // Increased priority
  and(
    isObjectControl,
    (uischema, schema) => {
      // Handle nested objects and wildcards
      return schema.type === 'object' && 
             (schema.properties?.['*'] || Object.keys(schema.properties || {}).length > 0);
    }
  )
);

  // Get schema reference definitions
  const resolveRef = (schema) => {
    if (!schema || !schema.$ref) return schema;
    
    // For now, we'll handle schema as is
    // TODO: Implement proper reference resolution
    return schema;
  };

  // Handle wildcard paths
  const resolveWildcardPath = (path) => {
    const parts = path.split('/');
    const wildcardIndex = parts.indexOf('*');
    if (wildcardIndex !== -1) {
      // Replace wildcard with actual path segment if available
      // For now, we'll use the first item
      parts[wildcardIndex] = '0';
    }
    return parts.join('/');
  };

  const effectiveSchema = resolveRef(schema);
  const effectivePath = resolveWildcardPath(path);

  console.debug('ObjectRenderer:', {
    originalPath: path,
    effectivePath,
    schema: effectiveSchema
  });



export const ObjectRenderer = withJsonFormsControlProps(ObjectControlRenderer);