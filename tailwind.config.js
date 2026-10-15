/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F3EFE6",
          base: "#F3EFE6",
          muted: "#E8E2D5",
        },
        surface: {
          DEFAULT: "#FAF8F5",
          hover: "#FFFFFF",
          focus: "#FFFFFF",
          card: "#FAF8F5",
        },
        ink: {
          DEFAULT: "#1A1715",
          primary: "#1A1715",
          secondary: "#6E675F",
          tertiary: "#9A9185",
        },
        brand: {
          DEFAULT: "#991B1B",
          hover: "#7F1D1D",
          light: "#FEE2E2",
          badge: "#FEE2E2",
        },
        amber: {
          DEFAULT: "#D97706",
          vip: "#D97706",
        },
        seat: {
          DEFAULT: "#D3CBC0",
          available: "#D3CBC0",
          hover: "#B5AAA0",
          selected: "#991B1B",
          booked: "#E1DCD5",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        cozy: "0 4px 20px -2px rgba(26, 23, 21, 0.08), 0 2px 6px -1px rgba(26, 23, 21, 0.04)",
        poster: "0 12px 32px -4px rgba(26, 23, 21, 0.18), 0 4px 12px -2px rgba(26, 23, 21, 0.08)",
      },
    },
  },
  plugins: [],
};
