import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import {
  renderWithProviders,
  createMockFile,
  fillFormFields,
  mockSchema,
  mockThemeData
} from './test-utils';

describe('test-utils', () => {
  describe('renderWithProviders', () => {
    it('returns user event instance', async () => {
      const TestComponent = () => <div>Test</div>;
      const { user } = renderWithProviders(<TestComponent />);
      expect(user).toBeDefined();
      await vi.waitFor(() => {
        expect(typeof user.click).toBe('function');
      });
    });

    it('renders component correctly', () => {
      const TestComponent = () => <div>Test Content</div>;
      renderWithProviders(<TestComponent />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('createMockFile', () => {
    it('creates file with default parameters', () => {
      const content = { test: 'data' };
      const file = createMockFile(content);
      expect(file.name).toBe('theme.json');
      expect(file.type).toBe('application/json');
    });

    it('creates file with custom parameters', () => {
      const content = { test: 'data' };
      const file = createMockFile(content, 'custom.json', 'text/plain');
      expect(file.name).toBe('custom.json');
      expect(file.type).toBe('text/plain');
    });
  });

  describe('fillFormFields', () => {
    it('fills all form fields correctly', async () => {
      const mockGetByLabelText = vi.fn();
      const mockUser = {
        clear: vi.fn(),
        type: vi.fn()
      };
      const mockData = {
        field1: 'value1',
        field2: 'value2'
      };

      mockGetByLabelText.mockReturnValue(document.createElement('input'));

      await fillFormFields(mockUser, mockGetByLabelText, mockData);

      expect(mockGetByLabelText).toHaveBeenCalledTimes(2);
      expect(mockUser.clear).toHaveBeenCalledTimes(2);
      expect(mockUser.type).toHaveBeenCalledTimes(2);
    });
  });

  describe('mockSchema', () => {
    it('has required properties', () => {
      expect(mockSchema.type).toBe('object');
      expect(mockSchema.properties).toBeDefined();
      expect(mockSchema.properties.name).toBeDefined();
      expect(mockSchema.properties.visualStyles).toBeDefined();
    });
  });

  describe('mockThemeData', () => {
    it('matches schema structure', () => {
      expect(mockThemeData.name).toBeDefined();
      expect(mockThemeData.visualStyles).toBeDefined();
      expect(mockThemeData.visualStyles.background).toBeDefined();
    });
  });
});