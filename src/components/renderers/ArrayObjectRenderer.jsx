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

  console.log('Array Object Renderer:', { schema, path, label });

  const isArrayWithObjectItems = schema.type === 'array' && 
                               schema.items && 
                               schema.items.type === 'object';

  const layoutElements = isArrayWithObjectItems ? 
    (schema.items.properties ? Object.keys(schema.items.properties).map(property => ({
      type: 'Control',
      scope: `#/properties/${property}`
    })) : []) : 
    (schema.properties ? Object.keys(schema.properties).map(property => ({
      type: 'Control',
      scope: `#/properties/${property}`
    })) : []);

  const detailUiSchema = {
    type: 'VerticalLayout',
    elements: layoutElements
  };

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
  3, // Higher priority than the default object renderer
  or(
    isObjectControl,
    (uischema, schema) => schema.type === 'array' && schema.items?.type === 'object'
  )
);

export const ArrayObjectRenderer = withJsonFormsControlProps(ArrayObjectControlRenderer);