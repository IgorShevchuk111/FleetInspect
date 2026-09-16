/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: ['class'],

  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        secondary: 'hsl(var(--secondary))',
        surface: 'hsl(var(--surface))',

        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',

        primary: 'hsl(var(--primary))',
        'primary-hover': 'hsl(var(--primary-hover))',

        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',

        border: 'hsl(var(--border))',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },

  plugins: [],
};

export default tailwindConfig;
