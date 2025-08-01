import type { Config } from 'tailwindcss';
import flowbite from 'flowbite/plugin';

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}",
    './node_modules/flowbite/**/*.js', // Required for Flowbite
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#3AB0FF",
          DEFAULT: "#008CFF",
          dark: "#005F99",
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [flowbite],
}

export default config
