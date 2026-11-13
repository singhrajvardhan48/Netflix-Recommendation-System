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
        netflix: {
          red: "#E50914",
          redDark: "#B80710",
          black: "#141414",
          dark: "#181818",
          card: "#1f1f1f",
          gray: "#808080",
          lightGray: "#e5e5e5",
        },
      },
      fontFamily: {
        sans: ["Netflix Sans", "Helvetica Neue", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

