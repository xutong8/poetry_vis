module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    _: true,
  },
  parser: 'babel-eslint', // 解决 实验性的 public class fields 语法 报错问题
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // 检查 Hook 的规则
    'react-hooks/exhaustive-deps': 'warn', // 检查 effect 的依赖
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    // 'linebreak-style': ['error', 'unix'], // 换行符 Mac：'unix' -> LF，win：'windows' -> CRLF
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'multiline-ternary': ['error', 'always-multiline'], // 三目运算符换行
    'react/jsx-uses-react': 'error', // Prevent React to be incorrectly marked as unused
    'react/jsx-uses-vars': 'error', // Prevent variables used in JSX to be incorrectly marked as unused
    'no-console': 'off',
  },
};