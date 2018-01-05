'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

let config = Object.assign({}, baseConfig, {
  entry: [
    'webpack-hot-middleware/client?reload=true', './src/index'
  ],
  cache: true,
  devtool: 'inline-source-map',
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: defaultSettings.getDefaultModules(),
  postcss: defaultSettings.getDefaultPostcss
});

module.exports = config;
