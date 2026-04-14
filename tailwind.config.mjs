/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E1F0FF',
          100: '#A8D1FF',
          200: '#7FB2FF',
          300: '#56A3FF',
          400: '#2D94FF',
          500: '#0766FF',
          600: '#065BEB',
          700: '#0550D7',
          800: '#0446C3',
          900: '#033BAF',
          950: '#022F99',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        white: '#FFFFFF',
        gray: {
          50: '#D9D9D9',
          100: '#B3B3B3',
          200: '#666666',
          300: '#4C4C4C',
          400: '#333333',
          500: '#606060',
          600: '#0D0D0D',
          700: '#000000',
        },
        danger: {
          50: '#FFE4E6',
          100: '#FFCCD3',
          200: '#FFB3B9',
          300: '#FF99A0',
          400: '#FF8090',
          500: '#FF4F5A',
          600: '#FF3D47',
          700: '#FF2B36',
          800: '#FF1925',
          900: '#FF0614',
          950: '#E6000C',
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
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        roboto: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default tailwindConfig;
