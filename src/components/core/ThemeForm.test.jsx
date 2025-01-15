import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeForm } from './ThemeForm';
import { renderWithProviders, mockSchema, mockThemeData } from '../../test/test-utils';

// Mock hooks
vi.mock('../../hooks/useSchemaResolution', () => ({
  useSchemaResolution: vi.fn(schema => schema)
}));

vi.mock('../../hooks/useFormState', () => ({
  useFormState: vi.fn((initialData) => ({
    formData: initialData,
    updateField: vi.fn(),
    resetForm: vi.fn()
  }))
}));

vi.mock('../../utils/schemaUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    traverseSchema: vi.fn(schema => ({
      type: 'object',
      fields: {
        name: {
          schema: {
            type: 'string',
            title: 'Theme name'
          }
        },
        visualStyles: {
          schema: {
            type: 'object',
            title: 'Visual Styles'
          }
        }
      }
    })),
    resolveFieldType: vi.fn(schema => schema?.type || 'string')
  };
});

describe('ThemeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any lingering DOM elements
    document.body.innerHTML = '';
  });

  it('renders with initial data', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ThemeForm 
        schema={mockSchema}
        initialData={mockThemeData}
        onChange={onChange}
      />
    );

    // Check if form fields are rendered
    expect(screen.getByText('Theme name')).toBeInTheDocument();
    expect(screen.getByText('Visual Styles')).toBeInTheDocument();
  });

  it('handles field changes', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <ThemeForm 
        schema={mockSchema}
        initialData={mockThemeData}
        onChange={onChange}
      />
    );

    // Find and change a field
    const nameInput = screen.getByLabelText('Theme name', { exact: false });
    await user.clear(nameInput);
    await user.type(nameInput, 'New Theme Name');

    // Wait for all updates to complete
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('expands sections when expandPath is called', () => {
    const ref = React.createRef();
    renderWithProviders(
      <ThemeForm 
        ref={ref}
        schema={mockSchema}
        initialData={mockThemeData}
      />
    );

    // Create a test section in the DOM
    const section = document.createElement('div');
    section.id = 'section-visualStyles';
    document.body.appendChild(section);

    // Call expandPath through ref
    ref.current.expandPath(['visualStyles', 'background']);

    // Check if section is expanded
    expect(section).toHaveAttribute('data-expanded', 'true');
  });

  it('resets form with new schema URL', async () => {
    const onChange = vi.fn();
    const { useFormState } = require('../../hooks/useFormState');
    const resetForm = vi.fn();
    useFormState.mockReturnValue({
      formData: {},
      updateField: vi.fn(),
      resetForm
    });

    const schemaWithUrl = {
      ...mockSchema,
      $schema: 'http://example.com/schema.json'
    };

    renderWithProviders(
      <ThemeForm 
        schema={schemaWithUrl}
        initialData={{}}
        onChange={onChange}
      />
    );

    await vi.waitFor(() => {
      expect(resetForm).toHaveBeenCalledWith(
        expect.objectContaining({
          $schema: 'http://example.com/schema.json'
        })
      );
    });
  });

  it('returns current theme data through ref', () => {
    const ref = React.createRef();
    const testData = { name: 'Test Theme' };
    
    const { useFormState } = require('../../hooks/useFormState');
    useFormState.mockReturnValue({
      formData: testData,
      updateField: vi.fn(),
      resetForm: vi.fn()
    });

    renderWithProviders(
      <ThemeForm 
        ref={ref}
        schema={mockSchema}
        initialData={testData}
      />
    );

    expect(ref.current.getThemeData()).toEqual(testData);
  });

  it('handles null schema gracefully', () => {
    const { container } = renderWithProviders(
      <ThemeForm 
        schema={null}
        initialData={{}}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});