/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00d4ff", // Orbital Cyan
        "primary-dark": "#0284c7",
        "primary-orange": "#ff6b1a", // Flare orange
        "isro-orange": "#ff9933",
        "accent-red": "#ff2244",
        "accent-cyan": "#00d4ff",
        "accent-green": "#00ff9d",
        "background-light": "#070b16",
        "background-dark": "#050814",
        "surface-dark": "#0a1022",
        "surface-card": "#0f172a",
        "surface-border": "#1e293b",
      },
      fontFamily: {
        "orbitron": ["Orbitron", "sans-serif"],
        "display": ["Orbitron", "Space Grotesk", "sans-serif"],
        "mono": ["Space Mono", "JetBrains Mono", "monospace"],
        "sans": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "lg": "0.5rem",
        "xl": "0.75rem",
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 212, 255, 0.35), 0 0 30px rgba(0, 212, 255, 0.15)',
        'neon-orange': '0 0 15px rgba(255, 107, 26, 0.4), 0 0 30px rgba(255, 107, 26, 0.15)',
        'neon-red': '0 0 15px rgba(255, 34, 68, 0.45), 0 0 30px rgba(255, 34, 68, 0.2)',
        'neon-green': '0 0 15px rgba(0, 255, 157, 0.45), 0 0 30px rgba(0, 255, 157, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dash': 'dash 4s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        dash: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
