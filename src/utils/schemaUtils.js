const MAX_RESOLUTION_ATTEMPTS = 3;

const DEFAULT_DEFINITIONS = {
  color: {
    type: 'string',
    format: 'color',
    default: '#000000'
  },
  verticalAlignment: {
    type: 'string',
    enum: ['top', 'middle', 'bottom'],
    default: 'middle'
  },
  fill: {
    type: 'object',
    properties: {
      color: { type: 'string', format: 'color' },
      transparency: { type: 'number', minimum: 0, maximum: 100 },
      show: { type: 'boolean' }
    }
  },
  fontSize: {
    type: 'number',
    minimum: 1,
    maximum: 100,
    default: 10
  },
  labelDisplayUnits: {
    type: 'number',
    enum: [0, 1, 1000, 1000000, 1000000000],
    default: 0,
    description: 'Display units: 0=Auto, 1=None, 1000=Thousands, 1000000=Millions, 1000000000=Billions'
  },
  fillRule: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['gradient', 'solid'] },
      gradient: {
        type: 'object',
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          startColor: { type: 'string', format: 'color' },
          endColor: { type: 'string', format: 'color' }
        }
      }
    }
  },
  alignment: {
    type: 'string',
    enum: ['left', 'center', 'right'],
    default: 'left'
  },
  image: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      scaling: { type: 'string', enum: ['fit', 'fill', 'stretch'] },
      transparency: { type: 'number', minimum: 0, maximum: 100 }
    }
  },
  dataBars: {
    type: "object",
    properties: {
      positiveColor: {
        type: "string",
        format: "color",
        description: "Color for positive values in data bars"
      },
      negativeColor: {
        type: "string",
        format: "color",
        description: "Color for negative values in data bars"
      },
      axisColor: {
        type: "string",
        format: "color",
        description: "Color for the axis in data bars"
      },
      reverseDirection: {
        type: "boolean",
        description: "Whether to reverse the direction of data bars"
      }
    }
  },

  displayUnitsWithoutAuto: {
    type: "string",
    enum: [
      "None",
      "Thousands",
      "Millions",
      "Billions",
      "Trillions"
    ],
    description: "Display units without auto option"
  },
  itemLocation: {
    type: "string",
    description: "Location for visual link item in bookmark actions",
    enum: [
      "report", // Link to another report
      "page",   // Link to another page
      "bookmark", // Link to a bookmark
      "url",    // Link to external URL
      "back"    // Back navigation
    ],
    default: "bookmark"
  },
  icon: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["none", "default", "custom"],
        description: "Type of icon to display"
      },
      position: {
        type: "string",
        enum: ["left", "right", "top", "bottom", "center"],
        description: "Position of the icon relative to content"
      },
      size: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Size of the icon in pixels"
      },
      color: {
        type: "string",
        format: "color",
        description: "Color of the icon"
      },
      show: {
        type: "boolean",
        description: "Whether to show or hide the icon",
        default: true
      }
    }
  },
  paragraphs: {
    type: "array",
    description: "Text paragraphs grouping",
    items: {
      type: "object"
      // No need to define properties here as they're already handled by the parent schema
    }
  }
};

// Cache for resolved references to prevent infinite recursion
const referenceCache = new Map();


/**
 * Resolves a JSON Schema reference
 */
// schemaUtils.js

export const resolveReference = async (ref, context) => {
  // Detailed debug info about context
  console.log('Resolving reference:', {
    ref,
    // Show exact content of definitions
    definitions: context?.definitions,
    // Show the full path to definitions
    contextPath: {
      hasDefinitions: Boolean(context?.definitions),
      definitionsDirectly: context?.definitions?.color ? 'Found color directly' : 'No color directly',
      schemaPath: Boolean(context?.$schema?.definitions),
      defsPath: Boolean(context?.$defs?.definitions)
    }
  });

  // Handle local references
  if (ref.startsWith('#')) {
    const path = ref.slice(2).split('/');
    let current = context;

    // For PowerBI schema, first look for definitions at the root
    if (path[0] === 'definitions') {
      const definitionName = path[1];
      
      console.log('Definition details:', {
        lookingFor: definitionName,
        foundInContext: context?.definitions?.[definitionName],
        definitionsAvailable: Object.keys(context?.definitions || {})
      });

      // Search in known locations for definitions
      const possibleContexts = [
        context,
        context.$schema,
        context.definitions && { definitions: context.definitions },
        context.$defs && { definitions: context.$defs }
      ].filter(Boolean);

      // Try to find definition in context
      for (const ctx of possibleContexts) {
        if (ctx.definitions?.[definitionName]) {
          current = ctx;

          // Add debugging
        console.log('Found definition in context:', {
          name: definitionName,
          definition: ctx.definitions[definitionName]
        });

          break;
        }
      }

      // If definition not found in context, log warning
      if (!current.definitions || !current.definitions[definitionName]) {
        console.warn(`Definition not found: ${definitionName}`);
        throw new Error(`Cannot find definition for ${ref}`);
      }
    }

    try {
      for (const segment of path) {
        if (segment === '') continue;
        const decodedSegment = decodeURIComponent(segment);
        
        if (!current || typeof current !== 'object') {
          throw new Error(`Invalid path segment: ${decodedSegment}`);
        }
        
        current = current[decodedSegment];
        
        if (current === undefined) {
          throw new Error(`Reference not found at: ${decodedSegment}`);
        }
      }
      
      // Cache the resolved reference
      referenceCache.set(ref, current);
      return current;
    } catch (error) {
      console.error(`Error resolving reference ${ref}:`, error);
      throw error;
    }
  }
  
  throw new Error(`External references not supported: ${ref}`);
};

