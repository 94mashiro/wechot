module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  plugins: ['prettier', 'simple-import-sort'],
  env: {
    node: true,
    es6: true,
  },
  globals: {},
  rules: {
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/explicit-member-accessibility': 'off',
  },
};
