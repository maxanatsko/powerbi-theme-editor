import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';
import { resolveSchemaRef, createDefaultValue } from '../../utils/schemaUtils';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { getPathDisplayInfo } from '../../utils/pathUtils';

// Enhanced schema cache with TTL
const itemSchemaCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const ArrayField = ({ path, schema, value = [], onChange, required }) => {
  const normalizedValue = Array.isArray(value) ? value : [];
  const [resolvedItemSchema, setResolvedItemSchema] = useState(null);
  const [error, setError] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const resolveAttempts = useRef(0);

  // Create a stable cache key
  const cacheKey = schema.items?.$ref || JSON.stringify(schema.items);

  useEffect(() => {
    const resolveSchema = async () => {
      if (!schema.items) return;

      // Check cache with TTL
      const cached = itemSchemaCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setResolvedItemSchema(cached.schema);
        return;
      }

      if (resolveAttempts.current >= 3) {
        console.warn(`Max resolution attempts reached for ${path}`);
        // Use a simplified fallback schema for the items
        const fallbackSchema = {
          type: 'object',
          properties: {}
        };
        setResolvedItemSchema(fallbackSchema);
        return;
      }

      setIsResolving(true);
      try {
        let resolved;
        if (schema.items.$ref) {
          resolved = await resolveSchemaRef(schema.items, schema);
          if (!resolved) {
            throw new Error(`Failed to resolve schema reference: ${schema.items.$ref}`);
          }
        } else {
          resolved = schema.items;
        }

        // For dataColors array, provide a specific structure
        if (path === 'dataColors' || path.endsWith('.dataColors')) {
          resolved = {
            type: 'object',
            properties: {
              name: { type: 'string' },
              color: { type: 'string', format: 'color' }
            }
          };
        }

        itemSchemaCache.set(cacheKey, {
          schema: resolved,
          timestamp: Date.now()
        });
        
        setResolvedItemSchema(resolved);
        setError(null);
        resolveAttempts.current = 0;
      } catch (err) {
        console.error('Error resolving schema reference:', err);
        resolveAttempts.current++;
        
        if (resolveAttempts.current < 3) {
          // Retry after a delay
          setTimeout(() => resolveSchema(), 1000 * resolveAttempts.current);
        } else {
          // Use fallback schema after max attempts
          const fallbackSchema = {
            type: 'object',
            properties: {
              value: { type: 'string' }
            }
          };
          setResolvedItemSchema(fallbackSchema);
        }
      } finally {
        setIsResolving(false);
      }
    };

    resolveSchema();
  }, [schema, cacheKey, path]);

  const handleAdd = () => {
    try {
      const schemaToUse = resolvedItemSchema || schema.items;
      if (!schemaToUse) {
        throw new Error('No schema available for new item');
      }

      const defaultValue = createDefaultValue(schemaToUse);
      const newValue = [...normalizedValue, defaultValue];
      onChange(path, newValue);
      setError(null);
    } catch (err) {
      console.error('Error adding new item:', err);
      setError(err.message);
    }
  };

  const handleRemove = (index) => {
    const newValue = normalizedValue.filter((_, i) => i !== index);
    onChange(path, newValue);
  };

  const handleItemChange = (index, newValue) => {
    const updatedValue = [...normalizedValue];
    updatedValue[index] = newValue;
    onChange(path, updatedValue);
  };

  // Use the schema that's available (resolved or original)
  const schemaToUse = resolvedItemSchema || schema.items;

  return (
    <div className="my-4 border rounded-lg
      bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
      border-theme-light-border-default dark:border-theme-dark-border-default">
      <div className="p-3 flex justify-between items-start gap-4">
  <div className="flex-1">
    <span className="font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">
      {schema.title || getPathDisplayInfo(path).label}
    </span>
    {schema.description && (
      <p className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary mt-1 max-w-1xl">
        {schema.description}
      </p>
    )}
  </div>
  <button
  type="button"
  onClick={handleAdd}
  className="px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors duration-200
    bg-theme-light-accent-primary dark:bg-theme-dark-accent-primary
    text-white
    hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:ring-2 focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
    focus:outline-none"
  disabled={isResolving || !schemaToUse}
>
  <PlusCircle className="w-4 h-4" />
  Add Item
</button>
</div>
      <div className="bg-theme-light-bg-base dark:bg-theme-dark-bg-base border-t border-theme-light-border-default dark:border-theme-dark-border-default rounded-b-lg">
        {normalizedValue.map((item, index) => (
          <ErrorBoundary key={`${path}[${index}]`}>
            <div className="p-4 border-b last:border-b-0 border-theme-light-border-default dark:border-theme-dark-border-default">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary">
                  {schemaToUse?.title || `Item ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-theme-light-state-error hover:text-theme-light-state-error/90
                    dark:text-[#FF6B6B] dark:hover:text-[#FF6B6B]/90
                    transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <FieldRenderer
                path={`${path}[${index}]`}
                schema={schemaToUse}
                value={item}
                onChange={(_, value) => handleItemChange(index, value)}
                required={schemaToUse?.required || []}
              />
            </div>
          </ErrorBoundary>
        ))}
        {normalizedValue.length === 0 && (
          <div className="p-4 text-center text-theme-light-text-muted dark:text-theme-dark-text-muted text-sm">
            No items added
          </div>
        )}
      </div>
      {error && (
        <div className="p-2 text-sm border-t
          border-theme-light-state-error dark:border-theme-dark-state-error
          bg-theme-light-state-error-bg dark:bg-theme-dark-state-error-bg
          text-theme-light-state-error dark:text-theme-dark-state-error">
          {error}
        </div>
      )}
    </div>
  );
};