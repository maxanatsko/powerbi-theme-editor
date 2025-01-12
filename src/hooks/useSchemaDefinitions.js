import { useEffect, useMemo } from 'react';
import { definitionResolver } from '../utils/schemaDefinitionResolver';

export function useSchemaDefinitions(schema) {
  // Extract definitions when schema changes
  useEffect(() => {
    if (schema) {
      definitionResolver.extractDefinitions(schema);
    }
  }, [schema]);

  // Memoized helper functions
  const helpers = useMemo(() => ({
    resolveReference: (ref) => definitionResolver.resolveReference(ref),
    getDefinition: (name) => definitionResolver.getDefinition(name),
    validateAgainstDefinition: (value, definition) => 
      definitionResolver.validateAgainstDefinition(value, definition)
  }), []);

  return helpers;
}