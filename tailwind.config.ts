import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './src/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        lg: '2.5rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        brand: {
          bg: '#F4F6FB',
          surface: '#FFFFFF',
          surfaceMuted: '#F8FAFF',
          primary: '#1E40AF',
          primaryHover: '#1D4ED8',
          accent: '#C2410C',
          accentSoft: '#FBE8D6',
          text: '#111827',
          muted: '#4C566A',
          border: '#E2E8F0',
          ring: '#C7D2FE',
          tag: '#E0E7FF',
          success: '#16A34A',
          warn: '#F59E0B',
          danger: '#DC2626',
          subtle: '#EEF2FF',
          soft: '#F8FAFF',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 48px -28px rgba(30, 64, 175, 0.35)',
        subtle: '0 10px 28px -24px rgba(15, 23, 42, 0.2)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [typography],
} satisfies Config
