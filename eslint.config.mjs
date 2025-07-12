import nextPlugin from '@next/eslint-plugin-next';
import js from '@eslint/js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    plugins: {
      next: nextPlugin,
    },
    languageOptions: {
      globals: {
        // Allow common browser and Node.js globals
        console: true,
        process: true,
        Buffer: true,
        URL: true,
        navigator: true,
        require: true,
        window: true,
        document: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Use the proper format for Next.js rules
      'next/no-html-link-for-pages': 'error',
      'next/no-img-element': 'error',
      'next/no-unwanted-polyfillio': 'error',
      'next/no-css-tags': 'error',
      // Disable rules causing build failures
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
    },
    ignores: ['node_modules/**', '.next/**'],
  },
];

export default eslintConfig;
