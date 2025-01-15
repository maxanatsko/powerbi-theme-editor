import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock schema for testing
export const mockSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Theme name'
    },
    visualStyles: {
      type: 'object',
      properties: {
        background: {
          type: 'string',
          format: 'color'
        }
      }
    }
  }
};

// Custom render function
export function renderWithProviders(ui, options = {}) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => children,
      ...options,
    }),
  };
}

// Helper to simulate file upload
export const createMockFile = (content, name = 'theme.json', type = 'application/json') => {
  const blob = new Blob([JSON.stringify(content)], { type });
  return new File([blob], name, { type });
};

// Common test data
export const mockThemeData = {
  name: 'Test Theme',
  visualStyles: {
    background: '#FFFFFF'
  }
};

// Helper for form interactions
export const fillFormFields = async (user, getByLabelText, data) => {
  for (const [key, value] of Object.entries(data)) {
    const input = getByLabelText(key, { exact: false });
    await user.clear(input);
    await user.type(input, value);
  }
};