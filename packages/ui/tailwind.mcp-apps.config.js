const path = require('path');
const fg = require('fast-glob');

/**
 * Tailwind content for MCP App bundles: scan Controls and shared UI used by adapters,
 * but exclude web-only App shells that pull unused layout utilities into the CSS.
 */
const root = __dirname;
const contentGlobs = [
  'src/mcp-apps/**/*.{html,svelte,ts}',
  'src/common/**/*.{svelte,ts,css}',
  'src/solidity/**/*.{svelte,ts}',
  'src/cairo/**/*.{svelte,ts}',
  'src/stellar/**/*.{svelte,ts}',
  'src/stylus/**/*.{svelte,ts}',
  'src/confidential/**/*.{svelte,ts}',
  'src/uniswap-hooks/**/*.{svelte,ts}',
];

const content = fg
  .sync(contentGlobs, { cwd: root, absolute: true })
  .filter(file => path.basename(file) !== 'App.svelte');

module.exports = {
  content,

  theme: {
    extend: {
      spacing: {
        74: '18.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-up': 'fade-up 0.2s ease-out',
        'fade-down': 'fade-down 0.5s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
