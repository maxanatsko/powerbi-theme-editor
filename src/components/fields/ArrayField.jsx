import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FieldRenderer } from '../core/FieldRenderer';

export const ArrayField = ({ path, schema, value = [], onChange }) => {
  const handleAdd = () => {
    const newValue = [...value, undefined];
    onChange(path, newValue);
  };

  const handleRemove = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(path, newValue);
  };

  const handleItemChange = (index, newValue) => {
    const updatedValue = [...value];
    updatedValue[index] = newValue;
    onChange(path, updatedValue);
  };

  return (
    <div className="my-4 border rounded-lg bg-gray-50">
      <div className="p-3 flex justify-between items-center">
        <span className="font-medium text-gray-700">
          {schema.title || path}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </button>
      </div>
      <div className="bg-white border-t">
        {value.map((item, index) => (
          <div key={index} className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <FieldRenderer
              path={`${path}.${index}`}
              schema={schema.items}
              value={item}
              onChange={(_, value) => handleItemChange(index, value)}
              required={schema.required?.includes(key)}
            />
          </div>
        ))}
        {value.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No items added
          </div>
        )}
      </div>
    </div>
  );
};