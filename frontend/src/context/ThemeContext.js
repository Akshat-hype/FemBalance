import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [colorScheme, setColorScheme] = useState('pink'); // pink, blue, purple

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fembalance_theme');
    const savedColorScheme = localStorage.getItem('fembalance_color_scheme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', colorScheme);
    
    // Save to localStorage
    localStorage.setItem('fembalance_theme', theme);
    localStorage.setItem('fembalance_color_scheme', colorScheme);
  }, [theme, colorScheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeColorScheme = (newScheme) => {
    setColorScheme(newScheme);
  };

  // Theme-aware colors
  const colors = {
    light: {
      pink: {
        primary: '#ec4899',
        secondary: '#f9a8d4',
        accent: '#fce7f3'
      },
      blue: {
        primary: '#3b82f6',
        secondary: '#93c5fd',
        accent: '#dbeafe'
      },
      purple: {
        primary: '#8b5cf6',
        secondary: '#c4b5fd',
        accent: '#ede9fe'
      }
    },
    dark: {
      pink: {
        primary: '#f472b6',
        secondary: '#ec4899',
        accent: '#be185d'
      },
      blue: {
        primary: '#60a5fa',
        secondary: '#3b82f6',
        accent: '#1d4ed8'
      },
      purple: {
        primary: '#a78bfa',
        secondary: '#8b5cf6',
        accent: '#7c3aed'
      }
    }
  };

  const getCurrentColors = () => {
    return colors[theme][colorScheme];
  };

  // Predefined themes
  const themes = {
    feminine: {
      name: 'Feminine',
      theme: 'light',
      colorScheme: 'pink',
      description: 'Soft pink tones for a feminine feel'
    },
    professional: {
      name: 'Professional',
      theme: 'light',
      colorScheme: 'blue',
      description: 'Clean blue tones for a professional look'
    },
    elegant: {
      name: 'Elegant',
      theme: 'light',
      colorScheme: 'purple',
      description: 'Elegant purple tones'
    },
    darkMode: {
      name: 'Dark Mode',
      theme: 'dark',
      colorScheme: 'pink',
      description: 'Dark theme with pink accents'
    }
  };

  const applyTheme = (themeName) => {
    const selectedTheme = themes[themeName];
    if (selectedTheme) {
      setTheme(selectedTheme.theme);
      setColorScheme(selectedTheme.colorScheme);
    }
  };

  const value = {
    // Current state
    theme,
    colorScheme,
    
    // Actions
    setTheme,
    setColorScheme,
    toggleTheme,
    changeColorScheme,
    applyTheme,
    
    // Utilities
    getCurrentColors,
    themes,
    
    // Theme checks
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};