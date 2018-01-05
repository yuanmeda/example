(function ($, window) {
    var store = {
        logout: function () {
            return $.ajax({
                url: '/loginout'
            })
        },
        //{roleName:'',isVisitor:(0-登录/1-游客账号)}
        getRoleName: function (userId) {
            return $.ajax({
                url: '/fjedu/role/get/' + userId,
            })
        },
        setRole: function (role) {
            return $.ajax({
                url: '/fjedu/role/set?role_name=' + role
            })
        },
        user: function (role) {
            return $.ajax({
                url: '/fjedu/learn_user?role_name=' + role
            })
        },
        login: function () {
            return $.ajax({
                url: "/login/index",
                addMac: true,
                cache: true,
                contentType: 'application/json'
            });
        },
        getHomeWork: function () {
            var data = {
                offset: 0,
                limit: 3
            };

            var url;

            if (roleName == 'student') {
                url = '/fjedu/homeworks/student';
                data.type = 'todo';
            } else {
                url = '/fjedu/homeworks/todo';
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
                    "vorg": typeof orgName == 'undefined' ? 'V_ORG_K12_PROD' : orgName
                }
            });
        }
    };

    var viewModel = {
        account: {
            is_visitor: 1,
            role_name: 'student'
        },
        model: {
            type: '资源'
        },
        init: function () {
            this.activeCss();
            this.uc();
            this.registerEvents();
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
                                    store.login().done(function () {
                                        location.href = '/home';
                                    });
                                }
                            });
                        });
                    }
                });
            } else {
                store.setRole(role).done(function () {
                    location.href = '/home';
                });
            }
        },
        uc: function () {
            var t = this;
            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    //自动注册登录的时候要过滤中转页面自动跳转到首页
                    if (location.href.indexOf('/turn') > 0)
                        return;

                    ucManager.getUserInfo().then(function (res) {
                        if (typeof res == "object" && undefined != res.user_id) {
                            if (res.user_id != userId) {
                                userId = res.user_id;
                                store.login().done(function () {
                                    location.href = '/home';
                                });
                            }
                            store.getRoleName(userId).done(function (data) {
                                t.account = data;
                                t.nextStep(res);
                            });
                        } else {
                            t.nextStep();
                        }
                    });
                }
                else {
                    if (userId) {
                        store.logout().done(function () {
                            location.reload();
                        });
                    } else {
                        t.nextStep();
                    }
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
                            str.push('<li class="clearfix"><a class="title" href="/ls?nav=12">' + item.title + '</a><a class="status" href="/ls?nav=12">查看</a></li>');
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
            var type = $(evt.currentTarget).data('type');
            switch (type) {
                case 1:
                    //作业
                    location.href = '/ls?nav=8';
                    break;
                case 2:
                    //通知公告
                    location.href = '/ls?nav=12';
                    break;
                case 3:
                    //我的备课
                    location.href = '/ls?nav=16';
                    break;
                case 4:
                    //教育百科
                    var baikeUrl = 'http://baike.101.com';
                    var url = baikeUrl;
                    var autoLogin = baikeUrl + "/#!/autologin?fromway=" + encodeURIComponent(url) + "&mode=session&auth=";
                    var mac = JsMAF.getAuthHeader(baikeUrl + '/', 'GET');
                    mac = encodeURI(base64_encode(mac));
                    window.open(autoLogin + mac);
                    break;
                case 5:
                    //笔记
                    location.href = '/ls?nav=11';
                    break;
                case 6:
                    //我的课程
                    var projectCode = 'sfjdev';
                    if (this.account.role_name == 'teacher')
                        projectCode = 'tfjdev';
                    else if (this.account.role_name == 'guardian')
                        projectCode = 'pfjdev';

                    location.href = elearningUrl + '/' + projectCode + '/mystudy/user_center';
                    break;
                case 7:
                    //问答社区
                    window.open('http://forum-web.social.web.sdp.101.com/fjedu');
                    break;
                case 8:
                    //老师学习报告
                    location.href = '/ls?nav=18';
                    break;
                case 9:
                    //制作课件
                    var pptshell = "pptshell:id=3006cc7c-9b2a-4c96-be96-3c8a8051dbfd,chapter_id=,mode=preview";
                    if (userId) {
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
                $('.userlogo').attr('src', 'http://cdncs.101.com/v0.1/static/cscommon/avatar/' + res.user_id + '/' + res.user_id + '.jpg?size=160&defaultImage=1');
                $('.islogin').show();
                $('.notlogin').hide();
                this.doLogin();
            } else {
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
            }
        },
        activeCss: function () {
            if (location.href.indexOf('/ls') > 0) {
                $('#js_nav li:contains(学习空间)').addClass('active');
                $('#js_nav li:contains(家长空间)').addClass('active');
                $('#js_nav li:contains(教学管理)').addClass('active');
            }
            else if (location.href.indexOf('/social') > 0)
                $('#js_nav li:contains(交流)').addClass('active');
            else if (location.href.indexOf('/home') > 0)
                $('#js_nav li:contains(首页)').addClass('active');
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
                location.href = cartUrl + '/' + projectCode + '/cart';
            } else {
                location.href = '/login';
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
            this.model.type = tx;
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
            switch (this.model.type) {
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
                        url = channelUrl + '/tfjdev/search?keyword=' + keyword;
                    else if (this.account.role_name == 'guardian')
                        url = channelUrl + '/pfjdev/search?keyword=' + keyword;
                    else
                        url = channelUrl + '/sfjdev/search?keyword=' + keyword;
                    break;
                default:
                    url = channelUrl + '/famous/search?keyword=' + keyword;
                    break;
            }
            if (url)
                location.href = url;
        },
        logout: function () {
            if (userId) {
                ucManager.logOut().then(function (res) {
                    //退出成功
                    if (res == "success") {
                        store.logout().done(function () {
                            location.href = "/home";
                        });
                    } else {
                        alert("fail:" + res);
                    }
                });
            }
        },
        logout2: function () {
            if (userId) {
                ucManager.logOut().then(function (res) {
                    //退出成功
                    if (res == "success") {
                        store.logout().done(function () {
                            location.href = "/login";
                        });
                    } else {
                        alert("fail:" + res);
                    }
                });
            }
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
                        iframe.contentWindow.location = '/pptproxy';
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
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window)