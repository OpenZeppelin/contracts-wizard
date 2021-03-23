import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import styles from 'rollup-plugin-styles';
import proc from 'child_process';
import events from 'events';

const production = !process.env.ROLLUP_WATCH;

function onStartRun(cmd, ...args) {
  let ran = false;
  return {
    async buildStart(opts) {
      if (ran) return;
      const child = proc.spawn(cmd, args, { stdio: 'inherit' });
      const [code, signal] = await events.once(child, 'exit');
      if (code || signal) {
        throw new Error(`Command \`${cmd}\` failed`);
      }
      ran = true;
    }
  };
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        },
      );

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

export default [
  {
    input: 'src/embed.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'embed',
      file: 'public/build/embed.js',
    },
    plugins: [
      typescript({
        include: ['src/**/*.ts'],
        sourceMap: true,
        inlineSources: true,
      }),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production &&
        livereload({
          watch: 'public',
          port: 35731,
        }),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
  },
  {
    input: 'src/main.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: 'public/build/bundle.js',
      assetFileNames: '[name][extname]',
    },
    plugins: [
      // Generate openzeppelin-contracts.js data file
      onStartRun(...'yarn --cwd ../core prepare'.split(' ')),

      svelte(require('./svelte.config')),

      styles({
        mode: ['extract', 'bundle.css'],
        sourceMap: true,
      }),

      resolve({
        browser: true,
        dedupe: ['svelte'],
        mainFields: ['ts:main', 'module', 'main'],
      }),

      replace({
        preventAssignment: true,
        include: '../../**/node_modules/highlightjs-solidity/solidity.js',
        delimiters: ['', ''],
        'var module = module ? module : {};': '',
      }),

      json(),

      commonjs(),

      typescript({
        include: ['src/**/*.ts', '../core/src/**/*.ts'],
        sourceMap: true,
        inlineSources: true,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production &&
        livereload({
          watch: 'public',
          port: 35730,
        }),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
];
