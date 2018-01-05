import 'theme/styles/reset.css'
import 'theme/styles/app.css'
import 'babel-polyfill'
import $script from 'scriptjs';
import {loadCSS} from "fg-loadcss"
import config from './service/request-config'
import Request from './service/rest.service'
import CORS from './service/cors-custom'

if (typeof global.Promise === 'undefined') {
  require.ensure([], function () {
    require('es6-promise/auto')
  })
}
const React = require('react')
const render = require('react-dom').render
const Provider = require('react-redux').Provider
const syncHistoryWithStore = require('react-router-redux/lib/sync').default
const configureStore = require('./store/configureStore')
const routes = require('./routes')
const routerHistory = require('react-router').useRouterHistory
const createHistory = require('history').createHashHistory
const store = configureStore()
// 移除react-router自动添加的_k=xxx参数
const hashHistory = routerHistory(createHistory)({queryKey: false})
const history = syncHistoryWithStore(hashHistory, store)

if(CORS.isIELower()) {
  $script(window.staticUrl + "auxo/component/js-manual-mark/src/static/mediaelement-and-player.min.js");
  loadCSS(window.staticUrl + "auxo/component/js-manual-mark/src/static/mediaelementplayer.min.css");
}

$script("http://cs.101.com/v0.1/static/esp_developer/icplayers/7.3.0.3/javascript/mathjax/MathJax.js?config=TeX-AMS-MML_SVG-full,local/local");
$script(['http://cdncs.101.com/v0.1/static/esp_developer/js-library/QtiPlayer/1.1.0/qti-player-all.js'],'player');
$script.ready('player',function(){
  $script(['http://cdncs.101.com/v0.1/static/esp_developer/js-library/NDMediaPlayer/1.0.1/media.js',
    'http://static.auxo.test.huayu.nd//auxo/addins/base64/v1.0.0/base64.js'],'bundle')
});
loadCSS("http://cdncs.101.com/v0.1/static/esp_developer/js-library/NDMediaPlayer/1.0.1/media.css");
loadCSS("http://cdncs.101.com/v0.1/static/esp_developer/js-library/QtiPlayer/1.1.0/qti-player-all.min.css");

//mock数据，token， window对象待处理, ie9下uc无法跨域
if(window.manualMock) {
  Request.mockToken().then(function (data) {
    config.token = data;
    $script.ready('bundle',function(){
      render((
        <Provider store={store}>
          {routes(history)}
        </Provider>
      ), document.getElementById('app'))
    })
  }, function () {
    $script.ready('bundle',function(){
      render((
        <Provider store={store}>
          {routes(history)}
        </Provider>
      ), document.getElementById('app'))
    })
  })
} else {
  $script.ready('bundle',function(){
    render((
      <Provider store={store}>
        {routes(history)}
      </Provider>
    ), document.getElementById('app'))
  })
}
