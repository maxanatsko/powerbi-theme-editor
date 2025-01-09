import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { debounce } from 'lodash';

const SearchBar = ({ onSearch, placeholder = 'Search theme properties...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Cancel the debounced search and search immediately
      debouncedSearch.cancel();
      onSearch(searchTerm);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-white/75 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
      />
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        size={16} 
      />
    </div>
  );
};

export default SearchBar;