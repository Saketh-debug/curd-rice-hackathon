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
        background: "#161513",
        foreground: "#f1efea",
        card: "#1f1e1b",
        "card-foreground": "#f1efea",
        popover: "#1f1e1b",
        "popover-foreground": "#f1efea",
        muted: "#292825",
        "muted-foreground": "#a19c92",
        border: "#34322d",
        input: "#34322d",
        ring: "#66625a",
        signal: "#ff9933",
        "signal-foreground": "#161513",
        grove: "#8abf84",
        "grove-foreground": "#161513",
        destructive: "#ff6568",
        slate: "#7c9bda",
        "slate-soft": "#242e48",

        // Palette aliases for backward compatibility mapped to FieldRank palette
        primary: "#f1efea",
        "primary-dark": "#e0ddd5",
        "primary-orange": "#ff9933",
        "isro-orange": "#ff9933",
        "accent-red": "#ff6568",
        "accent-cyan": "#7c9bda",
        "accent-green": "#8abf84",
        "background-light": "#1f1e1b",
        "background-dark": "#161513",
        "surface-dark": "#161513",
        "surface-card": "#1f1e1b",
        "surface-border": "#34322d",
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        display: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        logo: ['Orbitron', 'sans-serif'],
      },
      borderRadius: {
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.875rem",
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 212, 255, 0.35), 0 0 30px rgba(0, 212, 255, 0.15)',
        'neon-orange': '0 0 15px rgba(255, 153, 51, 0.4), 0 0 30px rgba(255, 153, 51, 0.15)',
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
