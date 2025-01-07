// editTracker.js

// Store edited fields with their paths
const editedFields = new Set();

export const markFieldAsEdited = (path) => {
  editedFields.add(path);
};

export const clearEditedFields = () => {
  editedFields.clear();
};

export const isFieldEdited = (path) => {
  return editedFields.has(path);
};

export const getAllEditedFields = () => {
  return Array.from(editedFields);
};

// Clean form data but only include edited fields
export const cleanEditedFormData = (data, currentPath = '') => {
  if (Array.isArray(data)) {
    const cleanedArray = data
      .map((item, index) => cleanEditedFormData(item, `${currentPath}${index}.`))
      .filter(item => item !== undefined);
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  if (typeof data === 'object' && data !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      const fieldPath = currentPath + key;
      const cleanedValue = cleanEditedFormData(value, `${fieldPath}.`);
      
      // Only include the field if it or one of its children was edited
      if (isFieldEdited(fieldPath) || 
          (cleanedValue !== undefined && typeof cleanedValue === 'object')) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  // For primitive values, only include them if their path was edited
  if (isFieldEdited(currentPath.slice(0, -1))) { // Remove trailing dot
    return data;
  }

  return undefined;
};