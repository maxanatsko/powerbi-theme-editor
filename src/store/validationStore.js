import { create } from 'zustand';
import { definitionResolver } from '../utils/schemaDefinitionResolver';
import useSchemaStore from './schemaStore';

const useValidationStore = create((set, get) => ({
  // State
  errors: new Map(), // key: field path, value: error message
  isValidating: false,

  // Actions
  setFieldError: (path, error) => {
    const errors = new Map(get().errors);
    if (error) {
      errors.set(path, error);
    } else {
      errors.delete(path);
    }
    set({ errors });
  },

  clearErrors: () => set({ errors: new Map() }),

  // Validation methods
  validateField: (path, value, schema) => {
    const store = get();
    
    if (schema.$ref) {
      const definition = useSchemaStore.getState().resolveReference(schema.$ref);
      if (!definition) {
        store.setFieldError(path, `Unable to resolve definition: ${schema.$ref}`);
        return false;
      }
      
      const isValid = definitionResolver.validateAgainstDefinition(value, definition);
      if (!isValid) {
        store.setFieldError(path, `Value does not match definition ${schema.$ref}`);
      } else {
        store.setFieldError(path, null);
      }
      return isValid;
    }

    // Direct schema validation
    const isValid = definitionResolver.validateAgainstDefinition(value, schema);
    if (!isValid) {
      store.setFieldError(path, 'Invalid value for field');
    } else {
      store.setFieldError(path, null);
    }
    return isValid;
  },

  validateForm: (formData, schema) => {
    const store = get();
    store.clearErrors();
    let isValid = true;

    const validateRecursive = (data, schemaPath = [], dataPath = []) => {
      if (!data || typeof data !== 'object') return;

      Object.entries(data).forEach(([key, value]) => {
        const currentPath = [...dataPath, key];
        const currentSchemaPath = [...schemaPath, key];
        const fieldSchema = useSchemaStore.getState().getSchemaAtPath(currentSchemaPath);

        if (fieldSchema) {
          const fieldValid = store.validateField(
            currentPath.join('.'), 
            value, 
            fieldSchema
          );
          if (!fieldValid) isValid = false;
        }

        // Recurse into nested objects
        if (value && typeof value === 'object') {
          validateRecursive(value, currentSchemaPath, currentPath);
        }
      });
    };

    validateRecursive(formData);
    return isValid;
  }
}));

export default useValidationStore;