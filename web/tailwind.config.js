const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx,css,less}"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.purple,
        gray: colors.neutral
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: 'class'
    }),
    require("tailwindcss-animate"),
    require('@tailwindcss/typography')
  ],
  darkMode: "class"
}
