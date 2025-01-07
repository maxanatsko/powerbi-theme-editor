import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSchemaResolution } from '../../hooks/useSchemaResolution';
import { useFormState } from '../../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';

export const ThemeForm = forwardRef(({ schema, initialData = {} }, ref) => {
  const resolvedSchema = useSchemaResolution(schema);
  const { formData, updateField } = useFormState(initialData, resolvedSchema);

  useImperativeHandle(ref, () => ({
    getThemeData: () => {
      return formData;
    }
  }));

  const handleFieldChange = useCallback((path, value) => {
    console.log('Field changed:', { path, value }); // For debugging
    updateField(path, value);
  }, [updateField]);

  if (!resolvedSchema) return null;

  return (
    <div className="w-full h-full overflow-auto space-y-4">
      {Object.entries(resolvedSchema.properties || {}).map(([key, fieldSchema]) => (
        <FieldRenderer
          key={key}
          path={key}
          schema={fieldSchema}
          value={formData[key]}
          onChange={handleFieldChange}
        />
      ))}

      {/* Debug view */}
      <details className="mt-8 p-4 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer text-gray-700 font-medium">
          Debug: Current Form Data
        </summary>
        <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
});