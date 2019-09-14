const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'Banana',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
    filename: 'banana-i18n.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map'
}
