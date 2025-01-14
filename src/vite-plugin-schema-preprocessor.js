import * as fs from 'fs/promises';
import * as path from 'path';
import mergeAllOf from 'json-schema-merge-allof';

// Function to resolve $refs locally
const resolveRefs = (schema, definitions = {}) => {
  const resolveRef = (ref) => {
    // Handle definitions
    if (ref.startsWith('#/definitions/')) {
      const defName = ref.split('/').pop();
      return definitions[defName];
    }
    // Add more ref resolution logic as needed
    return null;
  };

  // Deep clone to avoid modifying original
  const clone = JSON.parse(JSON.stringify(schema));
  
  // Recursively process object
  const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle $ref
    if (obj.$ref && typeof obj.$ref === 'string') {
      const resolved = resolveRef(obj.$ref);
      if (resolved) return processObject(resolved);
    }

    // Process arrays
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }

    // Process object properties
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processObject(value);
    }
    return result;
  };

  // Store definitions for reference
  const defs = clone.definitions || {};
  delete clone.definitions;

  // Process the schema
  return processObject(clone);
};

export default function schemaPreprocessor() {
  const virtualModuleId = 'virtual:powerbi-schema';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'schema-preprocessor',
    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        try {
          // Fetch schema from GitHub
          const response = await fetch('https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.114.json');
          const rawSchema = await response.json();

          // Preprocess schema
          const dereferencedSchema = resolveRefs(rawSchema);
          const processedSchema = mergeAllOf(dereferencedSchema);

          // Return as module
          return `export default ${JSON.stringify(processedSchema)};`;
        } catch (error) {
          console.error('Error preprocessing schema:', error);
          throw error;
        }
      }
    }
  };
}