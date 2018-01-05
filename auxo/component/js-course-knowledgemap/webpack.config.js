const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
  context: path.resolve(__dirname, './src'),
  entry: {
    knowledgemap: [
      './knowledgemap',
    ],
    rank: [
      './rank',
    ],
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: '[name].js',
  },

  resolve: {
    extensions: ['.js'],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        exclude: /(node_modules|dist)/,
        use: 'babel-loader',
      },

      {
        test: /\.html$/,
        include: path.resolve(__dirname, './src'),
        use: 'html-loader',
      },
    ],
  },
};

webpackConfig.externals = {
  knockout: 'ko',
};

module.exports = webpackConfig;
