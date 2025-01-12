import React, { useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useSchemaResolution } from '../../hooks/useSchemaResolution';
import { useFormState } from '../../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';
import { traverseSchema } from '../../utils/schemaUtils';

export const ThemeForm = forwardRef(({ schema, initialData = {}, onChange }, ref) => {
  // Use the schema resolution hook
  const resolvedSchema = useSchemaResolution(schema);
  
  // Process schema for hierarchical structure
  const processedSchema = resolvedSchema ? traverseSchema(resolvedSchema) : null;

  // Form state management
  const { formData, updateField, resetForm } = useFormState(initialData, resolvedSchema);

  // Initialize form with schema URL
  useEffect(() => {
    if (schema?.$schema && !formData.$schema) {
      resetForm({ ...formData, $schema: schema.$schema });
    }
  }, [schema, formData.$schema]);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  // Handle field changes
  const handleFieldChange = useCallback((path, value) => {
    updateField(path, value);
  }, [updateField]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getThemeData: () => formData,
    expandPath: (pathSegments) => {
      try {
        let currentPath = '';
        for (const segment of pathSegments) {
          currentPath = currentPath ? `${currentPath}.${segment}` : segment;
          const sectionId = `section-${currentPath.replace(/\./g, '-')}`;
          const section = document.getElementById(sectionId);
          if (section) {
            section.setAttribute('data-expanded', 'true');
          }
        }
      } catch (error) {
        console.error('Error expanding path:', error);
      }
    }
  }));

  if (!processedSchema) {
    console.log('No processed schema available');
    return null;
  }

  const renderFields = (schema, basePath = '') => {
    if (schema.type === 'object' && schema.fields) {
      return Object.entries(schema.fields).map(([key, fieldSchema]) => {
        const fieldPath = basePath ? `${basePath}.${key}` : key;
        return (
          <FieldRenderer
            key={fieldPath}
            path={fieldPath}
            schema={fieldSchema.schema}
            rootSchema={resolvedSchema} // Pass resolved schema as root
            value={formData[key]}
            onChange={handleFieldChange}
            required={resolvedSchema?.required?.includes(key)}
          />
        );
      });
    }
    return null;
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 pb-8">
      {renderFields(processedSchema)}
    </div>
  );
});