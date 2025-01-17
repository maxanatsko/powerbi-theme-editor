import React, { useState, useMemo, useEffect } from 'react';
import { processComplexSchema, isColorGroupParent, getColorGroups, getColorGroup } from '../../utils/schemaUtils';
import { groupOrder } from '../../utils/colorGroups';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';
import { getPathDisplayInfo } from '../../utils/pathUtils';
import { ErrorBoundary } from '../core/ErrorBoundary';

export const ObjectField = ({ path, schema, value = {}, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Process the schema to handle complex structures
  const [processedSchema, setProcessedSchema] = useState(schema);
  
  // Check if this object contains color groups and debug
  const colorGroups = useMemo(() => {
    if (!processedSchema?.properties) return null;
    const groups = getColorGroups(processedSchema, path);
    console.log('Path:', path);
    console.log('Schema properties:', Object.keys(processedSchema.properties));
    console.log('Detected color groups:', groups);
    return groups;
  }, [processedSchema, path]);

  // Determine if this is a color group container
  const isColorContainer = useMemo(() => {
    return isColorGroupParent(processedSchema, path);
  }, [processedSchema, path]);

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
  
  // Special handling for color groups
  const renderColorGroups = () => {
    if (!colorGroups) return null;
    
    // Render groups in specified order
    return (
      <div className="mb-6 p-4 bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface rounded-lg border border-theme-light-border-default dark:border-theme-dark-border-default">
        <h2 className="text-lg font-semibold mb-4 text-theme-light-text-primary dark:text-theme-dark-text-primary">
          Base Colors
        </h2>
        {groupOrder
      .filter(groupName => colorGroups[groupName])
      .map(groupName => (
        <div key={groupName} className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-theme-light-text-primary dark:text-theme-dark-text-primary">
            {groupName}
          </h3>
          <div className="grid grid-cols-1 gap-4 pl-4">
            {Object.entries(colorGroups[groupName]).map(([key, fieldSchema]) => {
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
                  required={processedSchema.required?.includes(key)}
                />
              );
            })}
          </div>
        </div>
      ))}
      </div>
    );
  };
  
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
    <div className="w-full border rounded-lg mb-4
      bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
      border-theme-light-border-default dark:border-theme-dark-border-default">
      <div 
        className={`flex items-center cursor-pointer rounded-lg transition-colors duration-200
          hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover
          ${isExpanded ? 'rounded-b-none' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center w-full p-3 ${nestingLevel > 1 ? 'pl-6' : ''}`}>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
          )}
          <span 
            className={`ml-2 ${isRoot ? 'font-semibold' : 'font-medium'}
              text-theme-light-text-primary dark:text-theme-dark-text-primary`}
            title={tooltip || undefined}
          >
            {label}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 rounded-b-lg border-t
          bg-theme-light-bg-base dark:bg-theme-dark-bg-base
          border-theme-light-border-default dark:border-theme-dark-border-default">
          {/* Render color groups if present */}
          {colorGroups && renderColorGroups()}
          
          {/* Render non-grouped properties */}
          {Object.entries(processedSchema.properties)
            .filter(([key]) => !colorGroups || !Object.values(colorGroups).some(group => key in group))
            .map(([key, fieldSchema]) => {
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