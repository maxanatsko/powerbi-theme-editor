import { useReducer, useCallback } from 'react';
import { set, get } from 'lodash';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      // Create a fresh copy of the state
      const newState = { ...state };
      // Use lodash's set to handle nested paths correctly
      set(newState, action.path, action.value);
      return newState;
    }
    case 'RESET':
      return action.data;
    default:
      return state;
  }
};

export const useFormState = (initialData = {}) => {
  const [formData, dispatch] = useReducer(formReducer, initialData);

  const updateField = useCallback((path, value) => {
    // Handle empty or invalid paths
    if (!path) return;
    
    // Normalize the path to handle arrays and nested objects
    const normalizedPath = Array.isArray(path) ? path : path.split('.');
    
    dispatch({ 
      type: 'UPDATE_FIELD', 
      path: normalizedPath,
      value 
    });
  }, []);

  const getFieldValue = useCallback((path) => {
    if (!path) return undefined;
    const normalizedPath = Array.isArray(path) ? path : path.split('.');
    return get(formData, normalizedPath);
  }, [formData]);

  const resetForm = useCallback((data = {}) => {
    dispatch({ type: 'RESET', data });
  }, []);

  return {
    formData,
    updateField,
    getFieldValue,
    resetForm
  };
};