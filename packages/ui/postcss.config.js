const nesting = require('tailwindcss/nesting');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    nesting,
    tailwindcss,
    autoprefixer,
  ],
};
