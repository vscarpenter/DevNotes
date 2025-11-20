/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Times New Roman', 'serif'], 
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
        manuscript: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        manuscript: {
          parchment: "hsl(var(--manuscript-parchment))",
          ink: "hsl(var(--manuscript-ink))",
          gold: "hsl(var(--manuscript-gold))",
          shadow: "hsl(var(--manuscript-shadow))",
        },
        dark: {
          DEFAULT: "hsl(var(--dark))",
          lighter: "hsl(var(--dark-lighter))",
          accent: "hsl(var(--dark-accent))",
          teal: "hsl(var(--dark-teal))",
          gold: "hsl(var(--dark-gold))",
          text: "hsl(var(--dark-text))",
          muted: "hsl(var(--dark-muted))",
          border: "hsl(var(--dark-border))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(30, 159, 170, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(30, 159, 170, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-teal': 'linear-gradient(135deg, hsl(var(--dark-teal)) 0%, hsl(185 90% 55%) 100%)',
        'gradient-gold': 'linear-gradient(135deg, hsl(var(--dark-gold)) 0%, hsl(45 95% 75%) 100%)',
        'gradient-teal-gold': 'linear-gradient(135deg, hsl(var(--dark-teal)) 0%, hsl(var(--dark-gold)) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}