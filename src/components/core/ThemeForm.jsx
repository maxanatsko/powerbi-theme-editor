import React, { useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useSchemaResolution } from '../../hooks/useSchemaResolution';
import { useFormState } from '../../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';

export const ThemeForm = forwardRef(({ schema, initialData = {}, onChange }, ref) => {
  const resolvedSchema = useSchemaResolution(schema);
  const { formData, updateField, resetForm } = useFormState(initialData, resolvedSchema);

  // Initialize form with schema URL
  useEffect(() => {
    if (schema?.$schema && !formData.$schema) {
      resetForm({ ...formData, $schema: schema.$schema });
    }
  }, [schema, formData.$schema]);

  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  // Add expandPath to the methods exposed via ref
  useImperativeHandle(ref, () => ({
    getThemeData: () => formData,
    expandPath: (pathSegments) => {
      try {
        // Example implementation - adjust based on your form structure
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

  const handleFieldChange = useCallback((path, value) => {
    console.log('Field changed:', { path, value }); // For debugging
    updateField(path, value);
  }, [updateField]);

  if (!resolvedSchema) return null;

  return (
    <div className="w-full h-full overflow-auto space-y-4 pb-8">
      {Object.entries(resolvedSchema.properties || {}).map(([key, fieldSchema]) => (
        <FieldRenderer
          key={key}
          path={key}
          schema={fieldSchema}
          value={formData[key]}
          onChange={handleFieldChange}
          required={resolvedSchema.required?.includes(key)}
        />
      ))}
    </div>
  );
});