module.exports = {
  content: [
    './src/**/*.{html,svelte}',

    // Using glob patterns results in infinite loop
    './public/index.html',
    './public/cairo.html',
    './public/embed.html',
  ],

  theme: {
    extend: {
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

    }
  },
  plugins: []
};
