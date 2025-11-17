/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibelab-cyan': '#00E5FF',
        'vibelab-dark': '#000000',
        'vibelab-charcoal': '#0A0F14',
      },
    },
  },
  plugins: [],
}
