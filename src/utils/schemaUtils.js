/**
 * Resolves a JSON Schema reference
 */
const resolveReference = async (ref, context) => {
  // Handle local references (within the same schema)
  if (ref.startsWith('#')) {
    const path = ref.slice(2).split('/');
    let current = context;
    
    for (const segment of path) {
      if (segment === '') continue;
      current = current[decodeURIComponent(segment)];
      if (!current) {
        throw new Error(`Invalid reference: ${ref}`);
      }
    }
    
    return current;
  }
  
  // Handle external references
  try {
    const response = await fetch(ref);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema reference: ${ref}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error resolving reference ${ref}:`, error);
    throw new Error(`Failed to resolve schema reference: ${ref}`);
  }
};

/**
 * Resolves the field type from a schema definition
 */
export const resolveFieldType = (schema) => {
  if (!schema) return 'string';

  // Handle special cases first
  if (schema.enum || schema.oneOf) return 'enum';
  
  // Color fields detection
  if (schema.type === 'string' && (
    schema.format === 'color' ||
    (schema.pattern && /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/.test(schema.pattern)) ||
    schema.title?.toLowerCase().includes('color')
  )) {
    return 'color';
  }

  // Handle standard types
  return schema.type || 'string';
};

/**
 * Recursively resolves schema references and combines schemas
 */
export const resolveSchema = async (schema, context = schema, refCache = new Map()) => {
  if (!schema) return schema;

  // Handle $ref
  if (schema.$ref) {
    // Prevent infinite recursion
    if (refCache.has(schema.$ref)) {
      return refCache.get(schema.$ref);
    }

    const resolved = await resolveReference(schema.$ref, context);
    refCache.set(schema.$ref, resolved);
    return resolveSchema(resolved, context, refCache);
  }

  // Handle allOf
  if (schema.allOf) {
    const resolvedSchemas = await Promise.all(
      schema.allOf.map(s => resolveSchema(s, context, refCache))
    );
    
    return resolvedSchemas.reduce((acc, current) => ({
      ...acc,
      ...current,
      properties: {
        ...(acc.properties || {}),
        ...(current.properties || {})
      }
    }), {});
  }

  // Handle properties recursively
  if (schema.properties) {
    const resolvedProperties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      resolvedProperties[key] = await resolveSchema(value, context, refCache);
    }
    return { ...schema, properties: resolvedProperties };
  }

  return schema;
};

/**
 * Validates a value against its schema definition
 */
export const validateField = (schema, value) => {
  if (!schema) return { valid: true };

  const errors = [];

  // Required check
  if (schema.required && (value === undefined || value === null || value === '')) {
    errors.push('Field is required');
  }

  // Type validation
  if (value !== undefined && value !== null) {
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Value must be a string');
        } else if (schema.pattern) {
          try {
            const regex = new RegExp(schema.pattern);
            if (!regex.test(value)) {
              errors.push('Value does not match required pattern');
            }
          } catch (error) {
            console.error('Invalid regex pattern:', error);
            errors.push('Invalid pattern in schema');
          }
        }
        break;
        
      case 'number':
      case 'integer':
        if (typeof value !== 'number') {
          errors.push('Value must be a number');
        } else {
          if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push(`Value must be >= ${schema.minimum}`);
          }
          if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push(`Value must be <= ${schema.maximum}`);
          }
          if (schema.type === 'integer' && !Number.isInteger(value)) {
            errors.push('Value must be an integer');
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Value must be a boolean');
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push('Value must be an array');
        } else {
          if (schema.minItems !== undefined && value.length < schema.minItems) {
            errors.push(`Array must have at least ${schema.minItems} items`);
          }
          if (schema.maxItems !== undefined && value.length > schema.maxItems) {
            errors.push(`Array must have at most ${schema.maxItems} items`);
          }
        }
        break;
    }
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push('Value must be one of the allowed options');
  }

  // OneOf validation
  if (schema.oneOf && !schema.oneOf.some(option => option.const === value)) {
    errors.push('Value must match one of the allowed options');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Extracts enum options from schema
 */
export const resolveEnumOptions = (schema) => {
  if (schema.enum) {
    return schema.enum.map(value => ({
      const: value,
      title: value.toString()
    }));
  }

  if (schema.oneOf) {
    return schema.oneOf.map(option => ({
      const: option.const,
      title: option.title || option.const.toString()
    }));
  }

  return [];
};