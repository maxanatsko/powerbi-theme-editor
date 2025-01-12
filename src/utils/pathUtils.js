export const formatPathForDisplay = (path) => {
  if (!path) return '';
  
  // Split the path into segments
  const segments = path.split('.');
  const lastSegment = segments[segments.length - 1];
  
  // If this is a visual styles property, handle it specially
  if (segments[0] === 'visualStyles') {
    // For the * segment specifically, show the parent component name
    if (lastSegment === '*') {
      return segments[segments.length - 2];
    }
  }
  
  // All other cases - convert to title case
  return toTitleCase(lastSegment);
};

export const getPathDisplayInfo = (path) => {
  if (!path) return { label: '', tooltip: undefined, nestingLevel: 0 };
  
  const segments = path.split('.');
  const isVisualStyles = segments[0] === 'visualStyles';
  
  // For visual styles, adjust nesting level to skip the * level
  let nestingLevel = segments.length;
  if (isVisualStyles && segments.includes('*')) {
    nestingLevel -= 1; // Subtract one level for the * that we're flattening
  }
  
  const isLeafNode = !path.endsWith('*');
  
  return {
    label: formatPathForDisplay(path),
    tooltip: isLeafNode ? path : undefined,
    nestingLevel,
    isArrayContainer: path.endsWith('*'),
    isArrayItem: path.includes('*[')
  };
};

// Helper function to convert camelCase to Title Case
function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}