import { useReducer, useCallback } from 'react';
import lodash from 'lodash';

/**
 * Creates an ordered object that maintains property order based on a schema
 */
const createOrderedObject = (schema, data) => {
  if (!schema?.properties) return data;

  const orderedData = {};
  
  // First add properties that exist in the schema in schema order
  Object.keys(schema.properties).forEach(key => {
    if (data && key in data) {
      // If the property is an object, recursively order its properties
      if (schema.properties[key].type === 'object' && schema.properties[key].properties) {
        orderedData[key] = createOrderedObject(schema.properties[key], data[key]);
      } else {
        orderedData[key] = data[key];
      }
    }
  });

  // Then add any remaining properties that might not be in the schema
  if (data) {
    Object.keys(data).forEach(key => {
      if (!(key in orderedData)) {
        orderedData[key] = data[key];
      }
    });
  }

  return orderedData;
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const newState = { ...state };
      lodash.set(newState, action.path, action.value);
      return createOrderedObject(action.schema, newState);
    }
    case 'RESET':
      return createOrderedObject(action.schema, action.data);
    default:
      return state;
  }
};

export const useFormState = (initialData = {}, schema = null) => {
  const [formData, dispatch] = useReducer(formReducer, initialData, 
    (initial) => createOrderedObject(schema, initial)
  );

  const updateField = useCallback((path, value) => {
    if (!path) return;
    
    const normalizedPath = Array.isArray(path) ? path : path.split('.');
    
    dispatch({ 
      type: 'UPDATE_FIELD', 
      path: normalizedPath,
      value,
      schema 
    });
  }, [schema]);

  const getFieldValue = useCallback((path) => {
    if (!path) return undefined;
    const normalizedPath = Array.isArray(path) ? path : path.split('.');
    return lodash.get(formData, normalizedPath);
  }, [formData]);

  const resetForm = useCallback((data = {}) => {
    dispatch({ 
      type: 'RESET', 
      data,
      schema 
    });
  }, [schema]);

  return {
    formData,
    updateField,
    getFieldValue,
    resetForm
  };
};