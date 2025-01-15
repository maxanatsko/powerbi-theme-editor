import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchemaResolution } from './useSchemaResolution';
import * as schemaUtils from '../utils/schemaUtils';

vi.mock('../utils/schemaUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    resolveSchema: vi.fn(),
  };
});

describe('useSchemaResolution', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });
  it('returns null when no schema is provided', () => {
    const { result } = renderHook(() => useSchemaResolution(null));
    expect(result.current).toBeNull();
  });

  it('resolves schema successfully', async () => {
    vi.useFakeTimers();
    const mockResolvedSchema = {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    };

    schemaUtils.resolveSchema.mockResolvedValueOnce(mockResolvedSchema);

    const { result } = renderHook(() => 
      useSchemaResolution({
        type: 'object',
        $ref: '#/definitions/test'
      })
    );

    // Initially null
    expect(result.current).toBeNull();

    // Advance timers to trigger effects
    await vi.runAllTimersAsync();
    
    // Now the state should be updated
    expect(result.current).toEqual(mockResolvedSchema);

    // Check if resolveSchema was called
    expect(schemaUtils.resolveSchema).toHaveBeenCalled();
  });

  it('handles schema resolution errors', async () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock resolveSchema to throw
    schemaUtils.resolveSchema.mockRejectedValueOnce(new Error('Resolution failed'));

    const { result } = renderHook(() => 
      useSchemaResolution({
        type: 'object',
        $ref: '#/definitions/test'
      })
    );

    // Should still be null after error
    await vi.waitFor(() => {
      expect(result.current).toBeNull();
    });

    expect(schemaUtils.resolveSchema).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

});