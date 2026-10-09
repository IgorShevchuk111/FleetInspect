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
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',

        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        border: 'hsl(var(--border))',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      fontSize: {
        caption: 'var(--font-size-caption)',
        secondary: 'var(--font-size-secondary)',
        body: 'var(--font-size-body)',
        heading: 'var(--font-size-heading)',
        'page-title': 'var(--font-size-page-title)',
      },

      lineHeight: {
        body: 'var(--line-height-body)',
        heading: 'var(--line-height-heading)',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },

  plugins: [],
};

export default tailwindConfig;
