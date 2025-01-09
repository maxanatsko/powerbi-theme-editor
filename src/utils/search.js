import { flattenObject } from './jsonHelper';

/**
 * Search through theme properties and descriptions
 * @param {Object} theme - The theme object to search through
 * @param {string} searchTerm - The search term
 * @returns {Array} Array of matches with paths and context
 */
export const searchTheme = (theme, searchTerm) => {
  if (!searchTerm.trim() || !theme) return [];
  
  const normalizedSearch = searchTerm.toLowerCase();
  const matches = [];
  
  // Flatten the theme object for easier searching
  const flatTheme = flattenObject(theme);
  
  // Search through all properties
  Object.entries(flatTheme).forEach(([path, value]) => {
    const pathLower = path.toLowerCase();
    const valueLower = String(value).toLowerCase();
    
    if (pathLower.includes(normalizedSearch) || valueLower.includes(normalizedSearch)) {
      matches.push({
        path,
        value,
        matchType: pathLower.includes(normalizedSearch) ? 'property' : 'value',
        context: getSearchContext(value, normalizedSearch)
      });
    }
  });
  
  return matches;
};

/**
 * Get context around the matched term
 * @param {string} text - The full text to get context from
 * @param {string} searchTerm - The search term
 * @returns {string} Context string with match highlighted
 */
const getSearchContext = (text, searchTerm) => {
  const contextLength = 20;
  const textStr = String(text);
  const index = textStr.toLowerCase().indexOf(searchTerm);
  
  if (index === -1) return textStr;
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(textStr.length, index + searchTerm.length + contextLength);
  
  return textStr.slice(start, end);
};
