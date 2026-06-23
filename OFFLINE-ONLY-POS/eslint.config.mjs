import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const reactFiles = ['src/renderer/**/*.{jsx,tsx}']
const nodeFiles = [
  'src/main/**/*.{js,ts}',
  'src/preload/**/*.{js,ts}',
  'electron.vite.config.ts',
  'scripts/**/*.{js,ts,mjs}',
  'eslint.config.mjs'
]

export default tseslint.config(
  {
    ignores: [
      'out/**',
      'dist/**',
      'release/**',
      'node_modules/**',
      'private/**',
      'sync-service/dist/**',
      'sync-service/scripts/**',
      '.cache/**',
      'electron.vite.config.*.mjs',
      '**/*.d.ts'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,ts,tsx}', 'electron.vite.config.ts', 'scripts/**/*.{js,ts,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: nodeFiles,
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['src/renderer/**/*.{js,ts,tsx}', 'src/shared/**/*.{js,ts}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    }
  },
  {
    files: reactFiles,
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  },
  {
    files: reactFiles,
    ...reactHooks.configs.flat.recommended
  },
  {
    files: reactFiles,
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/set-state-in-effect': 'warn'
    }
  },
  {
    files: reactFiles,
    ...reactCompiler.configs.recommended,
    rules: {
      'react-compiler/react-compiler': 'warn'
    }
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['src/renderer/src/vite-env.d.ts', 'src/renderer/activation/main.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-void': 'off',
      'prefer-const': 'warn'
    }
  }
)
