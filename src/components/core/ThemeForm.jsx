import React, { useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useSchemaResolution } from '../../hooks/useSchemaResolution';
import { useFormState } from '../../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';
import { traverseSchema } from '../../utils/schemaUtils';

export const ThemeForm = forwardRef(({ schema, initialData = {}, onChange }, ref) => {
  const resolvedSchema = useSchemaResolution(schema);
  const processedSchema = resolvedSchema ? traverseSchema(resolvedSchema) : null;
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

  const handleFieldChange = useCallback((path, value) => {
    updateField(path, value);
  }, [updateField]);

  if (!processedSchema) return null;

  const renderFields = (schema, basePath = '') => {
    if (schema.type === 'object' && schema.fields) {
      return Object.entries(schema.fields).map(([key, fieldSchema]) => {
        const fieldPath = basePath ? `${basePath}.${key}` : key;
        return (
          <FieldRenderer
            key={fieldPath}
            path={fieldPath}
            schema={fieldSchema.schema}
            value={formData[key]}
            onChange={handleFieldChange}
            required={resolvedSchema.required?.includes(key)}
          />
        );
      });
    }
    return null;
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 pb-8
     bg-theme-light-bg-base dark:bg-theme-dark-bg-base
     text-theme-light-text-primary dark:text-theme-dark-text-primary">
      {renderFields(processedSchema)}
    </div>
  );
});