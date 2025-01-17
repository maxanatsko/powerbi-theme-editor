import React, { useCallback, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSchemaResolution } from '../../hooks/useSchemaResolution';
import { useFormState } from '../../hooks/useFormState';
import { FieldRenderer } from './FieldRenderer';
import { traverseSchema, getColorGroups } from '../../utils/schemaUtils';
import { groupOrder } from '../../utils/colorGroups';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const ThemeForm = forwardRef(({ schema, initialData = {}, onChange }, ref) => {
  const resolvedSchema = useSchemaResolution(schema);
  const processedSchema = resolvedSchema ? traverseSchema(resolvedSchema) : null;
  const { formData, updateField, resetForm } = useFormState(initialData, resolvedSchema);

  // Initialize form with schema URL
  useEffect(() => {
    if (schema?.$schema && !formData.$schema) {
      resetForm({ ...formData, $schema: schema.$schema });
    }
  }, [schema, formData.$schema]);

  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  useImperativeHandle(ref, () => ({
    getThemeData: () => formData,
    expandPath: (pathSegments) => {
      try {
        let currentPath = '';
        for (const segment of pathSegments) {
          currentPath = currentPath ? `${currentPath}.${segment}` : segment;
          const sectionId = `section-${currentPath.replace(/\./g, '-')}`;
          const section = document.getElementById(sectionId);
          if (section) {
            section.setAttribute('data-expanded', 'true');
          }
        }
      } catch (error) {
        console.error('Error expanding path:', error);
      }
    }
  }));

  const handleFieldChange = useCallback((path, value) => {
    updateField(path, value);
  }, [updateField]);

  if (!processedSchema) return null;

  // Base Colors section component
  const BaseColorsSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    
    if (!resolvedSchema?.properties) return null;
    const colorGroups = getColorGroups(resolvedSchema, ''); // Empty string for root path
    if (!colorGroups) return null;

    const toggleGroup = (groupName) => {
      setExpandedGroups(prev => ({
        ...prev,
        [groupName]: !prev[groupName]
      }));
    };

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
          <div className="flex items-center w-full p-3">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
            )}
            <span className="ml-2 font-semibold text-theme-light-text-primary dark:text-theme-dark-text-primary">
              Base Colors
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 rounded-b-lg border-t
            bg-theme-light-bg-base dark:bg-theme-dark-bg-base
            border-theme-light-border-default dark:border-theme-dark-border-default">
            {groupOrder
              .filter(groupName => colorGroups[groupName])
              .map(groupName => (
                <div key={groupName} className="mb-6 last:mb-0">
                  <div className="w-full border rounded-lg mb-4
                    bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
                    border-theme-light-border-default dark:border-theme-dark-border-default">
                    <div 
                      className={`flex items-center w-full p-3 cursor-pointer
                        hover:bg-theme-light-bg-hover dark:hover:bg-theme-dark-bg-hover
                        ${expandedGroups[groupName] ? 'rounded-b-none' : ''}`}
                      onClick={() => toggleGroup(groupName)}
                    >
                      {expandedGroups[groupName] ? (
                        <ChevronDown className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary flex-shrink-0" />
                      )}
                      <span className="ml-2 font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">
                        {groupName}
                      </span>
                    </div>
                    {expandedGroups[groupName] && (
                      <div className="p-4 rounded-b-lg border-t
                        bg-theme-light-bg-base dark:bg-theme-dark-bg-base
                        border-theme-light-border-default dark:border-theme-dark-border-default">
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(colorGroups[groupName]).map(([key, fieldSchema]) => (
                            <FieldRenderer
                              key={key}
                              path={key}
                              schema={fieldSchema}
                              value={formData[key]}
                              onChange={handleFieldChange}
                              required={resolvedSchema.required?.includes(key)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const renderNonColorFields = () => {
    if (!processedSchema?.fields) return null;

    // Filter out color fields that are rendered in groups
    const colorGroups = resolvedSchema?.properties ? getColorGroups(resolvedSchema) : null;
    const colorFields = colorGroups ? 
      Object.values(colorGroups).flatMap(group => Object.keys(group)) : 
      [];

    return Object.entries(processedSchema.fields)
      .filter(([key]) => !colorFields.includes(key))
      .map(([key, fieldSchema]) => (
        <FieldRenderer
          key={key}
          path={key}
          schema={fieldSchema.schema}
          value={formData[key]}
          onChange={handleFieldChange}
          required={resolvedSchema.required?.includes(key)}
        />
      ));
  };

  // First render all non-color fields, then add Base Colors section at the end
  return (
    <div className="w-full h-full overflow-auto space-y-4 pb-8
     bg-theme-light-bg-base dark:bg-theme-dark-bg-base
     text-theme-light-text-primary dark:text-theme-dark-text-primary">
      {renderNonColorFields()}
      <BaseColorsSection />
    </div>
  );
});