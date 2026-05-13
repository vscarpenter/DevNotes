/** @type {import('tailwindcss').Config} */
/*
 * Tailwind theme is wired to the Inkwell design system: every color,
 * font family, and radius below points at an Inkwell CSS variable.
 * This means utilities like `bg-card`, `text-foreground`, and
 * `border-border` resolve to Inkwell tokens — no parallel palette.
 *
 * Rules enforced here (see inkwell-tokens.css for source values):
 *   - One accent only (--accent), no warm-toned neutrals
 *   - Page = --ivory, text = --slate, never pure white/black
 *   - Platform fonts only (--serif/--sans/--mono); no webfonts
 */
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
        sans:  ['var(--sans)'],
        serif: ['var(--serif)'],
        mono:  ['var(--mono)'],
      },
      colors: {
        /* Surfaces & text — direct Inkwell tokens */
        ivory:      'var(--ivory)',
        paper:      'var(--paper)',
        slate:      'var(--slate)',
        oat:        'var(--oat)',

        /* Cool-putty neutral scale */
        'gray-100': 'var(--gray-100)',
        'gray-200': 'var(--gray-200)',
        'gray-300': 'var(--gray-300)',
        'gray-500': 'var(--gray-500)',
        'gray-700': 'var(--gray-700)',

        /* Inkwell semantic colors (single accent + signals) */
        olive:   'var(--olive)',
        rust:    'var(--rust)',
        warning: 'var(--warning)',
        info:    'var(--info)',
        sky:     'var(--sky)',

        /* Compatibility names — preserved so existing utilities
           (bg-card, text-foreground, etc.) keep working, but every
           one resolves to an Inkwell token. */
        border:     'var(--gray-300)',
        input:      'var(--paper)',
        ring:       'var(--accent)',
        background: 'var(--ivory)',
        foreground: 'var(--slate)',
        primary: {
          DEFAULT:      'var(--accent)',
          foreground:   'var(--paper)',
        },
        secondary: {
          DEFAULT:      'var(--gray-100)',
          foreground:   'var(--slate)',
        },
        destructive: {
          DEFAULT:      'var(--rust)',
          foreground:   'var(--paper)',
        },
        muted: {
          DEFAULT:      'var(--gray-100)',
          foreground:   'var(--gray-500)',
        },
        accent: {
          DEFAULT:      'var(--accent)',
          foreground:   'var(--paper)',
        },
        popover: {
          DEFAULT:      'var(--paper)',
          foreground:   'var(--slate)',
        },
        card: {
          DEFAULT:      'var(--paper)',
          foreground:   'var(--slate)',
        },
      },
      borderRadius: {
        lg: 'var(--r-lg)',
        md: 'var(--r-md)',
        sm: 'var(--r-sm)',
        xs: 'var(--r-xs)',
        xl: 'var(--r-xl)',
      },
      borderWidth: {
        /* Inkwell rule #1: borders are 1.5px, never 1px. Override
           Tailwind's default so bare `border`, `border-t`, `border-b`,
           `border-l`, `border-r` utilities honor the signature
           hairline without per-component changes. */
        DEFAULT: '1.5px',
        hairline: '1.5px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      transitionTimingFunction: {
        out:  'var(--ease-out)',
        pop:  'var(--ease-pop)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '150ms',
        slow: '300ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
