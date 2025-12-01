module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
  plugins: ['@typescript-eslint', 'eslint-plugin-n8n-nodes-base'],
  extends: ['plugin:n8n-nodes-base/community'],
  rules: {},
};
