// Tailwind CSS configuration
// Customizes theme colors and utilities for the complaint box dApp

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14F195',
        secondary: '#1F1F1F',
        accent: '#FF6B6B',
      },
    },
  },
  plugins: [],
};
