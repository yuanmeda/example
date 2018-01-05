(function ($, window) {
    var ajustTimeString = function (date) {
        if (!date)
            return null;
        date = date.replace('T', ' ');
        date = date.replace(/-/g, '/');
        date = date.substring(0, date.indexOf('.')) + ' ' + date.substring(date.indexOf('.') + 4);
        return date;
    };

    var stringToDate2 = function (date) {
        date = ajustTimeString(date);
        return Date.parse(date);
    };

    var store = {
        getUcToken: function () {
            var __mac = JsMAF.getAuthHeader('http://www.sdp.nd/valid', 'GET'),
                access_token,
                nonce,
                mac;

            access_token = __mac.match(new RegExp('id=\"([^\"]+)\"'))[1];
            nonce = __mac.match(new RegExp('nonce=\"([^\"]+)\"'))[1];
            mac = __mac.match(new RegExp('mac=\"([^\"]+)\"'))[1];

            return $.ajax({
                url: ucUrl + 'tokens/' + access_token + '/actions/valid',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    "mac": mac,
                    "nonce": nonce,
                    "http_method": "GET",
                    "request_uri": '/valid',
                    "host": 'www.sdp.nd'
                })
            });
        },
        navs: function () {
            return $.ajax({
                url: '/v1/center/menu'
            })
        }
    };


    var viewModel = {
        model: {
            currentNav: 0,
            navs: []
        },
        init: function () {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.onmessage();

            if (userId) {
                store.navs().done(function (d) {
                    t.model.currentNav(d.items[0].current_nav);
                    t.model.navs(d.items);
                    t.buildFrame(d.items[0]);
                });
            } else {
                location.href = '/login';
            }
        },
        onmessage: function () {
            function message(ret) {
                var data = JSON.parse(ret.data);
                switch (data.type) {
                    case '$navtochat':
                        location.href = '/social?nav=7';
                        break;
                    case 'iframe-resize':
                        if (data.height < 1000)
                            $('#js_frame').height(1000);
                        else
                            $('#js_frame').height(data.height);
                        break;
                }
            }

            if (window.addEventListener) {
                window.addEventListener("message", message, false);
            } else if (window.attachEvent) {
                window.attachEvent('onmessage', message);
            }
        },
        tabClick: function (obj) {
            this.model.currentNav(obj.current_nav);
            this.buildFrame(obj);
        },
        buildFrame: function (nav) {
            var t = this;
            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    var url = '';
                    switch (nav.current_nav) {
                        case 30://"我的资源"
                            url = t.url_by_myResource(nav);
                            break;
                        case 31://"我的学习"
                            url = t.url_by_myStudy(nav);
                            break;
                        case 32://"我的作业"
                            url = t.url_by_homeWork(nav);
                            break;
                        case 33://"我的班级"
                            url = t.url_by_myClass(nav);
                            break;
                        case 35://"我的收益"
                            url = t.url_by_myIncome(nav);
                            break;
                        case 37://我的网盘
                            url = t.url_by_wp(nav);
                            break;
                        case 38://个人履历
                            url = t.url_by_userdata(nav);
                            break;
                        case 39://我的孩子
                            url = t.url_by_myChild(nav);
                            break;
                        case 40://"我的家长"
                            url = t.url_by_myParent(nav);
                            break;
                        case 41://我的任务
                            url = t.url_by_myTask(nav);
                            break;
                    }

                    if (url)
                        $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
                } else {
                    location.href = '/login';
                }
            });
        },
        url_by_myTask: function (nav) {
            var projectCode = 'sfjdev';
            switch (roleName) {
                case 'guardian':
                    projectCode = 'pfjdev';
                    break;
                case 'student':
                    projectCode = 'sfjdev';
                    break;
                case 'teacher':
                    projectCode = 'tfjdev';
                    break;
            }
            var url = nav.url + '/' + projectCode + '/mytask';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '?__mac=' + mac;
        },
        url_by_userdata: function (nav) {
            var projectCode = 'sfjdev';
            switch (roleName) {
                case 'guardian':
                    projectCode = 'pfjdev';
                    break;
                case 'student':
                    projectCode = 'sfjdev';
                    break;
                case 'teacher':
                    projectCode = 'tfjdev';
                    break;
            }
            var url = nav.url + '/' + projectCode + '/resume/showforeign/' + userId;
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));
            return url + '?__mac=' + mac;
        },
        url_by_wp: function (nav) {
            var url = nav.url;

            store.getUcToken().done(function (token) {
                token.adjusttime = new Date().getTime() - stringToDate2(token.server_time);
                url += '?teacher_id=' + token.user_id + '&token=' + token.access_token + '&mac_key=' + token.mac_key + "&adjust_time=" + token.adjusttime;
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            });
        },
        url_by_myStudy: function (nav) {
            var projectCode = 'sfjdev';
            switch (roleName) {
                case 'guardian':
                    projectCode = 'pfjdev';
                    break;
                case 'student':
                    projectCode = 'sfjdev';
                    break;
                case 'teacher':
                    projectCode = 'tfjdev';
                    break;
            }
            var url = nav.url + '/' + projectCode + '/mystudy/user_center?pure=999';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '&__mac=' + mac + '#my-study';
        },
        url_by_homeWork: function (nav) {
            var homeWorkUrl = nav.url;

            var hash = '/#/jump?from=elearning&to=index&style=common';
            var mac = JsMAF.getAuthHeader('http://sdp.nd' + hash, 'INVOKE');
            mac = encodeURIComponent(base64_encode(mac));

            var url = homeWorkUrl + hash + '&__mac=' + mac;

            return url;
        },
        url_by_myIncome: function (nav) {
            return nav.url + '/user-center/income-third';
        },
        url_by_myResource: function (nav) {
            return nav.url + '/user-center/download-third';
        },
        url_by_myClass: function (nav) {
            var host = nav.url;
            var path = '/user-center/createClass';
            var url = host + path;
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));
            return url + '?__mac=' + mac
        },
        url_by_myParent: function (nav) {
            var host = nav.url;
            var path = '/user-center/myParents';
            var url = host + path;
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));
            return url + '?__mac=' + mac
        },
        url_by_myChild: function (nav) {
            var host = nav.url;
            var path = '/user-center/myChildren';
            var url = host + path;
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));
            return url + '?__mac=' + mac
        },
        url_by_mySchool: function (nav) {
            var host = nav.url;
            var path = '/user-center/mySchool';
            var url = host + path;
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));
            return url + '?__mac=' + mac
        },
        getIconClass: function (currentNav) {
            var iconClass;
            switch (currentNav) {
                case 30://"我的资源"
                    iconClass = ' icon-resource';
                    break;
                case 31://"我的学习"
                    iconClass = ' icon-learning';
                    break;
                case 32://"我的作业"
                    iconClass = ' icon-homework';
                    break;
                case 33://"我的班级"
                    iconClass = ' icon-class';
                    break;
                case 35://"我的收益"
                    iconClass = ' icon-earnings';
                    break;
                case 37://专属云盘
                    iconClass = ' icon-drive';
                    break;
                case 38://个人资料
                    iconClass = ' icon-data';
                    break;
                case 39://我的孩子
                    iconClass = ' icon-child';
                    break;
                case 40://"我的家长"
                    iconClass = ' icon-parents';
                    break;
                default:
                    iconClass = ' icon-resource';
                    break;
            }
            return iconClass + ' icon-usercenter';
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);