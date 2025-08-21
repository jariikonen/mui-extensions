import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import testingLibrary from 'eslint-plugin-testing-library';
import vitest from '@vitest/eslint-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const reactBase = {
  extends: [
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    reactDom.configs.recommended,
    reactX.configs.recommended,
  ],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
      },
      globals: {
        ...globals.browser,
      }
    },
  },
  plugins: {
    js,
    jsxA11y,
    react,
    reactDom,
    reactHooks,
    reactRefresh,
    reactX,
    tseslint,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/jsx-props-no-spreading': ['warn'],
    'react/jsx-no-useless-fragment': ['error'],
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': [
      'error',
      {
        functions: 'defaultArguments',
      },
    ],
    'react/prop-types': 'off',
  },
};

// https://typescript-eslint.io/packages/typescript-eslint/#config
export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  globalIgnores(['dist', 'eslint.config.mjs']),
  {
    files: ['**/*.{ts,tsx}'],
    ...reactBase,
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    ...reactBase,
    extends: [
      ...reactBase.extends,
    ],
    plugins: {
      ...reactBase.plugins,
      vitest,
      'testing-library': testingLibrary,
    },
    rules: {
        ...vitest.configs.recommended.rules,
    },
  }
)
