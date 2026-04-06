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
      }
    },
  },
  plugins: [],
}
