/* @flow */

import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'AutocompleteElement'
    }
  ],
  plugins: [
    resolve({
      main: true
    }),
    babel({
      plugins: ['transform-custom-element-classes'],
      presets: ['@babel/env', '@babel/flow']
    })
  ]
}
