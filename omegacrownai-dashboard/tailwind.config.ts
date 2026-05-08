import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0b10',
        panel: '#11131a',
        border: '#202534',
        text: '#f5f7ff',
        muted: '#98a2b3',
        accent: '#6d5efc',
        accent2: '#2f8cff',
        success: '#14b86a',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      boxShadow: {
        panel: '0 8px 32px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: []
};

export default config;
