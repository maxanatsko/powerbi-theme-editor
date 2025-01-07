import React from 'react';
import { Palette } from 'lucide-react';

export const ColorPalette = ({ colors = [] }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Palette className="w-5 h-5 text-gray-500" />
      <h3 className="text-lg font-medium text-gray-900">Color Palette</h3>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {colors.map((color, index) => (
        <div key={index} className="flex flex-col items-center group">
          <div className="relative w-full aspect-square rounded-lg shadow-sm overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: color }}
            />
            <div className="absolute inset-0 shadow-inner" />
          </div>
          <span className="mt-2 text-sm text-gray-600 font-mono">{color}</span>
        </div>
      ))}
    </div>
  </div>
);

export const CardPreview = ({ styles }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Card Visual Preview</h3>
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Sample Card 1 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div 
          style={{ 
            color: styles?.card?.title?.color,
            fontSize: styles?.card?.title?.fontSize
          }}
          className="font-medium mb-2"
        >
          Total Revenue
        </div>
        <div
          style={{ 
            color: styles?.card?.value?.color,
            fontSize: styles?.card?.value?.fontSize
          }}
          className="font-bold"
        >
          $1,234,567
        </div>
      </div>

      {/* Sample Card 2 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div 
          style={{ 
            color: styles?.card?.title?.color,
            fontSize: styles?.card?.title?.fontSize
          }}
          className="font-medium mb-2"
        >
          Customers
        </div>
        <div
          style={{ 
            color: styles?.card?.value?.color,
            fontSize: styles?.card?.value?.fontSize
          }}
          className="font-bold"
        >
          8,426
        </div>
      </div>

      {/* Sample Card 3 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div 
          style={{ 
            color: styles?.card?.title?.color,
            fontSize: styles?.card?.title?.fontSize
          }}
          className="font-medium mb-2"
        >
          Growth Rate
        </div>
        <div
          style={{ 
            color: styles?.card?.value?.color,
            fontSize: styles?.card?.value?.fontSize
          }}
          className="font-bold"
        >
          +24.8%
        </div>
      </div>
    </div>
  </div>
);

export const Preview = ({ formData }) => (
  <div className="space-y-6">
    <ColorPalette colors={formData.dataColors || []} />
    <CardPreview styles={formData.visualStyles} />
  </div>
);