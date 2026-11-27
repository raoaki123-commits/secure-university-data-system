/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Void & Base Canvas
        void: {
          950: '#07090E',
          DEFAULT: '#0B0F17',
          surface: '#111726',
          elevated: '#161E31',
          overlay: '#1C263D',
        },
        // Brand Primary - Sovereign Indigo
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Primary Brand Accent
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        // Security & Discovery Accent - Cyan Shield
        shield: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4', // Primary Shield Accent
          600: '#0891B2',
          700: '#0E7490',
          glow: 'rgba(6, 182, 212, 0.2)',
        },
        // Functional Accents
        status: {
          verified: '#10B981', // Emerald for Cryptographically Verified
          'verified-glow': 'rgba(16, 185, 129, 0.2)',
          pending: '#F59E0B',  // Amber
          confidential: '#8B5CF6', // Purple for Sensitive/FERPA Protected
          danger: '#EF4444',   // Red
        },
        // Neutral Slate Scales with Subtle Navy Tint
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Precise Borders
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          hover: 'rgba(255, 255, 255, 0.22)',
          active: '#6366F1',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 14px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'modal': '0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'brand-glow': '0 0 25px -4px rgba(99, 102, 241, 0.3)',
        'shield-glow': '0 0 25px -4px rgba(6, 182, 212, 0.25)',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-smooth': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'micro': '120ms',
        'default': '200ms',
        'smooth': '320ms',
        'cinematic': '600ms',
      }
    },
  },
  plugins: [],
};

