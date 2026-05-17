import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0a0a0c",
          panel: "#111114",
          elevated: "#16161b",
          border: "#1f1f26"
        },
        accent: {
          green: "#00ff9c",
          red: "#ff3b6b",
          amber: "#ffb547",
          blue: "#5b9eff"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1.2s ease-in-out infinite",
        "tick": "tick 0.6s ease-out"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" }
        },
        tick: {
          "0%": { transform: "translateY(-2px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
export default config;
