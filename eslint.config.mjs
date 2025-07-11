import nextPlugin from '@next/eslint-plugin-next';
import js from '@eslint/js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    plugins: {
      next: nextPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'next/core-web-vitals': 'error',
    },
    ignores: ['node_modules/**', '.next/**'],
  },
];

export default eslintConfig;
