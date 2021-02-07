/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BrowserExtensionPlugin = require('extension-build-webpack-plugin');

const config = {
  entry: {
    main: path.resolve('./src/index'),
    background: path.resolve('./src/background'),
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|jpe?g|gif|jp2|webp)$/,
        loader: 'file-loader',
      },
    ],
  },
  devtool: 'source-map',
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('./images'),
          to: './images',
        },
        {
          from: path.resolve('./manifest.json'),
          to: '.',
        },
        {
          from: path.resolve('./src/main.html'),
          to: '.',
        },
      ],
    }),
    new BrowserExtensionPlugin({ devMode: false, name: 'my-first-webpack.zip', directory: 'src', updateType: 'minor' }),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/', // Required for react-router + webpack-dev-server. Removal breaks nested paths
  },
};

module.exports = config;
