import React, { useState, useEffect } from 'react';

import { getPathDisplayInfo } from '../../utils/pathUtils';

export const ColorField = ({ path, schema, value = '#000000', onChange, required }) => {
  const { label } = getPathDisplayInfo(path);
  const displayLabel = schema.title || label;

  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState(value);

  // Update input value when the prop changes (e.g., from color picker)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateColor = (newValue) => {
    if (!newValue.startsWith('#')) {
      return 'Color must start with #';
    }
    if (!/^#[0-9A-Fa-f]*$/.test(newValue)) {
      return 'Color must only contain hex characters (0-9, A-F)';
    }
    if (newValue.length > 9) {
      return 'Color must be in #RRGGBB or #RRGGBBAA format';
    }
    return null;
  };

  const handleColorPickerChange = (newValue) => {
    // Color picker always provides valid colors
    setError(null);
    setInputValue(newValue);
    onChange(path, newValue);
  };

  const handleTextInputChange = (newValue) => {
    // Always update local input state to allow typing
    setInputValue(newValue);

    // Validate and show appropriate messages
    const validationError = validateColor(newValue);
    setError(validationError);

    // Only propagate value up when we have a complete valid color
    if (newValue.startsWith('#') && (newValue.length === 7 || newValue.length === 9) && !validationError) {
      onChange(path, newValue);
    } else if (newValue === '') {
      // Reset to default when clearing input
      onChange(path, '#000000');
    }
  };

  return (
    <div className="my-2">
      <label className="block text-sm font-medium mb-1 text-theme-light-text-primary dark:text-theme-dark-text-primary">
        {displayLabel}
        {required && <span className="text-theme-light-state-error dark:text-theme-dark-state-error ml-0.5">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value.slice(0, 7)} // Only use RGB part for color input
          onChange={(e) => handleColorPickerChange(e.target.value)}
          className="w-10 h-10 rounded overflow-hidden
            border border-theme-light-border-default dark:border-theme-dark-border-default
            focus:outline-none focus:ring-2
            focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
            hover:border-theme-light-border-hover dark:hover:border-theme-dark-border-hover
            transition-colors duration-200"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleTextInputChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md shadow-sm transition-colors duration-200
            bg-theme-light-bg-input dark:bg-theme-dark-bg-input
            text-theme-light-text-primary dark:text-theme-dark-text-primary
            border border-theme-light-border-default dark:border-theme-dark-border-default
            placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder
            focus:outline-none focus:ring-2
            focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
            focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
            hover:border-theme-light-border-hover dark:hover:border-theme-dark-border-hover"
          placeholder="#RRGGBB or #RRGGBBAA"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-theme-light-state-error dark:text-theme-dark-state-error">{error}</p>
      )}
      {schema.description && (
        <p className="mt-1 text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary">{schema.description}</p>
      )}
    </div>
  );
};