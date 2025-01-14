import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isObjectControl, and, compose, hasType } from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import { Paper } from '@mui/material';

const ObjectControlRenderer = ({ 
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
  visible,
  rootSchema, // Add rootSchema for reference resolution
  data // Add data for current values
}) => {
  if (!visible) {
    return null;
  }

  // Enhanced schema processing with better reference handling
  const processSchema = (inputSchema, currentPath) => {
    // Early return for non-object schemas
    if (inputSchema.type && inputSchema.type !== 'object') {
      console.debug('Skipping non-object schema:', inputSchema);
      return inputSchema;
    }
    const resolveReference = (ref) => {
      // Remove the initial #/ if present
      const refPath = ref.replace(/^#\/?/, '').split('/');
      let current = rootSchema;
      
      for (const segment of refPath) {
        current = current[segment];
        if (!current) {
          console.warn(`Failed to resolve reference: ${ref}`);
          return inputSchema;
        }
      }
      
      return current;
    };

    // Handle schema references
    if (inputSchema.$ref) {
      const resolved = resolveReference(inputSchema.$ref);
      console.debug('Resolved schema reference:', {
        from: inputSchema.$ref,
        to: resolved
      });
      return resolved;
    }

    // Handle wildcards in properties
    if (inputSchema.properties) {
      const wildcardKey = Object.keys(inputSchema.properties).find(k => k === '*');
      if (wildcardKey) {
        // Get the actual keys from the data at this path
        const currentData = path.split('/').reduce((obj, key) => obj?.[key], data);
        const actualKeys = Object.keys(currentData || {});
        
        // Create a new schema with actual property keys
        const expandedProperties = {};
        actualKeys.forEach(key => {
          expandedProperties[key] = inputSchema.properties[wildcardKey];
        });
        
        return {
          ...inputSchema,
          properties: expandedProperties
        };
      }
    }

    return inputSchema;
  };

  // Enhanced path resolution with support for multiple wildcards
  const resolveWildcardPath = (inputPath) => {
    if (!inputPath) return '';
    
    const parts = inputPath.split('/');
    const resolvedParts = parts.map((part, index) => {
      if (part === '*') {
        // Get the parent object's data to find actual keys
        const parentPath = parts.slice(0, index).join('/');
        const parentData = parentPath
          ? parentPath.split('/').reduce((obj, key) => obj?.[key], data)
          : data;

        // Use the first available key or fallback to a default
        const availableKeys = Object.keys(parentData || {});
        return availableKeys.length > 0 ? availableKeys[0] : 'default';
      }
      return part;
    });

    console.debug('Path resolution:', {
      original: inputPath,
      resolved: resolvedParts.join('/'),
      data: data
    });

    return resolvedParts.join('/');
  };

  // Enhanced UI Schema generation with better property handling
  const generateDetailUiSchema = (schema, currentPath) => {
    if (!schema?.properties) {
      console.debug('No properties found in schema:', schema);
      return {
        type: 'VerticalLayout',
        elements: []
      };
    }

    return {
      type: 'VerticalLayout',
      elements: Object.entries(schema.properties).map(([key, prop]) => {
        const isObject = prop.type === 'object';
        const isArray = prop.type === 'array';
        
        // Special handling for objects and arrays
        if (isObject || (isArray && prop.items?.type === 'object')) {
          return {
            type: 'Control',
            label: prop.title || key,
            scope: `#/properties/${key}`,
            options: {
              detail: 'GENERATED'
            }
          };
        }

        // Regular control for primitive types
        return {
          type: 'Control',
          label: prop.title || key,
          scope: `#/properties/${key}`
        };
      })
    };
  };

  // Process schema and generate UI
  console.debug('Processing object renderer:', {
    path,
    schema,
    data
  });

  const effectiveSchema = processSchema(schema, path);
  const effectivePath = resolveWildcardPath(path);
  const detailUiSchema = generateDetailUiSchema(effectiveSchema, effectivePath);

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <JsonFormsDispatch
        schema={effectiveSchema}
        uischema={detailUiSchema}
        path={effectivePath}
        renderers={renderers}
        cells={cells}
        enabled={enabled}
        data={data}
      />
    </Paper>
  );
};

// Enhanced tester with better type checking and debugging
export const objectControlTester = rankWith(
  2, // Lower priority to let other specific renderers take precedence if needed
  and(
    uischema => {
      // Log all incoming UI schemas for debugging
      console.debug('Object renderer received uischema:', {
        type: uischema.type,
        scope: uischema.scope,
        options: uischema.options
      });

      // Explicitly check for Control type and valid scope
      if (uischema.type !== 'Control') {
        console.debug('Skipping non-Control uischema:', uischema.type);
        return false;
      }

      if (!uischema.scope) {
        console.debug('Skipping Control without scope');
        return false;
      }

      return true;
    },
    (uischema, schema, rootSchema) => {
      // Early return if schema is not provided
      if (!schema) {
        console.debug('Skipping due to missing schema');
        return false;
      }

      // Handle schema references
      let effectiveSchema = schema;
      if (schema.$ref && rootSchema) {
        const refPath = schema.$ref.replace(/^#\/?/, '').split('/');
        let current = rootSchema;
        for (const segment of refPath) {
          current = current[segment];
          if (!current) break;
        }
        if (current) effectiveSchema = current;
      }

      // Check if we're dealing with an object type
      const isObject = effectiveSchema?.type === 'object';
      // Check if we have properties or they're defined in a reference
      const hasProperties = effectiveSchema?.properties || effectiveSchema?.$ref;
      
      const result = isObject && hasProperties;
      
      console.debug('Testing object renderer schema:', {
        type: effectiveSchema?.type,
        hasProperties,
        ref: effectiveSchema?.$ref,
        isValid: result,
        path: uischema.scope
      });
      
      return result;
    }
  )
);

export const ObjectRenderer = withJsonFormsControlProps(ObjectControlRenderer);