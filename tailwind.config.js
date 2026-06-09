/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        jost: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        vd: {
          black: '#0A0A0A',
          white: '#FFFFFF',
          text: '#0A0A0A',
          meta: '#6B6B6B',
          caption: '#9A9A9A',
          border: '#E0E0E0',
          surface: '#F5F5F5',
          dark: '#0A0A0A',
          'dark-2': '#1A1A1A',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '9999px',
      },
      gridTemplateColumns: {
        auto: 'repeat(auto-fill, minmax(min(100%, 1fr), 1fr))',
      },
      scale: {
        103: '1.03',
      },
      boxShadow: {
        subtle: '0 2px 16px rgba(0,0,0,0.06)',
        'subtle-md': '0 4px 24px rgba(0,0,0,0.09)',
      },
      width: {
        '15': '60px',
        'country-selector': '7rem',
      },
      minWidth: {
        'country-selector': '7rem',
      },
      height: {
        '15': '60px',
      },
      fontSize: {
        'badge': ['0.5625rem', { lineHeight: '1' }],
        'cta': ['0.6875rem', { lineHeight: '1' }],
        'label': ['0.625rem', { lineHeight: '1' }],
        'description': ['0.9375rem', { lineHeight: '1.625' }],
        'price-row': ['0.8125rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
        label: '0.15em',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms ease-out forwards',
        'fade-in': 'fade-in 200ms ease forwards',
        'slide-down': 'slide-down 200ms ease forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
