import React, { useState } from 'react';
import { PlusCircle, Trash2, Image, FileCode, AlertCircle } from 'lucide-react';
import { CollapsibleSection } from '../layouts/CollapsibleSection';

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

  const decodeSvgContent = (content) => {
    return content
      .replace(/'/g, '"')
      .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1));
  };

  const normalizeDataUrl = (url) => {
    const trimmedUrl = url.trim();
    const [prefix, ...rest] = trimmedUrl.split(',');
    const content = rest.join(',').trim();

    return {
      prefix,
      content: decodeSvgContent(content)
    };
  };

  const validateImageUrl = (url) => {
    const { prefix, content } = normalizeDataUrl(url);
    const isSvg = prefix.includes('image/svg+xml') && content.includes('<svg');
    const isPng = prefix === 'data:image/png;base64';
    const isGif = prefix.includes('data:image/gif;base64');

    return isSvg || isPng || isGif;
  };

  return (
    <CollapsibleSection 
      label="Theme Icons" 
      description="Add and manage custom icons for your theme"
      defaultExpanded={false}
    >
      <div className="px-4 pb-4 space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={newIconName}
            onChange={(e) => setNewIconName(e.target.value)}
            placeholder="New icon name"
            className="flex-1 px-3 py-2 rounded-lg
              bg-theme-light-bg-input dark:bg-theme-dark-bg-input
              text-theme-light-text-primary dark:text-theme-dark-text-primary
              border border-theme-light-border-default dark:border-theme-dark-border-default
              focus:outline-none focus:ring-2 focus:ring-theme-light-accent-primary dark:focus:ring-theme-dark-accent-primary"
          />
          <button
            onClick={handleAddIcon}
            disabled={!newIconName.trim()}
            className="px-4 py-2 rounded-lg
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
            <div key={iconName} className="rounded-lg border p-4 space-y-3
              bg-theme-light-bg-base dark:bg-theme-dark-bg-base
              border-theme-light-border-default dark:border-theme-dark-border-default">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-theme-light-text-secondary dark:text-theme-dark-text-secondary" />
                  <span className="font-medium text-theme-light-text-primary dark:text-theme-dark-text-primary">{iconName}</span>
                </div>
                <button
                  onClick={() => handleRemoveIcon(iconName)}
                  className="text-theme-light-state-error hover:text-red-400 dark:text-theme-dark-state-error dark:hover:text-red-400
                    transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-light-text-primary dark:text-theme-dark-text-primary">
                    SVG URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={iconData.url || ''}
                      onChange={(e) => handleIconChange(iconName, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg
                        bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                        text-theme-light-text-primary dark:text-theme-dark-text-primary
                        border border-theme-light-border-default dark:border-theme-dark-border-default
                        focus:outline-none focus:ring-2 focus:ring-theme-light-accent-primary dark:focus:ring-theme-dark-accent-primary"
                      placeholder="data:image/svg+xml;utf8,<svg...>"
                    />
                    {iconData.url && !validateImageUrl(iconData.url) && (
                      <div className="text-amber-500" title="URL should start with 'data:image/svg+xml;utf8,' (for SVG) or 'data:image/png;base64,' (for PNG)">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-theme-light-text-primary dark:text-theme-dark-text-primary">
                    Description
                  </label>
                  <input
                    type="text"
                    value={iconData.description || ''}
                    onChange={(e) => handleIconChange(iconName, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg
                      bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                      text-theme-light-text-primary dark:text-theme-dark-text-primary
                      border border-theme-light-border-default dark:border-theme-dark-border-default
                      focus:outline-none focus:ring-2 focus:ring-theme-light-accent-primary dark:focus:ring-theme-dark-accent-primary"
                    placeholder="Icon description..."
                  />
                </div>

                {iconData.url && validateImageUrl(iconData.url) && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1 text-theme-light-text-primary dark:text-theme-dark-text-primary">Preview</label>
                    <div className="border rounded-lg p-4 flex items-center justify-center
                      bg-theme-light-bg-input dark:bg-theme-dark-bg-input
                      border-theme-light-border-default dark:border-theme-dark-border-default">
                      <div className="flex items-center justify-center w-8 h-8 overflow-hidden">
                        {(() => {
                          const { prefix, content } = normalizeDataUrl(iconData.url);
                          const isSvg = prefix.includes('image/svg+xml') && content.includes('<svg');

                          const html = isSvg ? content : `<img src="${iconData.url}" alt="${iconData.description || 'Icon preview'}" class="w-auto h-auto max-w-full max-h-full" />`;

                          return (
                            <div className="flex items-center justify-center w-8 h-8 overflow-hidden">
                              <div 
                                className="[&>svg]:w-full [&>svg]:h-auto 
                                  [&>svg]:max-w-full [&>svg]:max-h-full
                                  [&>svg]:overflow-hidden [&>svg]:box-content"
                                dangerouslySetInnerHTML={{ __html: html }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {Object.keys(value).length === 0 && (
            <div className="text-center py-8 text-theme-light-text-secondary dark:text-theme-dark-text-secondary">
              No items added
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
};