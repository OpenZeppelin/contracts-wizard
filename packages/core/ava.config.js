export default {
  verbose: true,
  ignoredByWatcher: ['**/*.{ts,map,tsbuildinfo}', 'contracts'],
  typescript: { rewritePaths: { 'src/': 'dist/' } },
};
