// @ts-check

import eslint from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import unicornPlugin from "eslint-plugin-unicorn";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  eslint.configs.recommended,
  typescriptEslint.configs.strict,
  prettierRecommended,
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    ignores: [
      "node_modules/",
      "*.sol",
      "packages/*/node_modules/",
      "packages/**/dist/",
      "packages/**/build/",
    ],
  },
  {
    files: ["**/*.config.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/*": "off",
    },
  },
  {
    files: ["**/*.mjs", "**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        global: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
