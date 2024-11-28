import pkg from './package.json' with { type: 'json' }
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        name: 'Banana',
        file: pkg.main,
        format: 'umd'
      },
      {
        name: pkg.name,
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      },
    ],
    plugins: [
      json(),
      commonjs(),
      esbuild({
        sourceMap: true,
        minify: true
      })
    ]
  }
]
