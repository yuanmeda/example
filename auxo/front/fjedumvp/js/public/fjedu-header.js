/*

 -------------处理fjedu所有子站通用头部-------------

 依赖对象:
 var _FJEDU_CONFIG={
 mainUrl:'',//fjedu门户url地址
 elearningUrl:'',//elearning门户地址
 resourceUrl:'',//资源门户站点
 newsUrl:'',//新闻门户站点
 currentNav:'',//当前位于的子站
 staticUrl:'',//静态站地址
 roleName:'',//角色信息 student guardian teacher
 };

 */

(function (window) {
    var store = {
        //{roleName:'',isVisitor:(0-登录/1-游客账号)}
        getRoleName: function (userId) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/role/get/' + userId, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/role/get/' + userId,
                headers: {
                    "Authorization": mac
                }
            })
        },
        setRole: function (role) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/role/set?role_name=' + role, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/role/set?role_name=' + role,
                headers: {
                    "Authorization": mac
                }
            })
        },
        user: function (role) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/learn_user?role_name=' + role, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/learn_user?role_name=' + role,
                headers: {
                    "Authorization": mac
                }
            })
        },
        getHomeWork: function () {
            var data = {
                offset: 0,
                limit: 3
            };

            var url;

            if (viewModel.account.role_name == 'student') {
                url = _FJEDU_CONFIG.mainUrl + '/fjedu/homeworks/student';
                data.type = 'todo';
            } else {
                url = _FJEDU_CONFIG.mainUrl + '/fjedu/homeworks/todo';
                data.todo_type = 'correct';
            }

            return $.ajax({
                url: url,
                data: data
            })
        },
        getNotices: function () {
            var server = typeof _FJEDU_CONFIG.noteUrl == 'undefined' ? 'http://notice.web.sdp.101.com' : _FJEDU_CONFIG.noteUrl;
            var url = server + "/v0.2/received_notices?$offset=0&$limit=99&$count=true";
            var mac = JsMAF.getAuthHeader(url, 'GET');

            return $.ajax({
                url: url,
                cache: true,
                headers: {
                    "Authorization": mac,
                    "vorg": typeof _FJEDU_CONFIG.orgName == 'undefined' ? 'V_ORG_K12_PROD' : _FJEDU_CONFIG.orgName,
                    'X-Gaea-Authorization': undefined
                }
            });
        }
    };


    var viewModel = {
        userId: 0,
        account: {
            is_visitor: 1,
            role_name: 'student'
        },
        type: '资源',
        init: function () {
            this.uc();
            this.registerEvents();
            this.commonEvent();
            document.title = document.title + '-网教通-开发版';
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
                                    location.href = _FJEDU_CONFIG.mainUrl + '/home';
                                }
                            });
                        });
                    }
                });
            } else {
                store.setRole(role).done(function () {
                    location.href = _FJEDU_CONFIG.mainUrl + '/home';
                });
            }
        },
        uc: function () {
            var t = this;
            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    ucManager.getUserInfo().then(function (res) {
                        if (typeof res == "object" && undefined != res.user_id) {
                            t.userId = res.user_id;
                            store.getRoleName(res.user_id).done(function (data) {
                                t.account = data;
                                t.nextStep(res);
                            });
                        } else {
                            t.nextStep();
                        }
                    });
                }
                else {
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
                var str = [], length = d.items.length > 3 ? 3 : d.items.length;

                if (length > 0) {
                    for (var i = 0; i < length; i++) {
                        var item = d.items[i];
                        if (item.is_readed == 0) {
                            str.push('<li class="clearfix"><a class="title" href="' + _FJEDU_CONFIG.mainUrl + '/ls?nav=12">' + item.title + '</a><a class="status" href="' + _FJEDU_CONFIG.mainUrl + '/ls?nav=12">查看</a></li>');
                        }
                    }
                    if (str.length > 0) {
                        $jsnotices.html(str.join(''));
                        $hintline.show();
                    }
                }
            });
        },
        sidebarClick: function (evt) {
            var t = this;
            var type = $(evt.currentTarget).data('type');
            switch (type) {
                case 1:
                    //作业
                    location.href = _FJEDU_CONFIG.mainUrl + '/ls?nav=8';
                    break;
                case 2:
                    //通知公告
                    location.href = _FJEDU_CONFIG.mainUrl + '/ls?nav=12';
                    break;
                case 3:
                    //我的备课
                    location.href = _FJEDU_CONFIG.mainUrl + '/ls?nav=16';
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
                    location.href = _FJEDU_CONFIG.mainUrl + '/ls?nav=11';
                    break;
                case 6:
                    //我的课程
                    var projectCode = 'sfjdev';
                    if (this.account.role_name == 'teacher')
                        projectCode = 'tfjdev';
                    else if (this.account.role_name == 'guardian')
                        projectCode = 'pfjdev';

                    location.href = _FJEDU_CONFIG.elearningUrl + '/' + projectCode + '/mystudy/user_center';
                    break;
                case 7:
                    //问答社区
                    window.open('http://forum-web.social.web.sdp.101.com/fjedu');
                    break;
                case 8:
                    //老师学习报告
                    location.href = _FJEDU_CONFIG.mainUrl + '/ls?nav=18';
                    break;
                case 9:
                    //制作课件
                    var pptshell = "pptshell:id=3006cc7c-9b2a-4c96-be96-3c8a8051dbfd,chapter_id=,mode=preview";
                    if (t.userId) {
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
                $('.username').text(res.nick_name ? res.nick_name : (res.org_exinfo.real_name ? res.org_exinfo.real_name : res.user_id));
                $('.userlogo').attr('src', 'http://cdncs.101.com/v0.1/static/cscommon/avatar/' + res.user_id + '/' + res.user_id + '.jpg?size=80&defaultImage=1');
                $('.islogin').show();
                $('.notlogin').hide();
                this.doLogin();
            } else {
                $('#js_login').attr('href', _FJEDU_CONFIG.mainUrl + '/login?returnurl=' + location.href);
                $('.islogin').hide();
                $('.notlogin').show();
            }

            switch (this.account.role_name) {
                case 'student':
                    $('.role-content a[data-role="student"]').addClass('checked');
                    $('#js_login_current_role').text('学生');
                    $('#js_current_role').html('我是学生<i class="triangle-down"></i>');
                    break;
                case 'teacher':
                    $('.role-content a[data-role="teacher"]').addClass('checked');
                    $('#js_login_current_role').text('老师');
                    $('#js_current_role').html('我是老师<i class="triangle-down"></i>');
                    break;
                case 'guardian':
                    $('.role-content a[data-role="guardian"]').addClass('checked');
                    $('#js_login_current_role').text('家长');
                    $('#js_current_role').html('我是家长<i class="triangle-down"></i>');
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
            //购物车
            $('#js_cart').on('click', $.proxy(this.cart, this));
        },
        cart: function () {
            var projectCode = 'sfjdev';
            if (this.account.role_name == 'teacher')
                projectCode = 'tfjdev';
            else if (this.account.role_name == 'guardian')
                projectCode = 'pfjdev';

            if (!this.account.is_visitor) {
                location.href = _FJEDU_CONFIG.cartUrl + '/' + projectCode + '/cart';
            } else {
                location.href = _FJEDU_CONFIG.mainUrl + '/login';
            }
        },
        switchType: function (evt) {
            $('#js_types').toggle();
            evt.stopPropagation();
        },
        inputClick: function (evt) {
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
                    url = _FJEDU_CONFIG.resourceUrl + '/doSearch?keyword=' + keyword;
                    break;
                case '新闻':
                    url = _FJEDU_CONFIG.newsUrl + '/fjedu#/search/' + keyword;
                    break;
                case '应用':
                    url = _FJEDU_CONFIG.resourceUrl + '/store-search?keyword=' + keyword + '&type=system_app';
                    break;
                case '课程':
                    if (this.account.role_name == 'teacher')
                        url = _FJEDU_CONFIG.channelUrl + '/tfjdev/search?keyword=' + keyword;
                    else if (this.account.role_name == 'guardian')
                        url = _FJEDU_CONFIG.channelUrl + '/pfjdev/search?keyword=' + keyword;
                    else
                        url = _FJEDU_CONFIG.channelUrl + '/sfjdev/search?keyword=' + keyword;
                    break;
                default:
                    url = _FJEDU_CONFIG.channelUrl + '/famous/search?keyword=' + keyword;
                    break;
            }
            if (url)
                location.href = url;
        },
        logout: function () {
            ucManager.logOut().then(function (res) {
                if (res == "success") {
                    location.reload();
                } else {
                    alert("fail:" + res);
                }
            });
        },
        logout2: function () {
            ucManager.logOut().then(function (res) {
                //退出成功
                if (res == "success") {
                    location.href = _FJEDU_CONFIG.mainUrl + "/login";
                } else {
                    alert("fail:" + res);
                }
            });
        },
        pptproxy: function () {
            var t = this;

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
                        if (location.host.indexOf('news') >= 0)
                            iframe.contentWindow.location = '/fjedu';
                        else if (location.href.indexOf('mxms') >= 0 || location.href.indexOf('famous') >= 0)
                            iframe.contentWindow.location = '/portal/page/mxms-sso';
                        else
                            iframe.contentWindow.location = '/';
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
            //展开关闭搜索框
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

            //头部个人中心弹窗
            var _edupfHeader = $('.edupf-header'),
                _loginName = _edupfHeader.find('.login-name'),
                _loginIconHead = _edupfHeader.find('.login-icon-head'),
                _personCenter = _edupfHeader.find('.person-center'),
                _searchCon = _edupfHeader.find('.search-con');

            //判断IE9及以下
            if (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) <= 9) {
                $('.login-name, .login-icon-head').on('mouseover', function () {
                    _personCenter.css('top', '47px')
                        .slideDown().removeClass('false');
                })

                //点击其他区域收起个人中心
                $(document).on('click', function () {
                    if (_personCenter.is(':hidden')) {
                        // return false;
                    } else {
                        _personCenter.slideUp();
                    }
                });
            } else {
                $('.login-name, .login-icon-head').on('mouseover', function () {
                    _personCenter.addClass('myCenterFadeInDown').removeClass('myCenterFadeOutUp false');
                })

                $(document).on('click', function () {
                    if (_personCenter.hasClass('false')) {
                        // return false;
                    } else {
                        _personCenter.addClass('myCenterFadeOutUp').removeClass('myCenterFadeInDown false');
                    }
                });
            }

            _personCenter.on('click', function (e) {
                e.stopPropagation();
            });

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

})(window);