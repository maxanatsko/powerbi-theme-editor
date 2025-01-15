import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import SearchBar from './searchBar.jsx';
import { renderWithProviders } from '../test/test-utils';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });
  it('renders search input', () => {
    renderWithProviders(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls onSearch with input value', async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { user } = renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/search theme properties/i);
    await user.type(input, 'background');

    // Fast-forward through the debounce period
    await vi.runAllTimersAsync();

    // Should call onSearch after debounce
    expect(onSearch).toHaveBeenCalledWith('background');
  });

  it('debounces search input', async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { user } = renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/search theme properties/i);
    await user.type(input, 'test');
    await user.type(input, 'testing');

    // Fast-forward through the debounce period
    await vi.runAllTimersAsync();

    // Should only call onSearch once after debounce
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('testing');
  });

  it('handles Enter key press', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithProviders(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/search theme properties/i);
    await user.type(input, 'test');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('test');
  });
});