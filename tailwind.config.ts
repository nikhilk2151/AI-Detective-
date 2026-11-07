import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#08090c",
          900: "#0f1117",
          850: "#161822",
          800: "#1f2230",
          700: "#2d3245",
          600: "#424962",
        },
        ai: {
          blue: "#3b82f6",
          darkblue: "#1d4ed8",
          lightblue: "#60a5fa",
          cyan: "#38bdf8",
        },
        crime: {
          red: "#ef4444",
          darkred: "#b91c1c",
          lightred: "#f87171",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        'blue-glow': "0 0 30px -5px rgba(59, 130, 246, 0.4)",
        'red-glow': "0 0 30px -5px rgba(239, 68, 68, 0.4)",
        'white-subtle': "0 4px 20px -2px rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
