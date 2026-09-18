/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          tealDark: "#123C38",
          teal: "#1F6F63",
          marigold: "#C9752E",
          marigoldDark: "#8F5015",
        },
      },
    },
  },
  plugins: [],
}
