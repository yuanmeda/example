'use strict';
var auth = {
    keys: {
        'ndr_token': true,
//        'mac_key': true,
        'diff': false,
        'ndr-server-url': true,
        'uid': true,
        'coverage': true,
        'method': true,
        'url': true
    },
    getMacToken: function (upload_param,method, url,server_time) {
        return this.getAuthentization(upload_param,method, url,server_time);
    },
    getQueryParams:function(){
        return this.getQuery();
    },
    createNonce: function (diff,server_time) {
        function rnd(min, max) {
            var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var range = max ? max - min : min, str = '', i, length = arr.length - 1;
            for (i = 0; i < range; i++) {
                str += arr[Math.round(Math.random() * length)];
            }
            return str;
        }
        if(server_time){
            return server_time+(parseInt(diff) || 0) + ':' + rnd(8);
        }else{
            return new Date().getTime() + (parseInt(diff) || 0) + ':' + rnd(8);
        }
    },
    getQuery: function (method, url) {
        this.query = location.search && location.search.substr(1);

        if (!this.query) return {code: 400, message: '参数错误'};
        this.query = this.query.split('&').concat(['method='+method, 'url='+url]);
        var c = {};
        for (var i = 0, len = this.query.length; i < len; i++) {
            var a = this.query[i].split('=');
            if (c[a[0].toLowerCase()] === undefined) {
                c[a[0].toLowerCase()] = a[1];
            }
        }
        this.query = c;
        for (var j in this.keys) {
            if (this.keys[j] && (this.query[j] === undefined || this.query[j] === '' || this.query[j] === 'null')) {
                return {code: 400, message: '参数' + j + '不存在'};
            }
        }
        return this.query;
//        return this.getAuthentization();
    },
    querystring: function (key) {
        return this.query[key];
    },
    getAccessToken: function () {
        return this.querystring('token');
    },
    getAuthentization: function (upload_param,method, url,server_time) {
        return upload_param.token + ','+  this._getNonce(server_time) + ','+ this._getMac(method, url, ('101.com').replace(/(http:\/\/)|(https:\/\/)/,''),upload_param.mac_key) + ','+url+","+"101.com";
//        return ['MAC id="' + upload_param.token + '"',
//                'nonce="' + this._getNonce(server_time) + '"',
//                'mac="' + this._getMac(this.querystring('method'), this.querystring('url'), this.querystring('ndr-server-url').replace(/(http:\/\/)|(https:\/\/)/,'')) + '"'
//        ].join(',');
    },
    _getMacContent: function (method, url, host) {
        return [this.nonce, method, url, host, ''].join('\n');
    },
    _getMac: function (method, url, host,mac_key) {
        return new window.jsSHA(this._getMacContent(method, url, host), 'TEXT')
            .getHMAC(mac_key, 'TEXT', 'SHA-256', 'B64');
    },
    _getNonce: function (server_time) {
        return (this.nonce = this.createNonce(server_time));
    }
};

