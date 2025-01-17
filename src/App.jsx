import React, { useState, useRef, useEffect } from 'react';
import { ThemeForm } from './components/core/ThemeForm';
import TreeLayout from './components/core/TreeLayout';
import { Download, Upload, Code } from 'lucide-react';
import { getLatestSchema } from './components/schemaVersions';
//import JsonViewer from './components/core/JsonViewer';
import SearchBar from './components/searchBar';

const App = () => {
  const [schema, setSchema] = useState(null);
  const [schemaVersion, setSchemaVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const fileInputRef = useRef(null);
  const themeFormRef = useRef(null);
  const [themeData, setThemeData] = useState({});
  const [searchResults, setSearchResults] = useState([]);

  // Add export handler here
  const handleExport = () => {
    const jsonString = JSON.stringify(themeData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (schema) {
      console.log('Schema Debug Info:', {
        type: schema?.type,
        hasProperties: Boolean(schema?.properties),
        propertiesLength: schema?.properties ? Object.keys(schema.properties).length : 0,
        topLevel: Object.keys(schema || {}),
        visualStyles: Boolean(schema?.properties?.visualStyles),
        firstLevelKeys: schema?.properties ? Object.keys(schema.properties) : [],
        visualStylesKeys: schema?.properties?.visualStyles?.properties 
          ? Object.keys(schema.properties.visualStyles.properties)
          : []
      });
    }
  }, [schema]);

  const handleSearch = (searchTerm) => {
    console.log('Search triggered with term:', searchTerm);
    
    if (!searchTerm?.trim() || !schema) {
      setSearchResults([]);
      return;
    }
    
    const results = [];
    const searchTermLower = searchTerm.toLowerCase();
    const visited = new Set();

    function searchInObject(obj, path = '') {
      // Base case checks
      if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
      visited.add(obj);

      // Check current object properties
      if (obj.properties) {
        Object.entries(obj.properties).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          // Check for matches in the current property
          const matches = {
            key: key.toLowerCase().includes(searchTermLower),
            description: String(value?.description || '').toLowerCase().includes(searchTermLower),
            type: String(value?.type || '').toLowerCase().includes(searchTermLower)
          };

          if (matches.key || matches.description || matches.type) {
            results.push({
              path: currentPath,
              property: key,
              type: value?.type || typeof value,
              description: value?.description || '',
              matchType: matches.key ? 'property' : matches.description ? 'description' : 'type'
            });
          }

          // Continue searching in this property
          searchInObject(value, currentPath);
        });
      }

      // Search in array items
      if (obj.items) {
        searchInObject(obj.items, `${path}[]`);
      }

      // Search in pattern properties
      if (obj.patternProperties) {
        Object.values(obj.patternProperties).forEach(value => {
          searchInObject(value, path);
        });
      }

      // Search in combiners (allOf, anyOf, oneOf)
      ['allOf', 'anyOf', 'oneOf'].forEach(combiner => {
        if (Array.isArray(obj[combiner])) {
          obj[combiner].forEach((item, index) => {
            searchInObject(item, `${path}${path ? '.' : ''}${combiner}[${index}]`);
          });
        }
      });

      // Search in other object properties
      Object.entries(obj).forEach(([key, value]) => {
        if (!['properties', 'items', 'patternProperties', 'allOf', 'anyOf', 'oneOf'].includes(key) &&
            typeof value === 'object' && value !== null) {
          const currentPath = path ? `${path}.${key}` : key;
          searchInObject(value, currentPath);
        }
      });
    }

    try {
      searchInObject(schema);
      console.log(`Found ${results.length} results`);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const navigateToProperty = (path) => {
    // Get reference to the ThemeForm
    const formRef = themeFormRef.current;
    if (!formRef) return;
  
    // Split path into segments
    const pathSegments = path.split('.');
    
    try {
      // Expand the path in the form
      formRef.expandPath(pathSegments);
      
      // Wait for expansion to complete
      setTimeout(() => {
        // Try different possible IDs for the element
        const possibleIds = [
          `field-${path}`,
          `field-${path.replace(/\./g, '-')}`,
          `input-${path}`,
          `input-${path.replace(/\./g, '-')}`,
          path.replace(/\./g, '-')
        ];
        
        let targetElement = null;
        
        // Try to find the element using different possible IDs
        for (const id of possibleIds) {
          const element = document.querySelector(`[data-field-path="${path}"], #${id}`);
          if (element) {
            targetElement = element;
            break;
          }
        }
        
        // If we found the element, scroll to it
        if (targetElement) {
          // First scroll the main container
          const container = document.querySelector('.overflow-auto');
          if (container) {
            const elementRect = targetElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top;
            
            container.scrollTo({
              top: container.scrollTop + relativeTop - 100, // 100px offset from top
              behavior: 'smooth'
            });
          }
          
          // Add highlight effect
          targetElement.classList.add('highlight-found-property');
          setTimeout(() => {
            targetElement.classList.remove('highlight-found-property');
          }, 2000);
        } else {
          console.log('Target element not found for path:', path);
        }
      }, 100); // Give time for expansion to complete
    } catch (error) {
      console.error('Error navigating to property:', error);
    }
  };

  React.useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const { schema: schemaData, version } = await getLatestSchema();
        setSchema(schemaData);
        setSchemaVersion(version);
      } catch (err) {
        console.error('Error loading schema:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-theme-light-bg-base dark:bg-theme-dark-bg-base">
        <div className="text-lg text-theme-light-text-primary dark:text-theme-dark-text-primary">Loading schema...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-theme-light-bg-base dark:bg-theme-dark-bg-base">
        <div className="text-theme-light-state-error dark:text-theme-dark-state-error">
          Error: {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 rounded transition-colors duration-200
              bg-theme-light-accent-primary dark:bg-theme-dark-accent-primary
              text-white
              hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-theme-light-bg-base dark:bg-theme-dark-bg-base">
      <header className="flex-none shadow w-full bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface border-b border-theme-light-border-default dark:border-theme-dark-border-default">
  <div className="flex items-center justify-between w-full px-6 py-4">
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-theme-light-text-primary dark:text-theme-dark-text-primary">
        Power BI Theme Editor
      </h1>
      {schemaVersion && (
        <div className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary mt-1">
          Schema Version: <span className="font-medium text-theme-light-accent-primary dark:text-theme-dark-accent-primary">v{schemaVersion}</span>
        </div>
      )}
    </div>
    
    <div className="relative flex-1 max-w-md mx-8">
      <SearchBar onSearch={handleSearch} />
      {searchResults.length > 0 && (
  <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border max-h-96 overflow-y-auto">
    {searchResults.map((result, index) => (
      <div
        key={`${result.path}-${index}`}
        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
        onClick={() => {
          navigateToProperty(result.path);
          setSearchResults([]); // Clear results after navigation
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded ${
              result.matchType === 'property' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {result.type}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {result.property}
              <span className="ml-2 text-xs text-gray-500">
                {result.path}
              </span>
            </p>
            {result.description && (
              <p className="text-sm text-gray-600 mt-1">
                {result.description}
              </p>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
      )}
    </div>
    
    <div className="space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
            />
            <button
              className="px-4 py-2 rounded transition-colors duration-200
                bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                text-theme-light-text-primary dark:text-theme-dark-text-primary
                hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover"
              onClick={() => setShowJson(!showJson)}
            >
              <Code className="w-4 h-4 mr-2 inline" />
              View JSON
            </button>
            <button
              className="px-4 py-2 rounded transition-colors duration-200
                bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                text-theme-light-text-primary dark:text-theme-dark-text-primary
                hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Import
            </button>
            <button
              className="px-4 py-2 rounded transition-colors duration-200
                bg-theme-light-accent-primary dark:bg-theme-dark-accent-primary
                text-white
                hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-hidden w-full bg-theme-light-bg-base dark:bg-theme-dark-bg-base">
        <TreeLayout>
          <div className={`flex gap-6 p-4 transition-all duration-200 ease-in-out bg-theme-light-bg-base dark:bg-theme-dark-bg-base ${showJson ? 'w-full' : 'max-w-4xl mx-auto'}`}>
            <div className="flex-[6]">
              <ThemeForm
                ref={themeFormRef}
                schema={schema}
                onChange={(newData) => setThemeData(newData)}
              />
            </div>
            {showJson && (
              <div className="flex-[4] border-l pl-6 border-theme-light-border-default dark:border-theme-dark-border-default">
              <div className="sticky top-0 pt-4">
              <h2 className="text-lg font-semibold mb-4 text-theme-light-text-primary dark:text-theme-dark-text-primary">JSON</h2>
              <pre className="p-4 rounded border text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[calc(100vh-12rem)]
                  bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
                  text-theme-light-text-primary dark:text-theme-dark-text-primary
                  border-theme-light-border-default dark:border-theme-dark-border-default">
                    {JSON.stringify(themeData || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </TreeLayout>
      </main>
    </div>
  );
};

export default App;