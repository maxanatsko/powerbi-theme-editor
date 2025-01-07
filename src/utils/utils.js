// utils.js

const resolveRef = (ref, rootSchema, cache = new Map()) => {
    if (cache.has(ref)) {
      return cache.get(ref);
    }
  
    const path = ref.split('/').slice(1);
    let current = rootSchema;
    
    for (const segment of path) {
      current = current[segment];
      if (!current) {
        console.warn(`Failed to resolve reference: ${ref}`);
        return { type: 'string' }; // Fallback for unresolved refs
      }
    }
  
    cache.set(ref, { ...current });
    const resolved = resolveSchema(current, rootSchema, cache);
    cache.set(ref, resolved);
    
    return resolved;
  };
  
  const resolveArraySchema = (arraySchema, rootSchema, cache) => {
    if (!arraySchema.items) return arraySchema;
  
    const resolvedItems = resolveSchema(arraySchema.items, rootSchema, cache);
    return {
      ...arraySchema,
      items: resolvedItems
    };
  };
  
  const deepMerge = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    if (!target || typeof target !== 'object') return source;
  
    const result = { ...target };
  
    Object.entries(source).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (key === 'properties' && result[key]) {
          result[key] = {
            ...result[key],
            ...value
          };
        } else {
          result[key] = deepMerge(result[key] || {}, value);
        }
      } else {
        result[key] = value;
      }
    });
  
    return result;
  };
  
  const resolveSchema = (schemaNode, rootSchema, cache = new Map()) => {
    if (!schemaNode || typeof schemaNode !== 'object') {
      return schemaNode;
    }
  
    if (schemaNode.$ref) {
      return resolveRef(schemaNode.$ref, rootSchema, cache);
    }
  
    const resolved = { ...schemaNode };
  
    // Handle array type first
    if (resolved.type === 'array') {
      return resolveArraySchema(resolved, rootSchema, cache);
    }
  
    // Handle schema combinations
    ['oneOf', 'anyOf', 'allOf'].forEach(combiner => {
      if (resolved[combiner]) {
        const mergedSchema = resolved[combiner].reduce((acc, schema) => {
          const resolvedSubSchema = resolveSchema(schema, rootSchema, cache);
          return deepMerge(acc, resolvedSubSchema);
        }, {});
        delete resolved[combiner];
        Object.assign(resolved, mergedSchema);
      }
    });
  
    // Handle nested properties
    if (resolved.properties) {
      resolved.properties = Object.fromEntries(
        Object.entries(resolved.properties).map(([key, value]) => [
          key,
          resolveSchema(value, rootSchema, cache)
        ])
      );
    }
  
    // Handle additionalProperties
    if (resolved.additionalProperties && typeof resolved.additionalProperties === 'object') {
      resolved.additionalProperties = resolveSchema(resolved.additionalProperties, rootSchema, cache);
    }
  
    return resolved;
  };
  
  export const loadSchemaFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const schema = await response.json();
      
      // Process definitions first
      if (schema.definitions) {
        schema.definitions = Object.fromEntries(
          Object.entries(schema.definitions).map(([key, def]) => [
            key,
            resolveSchema(def, schema)
          ])
        );
      }
  
      // Then resolve the main schema
      const resolvedSchema = {
        ...schema,
        properties: Object.fromEntries(
          Object.entries(schema.properties).map(([key, value]) => {
            console.log(`Resolving property ${key}...`);
            const resolved = resolveSchema(value, schema);
            console.log(`Resolved ${key}:`, resolved);
            return [key, resolved];
          })
        )
      };
  
      return resolvedSchema;
    } catch (error) {
      throw new Error(`Failed to load schema: ${error.message}`);
    }
  };
  
  export const extractDefaultValues = (properties, path = '') => {
    const defaults = {};
    
    Object.entries(properties || {}).forEach(([key, prop]) => {
      if (prop.default !== undefined) {
        defaults[key] = prop.default;
      }
      if (prop.type === 'object' && prop.properties) {
        defaults[key] = extractDefaultValues(prop.properties, `${path}${key}.`);
      }
      if (prop.type === 'array' && prop.items && prop.items.default !== undefined) {
        defaults[key] = [prop.items.default];
      }
    });
  
    return defaults;
  };
  
  export const getValue = (obj, path) => {
    const pathArray = path.split('.');
    let current = obj;
    for (const key of pathArray) {
      if (current === undefined) return '';
      current = current[key];
    }
    return current;
  };
  
  export const updateValue = (obj, path, value) => {
    const pathArray = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    return newObj;
  };