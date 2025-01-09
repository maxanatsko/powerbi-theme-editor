import { useState, useCallback, useEffect } from 'react';
import { validateField, createDefaultValue, resolveSchemaRef } from '../utils/schemaUtils';

export const useSchemaForm = (schema, initialValue = undefined) => {
  const [formData, setFormData] = useState(initialValue);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [resolvedSchema, setResolvedSchema] = useState(schema);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve schema references on mount
  useEffect(() => {
    const resolveSchema = async () => {
      try {
        setIsLoading(true);
        const resolved = await resolveSchemaRef(schema, schema);
        setResolvedSchema(resolved);
        
        // If no initial value provided, create default values from schema
        if (initialValue === undefined) {
          const defaultValue = createDefaultValue(resolved);
          setFormData(defaultValue);
        }
      } catch (error) {
        console.error('Error resolving schema:', error);
      } finally {
        setIsLoading(false);
      }
    };

    resolveSchema();
  }, [schema, initialValue]);

  // Validate the entire form
  const validateForm = useCallback((data = formData) => {
    if (!resolvedSchema || isLoading) return true;

    const newErrors = {};
    let formIsValid = true;

    const validateFieldRecursively = (fieldSchema, fieldValue, path = '') => {
      // Skip validation if schema is not resolved
      if (fieldSchema.$ref) return true;

      const validation = validateField(fieldSchema, fieldValue);
      
      if (!validation.valid) {
        formIsValid = false;
        newErrors[path] = validation.errors;
      }

      // Recursively validate object properties
      if (fieldSchema.type === 'object' && fieldSchema.properties) {
        Object.entries(fieldSchema.properties).forEach(([key, propSchema]) => {
          const propPath = path ? `${path}.${key}` : key;
          const propValue = fieldValue?.[key];
          validateFieldRecursively(propSchema, propValue, propPath);
        });
      }

      // Recursively validate array items
      if (fieldSchema.type === 'array' && Array.isArray(fieldValue)) {
        fieldValue.forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          validateFieldRecursively(fieldSchema.items, item, itemPath);
        });
      }
    };

    validateFieldRecursively(resolvedSchema, data);
    
    setErrors(newErrors);
    setIsValid(formIsValid);
    
    return formIsValid;
  }, [formData, resolvedSchema, isLoading]);

  // Handle field changes
  const handleChange = useCallback((path, value) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Handle nested paths (e.g., "person.name" or "items[0].title")
      const pathParts = path.split(/[.[\]]/).filter(Boolean);
      let current = newData;
      
      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          current[part] = value;
        } else {
          if (!(part in current)) {
            const nextPart = pathParts[index + 1];
            current[part] = /^\d+$/.test(nextPart) ? [] : {};
          }
          current = current[part];
        }
      });

      return newData;
    });

    // Validate the changed field and its parent objects
    validateForm();
  }, [validateForm]);

  // Reset form to initial state or schema defaults
  const resetForm = useCallback(() => {
    const defaultValue = initialValue !== undefined 
      ? initialValue 
      : createDefaultValue(resolvedSchema);
    
    setFormData(defaultValue);
    setErrors({});
    setIsValid(true);
  }, [initialValue, resolvedSchema]);

  // Submit handler
  const handleSubmit = useCallback((onSubmit) => async (event) => {
    event?.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors(prev => ({
          ...prev,
          submit: [error.message || 'Submission failed']
        }));
      }
    }
  }, [formData, validateForm]);

  return {
    formData,
    setFormData,
    errors,
    isValid,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm,
    validateForm,
    resolvedSchema
  };
};