/**
 * SHTKS Sovereign Design System Tokens
 * Source of truth for programmatic design values across the application.
 */

export const tokens = {
  colors: {
    void: {
      950: '#07090E',
      DEFAULT: '#0B0F17',
      surface: '#111726',
      elevated: '#161E31',
      overlay: '#1C263D',
    },
    brand: {
      500: '#6366F1', // Primary Sovereign Indigo
      600: '#4F46E5',
      glow: 'rgba(99, 102, 241, 0.25)',
    },
    shield: {
      500: '#06B6D4', // Primary Cyan Security Shield
      600: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.2)',
    },
    status: {
      verified: '#10B981',     // CKKS / Proof Verified
      verifiedGlow: 'rgba(16, 185, 129, 0.2)',
      pending: '#F59E0B',      // Pending Consent / Processing
      confidential: '#8B5CF6', // FERPA / Sensitive
      danger: '#EF4444',       // Revoked / Error
    },
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
    borders: {
      subtle: 'rgba(255, 255, 255, 0.07)',
      default: 'rgba(255, 255, 255, 0.12)',
      hover: 'rgba(255, 255, 255, 0.22)',
      active: '#6366F1',
    }
  },
  typography: {
    fonts: {
      display: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    },
    scales: {
      display: { size: 'clamp(2.5rem, 5vw, 4rem)', leading: '1.05', weight: '800' },
      h1: { size: 'clamp(1.875rem, 3.5vw, 2.5rem)', leading: '1.15', weight: '700' },
      h2: { size: 'clamp(1.5rem, 2.5vw, 2rem)', leading: '1.25', weight: '700' },
      h3: { size: '1.25rem', leading: '1.35', weight: '600' },
      bodyLarge: { size: '1.125rem', leading: '1.6', weight: '400' },
      body: { size: '0.9375rem', leading: '1.5', weight: '400' },
      small: { size: '0.8125rem', leading: '1.4', weight: '500' },
      tiny: { size: '0.6875rem', leading: '1.3', weight: '600' },
    }
  },
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    elevated: '0 4px 14px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
    modal: '0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
    brandGlow: '0 0 25px -4px rgba(99, 102, 241, 0.3)',
    shieldGlow: '0 0 25px -4px rgba(6, 182, 212, 0.25)',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  }
} as const;

export type DesignTokens = typeof tokens;

