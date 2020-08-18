const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const copyPlugin = require('copy-webpack-plugin')

const config = {
  entry: {
    main: './src/js/main.js',
    styles: './src/scss/styles.scss',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new ExtraneousFileCleanupPlugin({
      extensions: ['.js'],
      paths: ['/styles'],
    }),
    new copyPlugin([
      {
        from: './src',
        to: '',
        ignore: ['js/**/*', 'scss/**/*'],
      },
    ]),
    new copyPlugin([
      {
        from: './src/lang',
        to: '/lang',
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
}

module.exports = [config]
