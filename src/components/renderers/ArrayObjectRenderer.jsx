import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isObjectControl, or } from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import { 
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ArrayObjectControlRenderer = ({ 
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
  visible,
  label
}) => {
  if (!visible) {
    return null;
  }

  const isArrayWithObjectItems = schema.type === 'array' && 
                               schema.items && 
                               schema.items.type === 'object';

  const getProperties = () => {
    const properties = isArrayWithObjectItems ? schema.items.properties : schema.properties;
    if (!properties) {
      console.debug('No properties found in schema:', schema);
      return [];
    }
    return Object.keys(properties).map(key => ({
      key,
      ...properties[key]
    }));
  };

  const detailUiSchema = {
    type: 'VerticalLayout',
    elements: getProperties().map(({ key }) => ({
      type: 'Control',
      scope: `#/properties/${key}`
    }))
  };

  console.debug('ArrayObjectRenderer:', {
    schema,
    path,
    label,
    isArrayWithObjectItems,
    detailUiSchema
  });

  return (
    <Box sx={{ my: 1 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{label || schema.title || path.split('/').pop()}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={0}>
            <JsonFormsDispatch
              schema={isArrayWithObjectItems ? schema.items : schema}
              uischema={detailUiSchema}
              path={path}
              renderers={renderers}
              cells={cells}
              enabled={enabled}
            />
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export const arrayObjectTester = rankWith(
  3,
  (uischema, schema) => {
    // Check if it's a Control type and has a scope
    const isControl = uischema.type === 'Control' && !!uischema.scope;
    if (!isControl) return false;

    // Check if it's an array with object items
    const isArrayWithObjects = schema.type === 'array' && 
                              schema.items?.type === 'object' && 
                              schema.items?.properties;

    console.debug('ArrayObjectRenderer testing:', {
      schema,
      uischema,
      isControl,
      isArrayWithObjects,
      result: isControl && isArrayWithObjects
    });

    return isControl && isArrayWithObjects;
  }
);

export const ArrayObjectRenderer = withJsonFormsControlProps(ArrayObjectControlRenderer);