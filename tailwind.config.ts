import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050505",
        surface: "#151412",
        surface2: "#211F1B",
        paper: "#FFFFFF",
        ink: "#1B1210",
        stone: {
          200: "#EAE6E1",
          400: "#AFA69D",
          600: "#7C736A",
        },
        cappuccino: {
          DEFAULT: "#C8A272",
          dark: "#A9835A",
          50: "#F3E6D5",
        },
        gold: {
          DEFAULT: "#F2B84B",
          dark: "#D69B2F",
        },
        confirmed: "#59B37D",
        alert: "#E5484D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
