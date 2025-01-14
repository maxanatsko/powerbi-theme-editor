import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isStringControl, and, formatIs } from '@jsonforms/core';
import { TextField } from '@mui/material';

const ColorPickerControl = ({ 
  data,
  handleChange,
  path,
  label,
  required,
  errors,
  schema
}) => {
  const isValid = errors.length === 0;

  return (
    <TextField
      type="color"
      value={data || '#000000'}
      onChange={(event) => handleChange(path, event.target.value)}
      label={label || schema.title}
      required={required}
      error={!isValid}
      helperText={!isValid ? errors : undefined}
      fullWidth
      margin="normal"
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
};

// Create a tester for this renderer with high priority
export const colorPickerTester = rankWith(
  3, // priority
  and(
    isStringControl,
    (uischema, schema) => schema.format === 'color' || schema.title?.toLowerCase().includes('color')
  )
);

// Export the renderer
export const ColorPickerRenderer = withJsonFormsControlProps(ColorPickerControl);