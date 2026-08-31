import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F7FB",
        foreground: "#1E1B2E",
        primary: {
          50: "#F3F1FE",
          100: "#E8E4FD",
          200: "#D1C9FB",
          300: "#B9AEF9",
          400: "#A293F7",
          500: "#7C6FF0",
          600: "#5A4AD4",
          700: "#4337A8",
          800: "#2F267D",
          900: "#1C1752",
        },
        accent: {
          purple: "#9B8AFB",
          lavender: "#C4B8FF",
          soft: "#EAE6FF",
        },
      },
      fontFamily: {
        
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(124, 111, 240, 0.10)",
        card: "0 4px 24px 0 rgba(124, 111, 240, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
