import _ from 'lodash'
import CryptoJS from './hmac-sha256'
import baseConfig from './request-config'

var requestCount = 0;
var setLoadingDataTimer = function (isloading) {
  if (isloading) {
    requestCount++;
  } else {
    requestCount--;
  }

  setTimeout(()=> {
    if (requestCount > 0) {
      baseConfig.showPreloader();
    } else if (requestCount === 0) {
      baseConfig.hidePreloader();
    }
  }, baseConfig.loadingDelay);
};

var errorInfoShow = function (data) {
  switch (data.status) {
    case 0:
      baseConfig.toast('网络连接出错，请重试', 2000);
      break;
    case 404:
      baseConfig.toast('服务端异常，请联系管理员', 2000);
      break;
    default:
      showErrorMsg(data);
      break;
  }
  function showErrorMsg(data) {
    if (data.responseText != null && data.responseText) {
      var message = JSON.parse(data.responseText).message == undefined ? "" : JSON.parse(data.responseText).message;
      baseConfig.toast(message)
    }
  }
};

var request = function (host) {
  var request_config = {
    contentType: 'application/json; charset=utf-8',
    timeout: 30000
  };
  var then = function (sclb, eclb) {
    request_config.beforeSend = function (request) {
      if(request_config.url.indexOf(window.elearningManualMarkUrl) == -1 && request_config.url.indexOf(window.gateway) == -1) {
        request_config.headers = $.extend({
          "X-Gaea-Authorization": undefined,
        }, request_config.headers);
      }
    }

    request_config.success = function (data) {
      if (typeof (sclb) == "function") {
        if (data) {
          sclb(data);
        } else {
          sclb();
        }
      }
    };
    request_config.error = function (data) {
      errorInfoShow(data);
      if (typeof (eclb) == "function")
        eclb(data);

    };

    $.ajax(request_config);
  };
  return {
    url: function (url) {
      request_config.url = [(host || baseConfig.host), url].join('');
      return {
        get: function (params) {
          request_config.type = 'GET';
          if (params) {
            var paramArr = [];
            _.forEach(params, function (value, key) {
              if (!_.isNull(value) && !_.isUndefined(value)) {
                if(_.isArray(value)) {
                  _.each(value, function(v) {
                    paramArr.push(key + '=' + v);
                  })
                } else {
                  paramArr.push(key + '=' + value);
                }
              }
            });
            request_config.url += '?' + paramArr.join('&');
          }
          return {
            then: then
          }
        },
        post: function (params) {
          request_config.type = 'POST';
          request_config.data = JSON.stringify(params);
          return {
            then: then
          }
        },
        put: function (params) {
          request_config.type = 'PUT';
          request_config.data = JSON.stringify(params);
          return {
            then: then
          }
        },
        delete: function (params) {
          request_config.type = 'DELETE';
          request_config.data = JSON.stringify(params);
          return {
            then: then
          }
        }
      }
    },
    withoutAuth: function () {
      return this;
    },
    version: function (version) {
      request_config._version = version;
      return this;
    }

  }
};


var RestRequest = function (host) {
  return new request(host);
};

//封装的无需权限验证的请求方法
var NoAuthRestRequest = function (host) {
  return RestRequest(host).withoutAuth();
};

export default {
  NoAuthRestRequest: NoAuthRestRequest,
  RestRequest: RestRequest,
  config: baseConfig
}
