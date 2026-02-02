const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const srcFiles = fs.readdirSync('./src')

let entries = {
  'gallery/gallery.min': './src/gallery.ts',
  'dist/index': './src/index.ts',
}

// Compile vanta.xxxxx.ts (or .js) files
for (let i = 0; i < srcFiles.length; i++) {
  const file = srcFiles[i]
  if (file.indexOf('vanta') !== 0) continue
  const fileWithoutExtension = file.replace(/\.[^/.]+$/, '')
  const hasTs = srcFiles.includes(fileWithoutExtension + '.ts')
  const hasJs = srcFiles.includes(fileWithoutExtension + '.js')
  const ext = hasTs ? '.ts' : hasJs ? '.js' : null
  if (ext) entries['dist/' + fileWithoutExtension + '.min'] = './src/' + fileWithoutExtension + ext
}

module.exports = {
  mode: 'production',
  entry: entries,
  // watch: true,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.'),
    library: '_vantaEffect',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      { test: /\.ts$/, use: { loader: 'ts-loader', options: { transpileOnly: true } }, exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, use: ['raw-loader', 'glslify-loader'], exclude: /node_modules/ },
    ],
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  devServer: {
    // contentBase: './dist',
    // publicPath: '',
    static: {
      directory: path.join(__dirname, ''),
    },
    compress: true,
    // port: 9000
  }
}