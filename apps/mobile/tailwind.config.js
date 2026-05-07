/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        secondary: "#2DBE6C",
        orange: "#F5820A",
        dark: "#1A1A1A",
      },
    },
  },
  plugins: [],
};
