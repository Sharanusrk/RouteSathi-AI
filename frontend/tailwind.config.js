/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // AllIndiaCitySelect builds this text color from an accent prop at runtime.
  safelist: ['text-sky-600', 'text-violet-600'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#1d4ed8',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};

