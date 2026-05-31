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
        primary: {
          DEFAULT: "#2B6CB0",
          dark: "#215387",
          light: "#EBF4FF",
        },
        success: "#38A169",
        warning: "#D69E2E",
        danger: "#E53E3E",
        border: "#E2E8F0",
        text: {
          900: "#1A202C",
          700: "#2D3748",
          500: "#4A5568",
          400: "#718096",
        },
        bg: {
          100: "#F7FAFC",
          50: "#EDF2F7",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)",
        modal: "0px 20px 25px rgba(0,0,0,0.1), 0px 10px 10px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
