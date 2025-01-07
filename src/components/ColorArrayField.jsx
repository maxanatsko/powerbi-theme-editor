import React from 'react';

const ColorArrayField = ({ value = [], onChange, label }) => {
  const handleColorChange = (index, newColor) => {
    const newColors = [...value];
    newColors[index] = newColor;
    onChange(newColors);
  };

  const addColor = () => {
    onChange([...value, '#000000']);
  };

  const removeColor = (index) => {
    const newColors = value.filter((_, i) => i !== index);
    onChange(newColors);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        {value.map((color, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="h-8 w-16 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => removeColor(index)}
              className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addColor}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        Add Color
      </button>
    </div>
  );
};

export default ColorArrayField;