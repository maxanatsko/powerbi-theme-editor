import React from 'react';

const SearchResults = ({ results, onResultClick }) => {
  if (!results.length) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border max-h-96 overflow-y-auto">
      {results.map((result, index) => (
        <div
          key={`${result.path}-${index}`}
          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          onClick={() => onResultClick(result)}
        >
          <div className="flex items-start">
            <span className={`text-xs px-2 py-1 rounded ${
              result.matchType === 'property' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {result.matchType}
            </span>
            <div className="ml-2 flex-1">
              <p className="text-sm font-medium text-gray-900">{result.path}</p>
              <p className="text-sm text-gray-500 mt-1">
                {result.context}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;