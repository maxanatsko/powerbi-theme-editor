import React from 'react';
import useSchemaStore from '../store/schemaStore';
import FormField from './FormField';

const DefinitionForm = ({ definitionPath, value, onChange }) => {
  const { getDefinition, resolveReference } = useSchemaStore();
  
  // Get the definition
  const definition = getDefinition(definitionPath);
  if (!definition) {
    console.warn(`No definition found for path: ${definitionPath}`);
    return null;
  }

  // Handle $ref in definition
  const resolvedDefinition = definition.$ref ? 
    resolveReference(definition.$ref) : 
    definition;

  // Render form based on definition type
  const renderDefinitionForm = () => {
    switch (resolvedDefinition.type) {
      case 'object':
        return (
          <div className="space-y-4">
            {Object.entries(resolvedDefinition.properties || {}).map(([propName, propSchema]) => (
              <FormField
                key={propName}
                name={propName}
                schema={propSchema}
                value={value?.[propName]}
                onChange={(newValue) => {
                  onChange({
                    ...(value || {}),
                    [propName]: newValue
                  });
                }}
                required={resolvedDefinition.required?.includes(propName)}
              />
            ))}
          </div>
        );

      case 'array':
        return (
          <div className="space-y-2">
            {(value || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormField
                  name={`${index}`}
                  schema={resolvedDefinition.items}
                  value={item}
                  onChange={(newValue) => {
                    const newArray = [...(value || [])];
                    newArray[index] = newValue;
                    onChange(newArray);
                  }}
                />
                <button
                  onClick={() => {
                    const newArray = value.filter((_, i) => i !== index);
                    onChange(newArray);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newArray = [...(value || []), null];
                onChange(newArray);
              }}
              className="text-blue-500 hover:text-blue-700"
            >
              Add Item
            </button>
          </div>
        );

      default:
        return <FormField 
          name={definitionPath}
          schema={resolvedDefinition}
          value={value}
          onChange={onChange}
        />;
    }
  };

  return (
    <div className="definition-form">
      {resolvedDefinition.title && (
        <h3 className="text-lg font-medium mb-2">{resolvedDefinition.title}</h3>
      )}
      {resolvedDefinition.description && (
        <p className="text-sm text-gray-500 mb-4">{resolvedDefinition.description}</p>
      )}
      {renderDefinitionForm()}
    </div>
  );
};

export default DefinitionForm;