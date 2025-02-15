
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#000000",
          text: "#00ff00",
          glow: "#00ff0033"
        }
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
      },
      keyframes: {
        glow: {
          "0%, 100%": { textShadow: "0 0 4px #00ff00" },
          "50%": { textShadow: "0 0 8px #00ff00" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
