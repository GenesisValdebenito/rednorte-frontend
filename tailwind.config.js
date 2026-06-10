/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        rn: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
          accent:        '#2563EB',
          'accent-hover': '#1D4ED8',
          'accent-light': '#DBEAFE',
          success:       '#10B981',
          'success-bg':  '#D1FAE5',
          warning:       '#F59E0B',
          'warning-bg':  '#FEF3C7',
          danger:        '#EF4444',
          'danger-bg':   '#FEE2E2',
          muted:         '#64748B',
          border:        '#E2E8F0',
          surface:       '#FFFFFF',
          card:          '#FFFFFF',
          'card-hover':  '#F8FAFC',
          sidebar:       '#1E3A5F',
          'sidebar-hover':'#152A46',
          'sidebar-text': '#CBD5E1',
          'sidebar-active':'#2563EB',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.25s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
