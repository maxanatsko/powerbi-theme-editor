import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';
import { getPathDisplayInfo } from '../../utils/pathUtils';

export const ObjectField = ({ path, schema, value = {}, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug logging
  console.log('ObjectField render with path:', path);
  console.log('Schema:', schema);
  
  if (!schema.properties) return null;

  const displayInfo = getPathDisplayInfo(path);
  // Debug logging
  console.log('Display info for path:', displayInfo);
  
  const { label, tooltip, nestingLevel } = displayInfo;
  const isRoot = nestingLevel === 1;

  return (
    <div className="w-full border rounded-lg bg-gray-50">
      <div 
        className={`flex items-center cursor-pointer hover:bg-gray-100 rounded-lg ${isExpanded ? 'rounded-b-none' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center w-full p-3 ${nestingLevel > 1 ? 'pl-6' : ''}`}>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
          <span 
            className={`ml-2 ${isRoot ? 'font-semibold' : 'font-medium'} text-gray-700`}
            title={tooltip || undefined}
          >
            {label}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-lg border-t">
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            const fieldPath = path ? `${path}.${key}` : key;
            // Debug logging for child paths
            console.log('Creating child with path:', fieldPath);
            return (
              <FieldRenderer
                key={key}
                path={fieldPath}
                schema={fieldSchema}
                value={value[key]}
                onChange={handleFieldChange}
                required={schema.required?.includes(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
  
  function handleFieldChange(fieldPath, newValue) {
    const currentValue = { ...value };
    const fieldKey = fieldPath.split('.').pop();
    currentValue[fieldKey] = newValue;
    onChange(path, currentValue);
  }
};