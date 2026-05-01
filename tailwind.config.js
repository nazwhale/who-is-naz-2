/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#33D1FA",
          orange: "#FF7464",
        },
      },
    },
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
          "base-100": "#FFFFFF",          // Clean white page background
          "base-200": "#F5F1EA",          // Soft warm surface for tables and secondary backgrounds
          "base-300": "#E2D7C5",          // Slightly darker border/surface tone
          "info": "#33D1FA",
          "success": "#33D1FA",
          "warning": "#FF7464",
          "error": "#1C2B3A",

          // Text colors
          "base-content": "#102A43",      // Default body copy color
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
