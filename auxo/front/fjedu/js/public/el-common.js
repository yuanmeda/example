// 此文件用于注入elearning头部的处理
(function ($, window) {
    var store = {
        getNav: function () {
            return $.ajax({
                url: mainUrl + '/fjedu/navs'
            })
        },
        getRoleName: function (userId) {
            return $.ajax({
                url: mainUrl + '/fjedu/role/get/' + userId,
            })
        },
        setRole: function (role) {
            return $.ajax({
                url: mainUrl + '/fjedu/role/set?role_name=' + role
            })
        },
        user: function (role) {
            return $.ajax({
                url: mainUrl + '/fjedu/learn_user?role_name=' + role
            })
        },
        getHomeWork: function () {
            var data = {
                offset: 0,
                limit: 3
            };

            var url;

            if (viewModel.account.role_name == 'student') {
                url = mainUrl + '/fjedu/homeworks/student';
                data.type = 'todo';
            } else {
                url = mainUrl + '/fjedu/homeworks/todo';
                data.todo_type = 'correct';
            }

            return $.ajax({
                url: url,
                data: data
            })
        },
        getNotices: function () {
            var server = typeof noteUrl == 'undefined' ? 'http://notice.web.sdp.101.com' : noteUrl;
            var url = server + "/v0.2/received_notices?$offset=0&$limit=99&$count=true";
            var mac = JsMAF.getAuthHeader(url, 'GET');

            return $.ajax({
                url: url,
                cache: true,
                headers: {
                    "Authorization": mac,
                    "vorg": typeof orgName == 'undefined' ? 'V_ORG_K12_PROD' : orgName,
                    'X-Gaea-Authorization': undefined
                }
            });
        }
    };

    var viewModel = {
        account: {
            is_visitor: 1,
            role_name: 'student'
        },
        type: '资源',
        init: function () {
            this.navs();
            this.navSecond();
            this.uc();
            this.registerEvents();
            this.commonEvent();
            document.title = document.title + '-福建省教育信息化统一平台';
        },
        notLoginSwitchRole: function (evt) {
            var role = $(evt.currentTarget).data('role');
            $(evt.currentTarget).parent().hide();
            $('#js_current_role').html('<i class="loading"></i>');
            this.switchRole(role);
        },
        loginSwitchRole: function (evt) {
            var role = $(evt.currentTarget).data('role');

            if (role == this.account.role_name)
                return;

            this.switchRole(role);
        },
        switchRole: function (role) {
            if (this.account.is_visitor) {
                ucManager.logOut().then(function (res) {
                    if (res == "success") {
                        store.user(role).done(function (d) {
                            ucManager.login(d.account, d.password).then(function (res) {
                                if (typeof res == "object") {
                                    location.href = mainUrl + '/home';
                                }
                            });
                        });
                    }
                });
            } else {
                store.setRole(role).done(function () {
                    location.href = mainUrl + '/home';
                });
            }
        },
        uc: function () {
            var t = this;
            var userInfo = elearningHeaderManager.getUserInfo();

            ucManager.isLogin().then(function (res) {
                if (res == "true") {
                    ucManager.getUserInfo().then(function (res) {
                        if (typeof res == "object" && undefined != res.user_id) {
                            store.getRoleName(res.user_id).done(function (data) {
                                t.account = data;
                                t.nextStep(res);
                            });
                        } else {
                            t.nextStep();
                        }
                    });
                } else {
                    if (userInfo && userInfo.id)
                        location.href = elearningHeaderManager.getLogoutUrl();

                    t.nextStep();
                }
            });

        },
        doLogin: function () {
            var t = this,
                $jsnotices = $('#js_notices'),
                $hintline = $('.hint-line');

            switch (t.account.role_name) {
                case 'student':
                    store.getHomeWork().done(function (d) {
                        d.count && $('#js_homework_count').show().text(d.count)
                        $('.isstudent').show();
                    });
                    break;
                case 'teacher':
                    this.pptproxy();
                    store.getHomeWork().done(function (d) {
                        d.count && $('#js_homework_count').show().text(d.count)
                        $('.isteacher').show();
                    });
                    break;
                case 'guardian':
                    $('.isparents').show();
                    break;
            }

            store.getNotices().done(function (d) {
                var str = [], length = d.items.length;

                if (length > 0) {
                    for (var i = 0; i < length; i++) {
                        var item = d.items[i];
                        if (item.is_readed == 0) {
                            str.push('<li class="clearfix"><a class="title" href="/ls?nav=12">' + item.title + '</a><a class="status" href="/ls?nav=12">查看</a></li>');
                        }
                        if (str.length >= 3)
                            break;
                    }

                    if (str.length > 0) {
                        $jsnotices.html(str.join(''));
                        $hintline.show();
                    }
                }
            });
        },
        sidebarClick: function (evt) {
            var type = $(evt.currentTarget).data('type');
            switch (type) {
                case 1:
                    //作业
                    location.href = mainUrl + '/ls?nav=8';
                    break;
                case 2:
                    //通知公告
                    location.href = mainUrl + '/ls?nav=12';
                    break;
                case 3:
                    //我的备课
                    location.href = mainUrl + '/ls?nav=16';
                    break;
                case 4:
                    //教育百科
                    var baikeUrl = 'http://baike.101.com';
                    var url = baikeUrl;
                    var autoLogin = baikeUrl + "/#!/autologin?fromway=" + encodeURIComponent(url) + "&mode=session&auth=";
                    var mac = JsMAF.getAuthHeader(baikeUrl + '/', 'GET');
                    mac = encodeURI(window.btoa(mac));
                    window.open(autoLogin + mac);
                    break;
                case 5:
                    //笔记
                    location.href = mainUrl + '/ls?nav=11';
                    break;
                case 6:
                    //我的课程
                    location.href = elearningUrl + '/' + projectCode + '/mystudy/user_center';
                    break;
                case 7:
                    //问答社区
                    window.open('http://forum-web.social.web.sdp.101.com/fjedu');
                    break;
                case 8:
                    //老师学习报告
                    location.href = mainUrl + '/ls?nav=18';
                    break;
                case 9:
                    //制作课件
                    var userInfo = elearningHeaderManager.getUserInfo();
                    var pptshell = "pptshell:id=3006cc7c-9b2a-4c96-be96-3c8a8051dbfd,chapter_id=,mode=preview";
                    if (userInfo.id) {
                        pptshell += ',auth=' + btoa(JsMAF.getAuthHeaderByHost('class.101.com', '3006cc7c-9b2a-4c96-be96-3c8a8051dbfd', "POST"));
                    }
                    else {
                        pptshell += ',frm=101';
                    }
                    window.open(pptshell, "_top");
                    break;
            }
        },
        nextStep: function (res) {
            if (!this.account.is_visitor) {
                $('#js_create').attr('href', opencourseUrl2 + '/' + projectCode + '/open_course/course_upload');
                $('.username').text(res.nick_name ? res.nick_name : (res.org_exinfo.real_name ? res.org_exinfo.real_name : res.user_id));
                $('.userlogo').attr('src', 'http://cdncs.101.com/v0.1/static/cscommon/avatar/' + res.user_id + '/' + res.user_id + '.jpg?size=80&defaultImage=1');
                $('.islogin').show();
                $('.notlogin').hide();
                this.doLogin();
            } else {
                $('#js_create').attr('href', mainUrl + '/login?returnurl=' + location.href);
                $('#js_login').attr('href', mainUrl + '/login?returnurl=' + location.href);
                $('.islogin').hide();
                $('.notlogin').show();
            }

            switch (this.account.role_name) {
                case 'student':
                    $('.role-content a[data-role="student"]').addClass('checked');
                    $('#js_login_current_role').text('学生');
                    $('#js_current_role').html('我是学生<i class="triangle-down"></i>');
                    $('#js_user_center').attr('href', elearningUrl + '/k12/mystudy/user_center');
                    break;
                case 'teacher':
                    $('.role-content a[data-role="teacher"]').addClass('checked');
                    $('#js_login_current_role').text('老师');
                    $('#js_current_role').html('我是老师<i class="triangle-down"></i>');
                    $('#js_user_center').attr('href', elearningUrl + '/fjedu/mystudy/user_center');
                    break;
                case 'guardian':
                    $('.role-content a[data-role="guardian"]').addClass('checked');
                    $('#js_login_current_role').text('家长');
                    $('#js_current_role').html('我是家长<i class="triangle-down"></i>');
                    $('#js_user_center').attr('href', elearningUrl + '/pfjedu/mystudy/user_center');
                    break;
                default:
                    $('#js_user_center').parent().remove();
                    break;
            }
        },
        registerEvents: function () {
            //退出账号 切换账号
            $('#logout').on('click', $.proxy(this.logout, this));
            $('#logout2').on('click', $.proxy(this.logout2, this));
            //搜索
            $('#search').on('click', $.proxy(this.search, this));
            $('#searchval').on('keydown', $.proxy(this.keydown, this));
            $('#js_types a').on('click', $.proxy(this.selectType, this));
            $('.search-conditions').on('click', $.proxy(this.switchType, this));
            $('#searchval').on('click', $.proxy(this.inputClick, this));
            //角色切换
            $('#js_roles a').on('click', $.proxy(this.notLoginSwitchRole, this));
            $('.js_role_choose').on('click', $.proxy(this.loginSwitchRole, this));
            //个人中心操作栏
            $('#js_user_tabs li').on('click', $.proxy(this.sidebarClick, this));
        },
        navs: function () {
            // 1级导航
            store.getNav().done(function (d) {
                var result = [];
                for (var i = 0; i < d.items.length; i++) {
                    var nav = d.items[i];
                    if (nav.status != 1)
                        return;

                    if (nav.url)
                        result.push('<li><a target="' + (nav.open_type == 1 ? '_blank' : '_self') + '" href="' + nav.url + '">' + nav.title + '</a></li>');
                    else
                        result.push('<li><a href="javascript:;">' + nav.title + '</a></li>');
                }
                $('#js_nav').html(result.join(''));

                var inStr = '在线学习,学习,家长课堂';
                if (location.href.indexOf('/famous') >= 0)
                    inStr = '名校名师';

                $("#js_nav li").filter(function () {
                    return inStr.indexOf($(this).text()) >= 0;
                }).addClass('active');
            });
        },
        navSecond: function () {
            var userInfo = elearningHeaderManager.getUserInfo();
            //elearning2级导航
            var channels = projectConfig.channels || projectConfig.channel, result = [];
            for (var i = 0; i < channels.length; i++) {
                var channel = channels[i], id = channel.channel_id || channel.id;

                if (!userInfo.id && channel.alias == '我的课程') {
                    result.push('<li"><a href="' + mainUrl + '/login">' + channel.alias + '</a></li>')
                } else
                    result.push('<li class="' + (id == window.channelId ? 'active' : '') + '"><a href="' + portalUrl + '/' + projectCode + '/channel/' + id + '">' + channel.alias + '</a></li>')
            }
            $('#js_channel_nav').html(result.join(''));
            $('#js_create').show();
        },
        logout: function () {
            ucManager.logOut().then(function (res) {
                if (res == "success") {
                    location.href = elearningHeaderManager.getLogoutUrl();
                } else {
                    alert("fail:" + res);
                }
            });
        },
        logout2: function () {
            ucManager.logOut().then(function (res) {
                //退出成功
                if (res == "success") {
                    location.href = mainUrl + "/login";
                } else {
                    alert("fail:" + res);
                }
            });
        },
        switchType: function () {
            $('#js_types').toggle();
            evt.stopPropagation();
        },
        inputClick: function () {
            $('#js_types').hide();
            evt.stopPropagation();
        },
        selectType: function (evt) {
            var tx = $(evt.currentTarget).text();
            this.type = tx;
            $('#js_stype').text(tx);
            $('#js_types').hide();
            evt.stopPropagation();
        },
        keydown: function (evt) {
            if (evt.keyCode == 13) {
                this.go();
                return false;
            }
        },
        search: function () {
            this.go();
            return false;
        },
        go: function () {
            var url = '', keyword = encodeURIComponent($('#searchval').val());
            switch (this.type) {
                case '资源':
                    url = resourceUrl + '/doSearch?keyword=' + keyword;
                    break;
                case '新闻':
                    url = newsUrl + '/fjedu#/search/' + keyword;
                    break;
                case '应用':
                    url = resourceUrl + '/store-search?keyword=' + keyword + '&type=system_app';
                    break;
                case '课程':
                    if (this.account.role_name == 'teacher')
                        url = channelUrl + '/fjedu/search?keyword=' + keyword;
                    else if (this.account.role_name == 'guardian')
                        url = channelUrl + '/pfjedu/search?keyword=' + keyword;
                    else
                        url = channelUrl + '/k12/search?keyword=' + keyword;
                    break;
                default:
                    url = channelUrl + '/famous/search?keyword=' + keyword;
                    break;
            }
            if (url)
                location.href = url;
        },
        pptproxy: function () {
            function crossDomain(url, fn) {
                iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                var state = 0;
                iframe.onload = function () {
                    if (state === 1) {
                        fn(iframe.contentWindow && iframe.contentWindow.name);
                        iframe.contentWindow.document.write();
                        iframe.contentWindow.close();
                        document.body.removeChild(iframe);
                    } else if (state === 0) {
                        state = 1;
                        iframe.contentWindow.location = '/' + projectCode + '/error/killie';
                    }
                };
                iframe.src = url;
                document.body.appendChild(iframe);
            }

            var url = 'http://127.0.0.1:30002/101ppt.html';
            crossDomain(url, function (data) {
                if (data == '101ppt') {
                    $('.isppt').show();
                }
            });
        },
        commonEvent: function () {
            var isOldBroswer = navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) <= 9;

            //搜索公共
            var _edupfHeader = $('.edupf-header'),
                _navList = _edupfHeader.find('.nav-list'),
                _searchCon = _edupfHeader.find('.search-con'),
                _btnSearchFake = _searchCon.find('.btn-search-fake'),
                _btnClose = _searchCon.find('.btn-close'),
                _btnNewFunc = _edupfHeader.find('.btn-new-func');

            //头部搜索框
            _btnSearchFake.on('click', function () {
                _searchCon.addClass('active');
                _navList.hide();
                _btnNewFunc.hide();
            });

            _btnClose.on('click', function () {
                _searchCon.removeClass('active');
                _navList.show();
                _btnNewFunc.show();
            });

            //个人中心弹窗公共
            var _edupfHeader = $('.edupf-header'),
                _loginName = _edupfHeader.find('.login-name'),
                _loginIconHead = _edupfHeader.find('.login-icon-head'),
                _personCenter = _edupfHeader.find('.person-center'),
                _searchCon = _edupfHeader.find('.search-con');

            //判断IE9及以下
            var isOldBroswer = navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) <= 9;

            if (isOldBroswer) { //ie89
                $('.login-name, .login-icon-head').on('mouseover', function () {
                    _personCenter.css('top', '47px')
                        .slideDown().removeClass('false');
                })

                //点击其他区域收起个人中心
                $(document).on('click', function () {
                    if (_personCenter.hasClass('false')) {
                        // return false;
                    } else {
                        _personCenter.slideUp();
                    }
                });
            } else { //ie10+
                $('.login-name, .login-icon-head').on('mouseover', function () {
                    _personCenter.addClass('myCenterFadeInDown').removeClass('myCenterFadeOutUp false');
                });

                $(document).on('click', function () {
                    hideCenterPopup();
                });
            }

            _edupfHeader.find('.msg-list').on('click', '.status', function () {
                var $ctx = $(this);
                $(this).parent().animate({
                    left: '-374px',
                    opacity: '0',
                    filter: 'Alpha(opacity=0)'
                }, 300, function () {
                    $ctx.parent().remove();
                });
            });

            _personCenter.on('click', function (e) {
                e.stopPropagation();
            });

            //解决iframe不能触发click事件问题
            function hideCenterPopup() {
                if (_personCenter.hasClass('false')) {
                    // return false;
                } else {
                    _personCenter.addClass('myCenterFadeOutUp').removeClass('myCenterFadeInDown');
                }
            }

            var iframe = document.getElementById('js_frame');
            if (iframe) {

                var myConfObj = {
                    iframeMouseOver: false
                }
                window.addEventListener('blur', function () {
                    if (myConfObj.iframeMouseOver) {
                        hideCenterPopup()
                    }
                });

                iframe.addEventListener('mouseover', function () {
                    myConfObj.iframeMouseOver = true;

                });
                iframe.addEventListener('mouseout', function () {
                    myConfObj.iframeMouseOver = false;
                    window.focus();
                });
            }

            //改变角色
            var _edupfHeader = $('.edupf-header'),
                _headContainer = _edupfHeader.find('.head-container'),
                _link = _headContainer.find('.link'),
                _role = _headContainer.find('.role'),
                _roleWrap = _edupfHeader.find('.role-change-wrap'),
                _head = _roleWrap.find('.head'),
                _btnConfirm = _roleWrap.find('.btn-confirm');

            function slideInLeft() {
                _roleWrap.animate({
                    left: '50px'
                })
            };
            function slideInRight() {
                _roleWrap.animate({
                    left: '374px'
                })
            };
            _role.on('click', function () {
                _headContainer.fadeOut();
                slideInLeft();
            });
            _head.on('click', function () {
                $(this).find('.status').addClass('checked')
                    .parent().parent().siblings('.role-content').find('.status')
                    .removeClass('checked');
                $(this).parent().addClass('on').siblings().removeClass('on');
                _headContainer.fadeIn();
                slideInRight();
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window)