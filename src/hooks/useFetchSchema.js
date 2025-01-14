import { useState, useEffect } from 'react';
import { processSchema } from '../utils/schemaUtils';
import mergeAllOf from 'json-schema-merge-allof';

const SCHEMA_URL = 'https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.114.json';

const resolveRefs = (schema) => {
  const definitions = schema.definitions || {};
  
  const resolveRef = (ref) => {
    if (ref.startsWith('#/definitions/')) {
      const defName = ref.split('/').pop();
      return definitions[defName];
    }
    return null;
  };

  const processObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }

    if (obj.$ref && typeof obj.$ref === 'string') {
      const resolved = resolveRef(obj.$ref);
      if (resolved) {
        const { $ref, ...rest } = obj;
        return { ...processObject(resolved), ...rest };
      }
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processObject(value);
    }
    
    return result;
  };

  const processedSchema = structuredClone(schema);
  delete processedSchema.definitions;
  return processObject(processedSchema);
};

const resolveTypeConflicts = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(resolveTypeConflicts);
  }

  const result = { ...obj };

  if (obj.type && Array.isArray(obj.type)) {
    if (obj.type.includes('number') && obj.type.includes('integer')) {
      result.type = 'number';
    }
  }

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = resolveTypeConflicts(value);
    }
  }

  return result;
};

const analyzeSchemaStructure = (schema, path = '', result = { properties: [] }) => {
  if (typeof schema !== 'object' || schema === null) return;

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      const fullPath = path ? `${path}.${key}` : key;
      result.properties.push({
        path: fullPath,
        type: value.type,
        format: value.format,
        title: value.title || key
      });
      
      // Recurse into nested properties
      if (value.properties) {
        analyzeSchemaStructure(value, fullPath, result);
      }
    });
  }

  return result;
};

const CACHE_KEY = 'powerbi-schema-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const getCachedSchema = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const { schema, timestamp } = JSON.parse(cached);
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return schema;
  } catch (e) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const cacheSchema = (schema) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      schema,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to cache schema:', e);
  }
};

export const useFetchSchema = () => {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchema = async () => {
        // Try to get from cache first
        const cachedSchema = getCachedSchema();
        if (cachedSchema) {
          setSchema(cachedSchema);
          setError(null);
          setIsLoading(false);
          return;
        }

      try {
        setIsLoading(true);
        
        const response = await fetch(SCHEMA_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch schema: ${response.statusText}`);
        }
        
        const rawSchema = await response.json();
        
        const dereferencedSchema = resolveRefs(rawSchema);
        
        const processedSchema = mergeAllOf(dereferencedSchema, {
          resolvers: {
            enum: (values) => [...new Set(values.flat())],
            type: (values) => {
              if (values.flat().includes('number') && values.flat().includes('integer')) {
                return 'number';
              }
              return values[0];
            }
          }
        });

        const finalSchema = resolveTypeConflicts(processedSchema);
        
        // Analyze and log schema structure
        const structure = analyzeSchemaStructure(finalSchema);
        console.log('Schema structure:', JSON.stringify(structure.properties, null, 2));
        
        // Cache the processed schema
cacheSchema(finalSchema);

setSchema(finalSchema);
        setError(null);
      } catch (err) {
        console.error('Error fetching or processing schema:', err);
        setError(err.message);
        setSchema(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchema();
  }, []);

  return { schema, error, isLoading };
};