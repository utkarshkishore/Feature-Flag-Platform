import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0b0d17',
          700: '#1d2233',
        },
        cloud: {
          100: '#f4f6fb',
        },
        electric: {
          400: '#4f46e5',
          500: '#4338ca',
        },
        amber: {
          400: '#f59e0b',
          500: '#d97706',
        },
      },
    },
  },
  plugins: [],
};

export default config;
