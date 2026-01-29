import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E63946", // Mingles Red
          dark: "#C42835",
        },
        agave: {
          light: "#A4C3B2",
          DEFAULT: "#6B9080", // Muted Agave Green
          dark: "#4F6D62",
        },
        tequila: {
          DEFAULT: "#E9C46A", // Warm Gold/Amber
        },
        beige: {
          DEFAULT: "#F8F5F0", // Warm Off-white background
          dark: "#EBE5DA",
        },
        dark: {
          DEFAULT: "#1A1A1A", // Almost Black
          muted: "#4A4A4A",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;