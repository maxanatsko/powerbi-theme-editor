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
        className="w-full pl-9 pr-4 py-2 text-sm rounded-md shadow-sm transition-colors duration-200
          bg-theme-light-bg-input/75 dark:bg-theme-dark-bg-input/75
          hover:bg-theme-light-bg-input dark:hover:bg-theme-dark-bg-input
          text-theme-light-text-primary dark:text-theme-dark-text-primary
          border border-theme-light-border-default dark:border-theme-dark-border-default
          placeholder-theme-light-text-placeholder dark:placeholder-theme-dark-text-placeholder
          focus:outline-none focus:ring-2
          focus:ring-theme-light-border-focus dark:focus:ring-theme-dark-border-focus
          focus:border-theme-light-border-focus dark:focus:border-theme-dark-border-focus
          focus:bg-theme-light-bg-input dark:focus:bg-theme-dark-bg-input"
      />
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-light-text-secondary dark:text-theme-dark-text-secondary" 
        size={16} 
      />
    </div>
  );
};

export default SearchBar;