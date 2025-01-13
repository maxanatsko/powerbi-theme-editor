import { useState, useEffect, useMemo } from 'react';

const SCHEMA_URL = 'https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report%20Theme%20JSON%20Schema/reportThemeSchema-2.114.json';

export const useFetchSchema = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch(SCHEMA_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawSchema = await response.json();
        
        // Log raw schema for debugging
        console.log('Raw schema:', rawSchema);
        
        // Optimize schema by removing unnecessary validation keywords
        const optimizedSchema = optimizeSchema(rawSchema);
        
        setSchema(optimizedSchema);
      } catch (err) {
        console.error('Schema fetch error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  // Optimize schema by removing unnecessary validation
  const optimizeSchema = (rawSchema) => {
    if (!rawSchema) return rawSchema;

    const optimized = { ...rawSchema };
    
    // Remove unnecessary validation keywords
    const removeValidationKeywords = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      // Remove heavyweight validations if not critical
      delete obj.pattern;
      delete obj.patternProperties;
      delete obj.dependencies;
      
      // Recursively process nested objects
      Object.values(obj).forEach(removeValidationKeywords);
    };

    removeValidationKeywords(optimized);
    
    // Log optimized schema for debugging
    console.log('Optimized schema:', optimized);
    
    return optimized;
  };

  // Add error debugging
  useEffect(() => {
    if (error) {
      console.error('Schema Error Details:', {
        message: error.message,
        stack: error.stack,
        schema: schema
      });
    }
  }, [error, schema]);

  return { schema, loading, error };
};