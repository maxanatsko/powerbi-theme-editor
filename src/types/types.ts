
export interface SchemaProperty {
  type: string;
  description?: string;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  enum?: any[];
  format?: string;
  required?: boolean;
  default?: any;
  $ref?: string;
}

export interface Schema {
  $schema: string;
  type: string;
  properties: Record<string, SchemaProperty>;
}

export interface FormData {
  [key: string]: any;
}

export interface PreviewProps {
  formData: FormData;
}

export interface FieldProps {
  path: string;
  schema: SchemaProperty;
  value: any;
  onChange: (path: string, value: any) => void;
}

export interface EnumOption {
  const: string | number | boolean;
  title: string;
}

export interface SchemaProperty {
  // Add to existing interface:
  oneOf?: EnumOption[];
  allOf?: SchemaProperty[];
  title?: string;
}

export interface ValidationError {
  path: string;
  message: string;
}