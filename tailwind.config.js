/* eslint-disable max-len */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#2B2A29",
          lightGray: "#F3F4F6",
          lighterGray: "#F9FAFB",
          gray: "#D1D5DB",
          darkGray: "#64748B",
          blue: "#2E0099",
          green: "#15803D",
          secondaryGreen: '#007A5E',
          lightBlue1: "#3A00BF",
          lightPurple: "#BAADFF",
          neutral: "#EAECF0",
          red: "#D61C38",
          crimson: "#DC143C",
          orange: "#DD4F05",
          loganGrey: '#98A2B3',
        },
      },
    },
  },
  plugins: [],
};
