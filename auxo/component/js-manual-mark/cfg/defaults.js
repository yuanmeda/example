'use strict';

const path = require('path');
const srcPath = path.join(__dirname, '/../src');
const defaultPort = 8000;

const additionalPaths = path.join(__dirname, '/../node_modules/@sdp.nd');

function getDefaultModules() {
  return {
    // preLoaders: [
    //   {
    //     test: /\.(js|jsx)$/,
    //     include: srcPath,
    //     loader: 'eslint-loader'
    //   }
    // ],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: [additionalPaths, srcPath]
      },
      {
        test: /\.css$/,
        include: [additionalPaths, path.resolve(__dirname, '../src/theme/styles')],
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.css$/,
        exclude: [additionalPaths, path.resolve(__dirname, '../src/theme/styles')],
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]!postcss-loader'
      }, {
        test: /\.sass/,
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded&indentedSyntax'
      }, {
        test: /\.scss/,
        exclude: path.resolve(__dirname, '../src/styles'),
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]-[hash:base64:5]!sass-loader?outputStyle=expanded!postcss-loader'
      }, {
        test: /\.scss/,
        include: path.resolve(__dirname, '../src/styles'),
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded!postcss-loader'
      }, {
        test: /\.less/,
        loader: 'style-loader!css-loader!less-loader!postcss-loader'
      }, {
        test: /\.styl/,
        loader: 'style-loader!css-loader!stylus-loader!postcss-loader'
      }, {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?limit=10000'
      }, {
        test: /\.(mp4|ogg|svg)$/,
        loader: 'file-loader'
      }, { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" }, {
        test: /\.(woff|woff2)$/, loader: "url?prefix=font/&limit=5000"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml"
      }
    ],
    postLoaders: [{
      test: /\.(js|jsx)$/,
      loaders: ['es3ify-loader'],
      include: [
        path.join(__dirname, '/../src'),
        // 重新编译node_modules下的一些库，让他们支持ie8
        path.join(__dirname, '/../node_modules/@sdp.nd'),
        path.join(__dirname, '/../node_modules/axios'),
        path.join(__dirname, '/../node_modules/moment'),
        path.join(__dirname, '/../node_modules/redux-action')
      ]
    }],
  };
}
const browsers = ["> 5%", "ie >= 8"]
function getDefaultPostcss() {
  return [
    require('postcss-import')({
      path: srcPath + '/theme/styles'
    }),
    require('postcss-assets')({
      relative: true,
      loadPaths: [srcPath + '/static/images']
    }),
    require('postcss-cssnext')({
      browsers,
      features: {
        customProperties: {
          variables: require(srcPath + '/theme/styles/variables.js')
        },
        autoprefixer: true
      }
    }),
    // require('autoprefixer')({ browsers: browsers }),
    require('postcss-browser-reporter'),
    require('postcss-reporter')
  ]
}

module.exports = {
  srcPath: srcPath,
  publicPath: process.env.NODE_ENV === 'production' ? 'assets/' : '', // dist时使用相对路径
  port: defaultPort,
  getDefaultModules: getDefaultModules,
  getDefaultPostcss: getDefaultPostcss
};
