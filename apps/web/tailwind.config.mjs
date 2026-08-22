import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean:    { DEFAULT: '#1B3A4B', light: '#2D5F73', dark: '#0D1B2A' },
        sand:     { DEFAULT: '#F5F0E8', dark: '#D4C5A9', light: '#FAF8F4' },
        coral:    { DEFAULT: '#E07A5F', light: '#E9A08D', dark: '#C4583E' },
        leaf:     { DEFAULT: '#6B9080', light: '#8FB3A5', dark: '#4A6B5C' },
        stone:    { DEFAULT: '#3D405B', light: '#6B6E8A', dark: '#2A2D42' },
        midnight: '#0D1B2A',
      },
      fontFamily: {
        display: ['Fraunces', ...defaultTheme.fontFamily.serif],
        body:    ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        sans:    ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
