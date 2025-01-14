/**
 * Process schema references and definitions
 */
const resolveSchemaRefs = (schema, definitions = {}) => {
  if (!schema || typeof schema !== 'object') return schema;

  // Handle arrays
  if (Array.isArray(schema)) {
    return schema.map(item => resolveSchemaRefs(item, definitions));
  }

  // Handle direct references
  if (schema.$ref) {
    const refPath = schema.$ref.split('/');
    let resolved = definitions;
    // Skip the first two elements (#/definitions)
    for (let i = 2; i < refPath.length; i++) {
      resolved = resolved[refPath[i]];
    }
    
    // Merge reference with any additional properties
    const { $ref, ...rest } = schema;
    return { ...resolveSchemaRefs(resolved, definitions), ...rest };
  }

  // Process object properties
  const result = {};
  for (const [key, value] of Object.entries(schema)) {
    result[key] = resolveSchemaRefs(value, definitions);
  }

  return result;
};

/**
 * Handle specific types of schema fields
 */
const processSchemaTypes = (schema) => {
  if (!schema || typeof schema !== 'object') return schema;

  if (Array.isArray(schema)) {
    return schema.map(processSchemaTypes);
  }

  const result = { ...schema };

  // Handle specific field types
  if (result.type === 'string' && result.pattern?.includes('#')) {
    // Color field detection
    if (result.pattern.includes('0-9a-fA-F')) {
      result.format = 'color';
    }
  }

  // Process nested objects
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'object') {
      result[key] = processSchemaTypes(value);
    }
  }

  return result;
};

/**
 * Main schema processing function
 */
export const processSchema = (schema) => {
  if (!schema) return schema;

  // Store definitions for reference
  const { definitions = {}, ...rest } = schema;

  // First resolve all references
  const resolvedSchema = resolveSchemaRefs(rest, definitions);

  // Then process specific types
  return processSchemaTypes(resolvedSchema);
};

/**
 * Schema path utilities
 */
export const getSchemaPath = (basePath, propertyName) => {
  return basePath ? `${basePath}/properties/${propertyName}` : `#/properties/${propertyName}`;
};

/**
 * Type utilities
 */
export const isColorProperty = (schema) => {
  return schema.format === 'color' || 
         schema.pattern?.includes('#[0-9a-fA-F]') ||
         schema.title?.toLowerCase().includes('color');
};

export const isFontSizeProperty = (schema) => {
  return (schema.type === 'number' || schema.type === 'integer') &&
         schema.minimum >= 0 && 
         schema.maximum <= 100 &&
         (schema.title?.toLowerCase().includes('size') || 
          schema.title?.toLowerCase().includes('font'));
};