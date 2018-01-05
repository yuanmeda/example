var CORSCustom={};
(function() {
    var OriginalXMLHttpRequest,  _base,decodeData;

//    if (!(window.XDomainRequest && !(__indexOf.call(window.XMLHttpRequest, "withCredentials") >= 0))) {
//        return;
//    }
    CORSCustom.isIELower = function(){
        return (window.XDomainRequest && window.XMLHttpRequest && new window.XMLHttpRequest().withCredentials==undefined);
    }
    if (!CORSCustom.isIELower()) {
        return;
    }
    OriginalXMLHttpRequest = window.XMLHttpRequest;

    if ((_base = window.location).origin == null) {
        _base.origin = window.location.protocol + '//' + window.location.host;
    }
    decodeData = function(strRes){
        //$body,$headers,$status
        try{
            strRes = JSON.parse(strRes);
        }catch (ex){
            strRes={$statusText:'error',$status:999,$body:strRes}
//            throw new Error("反序列号失败");
        }

        return strRes;
    };
    CORSCustom.encodeData  = function(method, post,  headers){
        var objData = {};
        objData["$method"] = method;
        objData["$body"] = post;
        objData["$headers"] = headers;
        return  JSON.stringify(objData);
    };
    CORSCustom.isXDomain = function(requestUrl) {
        // gjn: replaced the whole function.
        // original is still commented below
        var host = window.location.origin
            .replace('http://', '')
            .replace('https://', '');

        //if host is found, then not XDomain
        if (requestUrl.indexOf(host) > -1) {
            return false;
        }
        //check for relative url
        if (requestUrl.indexOf('http://') < 0 &&
            requestUrl.indexOf('https://') < 0 ) {
            return false;
        }
        return true;
        /*
         if (requestUrl[0] === '/') {
         if (requestUrl.length === 1) {
         return false;
         }
         if (requestUrl[1] === '/') {
         return true;
         } else {
         return false;
         }
         }
         return requestUrl.slice(0, window.location.origin.length) !== window.location.origin;
         */
    };

    window.XMLHttpRequest = (function() {
        function XMLHttpRequest() {}

        XMLHttpRequest.prototype.open = function() {
            var func, method, url, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1,
                _this = this;
            method = arguments[0], url = arguments[1];

            if (!CORSCustom.isXDomain(url)) {
                this.implementation = new OriginalXMLHttpRequest;
                this.implementation.onreadystatechange = function() {
                    var prop, _i, _len, _ref;
                    if (_this.implementation.readyState === 4) {
                        _ref = ['readyState', 'status', 'responseText'];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            prop = _ref[_i];
                            _this[prop] = _this.implementation[prop];
                        }
                    }
                    if (_this.onreadystatechange) {
                        return _this.onreadystatechange();
                    }
                };
                _ref = ['abort', 'getAllResponseHeaders', 'getResponseHeader', 'send', 'setRequestHeader'];
                _fn = function(func) {
                    return _this[func] = function() {
                        var _ref1;
                        return (_ref1 = this.implementation)[func].apply(_ref1, arguments);
                    };
                };
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    func = _ref[_i];
                    _fn(func);
                }
                return this.implementation.open(method, url);
            } else {

                url = url + (url.indexOf('?')==-1?"?":"&") + '$proxy=body';

                this.implementation = new XDomainRequest;
                this.implementation.onload = function() {
                    var objData = decodeData(_this.implementation.responseText);
                    _this.responseText = objData['$body'];//JSON.stringify(objData['$body']);
                    //alert(objData['$body']);
                    //alert(_this.responseText);
                    _this.readyState = 4;
                    _this.statusText = objData['$statusText'];
                    _this.status = parseInt(objData['$status']);
                    _this.getAllResponseHeaders = function(){
                        return objData['$headers'];
                    }
                    if (_this.onreadystatechange) {
                        return _this.onreadystatechange();
                    }
                };
                this.implementation.onerror = function() {
                    _this.responseText = _this.implementation.responseText;
                    _this.readyState = 4;
                    _this.statusText = "error";
                    _this.status = 500;
                    if (_this.onreadystatechange) {
                        return _this.onreadystatechange();
                    }
                };
                // gjn fix (needs to be done)
                this.implementation.onprogress = function () {};
                // end of fix
                this.abort = function() {
                    var _ref1;
                    return (_ref1 = this.implementation).abort.apply(_ref1, arguments);
                };
                this.send = function() {
                    var _ref1;
//                    post = arguments["caller"][2];//ie9不兼容caller
//                    header = arguments["caller"][4];
                    //arguments[0] = encodeData(method,post, header);
                    return (_ref1 = _this.implementation).send.apply(_ref1, arguments);
                };
                _ref1 = ['getResponseHeader', 'getAllResponseHeaders', 'setRequestHeader', 'onprogress', 'ontimeout'];
                _fn1 = function(func) {
                    return _this[func] = function() {};
                };
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    func = _ref1[_j];
                    _fn1(func);
                }
                return this.implementation.open("POST", url);
            }

        };

        return XMLHttpRequest;

    })();

})();

export default CORSCustom;