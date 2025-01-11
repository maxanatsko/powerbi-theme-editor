import React, { useState } from 'react';
import { PlusCircle, Trash2, Image, FileCode, AlertCircle } from 'lucide-react';

export const IconField = ({ path, schema, value = {}, onChange }) => {
  const [newIconName, setNewIconName] = useState('');
  
  const handleAddIcon = () => {
    if (!newIconName.trim()) return;
    
    const newValue = {
      ...value,
      [newIconName]: {
        url: '',
        description: ''
      }
    };
    onChange(path, newValue);
    setNewIconName('');
  };

  const handleRemoveIcon = (iconName) => {
    const newValue = { ...value };
    delete newValue[iconName];
    onChange(path, newValue);
  };

  const handleIconChange = (iconName, field, fieldValue) => {
    const newValue = {
      ...value,
      [iconName]: {
        ...value[iconName],
        [field]: fieldValue
      }
    };
    onChange(path, newValue);
  };

  const validateSvgUrl = (url) => {
    return url.startsWith('data:image/svg+xml;utf8,') && url.includes('<svg');
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={newIconName}
          onChange={(e) => setNewIconName(e.target.value)}
          placeholder="New icon name"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddIcon}
          disabled={!newIconName.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Icon
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(value).map(([iconName, iconData]) => (
          <div key={iconName} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{iconName}</span>
              </div>
              <button
                onClick={() => handleRemoveIcon(iconName)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SVG URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={iconData.url || ''}
                    onChange={(e) => handleIconChange(iconName, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="data:image/svg+xml;utf8,<svg...>"
                  />
                  {iconData.url && !validateSvgUrl(iconData.url) && (
                    <div className="flex items-center text-amber-500" title="URL should start with 'data:image/svg+xml;utf8,' and contain SVG markup">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={iconData.description || ''}
                  onChange={(e) => handleIconChange(iconName, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Icon description..."
                />
              </div>

              {iconData.url && validateSvgUrl(iconData.url) && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    <div 
                      className="w-8 h-8"
                      dangerouslySetInnerHTML={{ __html: iconData.url.replace('data:image/svg+xml;utf8,', '') }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {Object.keys(value).length === 0 && (
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
            <FileCode className="w-6 h-6" />
            <p>No icons added yet. Add your first icon above.</p>
          </div>
        )}
      </div>
    </div>
  );
};