import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand - Orange (preserved from original)
        primary: {
          DEFAULT: '#FF6A00',
          hover: '#E65F00',
          light: '#FFF0E6',
          dark: '#CC5500',
        },
        // Status colors
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
        },
        info: {
          DEFAULT: '#06b6d4',
          light: '#cffafe',
        },
        // Content category colors - CRITICAL (preserved from original)
        instruction: {
          DEFAULT: '#8b5cf6',
          bg: '#f5f3ff',
        },
        technical: {
          DEFAULT: '#10b981',
          bg: '#d1fae5',
        },
        lighting: {
          DEFAULT: '#f59e0b',
          bg: '#fef3c7',
        },
        audio: {
          DEFAULT: '#ec4899',
          bg: '#fce7f3',
        },
        props: {
          DEFAULT: '#06b6d4',
          bg: '#cffafe',
        },
        microphone: {
          DEFAULT: '#0ea5e9',
          bg: '#e0f2fe',
        },
        // Surface colors
        surface: {
          DEFAULT: '#ffffff',
          dark: '#18181A',
        },
        background: {
          DEFAULT: '#f9fafb',
          dark: '#0F0F10',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['var(--font-cinzel)', 'Cinzel', 'serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      zIndex: {
        dropdown: '100',
        sticky: '200',
        fixed: '300',
        overlay: '400',
        modal: '500',
        popover: '600',
        tooltip: '700',
      },
      maxWidth: {
        content: '960px',
      },
      width: {
        sidebar: '300px',
      },
      height: {
        nav: '64px',
        'nav-mobile': '56px',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-up': 'slideInUp 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'pulse-border': 'pulseBorder 2s infinite',
        'pulse-border-warning': 'pulseBorderWarning 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: '#ef4444' },
          '50%': { borderColor: 'rgba(239, 68, 68, 0.5)' },
        },
        pulseBorderWarning: {
          '0%, 100%': { borderColor: '#f59e0b' },
          '50%': { borderColor: 'rgba(245, 158, 11, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
