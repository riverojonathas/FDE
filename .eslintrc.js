module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  rules: {
    // Regras gerais
    'no-unused-vars': 'off', // Desabilita a regra padrão
    '@typescript-eslint/no-unused-vars': ['warn'], // Usa a versão TypeScript
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Regras de React
    'react/no-unused-prop-types': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    
    // Regras customizadas para componentes
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',

    // Desabilitando a regra problemática
    'import/no-unused-modules': 'off'
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: true,
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'public/',
    'dist/',
    'build/',
  ],
} 