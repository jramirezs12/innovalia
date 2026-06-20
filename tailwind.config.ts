import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta acorde al logo INNOVALIA: azul (rol oscuro, antes "navy")
        navy: {
          50: '#eef1fb',
          100: '#d3dcf5',
          200: '#a7b8ea',
          300: '#7b95e0',
          400: '#4f71d5',
          500: '#3051b2',
          600: '#284499',
          700: '#213780',
          800: '#1a2b63',
          900: '#141f49',
          950: '#0d1530',
        },
        // Teal de marca (acento, antes "gold"). Tono ajustado para que el texto
        // blanco en botones tenga contraste suficiente.
        gold: {
          400: '#1fb2c9',
          500: '#0e8fa6',
          600: '#0b7286',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
