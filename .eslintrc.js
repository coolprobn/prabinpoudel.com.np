module.exports = {
    parser: 'babel-eslint',
    env: {
      browser: true,
      es6: true,
    },
    extends: ['airbnb', 'prettier', 'prettier/react'],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          jsxSingleQuote: false,
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src'],
        },
      },
    },
  };
  