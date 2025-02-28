// @ts-check

import eslint from '@eslint/js';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import unicornPlugin from 'eslint-plugin-unicorn';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  eslint.configs.recommended,
  typescriptEslint.configs.strict,
  prettierPluginRecommended,
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'prettier/prettier': [
        'error',
        { singleQuote: true, arrowParens: 'avoid', trailingComma: 'all', printWidth: 120, bracketSpacing: true },
      ],
    },
  },
  {
    ignores: ['node_modules/', '*.sol', 'packages/*/node_modules/', 'packages/**/dist/', 'packages/**/build/'],
  },
  {
    files: ['**/*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        global: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
