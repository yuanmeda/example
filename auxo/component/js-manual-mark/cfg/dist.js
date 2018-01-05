'use strict';
const CDN = process.env.CDN;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CdnWebpackPlugin = require('cdn-webpack-plugin');
let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

let config = Object.assign({}, baseConfig, {
  entry: path.join(__dirname, '../src/index'),
  cache: false,
  debug: false,
  devtool: false,
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: defaultSettings.getDefaultModules(),
  postcss: defaultSettings.getDefaultPostcss
});

if (CDN) {
  const CDNAddress = {
    development: 'http://static.auxo.dev.huayu.nd/auxo/component/js-manual-mark/dist/'+CDN+'/',
    test: 'http://static.auxo.test.huayu.nd/auxo/component/js-manual-mark/dist/'+CDN+'/',
    preproduction: 'http://r.s1.e.99.com/auxo/component/js-manual-mark/dist/'+CDN+'/',
    product: 'http://s11.e.99.com/auxo/component/js-manual-mark/dist/'+CDN+'/',
    aws: 'http://s1.e.aws.101.com/auxo/component/js-manual-mark/dist/'+CDN+'/',
    'aws-california': 'http://s1.e.awsca.101.com/auxo/component/js-manual-mark/dist/'+CDN+'/'
  }[CDN];

  config.output.publicPath = CDNAddress;
  config.output.path = path.join(__dirname, `/../dist/${CDN}`);
}

module.exports = config;
