/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        miramax: {
          "primary": "#E6B55A",           // Warm ochre - primary text color (h1, main headers)
          "secondary": "#CDAA5A",         // Desaturated tan - for secondary elements
          "accent": "#EBC977",            // Lighter ochre - for smaller headers (h2, h3)
          "neutral": "#1C2B3A",           // Deep navy - for shadows/contrast
          "base-100": "#5C748A",          // Slate blue-grey - main background (muted, desaturated)
          "base-200": "#4E6477",          // Darker, desaturated shade for secondary backgrounds
          "base-300": "#3F5363",          // Even darker, desaturated for tertiary backgrounds
          "info": "#E6B55A",
          "success": "#CDAA5A",
          "warning": "#E6B55A",
          "error": "#1C2B3A",

          // Text colors
          "base-content": "#E6B55A",      // Default text color (warm ochre)
          "primary-content": "#1C2B3A",   // Text on primary colored backgrounds
          "secondary-content": "#1C2B3A", // Text on secondary colored backgrounds
          "neutral-content": "#E6B55A",   // Text on neutral backgrounds
          "accent-content": "#1C2B3A",    // Text on accent colored backgrounds
        },
      },
      "autumn",
      "silk",
      "winter",
      "retro"
    ],
  },
  darkMode: false,
};
