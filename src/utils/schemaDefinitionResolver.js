/**
 * Enhanced schema definition resolver that works with existing resolution system
 */
// src/utils/schemaDefinitionResolver.js
export class SchemaDefinitionResolver {
    constructor() {
      this.definitions = new Map();
      this.resolutionStack = new Set();
      
      // Add default definitions
      this.addDefaultDefinitions();
    }
    
    addDefaultDefinitions() {
      const defaults = {
        color: {
          type: 'string',
          format: 'color',
          pattern: '^#[0-9a-fA-F]{6}$'
        },
        fill: {
          type: 'string',
          format: 'color',
          pattern: '^#[0-9a-fA-F]{6}$'
        },
        image: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            scaling: { 
              type: 'string',
              enum: ['normal', 'fit', 'fill', 'stretch']
            },
            transparency: {
              type: 'number',
              minimum: 0,
              maximum: 100
            }
          }
        },
        // Add more default definitions as needed
      };

      Object.entries(defaults).forEach(([key, definition]) => {
        this.definitions.set(key, definition);
      });
    }

    extractDefinitions(schema) {
      // Keep default definitions
      const currentDefs = new Map(this.definitions);
      
      if (schema.definitions) {
        Object.entries(schema.definitions).forEach(([key, definition]) => {
          currentDefs.set(key, definition);
        });
      }
      
      this.definitions = currentDefs;
      return this.definitions;
    }

    resolveReference(ref, context = null) {
        if (!ref || typeof ref !== 'string') return null;
        
        if (this.resolutionStack.has(ref)) {
          console.warn('Circular reference detected:', ref);
          return this.getFallbackSchema(ref);
        }
        
        this.resolutionStack.add(ref);
        
        try {
          if (ref.startsWith('#/definitions/')) {
            const definitionKey = ref.replace('#/definitions/', '');
            const definition = this.definitions.get(definitionKey);
            
            if (!definition) {
              console.warn(`Definition not found: ${definitionKey}, using fallback`);
              return this.getFallbackSchema(definitionKey);
            }
            
            return definition;
          }
          return null;
        } finally {
          this.resolutionStack.delete(ref);
        }
    }

    getFallbackSchema(ref) {
      // Provide fallback schemas for common types
      if (ref.includes('color') || ref.includes('fill')) {
        return {
          type: 'string',
          format: 'color'
        };
      }
      
      if (ref.includes('image')) {
        return {
          type: 'object',
          properties: {
            url: { type: 'string' },
            scaling: { type: 'string' }
          }
        };
      }
      
      return {
        type: 'string'
      };
    }
    
    /**
     * Get a specific definition by name
     * @param {string} name - Definition name
     */
    getDefinition(name) {
      return this.definitions.get(name) || null;
    }
  
    /**
     * Integrate with the existing schema resolution system
     * @param {Object} schema - The schema to enhance
     * @returns {Object} Enhanced schema with definition resolution
     */
    integrateWithSchemaResolution(schema) {
        if (!schema) return null;
      
        // Extract definitions first
        this.extractDefinitions(schema);
      
        // Helper to process nested objects
        const processObject = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return obj;
          
          const result = { ...obj };
          
          // Handle references
          if (obj.$ref) {
            const resolved = this.resolveReference(obj.$ref);
            if (resolved) {
              Object.assign(result, processObject(resolved, path));
            }
          }
          
          // Process nested properties
          if (obj.properties) {
            result.properties = Object.entries(obj.properties).reduce((acc, [key, value]) => {
              acc[key] = processObject(value, `${path}.${key}`);
              return acc;
            }, {});
          }
          
          return result;
        };
        
        return {
          ...processObject(schema),
          definitions: schema.definitions,
          resolveRef: (ref) => this.resolveReference(ref),
          getDefinition: (name) => this.getDefinition(name),
          hasDefinition: (name) => this.definitions.has(name)
        };
    }
  
    /**
     * Validate a value against a definition
     * @param {any} value - Value to validate
     * @param {Object} definition - Definition to validate against
     */
    validateAgainstDefinition(value, definition) {
      if (!definition || !definition.type) {
        return false;
      }
  
      switch (definition.type) {
        case 'string':
          return typeof value === 'string' && 
                 (!definition.pattern || new RegExp(definition.pattern).test(value));
        
        case 'number':
          return typeof value === 'number' &&
                 (!definition.minimum || value >= definition.minimum) &&
                 (!definition.maximum || value <= definition.maximum);
        
        case 'boolean':
          return typeof value === 'boolean';
        
        case 'object':
          if (!value || typeof value !== 'object') return false;
          
          // Check required properties
          if (definition.required) {
            const hasRequired = definition.required.every(prop => 
              Object.prototype.hasOwnProperty.call(value, prop)
            );
            if (!hasRequired) return false;
          }
          
          // Check properties if specified
          if (definition.properties) {
            for (const [prop, propValue] of Object.entries(value)) {
              const propDef = definition.properties[prop];
              if (propDef && !this.validateAgainstDefinition(propValue, propDef)) {
                return false;
              }
            }
          }
          
          return true;
  
        case 'array':
          return Array.isArray(value) &&
                 (!definition.items || 
                  value.every(item => this.validateAgainstDefinition(item, definition.items)));
  
        default:
          console.warn(`Unsupported definition type: ${definition.type}`);
          return false;
      }
    }
  }
  
  // Create singleton instance
  export const definitionResolver = new SchemaDefinitionResolver();