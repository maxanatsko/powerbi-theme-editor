import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  ColorInput,
  ArrayInput,
  EnumInput,
  TextInput,
  NumberInput,
  BooleanInput,
  SchemaInput
} from './FormFields';

const SchemaField = ({
  path,
  schema,
  value,
  onChange,
  isExpanded,
  onToggle,
  renderField,
  nestingLevel = 0,
  getValue,  // Add this
  formData   // Add this
}) => {
  // Handle allOf by merging schemas
  const resolvedSchema = React.useMemo(() => {
    if (schema.allOf) {
      return schema.allOf.reduce((acc, current) => ({
        ...acc,
        ...current,
        properties: {
          ...(acc.properties || {}),
          ...(current.properties || {})
        }
      }), { ...schema });
    }
    return schema;
  }, [schema]);

  // Check if this schema has children (including handling wildcards)
  const hasChildren = (
    resolvedSchema.type === 'object' && 
    (resolvedSchema.properties || 
     (resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object') ||
     Object.keys(resolvedSchema).some(key => key === '*'))
  );

  const renderInput = () => {
    // Special handling for $schema field
    if (path === '$schema' || path.endsWith('.$schema')) {
      return <SchemaInput path={path} value={value} onChange={onChange} />;
    }

    // Handle arrays
    if (resolvedSchema.type === 'array' && resolvedSchema.items) {
      return (
        <ArrayInput
          path={path}
          value={value}
          onChange={onChange}
          itemSchema={resolvedSchema.items}
          getValue={getValue || (() => {})}
          formData={formData || {}}
          renderField={renderField}  // Add this line
        />
      );
    }
      

    // Handle enums
    if (resolvedSchema.enum) {
      return <EnumInput path={path} value={value} onChange={onChange} options={resolvedSchema.enum} />;
    }

    // Detect color fields
    const isColorField = 
      resolvedSchema.type === 'string' && (
        path.toLowerCase().includes('color') ||
        resolvedSchema.format === 'color' ||
        (resolvedSchema.pattern && /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(resolvedSchema.pattern)) ||
        (resolvedSchema.examples && resolvedSchema.examples.some(ex => /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(ex)))
      );

    if (isColorField) {
      return <ColorInput path={path} value={value} onChange={onChange} />;
    }

    // Handle other primitive types
    switch (resolvedSchema.type) {
      case 'number':
      case 'integer':
        return <NumberInput path={path} value={value} onChange={onChange} />;
      case 'boolean':
        return <BooleanInput path={path} value={value} onChange={onChange} />;
      case 'string':
        return <TextInput path={path} value={value} onChange={onChange} />;
      default:
        return null;
    }
  };

  const renderChildren = () => {
    const properties = resolvedSchema.properties || {};
    const wildcardProperties = Object.keys(resolvedSchema).filter(key => key === '*').reduce((acc, key) => ({
      ...acc,
      [key]: resolvedSchema[key]
    }), {});

    return (
      <div className="ml-4 mt-2">
        {Object.entries({ ...properties, ...wildcardProperties }).map(([childKey, childSchema]) => {
          const childPath = path ? `${path}.${childKey}` : childKey;
          return renderField(childPath, childSchema, nestingLevel + 1);
        })}
      </div>
    );
  };

  const fieldName = path.split('.').pop();
  const input = renderInput();
  
  // Skip empty objects without properties or children
  if (resolvedSchema.type === 'object' && !hasChildren) {
    return null;
  }

  return (
    <div className={`mt-2 ${nestingLevel > 0 ? `ml-${Math.min(nestingLevel * 2, 8)}` : ''}`}>
      <div className="flex items-start">
        {hasChildren && (
          <button
            onClick={() => onToggle(path)}
            className="mt-1 p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-6" />}
        <div className="flex-1">
          <div className="flex items-center">
            <span className={`font-medium ${nestingLevel > 0 ? 'text-sm' : ''} text-gray-700`}>
              {resolvedSchema.title || fieldName}
            </span>
            {resolvedSchema.type && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                {resolvedSchema.type}
              </span>
            )}
            {resolvedSchema.required && (
              <span className="ml-2 text-red-500 text-xs">*required</span>
            )}
          </div>
          {resolvedSchema.description && (
            <div className="text-sm text-gray-500 mt-1">
              {resolvedSchema.description}
            </div>
          )}
          {input}
          {isExpanded && hasChildren && renderChildren()}
        </div>
      </div>
    </div>
  );
};

export default SchemaField;