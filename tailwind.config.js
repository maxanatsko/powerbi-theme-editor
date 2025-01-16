/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Enable dark mode based on system preference
  theme: {
    extend: {
      colors: {
        theme: {
          // Light mode
          light: {
            bg: {
              base: '#ffffff',
              surface: '#f9f9f9',
              input: '#f3f4f6',
              hover: '#f3f4f6'
            },
            text: {
              primary: '#213547',
              secondary: '#666666',
              muted: '#8a8a8a',
              input: '#213547',
              placeholder: '#a1a1aa'
            },
            border: {
              default: '#e5e7eb',
              hover: '#d1d5db',
              focus: '#646cff'
            },
            accent: {
              primary: '#646cff',
              hover: '#747bff'
            }
          },
          // Dark mode
          dark: {
            bg: {
              base: '#252423',      // Root background
              surface: '#323130',    // Card/Section background
              input: '#484644',      // Input fields
              hover: '#605E5C',      // Hover states
              active: '#3B3A39'      // Selected/Active states
            },
            text: {
              primary: '#FFFFFF',    // Primary text
              secondary: '#D2D0CE',  // Secondary text
              muted: '#A19F9D',      // Less important text
              input: '#FFFFFF',      // Input text
              placeholder: '#8A8886' // Placeholder text
            },
            border: {
              default: '#484644',    // Default borders
              hover: '#605E5C',      // Hover borders
              focus: '#4AA4EF'       // Focus borders
            },
            accent: {
              primary: '#2B88D8',    // Primary actions - PowerBI blue
              hover: '#4AA4EF'       // Hover state - Lighter PowerBI blue
            },
            state: {
            error: '#FF4444',      // Brighter error for dark mode
            warning: '#FFC107',    // Brighter warning for dark mode
            success: '#4CAF50',    // Brighter success for dark mode
            'error-bg': '#442726',  // Error background
            'warning-bg': '#433519',// Warning background
            'success-bg': '#103D10' // Success background
            }
          }
        }
      }
    },
  },
  plugins: [],
}