import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['out/**', 'dist/**', 'node_modules/**', 'private/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]
