import React, { useState, useCallback, useMemo } from 'react';
import { JsonForms } from '@jsonforms/react';
import {
  materialCells,
  materialRenderers,
  materialVerticalLayoutTester,
  MaterialVerticalLayout
} from '@jsonforms/material-renderers';
import { createAjv } from '@jsonforms/core';
import { Box } from '@mui/material';
import { useFetchSchema } from '../hooks/useFetchSchema';
import { colorPickerTester, ColorPickerRenderer } from './renderers/ColorPickerRenderer';
import { objectControlTester, ObjectRenderer } from './renderers/ObjectRenderer';
import { verticalNavigationTester, VerticalNavigationRenderer } from './layouts/VerticalNavigation';
import { arrayObjectTester, ArrayObjectRenderer } from './renderers/ArrayObjectRenderer';

// Create Ajv instance
const ajv = createAjv({ allErrors: true });

// Define all renderers
const allRenderers = [
  // Custom renderers
  {
    tester: arrayObjectTester,
    renderer: ArrayObjectRenderer
  },
  {
    tester: objectControlTester,
    renderer: ObjectRenderer
  },
  {
    tester: verticalNavigationTester,
    renderer: VerticalNavigationRenderer
  },
  {
    tester: colorPickerTester,
    renderer: ColorPickerRenderer
  },
  // Layout renderer
  {
    tester: materialVerticalLayoutTester,
    renderer: MaterialVerticalLayout
  },
  // Add all material renderers
  ...materialRenderers
].map(renderer => {
  const debugName = renderer.renderer.displayName || renderer.renderer.name;
  console.debug('Registering renderer:', {
    name: debugName,
    tester: renderer.tester.toString(),
    renderer: renderer.renderer.name
  });
  return renderer;
});

const createDefaultUiSchema = (schema) => {
  if (!schema) return {};

  // Create categorization for Visual Styles
  const createVisualStylesCategories = (properties) => {
    return Object.entries(properties || {}).map(([key, visualTypeSchema]) => {
      // Get the properties from the wildcard key if it exists
      const wildcardProps = visualTypeSchema.properties?.['*']?.properties || {};
      
      return {
        type: 'Category',
        label: key,
        elements: [
          {
            type: 'VerticalLayout',
            elements: Object.entries(wildcardProps).map(([propKey, propSchema]) => ({
              type: 'Control',
              label: propSchema.title || propKey,
              scope: `#/properties/visualStyles/properties/${key}/properties/*/properties/${propKey}`
            }))
          }
        ]
      };
    });
  };

  return {
    type: 'Categorization',
    elements: [
      {
        type: 'Category',
        label: 'Basic Settings',
        elements: [
          {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                scope: '#/properties/name'
              },
              {
                type: 'Control',
                scope: '#/properties/foreground'
              },
              {
                type: 'Control',
                scope: '#/properties/background'
              }
            ]
          }
        ]
      },
      {
        type: 'Category',
        label: 'Colors & Text',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/textClasses'
          },
          {
            type: 'Control',
            scope: '#/properties/dataColors'
          }
        ]
      },
      {
        type: 'Category',
        label: 'Visual Styles',
        elements: createVisualStylesCategories(schema.properties?.visualStyles?.properties)
      }
    ]
  };
};

const ThemeEditor = () => {
  const [data, setData] = useState({
    name: 'Power BI Theme',
    version: '1.0',
    visualStyles: {},
    dataColors: [],
    textClasses: {
      title: {
        fontFace: 'Segoe UI',
        fontSize: 14
      }
    }
  });

  const { schema, error, isLoading } = useFetchSchema();

  const handleChange = useCallback(({ data: newData, errors }) => {
    setData(newData);
    if (errors && errors.length > 0) {
      console.debug('Validation errors:', errors);
    }
  }, []);

  const uiSchema = useMemo(() => createDefaultUiSchema(schema), [schema]);

  // Debug logging
  console.debug('Current schema:', schema?.properties?.visualStyles);
  console.debug('Generated UI schema:', uiSchema);

  if (isLoading) return <div>Loading schema...</div>;
  if (error) return <div>Error loading schema: {error}</div>;

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={data}
        renderers={allRenderers}
        cells={materialCells}
        liveValidate={false}
        validationMode="NoValidation"
        onChange={handleChange}
        ajv={ajv}
      />
    </Box>
  );
};

export default ThemeEditor;