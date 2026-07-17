import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--canvas))",
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",
        "surface-muted": "hsl(var(--surface-muted))",
        ink: "hsl(var(--ink))",
        "ink-muted": "hsl(var(--ink-muted))",
        "accent-primary": "hsl(var(--accent-primary))",
        "accent-secondary": "hsl(var(--accent-secondary))",
        "accent-tertiary": "hsl(var(--accent-tertiary))",
        status: {
          idle: "hsl(var(--status-idle))",
          analyzing: "hsl(var(--status-analyzing))",
          planning: "hsl(var(--status-planning))",
          migrating: "hsl(var(--status-migrating))",
          validating: "hsl(var(--status-validating))",
          success: "hsl(var(--status-success))",
          warning: "hsl(var(--status-warning))",
          failed: "hsl(var(--status-failed))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glass: "0 20px 60px hsl(var(--shadow) / 0.28)",
        glow: "0 0 30px hsl(var(--accent-primary) / 0.18)",
      },
      backgroundImage: {
        grid: "linear-gradient(hsl(var(--grid) / 0.22) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--grid) / 0.22) 1px, transparent 1px)",
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        pulseSignal: "pulseSignal 1.8s ease-in-out infinite",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulseSignal: { "50%": { opacity: "0.45", transform: "scale(1.45)" } },
      },
    },
  },
  plugins: [],
};

export default config;
