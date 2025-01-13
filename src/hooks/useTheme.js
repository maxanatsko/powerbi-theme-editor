import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  const setTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('preferred-theme', theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  return { currentTheme, setTheme };
};