import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pacha: {
          50: "#F3F9F4",
          100: "#E7F3E8",
          200: "#C8E5CC",
          300: "#9BCFA5",
          400: "#5FB173",
          500: "#359457",
          600: "#27864A",
          700: "#1F6B3B",
          800: "#145A32",
          900: "#0C3D23",
          950: "#062515",
        },
        gold: {
          50: "#FDF8EA",
          100: "#FAEEC8",
          200: "#F4DC8F",
          300: "#EDC75A",
          400: "#E8B949",
          500: "#D6A32E",
          600: "#B58022",
          700: "#8F601E",
          800: "#734C1F",
          900: "#613F1E",
        },
        ink: "#16241B",
        mist: "#F4F6F5",
        cream: "#FBFAF5",
        clay: "#B4643C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
      },
      opacity: {
        "8": "0.08",
        "12": "0.12",
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(12, 61, 35, 0.28)",
        card: "0 1px 2px rgba(12, 61, 35, 0.06), 0 12px 30px -18px rgba(12, 61, 35, 0.24)",
        lift: "0 30px 70px -30px rgba(6, 37, 21, 0.45)",
      },
      backgroundImage: {
        "grain":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.13) 1px, transparent 0)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
