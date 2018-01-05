(function ($, window) {
    var store = {
        navs: function () {
            return $.ajax({
                url: '/fjedu/navs/two/' + currentNav
            })
        }
    };

    var viewModel = {
        model: {
            currentNav: 8,
            currentUrl: '',
            navs: []
        },
        init: function () {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    store.navs().done(function (d) {
                        t.model.navs(d.items);
                        t.model.currentNav(d.items[0].current_nav);
                        t.model.currentUrl(d.items[0].url);
                        t.frame();
                    });
                }
                else {
                    location.href = '/login?returnurl=' + location.href;
                }
            });
        },
        tab: function (obj) {
            this.model.currentNav(obj.current_nav);
            this.model.currentUrl(obj.url);
            this.frame();
        },
        frame: function () {
            var cn = this.model.currentNav(),
                host = this.model.currentUrl(),
                url;

            switch (cn) {
                //im
                case 7:
                    url = this.url_by_im(host);
                    break;
                //作业
                case 8:
                    if (location.href.indexOf('en.101.com') < 0)
                        url = this.url_by_homework(host);
                    else  url = host;
                    break;
                //明日阅读
                case 9:
                    url = host;
                    break;
                //班级管理
                case 201:
                    url = this.url_by_class(host);
                    break;
                //网盘
                case 202:
                    url = this.url_by_wp(host);
                    break;
                //教育百科
                case 203:
                    url = this.url_by_jybk(host);
                    window.open(url);
                    return;
                //朋友圈
                case 204:
                    url = this.url_by_pyq(host);
                    break;
            }

            $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
        },
        url_by_homework: function (host) {
            var homeWorkUrl = host;

            var hash = '/#/jump?from=elearning&to=index&style=common';
            var mac = JsMAF.getAuthHeader('http://sdp.nd' + hash, 'INVOKE');
            mac = encodeURIComponent(window.btoa(mac));

            var url = homeWorkUrl + hash + '&__mac=' + mac;

            return url;
        },
        url_by_im: function (imUrl) {
            var host = imUrl + '/';
            var macToken = encodeURIComponent(JsMAF.getAuthHeader(host, 'GET'));
            var url = host + 'sso/' + '?auth=' + macToken + '&app=101edu';

            return url;
        },
        url_by_pyq: function (weiboServer) {
            function getHost(host) {
                if (host.indexOf("http://") != -1) {
                    host = host.substring("http://".length);
                }
                if (host.indexOf("https://") != -1) {
                    host = host.substring("https://".length);
                }
                return host;
            }

            var hash = '/#/login/';
            var mac = JsMAF.getAuthHeader(weiboServer + '/', 'GET');
            var macParams = 'Authorization: ' + mac + ',request_uri="/",host="' + getHost(weiboServer) + '"';

            mac = encodeURI(window.btoa(macParams));
            var url = weiboServer + hash + mac;

            return url;
        },
        url_by_class: function (host2) {
            var host = host2.split(',');
            var class101 = host[0];
            var class101Sso = host[1];
            var url = class101 + "/#!/usercenter/class";
            var autoLogin = class101Sso + "/autologin?fromway=" + encodeURIComponent(url) + "&mode=no_session&auth="
            var mac = JsMAF.getAuthHeader(class101Sso + '/', 'GET');
            mac = encodeURI(window.btoa(mac));

            return autoLogin + mac;
        },
        url_by_wp: function (host) {
            var url = 'http://h.101.com/pc/teacher/sky_driver/resource.html';
            if (false) {
                var token = {};
                return url + '?teacher_id=' + token.user_id + '&token=' + token.access_token + '&mac_key=' + token.mac_key;
            } else {
                return url;
            }
        },
        url_by_jybk: function (baikeServer) {
            var url = baikeServer;
            var autoLogin = baikeServer + "/#!/autologin?fromway=" + encodeURIComponent(url) + "&mode=session&auth=";
            var mac = JsMAF.getAuthHeader(baikeServer + '/', 'GET');
            mac = encodeURI(window.btoa(mac));
            return autoLogin + mac;
        }

    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);