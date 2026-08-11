// @ts-check
// recommended start from https://typescript-eslint.io/getting-started
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'webpack.config.js',
      'webpack.production.config.js',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // React hooks rules, app code only. Matches the two rules the old
  // .eslintrc.js declared; the plugin's `recommended-latest` preset adds the
  // full React Compiler rule set if you ever want it.
  {
    files: ['src/app/**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Ported from the old .eslintrc.js (which ESLint 10 no longer reads).
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'prefer-const': 'warn',
      'no-empty': 'off',
    },
  },
);