export const createDefaultValue = (schema) => {
  if (!schema) return undefined;

  // Handle unresolved references with fallback values
  if (schema.$ref) {
    if (schema.$ref === '#/definitions/fill') {
      return {
        color: '#000000',
        transparency: 0,
        show: true
      };
    }
    console.warn(`Creating default value for unresolved reference: ${schema.$ref}`);
    return {};
  }

  // Handle allOf schemas
  if (schema.allOf) {
    return schema.allOf.reduce((acc, subSchema) => ({
      ...acc,
      ...createDefaultValue(subSchema)
    }), {});
  }

  // Handle objects
  if (schema.type === 'object' && schema.properties) {
    const defaultObj = {};
    
    // Handle wildcard property if present
    if (schema.properties['*']) {
      defaultObj['*'] = createDefaultValue(schema.properties['*']);
    }

    // Handle regular properties
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      if (key !== '*') {
        const defaultValue = createDefaultValue(propSchema);
        if (defaultValue !== undefined) {
          defaultObj[key] = defaultValue;
        }
      }
    });

    return defaultObj;
  }

  // Handle arrays
  if (schema.type === 'array') {
    return schema.default || [];
  }

  // Handle enums
  if (schema.enum && schema.enum.length > 0) {
    return schema.default || schema.enum[0];
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string':
      return schema.default || '';
    case 'number':
    case 'integer':
      return schema.default !== undefined ? schema.default : 0;
    case 'boolean':
      return schema.default !== undefined ? schema.default : false;
    case 'null':
      return null;
    default:
      return schema.default !== undefined ? schema.default : undefined;
  }
};

/**
 * Resolves field type from schema definition
 */
export const resolveFieldType = (schema) => {
  if (!schema) return 'string';

  // Handle special cases first
  if (schema.enum) return 'enum';
  if (schema.oneOf && schema.oneOf.every(item => item.const !== undefined)) return 'enum';
  
  // Enhanced color detection
  if (schema.type === 'string' && (
    schema.format === 'color' ||
    schema.title?.toLowerCase().includes('color') ||
    schema.description?.toLowerCase().includes('color') ||
    (schema.pattern && /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/.test(schema.pattern))
  )) {
    return 'color';
  }

  // Handle type-specific cases
  if (schema.type === 'array') return 'array';
  if (schema.type === 'object') return 'object';
  
  // Handle references
  if (schema.$ref) {
    return 'object'; // Default to object for unresolved references
  }

  return schema.type || 'string';
};

/**
 * Recursively resolves schema references and combines schemas
 */
export const resolveSchema = async (schema, context = schema) => {
  if (!schema) return schema;

  try {
    // Handle $ref
    if (schema.$ref) {
      const resolved = await resolveReference(schema.$ref, context);
      return resolveSchema(resolved, context);
    }

    // Handle allOf
    if (schema.allOf) {
      const resolvedSchemas = await Promise.all(
        schema.allOf.map(s => resolveSchema(s, context))
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
        resolvedProperties[key] = await resolveSchema(value, context);
      }
      return { ...schema, properties: resolvedProperties };
    }

    return schema;
  } catch (error) {
    console.error('Error resolving schema:', error);
    throw error;
  }
};

/**
 * Resolves a schema reference and returns the full schema
 */
const globalReferenceCache = new Map();

export const resolveSchemaRef = async (schema, context) => {
  if (!schema) return schema;

  try {
    // Skip resolution if no reference
    if (!schema.$ref) return schema;

    // Check global cache first
    const cacheKey = schema.$ref;
    if (globalReferenceCache.has(cacheKey)) {
      return globalReferenceCache.get(cacheKey);
    }

    // Resolve the reference
    const resolved = await resolveReference(schema.$ref, context);
    const fullyResolved = await resolveSchema(resolved, context);
    
    // Cache the result
    globalReferenceCache.set(cacheKey, fullyResolved);
    return fullyResolved;
  } catch (error) {
    console.error('Error resolving schema references:', error);
    throw error;
  }
};

