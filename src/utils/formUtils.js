import { markFieldAsEdited } from './editTracker';

export const getValue = (obj, path) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

export const updateValue = (obj, path, value) => {
  // Mark the field as edited when it's updated
  markFieldAsEdited(path);

  const parts = path.split('.');
  const newObj = { ...obj };
  let current = newObj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Check if we're dealing with an array index
    const nextPart = parts[i + 1];
    const isNextPartArrayIndex = !isNaN(nextPart);
    
    if (isNextPartArrayIndex) {
      // If current[part] is not an array, initialize it
      if (!Array.isArray(current[part])) {
        current[part] = [];
      }
      // Ensure the array is properly copied
      current[part] = [...current[part]];
      // Ensure the array has enough elements
      const index = parseInt(nextPart);
      while (current[part].length <= index) {
        current[part].push({});
      }
    } else {
      // Handle regular object properties
      current[part] = current[part] ? { ...current[part] } : {};
    }
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  
  // If the value is an empty object or undefined, remove the property
  if (value === undefined || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
    delete current[lastPart];
  } else {
    current[lastPart] = value;
  }
  
  return newObj;
};

export const cleanFormData = (data) => {
  if (Array.isArray(data)) {
    // Filter out empty objects and undefined values from arrays
    const cleanedArray = data
      .map(item => cleanFormData(item))
      .filter(item => {
        if (item === undefined || item === null) return false;
        if (typeof item === 'object' && Object.keys(item).length === 0) return false;
        return true;
      });
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }
  
  if (typeof data === 'object' && data !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      const cleanedValue = cleanFormData(value);
      if (cleanedValue !== undefined && 
          !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  // Return undefined for empty strings, null, or undefined
  if (data === '' || data === null || data === undefined) {
    return undefined;
  }
  
  return data;
};