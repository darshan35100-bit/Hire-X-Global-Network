/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#113253',
        'accent-teal': '#489895',
        'bg-light': '#F1F5F9',
        'cream': '#F5F5DC',
        'dark-charcoal': '#333333',
        'deep-navy': '#113253',
        'gold': '#D4AF37'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'playfair': ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