/**
 * Validates a value against schema
 */
export const validateField = (schema, value) => {
  const errors = [];

  if (!schema) return { valid: true, errors };

  // Required check
  if (schema.required && value == null) {
    errors.push('Field is required');
    return { valid: false, errors };
  }

  // Skip further validation if value is undefined/null and not required
  if (value == null) return { valid: true, errors };

  // Type validation
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

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push('Value must be one of the allowed options');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Extracts enum options from schema
 * @param {object} schema - JSON Schema object
 * @returns {Array<{const: any, title: string}>} Array of enum options
 */
export const resolveEnumOptions = (schema) => {
  if (!schema) return [];

  // Handle direct enum arrays
  if (schema.enum) {
    return schema.enum.map(value => ({
      const: value,
      title: value?.toString() || ''
    }));
  }

  // Handle oneOf with const values
  if (schema.oneOf) {
    return schema.oneOf
      .filter(option => option.const !== undefined)
      .map(option => ({
        const: option.const,
        title: option.title || option.const?.toString() || ''
      }));
  }

  // Handle anyOf with const values
  if (schema.anyOf) {
    return schema.anyOf
      .filter(option => option.const !== undefined)
      .map(option => ({
        const: option.const,
        title: option.title || option.const?.toString() || ''
      }));
  }

  return [];
};

/**
 * Traverses schema structure handling wildcards, arrays, and nested objects
 * @param {Object} schema - The schema object to traverse
 * @param {string} path - The current path in the schema
 * @returns {Object} Processed schema structure
 */
export const traverseSchema = (schema, path = '') => {
  if (!schema) return null;

  // Handle allOf first
  if (schema.allOf) {
    // Merge allOf schemas while preserving wildcards
    const mergedSchema = schema.allOf.reduce((acc, curr) => {
      if (curr.$ref) {
        // Resolve reference synchronously for now - we'll handle async later
        const resolved = resolveReference(curr.$ref, schema);
        curr = resolved || curr;
      }
      
      // Special handling for wildcard properties
      if (curr.properties?.['*']) {
        return {
          ...acc,
          properties: {
            ...acc.properties,
            '*': {
              ...acc.properties?.['*'],
              ...curr.properties['*']
            }
          }
        };
      }
      
      // Merge other properties
      return {
        ...acc,
        properties: {
          ...acc.properties,
          ...curr.properties
        }
      };
    }, { properties: {} });

    return traverseSchema({ ...schema, ...mergedSchema }, path);
  }

  // Then handle wildcards in properties
  if (schema.properties?.['*']) {
    const wildcardSchema = schema.properties['*'];
    const wildcardPath = path ? `${path}.*` : '*';
    
    return {
      type: 'wildcardObject',
      path,
      itemSchema: traverseSchema(wildcardSchema, wildcardPath),
      properties: Object.entries(schema.properties)
        .filter(([key]) => key !== '*')
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: traverseSchema(value, path ? `${path}.${key}` : key)
        }), {}),
      schema
    };
  }

  // Handle allOf with wildcards
  if (schema.allOf) {
    const mergedSchema = schema.allOf.reduce((acc, curr) => {
      if (curr.properties?.['*']) {
        return {
          ...acc,
          properties: {
            ...acc.properties,
            '*': curr.properties['*']
          }
        };
      }
      return { ...acc, ...curr };
    }, {});
    
    // Preserve definitions when merging
    if (schema.definitions) {
      mergedSchema.definitions = schema.definitions;
    }
    
    return traverseSchema(mergedSchema, path);
  }

  // Handle arrays
  if (schema.type === 'array' && schema.items) {
    return {
      type: 'array',
      path,
      items: traverseSchema(schema.items, `${path}[]`),
      schema: {
        ...schema,
        definitions: schema.definitions // Preserve definitions
      }
    };
  }

  // Handle objects
  if (schema.type === 'object' && schema.properties) {
    const fields = {};
    Object.entries(schema.properties).forEach(([key, value]) => {
      if (key !== '*') { // Skip wildcard property as it's handled separately
        fields[key] = traverseSchema(value, path ? `${path}.${key}` : key);
      }
    });
    return {
      type: 'object',
      path,
      fields,
      schema: {
        ...schema,
        definitions: schema.definitions // Preserve definitions
      }
    };
  }

  // Handle basic types including enums
  return {
    type: resolveFieldType(schema),
    path,
    schema: {
      ...schema,
      definitions: schema.definitions // Preserve definitions
    }
  };
};