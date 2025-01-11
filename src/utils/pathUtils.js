// src/utils/pathUtils.js

/**
 * Format a schema path for display
 * @param {string} path - The full property path
 * @returns {string} Formatted path for display
 */
export const formatPathForDisplay = (path) => {
  // Debug logging
  console.log('Formatting path:', path);
  
  if (!path) return '';
  
  // Split the path into segments
  const segments = path.split('.');
  const lastSegment = segments[segments.length - 1];
  
  // Debug logging
  console.log('Segments:', segments);
  console.log('Last segment:', lastSegment);
  
  // Basic cases
  if (path.endsWith('→*')) {
    console.log('Root level case, returning:', toTitleCase(lastSegment.replace('→*', '')));
    return toTitleCase(lastSegment.replace('→*', ''));
  }
  
  if (lastSegment === '*') {
    console.log('Array container case, returning: *');
    return '*';
  }
  
  if (lastSegment.match(/\*\[\d+\]/)) {
    console.log('Array item case, returning:', lastSegment);
    return lastSegment;
  }

  // Just show the property name for any path
  const result = toTitleCase(lastSegment);
  console.log('Default case, returning:', result);
  return result;
};

/**
 * Get display info for a schema path
 * @param {string} path - The property path
 * @returns {Object} Display information including label and tooltip
 */
export const getPathDisplayInfo = (path) => {
  // Debug logging
  console.log('Getting display info for path:', path);
  
  if (!path) return { label: '', tooltip: undefined, nestingLevel: 0 };
  
  const nestingLevel = path.split('.').length;
  const isLeafNode = !path.endsWith('*') && !path.endsWith('→*');
  
  const result = {
    label: formatPathForDisplay(path),
    tooltip: isLeafNode ? path : undefined,
    nestingLevel,
    isArrayContainer: path.endsWith('*'),
    isArrayItem: path.includes('*[')
  };
  
  // Debug logging
  console.log('Display info result:', result);
  return result;
};

// Helper function to convert camelCase to Title Case
function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
    .trim();
}