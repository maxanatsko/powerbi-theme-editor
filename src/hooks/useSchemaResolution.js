// src/hooks/useSchemaResolution.js
import { useState, useEffect } from 'react';
import { resolveSchema } from '../utils/schemaUtils';

export const useSchemaResolution = (schema) => {
  const [resolvedSchema, setResolvedSchema] = useState(null);

  useEffect(() => {
    if (!schema) return;
    
    const resolve = async () => {
      const result = await resolveSchema(schema);
      setResolvedSchema(result);
    };

    resolve();
  }, [schema]);

  return resolvedSchema;
};