import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

const JsonViewer = ({ 
  data,
  initialExpanded = true,
  level = 0,
  path = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [copied, setCopied] = useState(false);
  
  const formattedJson = useMemo(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value) => {
    const type = typeof value;
    switch (type) {
      case 'string':
        return <span className="text-green-600">"{value}"</span>;
      case 'number':
        return <span className="text-orange-600">{value}</span>;
      case 'boolean':
        return <span className="text-blue-600">{value.toString()}</span>;
      case 'object':
        if (value === null) return <span className="text-red-600">null</span>;
        return null; // Handled by recursive rendering
      default:
        return <span>{String(value)}</span>;
    }
  };

  const renderCollapsible = (obj) => {
    return Object.entries(obj).map(([key, value], index) => {
      const isObject = value !== null && typeof value === 'object';
      const currentPath = path ? `${path}.${key}` : key;
      
      return (
        <div key={currentPath} className="ml-4">
          <span className="text-purple-600 font-semibold">{key}</span>
          <span className="text-gray-600">: </span>
          {isObject ? (
            <JsonViewer
              data={value}
              initialExpanded={false}
              level={level + 1}
              path={currentPath}
            />
          ) : (
            renderValue(value)
          )}
          {index < Object.entries(obj).length - 1 && <span>,</span>}
        </div>
      );
    });
  };

  if (typeof data !== 'object' || data === null) {
    return renderValue(data);
  }

  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center space-x-2 sticky top-0 bg-white z-10 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <span>{isArray ? '[' : '{'}</span>
        {level === 0 && (
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-100 rounded ml-auto"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {isExpanded && !isEmpty && renderCollapsible(data)}
      
      <div className={isExpanded ? 'ml-4' : ''}>
        <span>{isArray ? ']' : '}'}</span>
        {level > 0 && <span>,</span>}
      </div>
    </div>
  );
};

export default JsonViewer;