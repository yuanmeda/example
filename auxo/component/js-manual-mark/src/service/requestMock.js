import $ from 'jquery'
import _ from 'lodash'
import CryptoJS from './hmac-sha256'
import baseConfig from './request-config'
import CORS from './cors-custom'
$.support.cors = true;

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
  var hasAuth = true;
  var isIELower = CORS.isIELower();
  var then = function (sclb, eclb) {
    if(baseConfig.token != null && hasAuth){
      request_config.beforeSend = function (request) {
        let auth = RestRequest.getAuthorization(request_config.url, request_config.type);
        if(auth){
          request.setRequestHeader('Authorization', auth);

          if(request_config.url.indexOf(baseConfig.host) != -1 || request_config.url.indexOf(baseConfig.gateway) != -1) {
            request.setRequestHeader('X-Gaea-Authorization', baseConfig.gaea_id);
          }
        }
      }
    }

    request_config.success = function (data) {
      if (typeof (sclb) == "function") {
        if (isIELower && CORS.isXDomain(request_config.url)) {
          if (data) {
            sclb(JSON.parse(data));
          } else {
            sclb();
          }

        } else {
          sclb(data);
        }
      }
    };
    request_config.error = function (data) {
      errorInfoShow(data);
      if (typeof (eclb) == "function")
        eclb(data);

    };
    if (isIELower && CORS.isXDomain(request_config.url)) {
      request_config.headers = {"Content-Type": 'application/json', "Accept-Language": "zh-CN"};
      if (hasAuth) {
        var gaea_id = baseConfig.gaeConfig;

        if(request_config.url.indexOf(baseConfig.host) != -1 || request_config.url.indexOf(baseConfig.gateway) != -1) {
          request_config.headers = $.extend({
            "Authorization": RestRequest.getAuthorization(request_config.url, request_config.type),
            'X-Gaea-Authorization': gaea_id?gaea_id:'GAEA id="RwU/Ea32iQw="'
          }, request_config.headers);
        } else {
          request_config.headers = $.extend({
            "Authorization": RestRequest.getAuthorization(request_config.url, request_config.type),
          }, request_config.headers);
        }
      }
      var type = request_config.type;
      request_config.type = "POST";
      request_config.data = CORS.encodeData(type, request_config.data, $.extend({"Host": (host || baseConfig.host).replace("http://", "").replace("https://", "")}, request_config.headers));
    }
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
            _.each(params, function (value, key) {
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
      hasAuth = false;
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


RestRequest.HmacAuth = function (token, hmackey, url, host, method, timeDifference) {
  var rtnArray = [];
  var sbRawMac = [];
  var dateNowServer = new Date().getTime() + (timeDifference || 0);
  var nonce = [dateNowServer, ':', CryptoJS.lib.WordArray.random(4)].join('');
  if(url.indexOf('$filter') != -1) {
    url = encodeURI(url)
  }
  sbRawMac.push(nonce);
  sbRawMac.push("\n");
  sbRawMac.push(method.toUpperCase());
  sbRawMac.push("\n");
  sbRawMac.push(url);
  sbRawMac.push("\n");
  sbRawMac.push(host);
  sbRawMac.push("\n");
  rtnArray.push('MAC id="');
  rtnArray.push(token);
  rtnArray.push('",nonce="');
  rtnArray.push(nonce);
  rtnArray.push('",mac="');
  rtnArray.push(CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(sbRawMac.join(''), hmackey)));
  rtnArray.push('"');
  return rtnArray.join('');
};

RestRequest.getAuthorization = function (url, method) {
  var host = url.split('//')[1].split('/')[0];
  var token = baseConfig.token;
  var shortUrl = url.split(host)[1];
  return RestRequest.HmacAuth(token.access_token, token.mac_key, shortUrl, host, method, token.timeDifference);
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
