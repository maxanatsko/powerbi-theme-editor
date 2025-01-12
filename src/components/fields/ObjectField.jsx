import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const ObjectField = ({ path, schema, value = {}, onChange }) => {
  console.log('ObjectField render:', { path });
  
  const [isExpanded, setIsExpanded] = useState(false);

  if (!schema || !schema.properties) {
    console.log('No schema or properties');
    return null;
  }

  return (
    <div className="w-full border rounded-lg bg-gray-50">
      <div 
        className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center w-full p-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="ml-2 font-medium text-gray-700">
            {path || 'Root'}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-lg border-t">
          <pre>{JSON.stringify(Object.keys(schema.properties), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};