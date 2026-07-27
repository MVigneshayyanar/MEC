/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medbosh: {
          teal: "#007A78",
          "teal-dark": "#005E5C",
          "teal-light": "#E6F4F4",
          navy: "#0F172A",
          "navy-dark": "#020617",
          "navy-light": "#1E293B",
          accent: "#D97706",
          gray: "#F8FAFC",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
