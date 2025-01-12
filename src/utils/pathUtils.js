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
  if (!path) return { label: '', tooltip: undefined, nestingLevel: 0 };
  
  const segments = path.split('.');
  const nestingLevel = segments.length;
  const lastSegment = segments[segments.length - 1];
  
  // Handle wildcard segments
  const isWildcard = lastSegment === '*';
  const parentSegment = segments[segments.length - 2];
  
  let label = formatPathForDisplay(lastSegment);
  if (isWildcard && parentSegment) {
    label = `${formatPathForDisplay(parentSegment)} Items`;
  }
  
  return {
    label,
    tooltip: path,
    nestingLevel,
    isArrayContainer: lastSegment === '*',
    isArrayItem: lastSegment.match(/\*\[\d+\]/),
    isWildcard
  };
};

// Helper function to convert camelCase to Title Case
function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
    .trim();
}