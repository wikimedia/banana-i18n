'use strict'

const lint = require('mocha-eslint')

const paths = [
  'src/**/*.js',
  'test/**/*.js'
]

// Run the tests
lint(paths)
