import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import styles from 'rollup-plugin-styles';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const nodeRequire = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.NODE_ENV = 'production';

const entriesDir = path.join(__dirname, 'src/mcp-apps/entries');
/** Optional: MCP_APP_LANGUAGE=<language> builds only that language entry (e.g. solidity, cairo). */
const only = process.env.MCP_APP_LANGUAGE?.trim();
const entryFiles = fs
  .readdirSync(entriesDir)
  .filter(f => f.endsWith('.ts'))
  .filter(f => !only || path.basename(f, '.ts') === only);
if (entryFiles.length === 0) {
  throw new Error(
    only
      ? `No MCP App entry matching MCP_APP_LANGUAGE="${only}" (expected a language name like solidity)`
      : `No MCP App entries in ${entriesDir}`,
  );
}

const svelteConfig = (await import('./svelte.config.js')).default;
const nesting = nodeRequire('tailwindcss/nesting');
const tailwindcss = nodeRequire('tailwindcss');
const autoprefixer = nodeRequire('autoprefixer');
const mcpTailwindConfig = nodeRequire('./tailwind.mcp-apps.config.js');

/** @type {import('rollup').RollupOptions[]} */
export default entryFiles.map(file => {
  const name = path.basename(file, '.ts');
  return {
    input: path.join(entriesDir, file),
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'McpApp',
      file: path.join(__dirname, `public/build/mcp/${name}.js`),
      inlineDynamicImports: true,
    },
    plugins: [
      svelte({
        ...svelteConfig,
        emitCss: false,
      }),

      styles({
        mode: 'inject',
        sourceMap: false,
        // Use MCP-scoped Tailwind content; do not load packages/ui/postcss.config.js
        // (that config points at the full web Wizard content globs).
        config: false,
        plugins: [nesting, tailwindcss(mcpTailwindConfig), autoprefixer],
      }),

      alias({
        entries: {
          path: 'path-browserify',
          'highlight.js/lib/languages/python': path.join(
            __dirname,
            '../../node_modules/highlight.js/lib/languages/python.js',
          ),
        },
      }),

      resolve({
        browser: true,
        dedupe: ['svelte'],
        mainFields: ['ts:main', 'module', 'main'],
        preferBuiltins: false,
      }),

      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.NODE_DEBUG': JSON.stringify(undefined),
        'process.env.API_HOST': JSON.stringify(''),
      }),

      json(),
      commonjs(),

      typescript({
        include: ['src/**/*.ts', '../core/*/src/**/*.ts', '../common/src/**/*.ts'],
        sourceMap: false,
        inlineSources: false,
      }),

      terser(),
    ],
  };
});
