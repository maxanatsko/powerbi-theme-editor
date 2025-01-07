import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';

export const ObjectField = ({ path, schema, value = {}, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  if (!schema.properties) return null;

  // Get nesting level from path to control indentation
  const nestingLevel = path ? path.split('.').length : 0;
  const isRoot = nestingLevel === 1; // First level items
  
  // Determine field label
  const fieldLabel = schema.title || path.split('.').pop();

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
          <span className={`ml-2 ${isRoot ? 'font-semibold' : 'font-medium'} text-gray-700`}>
            {fieldLabel}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-lg border-t">
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            const fieldPath = path ? `${path}.${key}` : key;
            return (
              <FieldRenderer
                key={key}
                path={fieldPath}
                schema={fieldSchema}
                value={value[key]}
                onChange={handleFieldChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
  
  function handleFieldChange(fieldPath, newValue) {
    // Get the current object value
    const currentValue = { ...value };
    
    // Update the specific field
    const fieldKey = fieldPath.split('.').pop();
    currentValue[fieldKey] = newValue;
    
    // Notify parent of the entire object change
    onChange(path, currentValue);
  }
};