/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
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
      },
      fontFamily: {
        roboto: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default tailwindConfig;
