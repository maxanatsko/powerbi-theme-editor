import { definitionResolver } from './schemaDefinitionResolver';

/**
 * Validates a complete theme object against the schema
 * @param {Object} theme - Theme object to validate
 * @param {Object} schema - Schema to validate against
 * @returns {Object} Validation result with errors if any
 */
export function validateTheme(theme, schema) {
  const errors = [];

  const validateProperty = (value, schemaPath, path = []) => {
    const schemaForPath = getSchemaAtPath(schema, schemaPath);
    
    if (!schemaForPath) {
      errors.push({
        path: path.join('.'),
        error: `No schema found for path: ${schemaPath}`
      });
      return;
    }

    if (schemaForPath.$ref) {
      const definition = definitionResolver.resolveReference(schemaForPath.$ref);
      if (!definition) {
        errors.push({
          path: path.join('.'),
          error: `Could not resolve reference: ${schemaForPath.$ref}`
        });
        return;
      }

      if (!definitionResolver.validateAgainstDefinition(value, definition)) {
        errors.push({
          path: path.join('.'),
          error: `Value does not match definition: ${schemaForPath.$ref}`
        });
      }
    }

    // Recurse into objects
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([key, val]) => {
        validateProperty(val, [...schemaPath, key], [...path, key]);
      });
    }
  };

  validateProperty(theme, []);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper to get schema at a specific path
function getSchemaAtPath(schema, path) {
  let current = schema;
  for (const segment of path) {
    if (!current?.properties?.[segment]) {
      return null;
    }
    current = current.properties[segment];
  }
  return current;
}