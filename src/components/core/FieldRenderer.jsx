import React, { useEffect, useState, useMemo } from 'react';
import { StringField } from '../fields/StringField';
import { NumberField } from '../fields/NumberField';
import { BooleanField } from '../fields/BooleanField';
import { ObjectField } from '../fields/ObjectField';
import { ArrayField } from '../fields/ArrayField';
import { ColorField } from '../fields/ColorField';
import { EnumField } from '../fields/EnumField';
import { IconField } from '../fields/iconField';
import { resolveFieldType, resolveSchemaRef } from '../../utils/schemaUtils';

// Enhanced schema cache with TTL
const schemaCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const FieldRenderer = ({ path, schema, value, onChange, required = false }) => {
  const [resolvedSchema, setResolvedSchema] = useState(schema);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create a stable cache key
  const cacheKey = schema.$ref || JSON.stringify(schema);

  useEffect(() => {
    console.log('Raw schema for:', path, schema);

    const resolveSchema = async () => {
      if (!schema.$ref) {
        setResolvedSchema(schema);
        return;
      }

      // Check cache with TTL
      const cached = schemaCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setResolvedSchema(cached.schema);
        return;
      }

      setIsLoading(true);
      try {
        const resolved = await resolveSchemaRef(schema, schema);
        schemaCache.set(cacheKey, {
          schema: resolved,
          timestamp: Date.now()
        });
        console.log('Resolved schema for:', path, resolved);
        setResolvedSchema(resolved);
        setError(null);
      } catch (err) {
        console.error('Error resolving schema reference:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    resolveSchema();
  }, [schema, cacheKey]);

  // Enhanced field type resolution with union type support
  const fieldType = useMemo(() => {
    if (resolvedSchema?.pattern?.includes('#')) {
      console.log('Found potential color pattern:', resolvedSchema.pattern);
      console.log('Schema type:', resolvedSchema.type);
      console.log('Full schema:', resolvedSchema);
    }
    console.log('Field schema for', path, ':', resolvedSchema);

    console.log('Determining field type for:', path, resolvedSchema);

    if (!resolvedSchema) return null;

    // First handle special cases (including color pattern detection)
    if (resolvedSchema?.type === 'string' && resolvedSchema?.pattern?.includes('#')) {
      console.log('Found color pattern field:', path);
      return 'color';
    }

    if (resolvedSchema.anyOf) {
      const isIconField = resolvedSchema.anyOf.some(type => 
        type.type === 'object' && 
        type.patternProperties && 
        type.patternProperties['.*']?.$ref?.includes('themeIcon')
      );
      if (isIconField) return 'icon';
    }

    // Handle array of types (union types)
    if (Array.isArray(resolvedSchema.type)) {
      // Prioritize type selection based on common patterns
      const typePreference = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
      for (const preferredType of typePreference) {
        if (resolvedSchema.type.includes(preferredType)) {
          return preferredType;
        }
      }
      // Use the first type as fallback
      return resolvedSchema.type[0];
    }

    // Handle special cases first
    // Check for direct color references
    if (resolvedSchema.$ref && resolvedSchema.$ref.endsWith('/color')) {
      console.log('Detected color reference:', resolvedSchema.$ref);
      return 'color';
    }

    if (resolvedSchema.enum) return 'enum';
    if (resolvedSchema.oneOf?.every(item => item.const !== undefined)) return 'enum';
    
    // Enhanced color detection
    if (resolvedSchema.type === 'string' && (
      resolvedSchema.format === 'color' ||
      resolvedSchema.title?.toLowerCase().includes('color') ||
      resolvedSchema.description?.toLowerCase().includes('color') ||
      (resolvedSchema.pattern && /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/.test(resolvedSchema.pattern))
    )) {
      return 'color';
    }

    const detectedType = resolveFieldType(resolvedSchema);
    console.log('Detected field type for', path, ':', detectedType);
    return detectedType;
  }, [resolvedSchema]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
        <p className="font-medium">Error rendering field</p>
        <p className="text-sm">{error}</p>
        {schema.$ref && (
          <p className="text-sm mt-1">
            Failed to resolve reference: {schema.$ref}
          </p>
        )}
      </div>
    );
  }

  if (!resolvedSchema) {
    return null;
  }

  // Common props for all field components
  const fieldProps = {
    path,
    schema: resolvedSchema,
    value,
    onChange,
    required
  };

  // Render appropriate field component with error boundary
  try {
    switch (fieldType) {
      case 'string':
        return <StringField {...fieldProps} />;
      case 'number':
      case 'integer':
        return <NumberField {...fieldProps} />;
      case 'boolean':
        return <BooleanField {...fieldProps} />;
      case 'object':
        return <ObjectField {...fieldProps} />;
      case 'array':
        return <ArrayField {...fieldProps} />;
      case 'color':
        return <ColorField {...fieldProps} />;
      case 'enum':
        return <EnumField {...fieldProps} />;
        case 'icon':
  return <IconField {...fieldProps} />;
      default:
        console.warn(`Unknown field type: ${fieldType}`, resolvedSchema);
        // Fallback to string field for unknown types
        return (
          <div className="space-y-2">
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              Using fallback string field for type: {fieldType}
            </div>
            <StringField {...fieldProps} />
          </div>
        );
    }
  } catch (err) {
    console.error('Error rendering field:', err);
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
        <p className="font-medium">Error rendering field</p>
        <p className="text-sm">{err.message}</p>
      </div>
    );
  }
};