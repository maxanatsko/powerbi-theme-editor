import React, { useState, useMemo, useEffect } from 'react';
import { processComplexSchema } from '../../utils/schemaUtils';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';
import { getPathDisplayInfo } from '../../utils/pathUtils';
import { ErrorBoundary } from '../core/ErrorBoundary';

export const ObjectField = ({ path, schema, value = {}, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Process the schema to handle complex structures
  const [processedSchema, setProcessedSchema] = useState(schema);

  useEffect(() => {
    let mounted = true;
    const processSchema = async () => {
      try {
        const result = await processComplexSchema(schema);
        if (mounted) {
          setProcessedSchema(result);
        }
      } catch (error) {
        console.error('Error processing schema:', error);
      }
    };
    processSchema();
    return () => {
      mounted = false;
    };
  }, [schema]);
  
  if (!processedSchema.properties) return null;

  const displayInfo = getPathDisplayInfo(path);
  const { label, tooltip, nestingLevel } = displayInfo;
  const isRoot = nestingLevel === 1;
  
  const pathParts = path?.split('.') || [];
  const isStarLevel = pathParts[pathParts.length - 1] === '*';
  const isUnderVisualStyles = pathParts[0] === 'visualStyles';
  
  // If this is the * level under visual styles, render its properties directly
  if (isStarLevel && isUnderVisualStyles) {
    return (
      <div className="space-y-4">
        {Object.entries(processedSchema.properties).map(([key, fieldSchema]) => {
          const actualPath = path.replace('.*', `.${key}`);
          return (
            <FieldRenderer
              key={key}
              path={actualPath}
              schema={fieldSchema}
              value={value[key]}
              onChange={(_, newValue) => {
                const updatedValue = { ...value, [key]: newValue };
                onChange(path, updatedValue);
              }}
              required={processedSchema.required?.includes(key)}
            />
          );
        })}
      </div>
    );
  }

  // Regular object field rendering with collapsible sections
  return (
    <div className="w-full border rounded-lg bg-gray-50 mb-4">
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
          {Object.entries(processedSchema.properties).map(([key, fieldSchema]) => {
            const fieldPath = path ? `${path}.${key}` : key;
            return (
              <FieldRenderer
                key={key}
                path={fieldPath}
                schema={fieldSchema}
                value={value[key]}
                onChange={(_, newValue) => {
                  const updatedValue = { ...value, [key]: newValue };
                  onChange(path, updatedValue);
                }}
                required={schema.required?.includes(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};