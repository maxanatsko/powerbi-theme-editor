import { useState, useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';

const DEBOUNCE_MS = 300;
const DEFAULT_OPTIONS = {
  maxResults: 50,
  includePaths: true,
  includeDescriptions: true,
  fuzzyMatch: true,
};

// Utility to safely get nested properties
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Debug utility to print schema structure
const debugPrintSchema = (obj, depth = 0, maxDepth = 3) => {
  if (depth >= maxDepth) return '...';
  if (!obj || typeof obj !== 'object') return String(obj);
  
  const indent = '  '.repeat(depth);
  const entries = Object.entries(obj);
  
  return entries.map(([key, value]) => {
    if (value && typeof value === 'object') {
      const type = value.type ? `(${value.type})` : '';
      if (key === 'properties') {
        return `${indent}${key}${type}: {\n${debugPrintSchema(value, depth + 1, maxDepth)}\n${indent}}`;
      }
      return `${indent}${key}${type}: ${JSON.stringify(value).slice(0, 50)}${value.length > 50 ? '...' : ''}`;
    }
    return `${indent}${key}: ${value}`;
  }).join('\n');
};

export const useSchemaSearch = (schema, options = {}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchCache = useRef(new Map());
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const search = useMemo(() => {
    const searchFn = async (searchTerm) => {
      if (!searchTerm?.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // Debug: Print schema structure
        console.log('Schema Debug Information:');
        console.log('Top level keys:', Object.keys(schema));
        if (schema.properties) {
          console.log('Properties keys:', Object.keys(schema.properties));
        }
        console.log('Schema structure:\n', debugPrintSchema(schema));

        const searchTermLower = searchTerm.toLowerCase();
        const results = [];
        const visited = new Set();

        function traverse(obj, path = '') {
          if (!obj || typeof obj !== 'object') return;
          
          // Prevent circular references
          if (visited.has(obj)) return;
          visited.add(obj);

          console.log(`Traversing path: ${path}`);
          console.log(`Current object type:`, obj.type || typeof obj);

          // Special handling for properties
          if (obj.properties) {
            console.log(`Found properties at ${path}`);
            traverse(obj.properties, path);
          }

          // Handle each property
          Object.entries(obj).forEach(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            console.log(`Checking: ${currentPath}`);

            // Check for match
            const keyMatch = key.toLowerCase().includes(searchTermLower);
            const descMatch = value?.description?.toLowerCase()?.includes(searchTermLower);
            const typeMatch = value?.type?.toLowerCase()?.includes(searchTermLower);

            if (keyMatch || descMatch || typeMatch) {
              console.log(`Match found at ${currentPath}`);
              results.push({
                path: currentPath,
                property: key,
                type: value?.type || typeof value,
                description: value?.description,
                matchType: keyMatch ? 'exact' : (descMatch ? 'description' : 'type'),
                relevance: 100 - (path.split('.').length * 10),
                schema: value
              });
            }

            // Recursively traverse objects and arrays
            if (value && typeof value === 'object') {
              // Handle different schema structures
              if (value.properties) {
                traverse(value.properties, currentPath);
              } else if (value.items) {
                traverse(value.items, `${currentPath}[]`);
              } else if (!value.type || value.type === 'object') {
                traverse(value, currentPath);
              }
            }
          });
        }

        // Start traversal
        console.log('Starting schema traversal');
        traverse(schema);
        console.log(`Found ${results.length} results`);

        // Sort and limit results
        const sortedResults = results
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, opts.maxResults);

        console.log('Final results:', sortedResults);
        
        setSearchResults(sortedResults);
        
      } catch (error) {
        console.error('Search error:', error);
        setSearchError(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    return debounce(searchFn, DEBOUNCE_MS);
  }, [schema, opts]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    searchCache.current.clear();
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    search,
    clearSearch
  };
};