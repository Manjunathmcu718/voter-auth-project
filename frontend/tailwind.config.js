/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saffron': '#FF9933',
        'green': '#138808',
        'navy': '#000080',
      }
    },
  },
  plugins: [],
}