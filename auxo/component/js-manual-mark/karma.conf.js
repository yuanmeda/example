var webpackCfg = require('./webpack.config');

// Set node environment to testing
process.env.NODE_ENV = 'test';

module.exports = function (config) {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    files: ['test/index.js'],
    port: 8000,
    frameworks: [
      'mocha', 'chai'
    ],
    singleRun: true,
    reporters: [
      'mocha', 'progress', 'coverage'
    ],
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackCfg,
    // plugins: [
    //   'karma-chai',
    //   'karma-coverage',
    //   'karma-mocha',
    //   'karma-mocha-reporter',
    //   'karma-phantomjs-launcher',
    //   'karma-sinon-chai',
    //   'karma-sourcemap-loader',
    //   'karma-webpack'
    // ],
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' }
      ]
    }
  });
};
