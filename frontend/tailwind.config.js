/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/background.jpg')",
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 4px #38bdf8, 0 0 6px #38bdf8' },
          '50%': { boxShadow: '0 0 8px #38bdf8, 0 0 12px #38bdf8' },
        }
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
