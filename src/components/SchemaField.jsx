import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  ColorInput,
  ArrayInput,
  EnumInput,
  TextInput,
  NumberInput,
  BooleanInput,
  OneOfInput,
  AnyOfInput
} from './FormFields';

const resolveReference = (schema, definitions) => {
  if (schema.$ref) {
    // Extract the definition name from the reference (e.g., "#/definitions/fill" -> "fill")
    const refPath = schema.$ref.split('/');
    const defName = refPath[refPath.length - 1];
    
    if (definitions && definitions[defName]) {
      // Merge the referenced definition with any additional properties
      return {
        ...definitions[defName],
        ...Object.fromEntries(
          Object.entries(schema).filter(([key]) => key !== '$ref')
        ),
      };
    }
  }
  return schema;
};

const SchemaField = ({
  path,
  schema,
  value,
  onChange,
  isExpanded,
  onToggle,
  nestingLevel = 0,
  getValue,
  formData,
  definitions
}) => {
  const hasChildren = 
    (schema.type === 'object' && schema.properties) ||
    schema.allOf || 
    schema.anyOf ||
    (schema.type === 'array' && schema.items);
    
  const fieldName = path.split('.').pop();

  const resolveSchema = (schema) => {
    // First resolve any references
    const resolvedRef = resolveReference(schema, definitions);
    
    if (!resolvedRef.allOf) return resolvedRef;
    
    return resolvedRef.allOf.reduce((merged, subSchema) => {
      const resolved = resolveSchema(subSchema); // Handle nested allOf
      return {
        ...merged,
        ...resolved,
        properties: {
          ...(merged.properties || {}),
          ...Object.entries(resolved.properties || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: key === '*' ? resolveSchema(value) : resolveReference(value, definitions)
          }), {})
        }
      };
    }, {});
  };

  const resolvedSchema = resolveSchema(schema);

  const getOneOfOptions = (oneOfArray) => {
    return oneOfArray.map(option => ({
      value: option.const,
      label: option.title || option.const
    }));
  };

  const shouldRenderField = (fieldSchema) => {
    if (!fieldSchema || Object.keys(fieldSchema).length === 0) {
      return false;
    }
    
    if (fieldSchema.type === 'object' && !fieldSchema.properties && !fieldSchema.allOf) {
      return false;
    }

    // Special case: Handle wildcard fields
    if (fieldName === '*' && !schema.properties && !schema.allOf) {
      return false;
    }

    return true;
  };

  const renderInput = () => {
    // Resolve references first
    const resolvedSchema = resolveReference(schema, definitions);
    
    // Handle allOf
    if (resolvedSchema.allOf) {
      const mergedSchema = resolveSchema(resolvedSchema);
      return renderInput(mergedSchema);
    }

    // Handle oneOf
    if (schema.oneOf) {
      return (
        <OneOfInput
          path={path}
          value={value}
          onChange={onChange}
          options={getOneOfOptions(schema.oneOf)}
        />
      );
    }

    // Handle anyOf
    if (schema.anyOf) {
      return (
        <AnyOfInput
          path={path}
          value={value}
          onChange={onChange}
          options={schema.anyOf}
        />
      );
    }

    // Handle array type
    if (schema.type === 'array') {
      if (!schema.items) {
        console.warn(`Array field ${path} has no items schema`);
        return null;
      }
      return (
        <ArrayInput
          path={path}
          value={value}
          onChange={onChange}
          itemSchema={schema.items}
          getValue={getValue}
          formData={formData}
        />
      );
    }

    // Handle enum type
    if (schema.enum) {
      return (
        <EnumInput
          path={path}
          value={value}
          onChange={onChange}
          options={schema.enum}
        />
      );
    }

    // Handle color fields
    const isColorField = 
      schema.type === 'string' && (
        path.toLowerCase().includes('color') ||
        schema.format === 'color' ||
        (schema.pattern && /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(schema.pattern)) ||
        (schema.examples && schema.examples.some(ex => /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(ex)))
      );

    if (isColorField) {
      return (
        <ColorInput
          path={path}
          value={value}
          onChange={onChange}
        />
      );
    }

    // Handle basic types
    switch (schema.type) {
      case 'number':
      case 'integer':
        return (
          <NumberInput
            path={path}
            value={value}
            onChange={onChange}
            minimum={schema.minimum}
            maximum={schema.maximum}
          />
        );
      case 'boolean':
        return (
          <BooleanInput
            path={path}
            value={value}
            onChange={onChange}
          />
        );
      case 'string':
        return (
          <TextInput
            path={path}
            value={value}
            onChange={onChange}
            pattern={schema.pattern}
            minLength={schema.minLength}
            maxLength={schema.maxLength}
          />
        );
      default:
        if (hasChildren) {
          return null;
        }
        console.warn(`Unsupported schema type: ${schema.type} for field ${path}`);
        return null;
    }
  };

  if (!shouldRenderField(schema)) {
    return null;
  }

  const renderField = () => {
    if (!hasChildren) {
      return <div className="mt-1">{renderInput()}</div>;
    }
  
    if (isExpanded) {
      // Handle normal object properties
      if (resolvedSchema.properties) {
        return (
          <div className="mt-2">
            {Object.entries(resolvedSchema.properties)
              .filter(([key, childSchema]) => {
                // Special handling for wildcards
                if (key === '*') {
                  return childSchema.properties || childSchema.allOf;
                }
                return shouldRenderField(childSchema);
              })
              .map(([childKey, childSchema]) => {
                const childPath = `${path}.${childKey}`;
                return (
                  <SchemaField
                    key={childPath}
                    path={childPath}
                    schema={childSchema}
                    value={getValue(formData, childPath)}
                    onChange={onChange}
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                    nestingLevel={nestingLevel + 1}
                    getValue={getValue}
                    formData={formData}
                  />
                );
              })}
          </div>
        );
      }
      
      // Handle array items
      if (schema.type === 'array' && schema.items) {
        return (
          <div className="mt-2">
            <SchemaField
              path={`${path}.items`}
              schema={schema.items}
              value={value}
              onChange={onChange}
              isExpanded={isExpanded}
              onToggle={onToggle}
              nestingLevel={nestingLevel + 1}
              getValue={getValue}
              formData={formData}
            />
          </div>
        );
      }
    }

    return null;
  };

  const renderPropertyType = () => {
    if (schema.oneOf) {
      return 'oneOf';
    }
    if (schema.anyOf) {
      return 'anyOf';
    }
    if (schema.allOf) {
      return 'allOf';
    }
    return schema.type;
  };

  return (
    <div className={`mt-2 ${nestingLevel > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-start">
        {hasChildren && (
          <button
            onClick={() => onToggle(path)}
            className="mt-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded group"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
            )}
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label 
              className={`font-medium ${nestingLevel > 0 ? 'text-sm' : ''} text-gray-700 dark:text-gray-200`}
              htmlFor={path.replace(/\./g, '-')}
            >
              {schema.title || fieldName}
            </label>
            {renderPropertyType() && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                {renderPropertyType()}
              </span>
            )}
            {schema.required && (
              <span className="text-red-500 dark:text-red-400 text-xs">*</span>
            )}
          </div>
          
          {schema.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {schema.description}
            </p>
          )}
          
          {renderField()}
        </div>
      </div>
    </div>
  );
};

export default SchemaField;