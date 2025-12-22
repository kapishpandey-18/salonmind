/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#0f62fe",
          600: "#0c4cd8",
        },
      },
    },
  },
  plugins: [],
};
