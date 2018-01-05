'use strict'

require('babel-polyfill')
require('core-js/fn/object/assign')
global.Intl = require('intl')
require('intl/locale-data/jsonp/zh')
require('intl/locale-data/jsonp/en')

import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'

chai.use(chaiEnzyme())


// Add support for all files in the test directory
const testsContext = require.context('.', true, /(\.test\.js$)|(Helper\.js$)/)
testsContext.keys().forEach(testsContext)
