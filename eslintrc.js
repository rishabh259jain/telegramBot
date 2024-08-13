module.exports = {
    env: {
      node: true,
      mocha: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
      ecmaVersion: 12,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  };
  