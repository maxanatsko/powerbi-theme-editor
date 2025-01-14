import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

// Define custom renderers with proper priority order
const customRenderers = [
  // Object renderer should be first to catch object types before other renderers
  {
    tester: objectControlTester,
    renderer: ObjectRenderer
  },
  {
    tester: arrayObjectTester,
    renderer: ArrayObjectRenderer
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
  }
];

// Combine custom renderers with material renderers
const allRenderers = [
  ...customRenderers,
  ...materialRenderers.filter(r => 
    // Filter out any material renderers that might conflict with our custom ones
    !customRenderers.some(cr => 
      cr.renderer.displayName === r.renderer.displayName
    )
  )
].map(renderer => {
  console.debug('Registering renderer:', {
    name: renderer.renderer.displayName || renderer.renderer.name,
    tester: renderer.tester.toString(),
    priority: renderer.tester.priority
  });
  return renderer;
});

const createDefaultUiSchema = (schema) => {
  if (!schema) return {};

  // Create categorization for Visual Styles
  const createVisualStylesCategories = (properties) => {
    if (!properties) {
      console.debug('No visual styles properties found');
      return [];
    }

    console.debug('Creating Visual Styles Categories:', {
      properties,
      keys: Object.keys(properties)
    });

    const categories = Object.entries(properties).map(([visualType, visualTypeSchema]) => {
      console.debug(`Creating category for ${visualType}:`, {
        schema: visualTypeSchema,
        type: visualType
      });

      // For each visual type, create a category with nested controls
      return {
        type: 'Category',
        label: visualType,
        elements: [
          {
            type: 'Control',
            scope: `#/properties/visualStyles/properties/${visualType}`,
            options: {
              detail: 'OBJECT'
            }
          }
        ]
      };
    });

    console.debug('Created visual styles categories:', categories);
    return categories;
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
  const uiSchema = useMemo(() => createDefaultUiSchema(schema), [schema]);

  useEffect(() => {
    // Debug when schema changes
    if (schema && uiSchema) {
      // Debug renderers
      console.debug('Renderer Test:', {
        renderers: allRenderers.map(r => ({
          name: r.renderer.name,
          testerFn: r.tester.toString(),
        })),
        testResult: allRenderers.map(r => ({
          name: r.renderer.name,
          result: r.tester(uiSchema, schema)
        }))
      });

      // Debug schema structure
      console.debug('Schema Debug:', {
        fullSchema: schema,
        visualStyles: schema?.properties?.visualStyles,
        firstVisualType: Object.keys(schema?.properties?.visualStyles?.properties || {})[0],
        samplePath: '#/properties/visualStyles/properties/report'
      });

      // Debug UI Schema
      console.debug('UI Schema Debug:', {
        fullUiSchema: uiSchema,
        visualStylesCategory: uiSchema.elements.find(e => e.label === 'Visual Styles'),
        sampleControl: uiSchema.elements.find(e => e.label === 'Visual Styles')?.elements[0]
      });
    }
  }, [schema, uiSchema]);

  const handleChange = useCallback(({ data: newData, errors }) => {
    setData(newData);
    if (errors && errors.length > 0) {
      console.debug('Validation errors:', errors);
    }
  }, []);

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