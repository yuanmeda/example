const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './example/entry.js'
  },
  output: {
    path: '/dist',
    filename: '[name].js'
  },
  module:{
    rules:[
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
      {
        test: /\.png$/,
        loader: 'url-loader',
        exclude: /node_modules/
      },
      {
        test: /\.eot$|\.svg$|\.ttf|\.woff/,
        loader: 'url-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      'component':path.resolve(__dirname, 'src')
    }
  },
  devtool: '#source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    publicPath: '/',
    port: 10024
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/index.html',
      inject: true
    })
  ]
};