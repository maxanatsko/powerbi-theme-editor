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
    <div className="space-y-4 p-4 rounded-lg border
      bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
      border-theme-light-border-default dark:border-theme-dark-border-default">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={newIconName}
          onChange={(e) => setNewIconName(e.target.value)}
          placeholder="New icon name"
          className="flex-1 px-3 py-2 rounded-lg transition-colors duration-200
            bg-theme-light-bg-input dark:bg-theme-dark-bg-input
            text-theme-light-text-primary dark:text-theme-dark-text-primary
            border border-theme-light-border-default dark:border-theme-dark-border-default
            focus:outline-none focus:ring-2
            focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
            focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
            placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder"
        />
        <button
          onClick={handleAddIcon}
          disabled={!newIconName.trim()}
          className="px-4 py-2 rounded-lg transition-colors duration-200
            bg-theme-light-accent-primary dark:bg-theme-dark-accent-primary
            text-white
            hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Icon
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(value).map(([iconName, iconData]) => (
          <div key={iconName} className="border rounded-lg p-4 space-y-3
            border-theme-light-border-default dark:border-theme-dark-border-default
            bg-theme-light-bg-base dark:bg-theme-dark-bg-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary" />
                <span className="font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">{iconName}</span>
              </div>
              <button
                onClick={() => handleRemoveIcon(iconName)}
                className="text-theme-light-state-error hover:text-theme-light-state-error/80
                  dark:text-theme-dark-state-error dark:hover:text-theme-dark-state-error/80
                  transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1
                  text-theme-light-text-primary dark:text-theme-dark-text-primary">
                  SVG URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={iconData.url || ''}
                    onChange={(e) => handleIconChange(iconName, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg transition-colors duration-200
                      bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                      text-theme-light-text-primary dark:text-theme-dark-text-primary
                      border border-theme-light-border-default dark:border-theme-dark-border-default
                      focus:outline-none focus:ring-2
                      focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
                      focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
                      placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder"
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
                <label className="block text-sm font-medium mb-1
                  text-theme-light-text-primary dark:text-theme-dark-text-primary">
                  Description
                </label>
                <input
                  type="text"
                  value={iconData.description || ''}
                  onChange={(e) => handleIconChange(iconName, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg transition-colors duration-200
                    bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                    text-theme-light-text-primary dark:text-theme-dark-text-primary
                    border border-theme-light-border-default dark:border-theme-dark-border-default
                    focus:outline-none focus:ring-2
                    focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
                    focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
                    placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder"
                  placeholder="Icon description..."
                />
              </div>

              {iconData.url && validateSvgUrl(iconData.url) && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1
                    text-theme-light-text-primary dark:text-theme-dark-text-primary">
                    Preview
                  </label>
                  <div className="border rounded-lg p-4 flex items-center justify-center
                    bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                    border-theme-light-border-default dark:border-theme-dark-border-default">
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
          <div className="text-center py-8 flex flex-col items-center gap-2
            text-theme-light-text-secondary dark:text-theme-dark-text-secondary">
            <FileCode className="w-6 h-6" />
            <p>No icons added yet. Add your first icon above.</p>
          </div>
        )}
      </div>
    </div>
  );
};