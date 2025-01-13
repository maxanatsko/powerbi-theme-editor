import Ajv from 'ajv';
import { customizeValidator } from '@rjsf/validator-ajv8';

const createCustomValidator = () => {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    validateFormats: false,
    // Allow additional properties
    additionalProperties: true,
    // More tolerant mode for oneOf/anyOf/allOf
    strictTypes: false,
    // Custom keyword to handle incompatible oneOf
    keywords: [{
      keyword: 'oneOf',
      schemaType: 'array',
      validate: (schema, data) => {
        // Accept any value that matches at least one of the schemas
        return schema.some(subschema => {
          // If it's a const schema, match the value directly
          if (subschema.const !== undefined) {
            return subschema.const === data;
          }
          return true;
        });
      }
    }]
  });

  return customizeValidator(ajv);
};

export const customValidator = createCustomValidator();