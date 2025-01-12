import React from 'react';
import useSchemaStore from '../store/schemaStore';
import useValidationStore from '../store/validationStore';
import FormField from './FormField';

const ThemeEditor = ({ theme, onChange }) => {
  console.log('ThemeEditor render start');
  const { schema, isLoading, error } = useSchemaStore();
  console.log('Schema store state:', { isLoading, hasSchema: !!schema, error });

  // Early return for loading state
  if (isLoading) {
    console.log('Returning loading state');
    return <div>Loading schema...</div>;
  }

  // Early return for error state
  if (error) {
    console.log('Returning error state:', error);
    return <div>Error loading schema: {error}</div>;
  }

  // Early return for no schema
  if (!schema) {
    console.log('No schema available');
    return null;
  }

  console.log('Rendering editor with schema');
  
  // Simplified render - just show the top-level properties first
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Power BI Theme Editor</h1>
      <pre>{JSON.stringify(Object.keys(schema.properties || {}), null, 2)}</pre>
    </div>
  );
};

export default ThemeEditor;