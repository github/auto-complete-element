/* @flow strict */

import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg['module'],
      format: 'es'
    },
    external: '@github/combobox-nav',
    plugins: [
      resolve(),
      babel({
        presets: ['github']
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: pkg['browser'],
      format: 'es'
    },
    plugins: [
      resolve(),
      babel({
        presets: ['github']
      })
    ]
  }
]
