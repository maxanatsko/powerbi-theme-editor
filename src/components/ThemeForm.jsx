import React, { useMemo, useCallback } from 'react';
import { Form as AntForm } from 'antd';
import { withTheme } from '@rjsf/core';
import { Theme as AntdTheme } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { useFetchSchema } from '../hooks/useFetchSchema';
import ObjectField from './ObjectField';

const Form = withTheme(AntdTheme);

// Memoize templates to prevent unnecessary rerenders
const CustomObjectFieldTemplate = React.memo(({ 
  properties, 
  title, 
  required,
  schema
}) => {
  // Memoize the content rendering
  const content = useMemo(() => (
    <div className="space-y-4">
      {properties.map((prop) => prop.content)}
    </div>
  ), [properties]);

  if (title === 'visualStyles') {
    return <div className="object-field">{content}</div>;
  }

  return (
    <ObjectField title={title} required={required}>
      {content}
    </ObjectField>
  );
});

const CustomFieldTemplate = React.memo((props) => {
  const { id, label, help, required, description, errors, children, schema } = props;

  if (schema.type === 'object') {
    return children;
  }

  return (
    <AntForm.Item
      label={label}
      required={required}
      help={errors?.length > 0 ? errors : (help || description)}
      validateStatus={errors?.length > 0 ? 'error' : ''}
    >
      {children}
    </AntForm.Item>
  );
});

const ThemeForm = () => {
  const { schema, loading, error } = useFetchSchema();

  // Memoize the UI schema configuration
  const uiSchema = useMemo(() => ({
    "ui:ObjectFieldTemplate": CustomObjectFieldTemplate,
    "ui:FieldTemplate": CustomFieldTemplate,
    // Add performance optimizations
    "ui:options": {
      disabled: false,
      readonly: false,
      addable: true,
      orderable: false,  // Disable array item reordering if not needed
      removable: true,
      // Limit initial expanded depth
      expandDepth: 2,
    }
  }), []);

  // Memoize the onChange handler if needed
  const onChange = useCallback((formData) => {
    // Handle form changes
  }, []);

  if (loading) return <div>Loading schema...</div>;
  if (error) return <div>Error loading schema: {error.message}</div>;

  return (
    <Form
      schema={schema}
      validator={validator}
      uiSchema={uiSchema}
      onChange={onChange}
      liveValidate={false}
      className="p-6 max-w-4xl mx-auto"
      noValidate={true}  // Disable HTML5 validation
      omitExtraData={true}  // Only collect changed data
      liveOmit={true}  // Remove extra data in real time
    />
  );
};

export default React.memo(ThemeForm);