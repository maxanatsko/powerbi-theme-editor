import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';
import { getLatestSchema } from './schemaVersions';
import SchemaField from './SchemaField';
import { getValue, updateValue } from '../utils/formUtils';

const SchemaBasedEditor = () => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['properties']));
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "My Theme",
    dataColors: ["#01B8AA", "#374649", "#FD625E", "#F2C80F"],
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const schemaData = await getLatestSchema();
        setSchema(schemaData);
        
        // Automatically expand some default nodes
        const defaultExpanded = new Set(['properties']);
        // Add any additional default expanded paths here
        setExpandedNodes(defaultExpanded);
      } catch (err) {
        setError('Failed to load schema: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setFormData(imported);
          
          // Expand all paths in the imported data
          const newExpanded = new Set(['properties']);
          const expandPaths = (obj, path = '') => {
            if (typeof obj === 'object' && obj !== null) {
              Object.keys(obj).forEach(key => {
                const newPath = path ? `${path}.${key}` : key;
                newExpanded.add(newPath);
                expandPaths(obj[key], newPath);
              });
            }
          };
          expandPaths(imported);
          setExpandedNodes(newExpanded);
        } catch (error) {
          alert('Error parsing theme file. Please ensure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const themeJson = JSON.stringify(formData, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'theme'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      // When collapsing, also remove all child paths
      const pathPrefix = path + '.';
      Array.from(newExpanded)
        .filter(p => p.startsWith(pathPrefix))
        .forEach(p => newExpanded.delete(p));
      newExpanded.delete(path);
    } else {
      // When expanding, ensure all parent paths are also expanded
      const parts = path.split('.');
      let currentPath = '';
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        newExpanded.add(currentPath);
      });
    }
    setExpandedNodes(newExpanded);
  };

  const isNodeExpanded = (path) => {
    return expandedNodes.has(path);
  };

  const handleValueChange = (path, value) => {
    setFormData(prev => updateValue(prev, path, value));
  };

  const renderField = (key, schemaProps, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    
    return (
      <SchemaField
        key={currentPath}
        path={currentPath}
        schema={schemaProps}
        value={getValue(formData, currentPath)}
        onChange={handleValueChange}
        isExpanded={isNodeExpanded(currentPath)}
        onToggle={toggleNode}
        formData={formData}
        getValue={getValue}
        definitions={schema.definitions || {}}
      />
    );
  };

  const getSchemaVersion = (schema) => {
    if (!schema) return 'Unknown';
    
    const schemaField = schema.$schema || '';
    const filenameMatch = schemaField.match(/reportThemeSchema-(\d+\.\d+)\.json/);
    if (filenameMatch) return filenameMatch[1];
    
    if (schema.$version) return schema.$version;
    
    const schemaId = schema.$id || '';
    const idMatch = schemaId.match(/reportThemeSchema-(\d+\.\d+)\.json/);
    if (idMatch) return idMatch[1];
    
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700 dark:text-gray-200">Loading schema...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!schema) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Power BI Theme Editor</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Schema Version: {getSchemaVersion(schema)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-gray-800">
        <div className="p-4">
          {schema && schema.properties && (
            Object.entries(schema.properties).map(([key, schemaProps]) => 
              renderField(key, schemaProps)
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaBasedEditor;