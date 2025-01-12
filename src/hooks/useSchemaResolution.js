import { useMemo } from 'react';
import { definitionResolver } from '../utils/schemaDefinitionResolver';

function mergeSchemas(schemas, context) {
  return schemas.reduce((acc, schema) => {
    // Handle references in allOf
    if (schema.$ref) {
      const resolved = definitionResolver.resolveReference(schema.$ref, context) || {};
      return {
        ...acc,
        ...resolved,
        properties: {
          ...(acc.properties || {}),
          ...(resolved.properties || {})
        }
      };
    }

    // Handle direct properties
    const mergedSchema = {
      ...acc,
      ...schema,
      properties: {
        ...(acc.properties || {}),
        ...(schema.properties || {})
      }
    };

    // Keep wildcard properties
    if (schema.properties?.['*']) {
      mergedSchema.properties['*'] = schema.properties['*'];
    }

    return mergedSchema;
  }, {});
}

function resolveWildcard(schema, context) {
  if (!schema) return null;

  // Handle allOf in wildcard
  if (schema.allOf) {
    return mergeSchemas(schema.allOf, context);
  }

  // Handle references in wildcard
  if (schema.$ref) {
    const resolved = definitionResolver.resolveReference(schema.$ref, context);
    return resolved || schema;
  }

  return schema;
}

export function useSchemaResolution(schema) {
  return useMemo(() => {
    if (!schema) return null;

    // Enhance schema with definition resolution
    const enhancedSchema = definitionResolver.integrateWithSchemaResolution(schema);

    if (!enhancedSchema) return null;
    
    return {
      ...enhancedSchema,
      resolve: (path) => {
        if (!path) return null;
        
        const segments = path.split('.');
        let current = enhancedSchema;

        for (const segment of segments) {
          if (!current) return null;
          
          // Handle allOf composition
          if (current.allOf) {
            current = mergeSchemas(current.allOf, enhancedSchema);
          }
          
          // Handle wildcard segments
          if (segment === '*' && current.properties?.['*']) {
            current = resolveWildcard(current.properties['*'], enhancedSchema);
            continue;
          }

          // Handle normal property access
          if (current.properties) {
            // Try exact match first
            if (current.properties[segment]) {
              current = current.properties[segment];
            }
            // Then try wildcard if available
            else if (current.properties['*']) {
              current = resolveWildcard(current.properties['*'], enhancedSchema);
            }
            // Finally try direct access
            else {
              current = current[segment];
            }
          } else {
            current = current[segment];
          }

          // Resolve any references
          if (current && current.$ref) {
            const resolved = definitionResolver.resolveReference(current.$ref, enhancedSchema);
            current = resolved || current;
          }
        }

        return current;
      }
    };
  }, [schema]);
}