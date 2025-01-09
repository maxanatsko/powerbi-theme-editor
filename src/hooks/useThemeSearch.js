import { useState, useCallback } from 'react';
import { searchTheme } from '../utils/search';

export const useThemeSearch = (theme) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((searchTerm) => {
    setIsSearching(true);
    try {
      const results = searchTheme(theme, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [theme]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    handleSearch,
    clearSearch
  };
};
