import React from 'react';
import { Card, Collapse } from 'antd';

const { Panel } = Collapse;

const ObjectFieldTemplate = ({
  title,
  description,
  properties,
  required,
  uiSchema,
  idSchema,
  registry
}) => {
  // Only render children when panel is expanded
  const handlePanelChange = (key) => {
    console.log('Panel expanded:', key);
  };

  // If it's a root object, render without collapse
  if (idSchema.$id === 'root') {
    return (
      <div className="object-field-root">
        {properties.map(prop => (
          <div key={prop.name} className="object-field-property">
            {prop.content}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="object-field">
      <Collapse onChange={handlePanelChange}>
        <Panel 
          header={title} 
          key={idSchema.$id}
        >
          {description && (
            <div className="object-field-description">{description}</div>
          )}
          {properties.map(prop => (
            <div key={prop.name} className="object-field-property">
              {prop.content}
            </div>
          ))}
        </Panel>
      </Collapse>
    </div>
  );
};

export default ObjectFieldTemplate;