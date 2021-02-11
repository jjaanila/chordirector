const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  entry: {
    index: path.resolve('./src/index'),
    background: path.resolve('./src/background'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  devtool: 'source-map',
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
          from: path.resolve('./src/index.html'),
          to: '.',
        },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
  },
};

module.exports = config;
