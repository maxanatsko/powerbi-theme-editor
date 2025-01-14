import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab,
  Paper
} from '@mui/material';
import { 
  JsonFormsDispatch,
  withJsonFormsLayoutProps
} from '@jsonforms/react';
import {
  rankWith,
  uiTypeIs
} from '@jsonforms/core';

const VerticalNavigation = ({ 
  data, 
  schema, 
  uischema, 
  path, 
  renderers, 
  cells,
  enabled,
  visible 
}) => {
  console.log('VerticalNavigation rendered with:', {
    schema,
    uischema,
    renderers: renderers.map(r => ({
      tester: r.tester.toString(),
      renderer: r.renderer.name
    }))
  });

  const [selectedTab, setSelectedTab] = React.useState(0);

  if (!visible) {
    return null;
  }

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const { elements } = uischema;

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 48px)',
      bgcolor: 'background.paper' 
    }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={selectedTab}
        onChange={handleChange}
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          minWidth: 200,
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            textAlign: 'left',
            justifyContent: 'flex-start',
            textTransform: 'none',
            minHeight: 48
          }
        }}
      >
        {elements.map((element, idx) => (
          <Tab 
            key={idx} 
            label={element.label}
            id={`vertical-tab-${idx}`}
            aria-controls={`vertical-tabpanel-${idx}`}
          />
        ))}
      </Tabs>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {elements.map((element, idx) => (
          <div
            key={idx}
            role="tabpanel"
            hidden={selectedTab !== idx}
            id={`vertical-tabpanel-${idx}`}
            aria-labelledby={`vertical-tab-${idx}`}
            style={{ width: '100%' }}
          >
            {selectedTab === idx && (
              <Paper elevation={0} sx={{ p: 3 }}>
                {element.elements.map((child, childIdx) => (
                  <JsonFormsDispatch
                    key={childIdx}
                    schema={schema}
                    uischema={child}
                    path={path}
                    renderers={renderers}
                    cells={cells}
                  />
                ))}
              </Paper>
            )}
          </div>
        ))}
      </Box>
    </Box>
  );
};

export const verticalNavigationTester = rankWith(
  2,
  uiTypeIs('Categorization')
);

const WrappedVerticalNavigation = withJsonFormsLayoutProps(VerticalNavigation);

export { WrappedVerticalNavigation as VerticalNavigationRenderer };