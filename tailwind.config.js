/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["autumn","silk", "winter", "retro"], // List only the themes you want to allow
  },
  darkMode: false,
};
