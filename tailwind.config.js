/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "nureach-lime": "#cce49e",
        "nureach-blue": "#297fb2",
      },
    },
  },
  plugins: [],
};
