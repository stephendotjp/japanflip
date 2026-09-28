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
        bg: "#F3F3F7",
        surface: "#FFFFFF",
        black: "#15191E",
        red: "#D92B3A",
        "red-light": "#FDF0F1",
        gold: "#B8860B",
        "gold-light": "#FDF8EE",
        green: "#1A7A4A",
        "green-light": "#EDF7F2",
        muted: "#60646C",
        border: "#B9BBC6",
        text: "#000000",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        ticker: "ticker 30s linear infinite",
        pulse_dot: "pulse_dot 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.4s ease forwards",
        fadeUp: "fadeUp 0.4s ease forwards",
        verdictReveal: "verdictReveal 0.3s ease forwards",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulse_dot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        verdictReveal: {
          "0%": { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
