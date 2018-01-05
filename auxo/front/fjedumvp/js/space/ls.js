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
        navs: function () {
            return $.ajax({
                url: '/fjedu/navs/two/' + currentNav
            })
        },
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
        getRoleName: function (userId) {
            return $.ajax({
                url: '/fjedu/role/get/' + userId
            })
        }
    };

    var ctb_index = 0;
    var ctb_host = '';
    var lastScrollTop = -1;

    var viewModel = {
        model: {
            isVisitor: true,
            adminRole: adminRole,
            title: '',
            showMenu: true,
            currentNav: 0,
            currentUrl: '',
            navs: []
        },
        init: function () {
            var t = this;
            t.onmessage();
            t.postmessage();
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            var nav = t.getQueryStringByName('nav');


            store.navs().done(function (d) {
                t.model.navs(d.items);


                for (var i = 0; i < d.items.length; i++) {
                    var item = d.items[i];
                    if (item.current_nav == nav) {
                        t.model.currentNav(item.current_nav);
                        t.model.currentUrl(item.url);
                        t.model.title(item.title);
                        break;
                    }
                }

                ucManager.isLogin().then(function (res) {
                    if (res == 'true') {
                        store.getRoleName(userId).done(function (role) {
                            if (role.is_visitor == 1) {
                                if (nav)
                                    t.sortUrl();
                            } else {
                                t.model.isVisitor(false);
                                if (nav)
                                    t.frame();
                            }
                        });
                    } else {
                        if (nav)
                            t.sortUrl();
                    }

                    if (nav)
                        t.model.showMenu(false);
                });

            });
        },
        postmessage: function () {
            setInterval(function () {
                var st = document.documentElement.scrollTop || document.body.scrollTop;

                if (window.frames.length) {
                    window.frames[0].postMessage(JSON.stringify({
                        "type": 'setScrollTop',
                        "scrollTop": st,
                        "offsetTop": $('#js_frame').offset().top
                    }), '*');
                }
            }, 500);
        },
        onmessage: function () {
            function adjustIframeHeight(ret) {
                var data = JSON.parse(ret.data);
                if (data.type === 'iframe-resize') {
                    if (data.height < 1000)
                        $('#js_frame').height(1000);
                    else
                        $('#js_frame').height(data.height);
                }
            }

            if (window.addEventListener) {                    //所有主流浏览器，除了 IE 8 及更早 IE版本
                window.addEventListener("message", adjustIframeHeight, false);
            } else if (window.attachEvent) {                  // IE 8 及更早 IE 版本
                window.attachEvent('onmessage', adjustIframeHeight);
            }
        },
        //未登录的时候跳介绍页
        sortUrl: function () {
            var cn = this.model.currentNav(),
                url;
            switch (cn) {
                //作业
                case 8:
                    $('#js_frame').height(1000);
                    url = '/space/homework';
                    break;
                //我的问答
                case 13:
                    $('#js_frame').height(1000);
                    url = '/space/question';
                    break;
                //班级管理
                case 201:
                    $('#js_frame').height(1000);
                    url = '/space/class';
                    break;
                //网盘
                case 202:
                    $('#js_frame').height(1000);
                    url = '/space/drive';
                    break;
                default:
                    location.href = '/login?returnurl=' + location.href;
                    break;
            }

            if (url) {
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            }
        },
        back: function () {
            this.model.showMenu(true);
            this.model.title('');
            this.model.currentNav('');
            this.model.currentUrl('');
            $('#js_frame').html('');
        },
        menuClick: function (obj) {
            var t = this;
            this.model.showMenu(false);
            if (obj.current_nav != 203 && obj.current_nav != 24)
                this.model.title(obj.title);
            this.model.currentNav(obj.current_nav);
            this.model.currentUrl(obj.url);

            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    store.getRoleName(userId).done(function (role) {
                        if (role.is_visitor == 1) {
                            //登录的是游客账号
                            t.sortUrl();
                        } else {
                            //登录的是正常账号
                            t.frame();
                        }
                    });
                } else {
                    t.sortUrl();
                }
            });
        },
        childMenuClick: function (nav, a, evt) {
            if (this.model.isVisitor())
                return;

            $('.edupf-sidebar-list li').removeClass('active');
            $(evt.currentTarget).addClass('active');

            var url = '';
            switch (nav) {
                case 1:
                    //作业-首页
                    url = this.url_by_homework(this.model.currentUrl(), '&to=index');
                    break;
                case 2:
                    //作业-布置作业
                    url = this.url_by_homework(this.model.currentUrl(), '&to=publish.main');
                    break;
                case 3:
                    //作业-我的作业
                    url = this.url_by_homework(this.model.currentUrl(), '&to=manage.homework');
                    break;
                case 4:
                    //作业-统计分析
                    url = this.url_by_homework(this.model.currentUrl(), '&to=manage.statistics');
                    break;
                case 5:
                    //错题本-作业
                    url = this.url_by_ctb(this.model.currentUrl(), 0);
                    break;
                case 6:
                    //错题本-在线学习
                    url = this.url_by_ctb(this.model.currentUrl(), 1);
                    break;
            }

            if (url)
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
        },
        frame: function () {
            var cn = this.model.currentNav(),
                host = this.model.currentUrl(),
                url;

            lastScrollTop = -1;
            $('#js_frame').height(1000);
            $('#ctb_nav').hide();
            switch (cn) {
                //im
                case 7:
                    url = this.url_by_im(host);
                    break;
                //作业
                case 8:
                    url = this.url_by_homework(host);
                    break;
                //明日阅读
                case 9:
                    url = host;
                    break;
                //我的笔记
                case 11:
                    url = this.url_by_note(host);
                    break;
                //通知公告
                case 12:
                    url = host;
                    break;
                //我的问答
                case 13:
                    url = this.url_by_qa(host);
                    break;
                //学情报告
                case 14:
                    url = this.url_by_studyreport(host);
                    break;
                //错题本
                case 15:
                    ctb_host = host;
                    url = this.url_by_ctb(host, ctb_index);
                    $('#ctb_nav').show();
                    break;
                //我的备课
                case 16:
                    url = this.url_by_myclass(host);
                    break;
                //学生学习报告
                case 17:
                    url = this.url_by_xuexibaogao(host);
                    break;
                //家长学习报告
                case 18:
                    url = this.url_by_xuexibaogao2(host);
                    break;
                //学习社区
                case 24:
                    url = host;
                    window.open(url);
                    return;
                //学生、家长 的 学生评价
                case 42:
                    url = this.url_by_studyreport3(host);
                    break;
                //老师的学生评价
                case 43:
                    url = this.url_by_studyreport2(host);
                    break;
                //学习目标
                case 44:
                    url = this.url_my_studyResult(host);
                    break;
                //试卷管理
                case 45:
                    url = this.url_paper_manager(host);
                    break;
                //题库管理
                case 46:
                    url = this.url_question_manager(host);
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

            if (url)
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
        },
        url_question_manager: function (host) {
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

            var url = host + '/' + projectCode + '/bank/list';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '?__mac=' + mac;
        },
        url_paper_manager: function (host) {
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

            var url = host + '/' + projectCode + '/front/paper_bank';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '?__mac=' + mac;
        },
        url_my_studyResult: function (host) {
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
            var url = host + '/bg/index.html#/' + projectCode + '/reach_standard';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '?__mac=' + mac;
        },
        url_by_studyreport3: function (host) {
            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(host, 'GET')));
            return host + '?__mac=' + mac;
        },
        url_by_studyreport2: function (host) {
            var url = host + '/pc/zone/situation/index.html';

            store.getUcToken().done(function (token) {
                url += '?token=' + token.access_token + '&mac_key=' + token.mac_key + '&skin=blue&menu=0#/performance';
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            });
        },
        url_by_ctb: function (host, index) {
            var hostAry = host.split(',');

            var url = hostAry[index];

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '?__mac=' + mac;
        },
        url_by_note: function (host) {
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
            var url = host + '/' + projectCode + '/mystudy/user_center?pure=999';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '&__mac=' + mac + '#my-note';
        },
        url_by_qa: function (host) {
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
            var url = host + '/' + projectCode + '/mystudy/user_center?pure=999';

            var mac = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url, 'GET')));

            return url + '&__mac=' + mac + '#my-question';
        },
        url_by_homework: function (host, h) {
            var homeWorkUrl = host, router = '&to=index';
            if (h)
                router = h;

            var hash = '/#/jump?from=elearning' + router + '&style=common';
            var mac = JsMAF.getAuthHeader('http://sdp.nd' + hash, 'INVOKE');
            mac = encodeURIComponent(base64_encode(mac));

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

            mac = encodeURI(base64_encode(macParams));
            var url = weiboServer + hash + mac;// + '?vorgid=' + orgId;

            return url;
        },
        url_by_class: function (host2) {
            var host = host2.split(',');
            var class101 = host[0];
            var class101Sso = host[1];
            var url = class101 + "/#!/usercenter/class";
            var autoLogin = class101Sso + "/autologin?fromway=" + encodeURIComponent(url) + "&mode=no_session&auth="
            var mac = JsMAF.getAuthHeader(class101Sso + '/', 'GET');
            mac = encodeURI(base64_encode(mac));

            return autoLogin + mac;
        },
        url_by_wp: function (host) {
            var url = host;

            var auth = encodeURIComponent(base64_encode(JsMAF.getAuthHeader(url + '/#', 'GET')));

            return url + '/#/main?platform=fj&auth=' + auth;

            // var url = host;
            //
            // store.getUcToken().done(function (token) {
            //     token.adjusttime = new Date().getTime() - stringToDate2(token.server_time);
            //     url += '?teacher_id=' + token.user_id + '&token=' + token.access_token + '&mac_key=' + token.mac_key + "&adjust_time=" + token.adjusttime;
            //     $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            // });
        },
        url_by_studyreport: function (host) {
            // var url = host + '/pc/zone/situation/index.html';
            //
            // store.getUcToken().done(function (token) {
            //     url += '?token=' + token.access_token + '&mac_key=' + token.mac_key + '&skin=blue&menu=1#/performance';
            //     $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            // });
            return host + '/#/study-situation-analysis/teacher';
        },
        url_by_myclass: function (host) {
            var url = host + '/pc/teacher/sky_driver/prepare.html';
            store.getUcToken().done(function (token) {
                token.adjusttime = new Date().getTime() - stringToDate2(token.server_time);
                url += '?teacher_id=' + token.user_id + '&token=' + token.access_token + '&mac_key=' + token.mac_key + "&adjust_time=" + token.adjusttime;
                $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            });
        },
        url_by_xuexibaogao: function (host) {
            // var url = host + '/pc/zone/index.html';
            // store.getUcToken().done(function (token) {
            //     url += '?token=' + encodeURIComponent(token.access_token) + '&mac_key=' + encodeURIComponent(token.mac_key) + '#/report';
            //     $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            // });
            var path = '/#/study-situation-analysis/student';
            return host + path;
        },
        url_by_xuexibaogao2: function (host) {
            // var url = host + '/pc/zone/index.html';
            // store.getUcToken().done(function (token) {
            //     url += '?token=' + encodeURIComponent(token.access_token) + '&mac_key=' + encodeURIComponent(token.mac_key) + '#/parent';
            //     $('#js_frame').html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
            // });
            var path = '/#/study-situation-analysis/parents';
            return host + path;
        },
        url_by_jybk: function (baikeServer) {
            var url = baikeServer;
            var autoLogin = baikeServer + "/#!/autologin?fromway=" + encodeURIComponent(url) + "&mode=session&auth=";
            var mac = JsMAF.getAuthHeader(baikeServer + '/', 'GET');
            mac = encodeURI(base64_encode(mac));
            return autoLogin + mac;
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        },
        getIcon: function (cn) {
            var iconClass = 'btn ';

            switch (cn) {
                //im
                case 7:
                    iconClass += 'webchat';
                    break;
                //作业
                case 8:
                    iconClass += 'homework-blue';
                    break;
                //明日阅读
                case 9:
                    iconClass += 'tomorrow-reading';
                    break;
                //我的笔记
                case 11:
                    iconClass += 'take-down-yellow';
                    break;
                //通知公告
                case 12:
                    iconClass += 'notice-green';
                    break;
                //我的问答
                case 13:
                    iconClass += 'qa-red';
                    break;
                //学情报告
                case 14:
                    iconClass += 'study-report-green';
                    break;
                //错题本
                case 15:
                    iconClass += 'wrong-question-blue';
                    break;
                //我的备课
                case 16:
                    iconClass += 'mylesson';
                    break;
                //学生学习报告
                case 17:
                    iconClass += 'study-report-green2';
                    break;
                //家长学习报告
                case 18:
                    iconClass += 'study-report-green2';
                    break;
                //学习社区
                case 24:
                    iconClass += 'bbs';
                    break;
                //评价
                case 42:
                case 43:
                    iconClass += 'stu-rank';
                    break;
                case 44:
                    iconClass += 'learning-target';
                    break;
                //试卷管理
                case 45:
                    iconClass += 'papers-manage';
                    break;
                //题库管理
                case 46:
                    iconClass += 'question-bank-manage';
                    break;
                //班级管理
                case 201:
                    iconClass += 'classmanage';
                    break;
                //网盘
                case 202:
                    iconClass += 'drive';
                    break;
                //教育百科
                case 203:
                    iconClass += 'baike';
                    break;
                //朋友圈
                case 204:
                    iconClass += 'moments';
                    break;
            }

            return iconClass;
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);