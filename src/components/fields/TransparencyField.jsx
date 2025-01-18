import React, { useState } from 'react';
import { getPathDisplayInfo } from '../../utils/pathUtils';
import { FormField } from '../core/FormField';

export const TransparencyField = ({ path, schema, value = 0, onChange, required }) => {
  const { label } = getPathDisplayInfo(path);
  const displayLabel = schema.title || label;
  
  // Local state for the slider/number input sync
  const [localValue, setLocalValue] = useState(value);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(path, newValue);
  };

  // Handle direct number input
  const handleNumberChange = (e) => {
    const newValue = e.target.value ? Math.min(100, Math.max(0, Number(e.target.value))) : '';
    setLocalValue(newValue);
    if (newValue !== '') {
      onChange(path, newValue);
    }
  };

  return (
    <FormField
      label={displayLabel}
      description={schema.description}
      required={required}
    >
      
      <div className="flex items-center space-x-4">
        {/* Slider input */}
        <input
          type="range"
          min="0"
          max="100"
          value={localValue}
          onChange={handleSliderChange}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer relative
            bg-theme-light-bg-input dark:bg-theme-dark-bg-input
            accent-theme-light-accent-primary dark:accent-theme-dark-accent-primary
            hover:accent-theme-light-accent-hover dark:hover:accent-theme-dark-accent-hover
            transition-all duration-200
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-theme-light-accent-primary
            [&::-webkit-slider-thumb]:dark:bg-theme-dark-accent-primary
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-200
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-theme-light-bg-surface
            [&::-webkit-slider-thumb]:dark:border-theme-dark-bg-surface
            
            before:content-[''] before:absolute before:top-0 before:left-0 before:h-full
            before:rounded-l-lg before:bg-theme-light-accent-primary dark:before:bg-theme-dark-accent-primary
            before:transition-all before:duration-200"

            />
        
        {/* Number input for precise control */}
        <input
          type="number"
          value={localValue}
          onChange={handleNumberChange}
          min="0"
          max="100"
          className="w-20 px-3 py-2 rounded-md shadow-sm transition-all duration-200
            bg-theme-light-bg-input dark:bg-theme-dark-bg-input
            text-theme-light-text-primary dark:text-theme-dark-text-primary
            border border-theme-light-border-default dark:border-theme-dark-border-default
            focus:outline-none focus:ring-2
            focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
            focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
            hover:border-theme-light-border-hover dark:hover:border-theme-dark-border-hover"
        />
        <span className="text-sm text-theme-light-text-secondary dark:text-theme-dark-text-secondary w-4 inline-block">%</span>
      </div>

    </FormField>
  );
};