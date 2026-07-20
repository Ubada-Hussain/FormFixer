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
        bg: "#FBFAF6",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#16241F",
          soft: "rgba(22,36,31,0.62)",
          faint: "rgba(22,36,31,0.4)",
        },
        line: "rgba(22,36,31,0.13)",
        teal: {
          900: "#04342C",
          800: "#085041",
          700: "#0F6E56",
          500: "#1D9E75",
          300: "#5DCAA5",
          200: "#9FE1CB",
          100: "#E1F5EE",
        },
        coral: {
          700: "#993C1D",
          500: "#D85A30",
          200: "#F5C4B3",
          100: "#FAECE7",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "18px",
        lg: "28px",
      },
      keyframes: {
        "pulse-dot": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "frame-pulse": {
          "0%,100%": { borderColor: "#9FE1CB" },
          "50%": { borderColor: "#1D9E75" },
        },
        "photo-fit": {
          "0%,45%": { transform: "scale(1.32) rotate(3deg)" },
          "65%,100%": { transform: "scale(1) rotate(0deg)" },
        },
        "check-pop": {
          "0%,60%": { opacity: "0", transform: "scale(0.4)" },
          "75%": { opacity: "1", transform: "scale(1.15)" },
          "85%,96%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.4)" },
        },
        drift: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(6deg)" },
        },
        "scroll-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "frame-pulse": "frame-pulse 3.2s ease-in-out infinite",
        "photo-fit": "photo-fit 3.2s cubic-bezier(.5,0,.2,1) infinite",
        "check-pop": "check-pop 3.2s ease infinite",
        "drift-1": "drift 6s ease-in-out infinite",
        "drift-2": "drift 7.5s ease-in-out infinite 1s",
        "drift-3": "drift 5.5s ease-in-out infinite 0.5s",
        "scroll-left": "scroll-left 26s linear infinite",
      },
      maxWidth: {
        wrap: "1080px",
      },
    },
  },
  plugins: [],
};
export default config;
