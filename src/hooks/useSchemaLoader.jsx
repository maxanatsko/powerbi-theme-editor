import { useState, useEffect } from 'react';
import { definitionResolver } from '../utils/schemaDefinitionResolver';

export function useSchemaLoader() {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Replace with your actual schema loading logic
        const response = await fetch('/path/to/schema.json');
        const schemaData = await response.json();

        // Extract and register definitions
        definitionResolver.extractDefinitions(schemaData);

        setSchema(schemaData);
      } catch (err) {
        console.error('Failed to load schema:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, []);

  return { schema, error, isLoading };
}