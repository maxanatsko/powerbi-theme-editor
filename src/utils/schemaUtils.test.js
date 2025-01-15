import { describe, it, expect } from 'vitest';
import { traverseSchema, resolveSchema } from './schemaUtils';

describe('schemaUtils', () => {
  describe('traverseSchema', () => {
    it('processes simple object schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const result = traverseSchema(schema);
      expect(result.type).toBe('object');
      expect(result.fields).toHaveProperty('name');
      expect(result.fields).toHaveProperty('age');
    });

    it('handles nested objects', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        }
      };

      const result = traverseSchema(schema);
      expect(result.fields.user.schema.type).toBe('object');
      expect(result.fields.user.schema.fields).toHaveProperty('name');
      expect(result.fields.user.schema.fields).toHaveProperty('age');
    });

    it('handles arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      };

      const result = traverseSchema(schema);
      expect(result.fields.tags.schema.type).toBe('array');
      expect(result.fields.tags.schema.items.type).toBe('string');
    });

    it('preserves additional schema properties', () => {
      const schema = {
        type: 'object',
        properties: {
          color: { 
            type: 'string',
            format: 'color',
            description: 'Color in hex format',
            default: '#000000'
          }
        }
      };

      const result = traverseSchema(schema);
      expect(result.fields.color.schema).toMatchObject({
        type: 'string',
        format: 'color',
        description: 'Color in hex format',
        default: '#000000'
      });
    });

    it('handles empty or invalid schemas', () => {
      expect(() => traverseSchema(null)).toThrow();
      expect(() => traverseSchema({})).toThrow();
      expect(() => traverseSchema({ type: 'invalid' })).toThrow();
    });
  });

  describe('resolveSchema', () => {
    it('resolves local references', async () => {
      const schema = {
        type: 'object',
        definitions: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' }
            }
          }
        },
        properties: {
          address: { $ref: '#/definitions/address' }
        }
      };

      const resolved = await resolveSchema(schema);
      expect(resolved.properties.address.type).toBe('object');
      expect(resolved.properties.address.properties).toHaveProperty('street');
      expect(resolved.properties.address.properties).toHaveProperty('city');
    });

    it('handles nested references', async () => {
      const schema = {
        type: 'object',
        definitions: {
          contact: {
            type: 'object',
            properties: {
              phone: { type: 'string' }
            }
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              contact: { $ref: '#/definitions/contact' }
            }
          }
        },
        properties: {
          address: { $ref: '#/definitions/address' }
        }
      };

      const resolved = await resolveSchema(schema);
      expect(resolved.properties.address.properties.contact.properties).toHaveProperty('phone');
    });

    it('handles circular references safely', async () => {
      const schema = {
        type: 'object',
        definitions: {
          person: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              friend: { $ref: '#/definitions/person' }
            }
          }
        },
        properties: {
          person: { $ref: '#/definitions/person' }
        }
      };

      const resolved = await resolveSchema(schema);
      expect(resolved.properties.person.properties.friend).toBeDefined();
      expect(resolved.properties.person.properties.friend.$ref).toBe('#/definitions/person');
    });

    it('throws error for invalid references', async () => {
      const schema = {
        type: 'object',
        properties: {
          invalid: { $ref: '#/definitions/nonexistent' }
        }
      };

      await expect(resolveSchema(schema)).rejects.toThrow();
    });

    it('preserves non-reference properties', async () => {
      const schema = {
        type: 'object',
        definitions: {
          color: {
            type: 'string',
            format: 'color'
          }
        },
        properties: {
          backgroundColor: {
            $ref: '#/definitions/color',
            description: 'Background color',
            default: '#FFFFFF'
          }
        }
      };

      const resolved = await resolveSchema(schema);
      expect(resolved.properties.backgroundColor).toMatchObject({
        type: 'string',
        format: 'color',
        description: 'Background color',
        default: '#FFFFFF'
      });
    });
  });
});