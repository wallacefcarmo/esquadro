import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:   '#0F2C4C',
        ink:    '#22303D',
        amber:  '#F2A007',
        ice:    '#F1F4F7',
        steel:  '#35709E',
        muted:  '#65758A',
        line:   '#E1E7ED',
        verde:    '#3FB950',
        amarelo:  '#D9A521',
        vermelho: '#E5484D',
      },
    },
  },
  plugins: [],
};

export default config;
