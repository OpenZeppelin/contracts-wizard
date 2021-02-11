export default {
  verbose: true,
  ignoredByWatcher: ['**/*.{ts,map,tsbuildinfo}'],
  typescript: { rewritePaths: { 'src/': 'dist/' } },
};
