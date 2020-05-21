import resolve from 'rollup-plugin-node-resolve'

export default [
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es'
    },
    external: '@github/combobox-nav',
    plugins: [resolve()]
  },
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/bundle.js',
      format: 'es'
    },
    plugins: [resolve()]
  }
]
