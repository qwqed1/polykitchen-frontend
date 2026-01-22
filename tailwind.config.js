/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'menu-bg': '#F5F5F5',
        'menu-primary': '#DC2626',
        'menu-text': '#1F2937',
        'menu-border': '#E5E5E5',
        'menu-hover': '#F9FAFA',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
