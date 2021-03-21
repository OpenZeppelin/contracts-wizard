export default {
  verbose: true,
  ignoredByWatcher: [
    '**/*.{ts,map,tsbuildinfo}',
    'contracts',
    'artifacts',
    'cache',
  ],
  typescript: { rewritePaths: { 'src/': 'dist/' } },
};
