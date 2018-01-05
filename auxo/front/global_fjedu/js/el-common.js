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
        },
        switchRole: function (evt) {
            var role = $(evt.currentTarget).data('role');
            $(evt.currentTarget).parent().hide();
            $('#js_current_role').html('<i></i>');
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
                        store.getRoleName(res.user_id).done(function (data) {
                            t.account = data;
                            t.nextStep(res);
                        });
                    });
                } else {
                    if (userInfo && userInfo.id)
                        location.href = elearningHeaderManager.getLogoutUrl();

                    t.nextStep();
                }
            });

        },
        nextStep: function (res) {
            if (!this.account.is_visitor) {
                $('#js_create').attr('href', 'http://xue.101.com/' + projectCode + '/open_course/yunke/my/create');
                $('#js_username').text(res.nick_name ? res.nick_name : (res.org_exinfo.real_name ? res.org_exinfo.real_name : res.user_id));
                $('.js_logurl').attr('src', 'http://cdncs.101.com/v0.1/static/cscommon/avatar/' + res.user_id + '/' + res.user_id + '.jpg?size=80&defaultImage=1');
                $('.islogin').show();
                $('.notlogin').hide();
            } else {
                $('#js_create').attr('href', mainUrl + '/login?returnurl=' + location.href);
                $('#js_login').attr('href', mainUrl + '/login?returnurl=' + location.href);
                $('.islogin').hide();
                $('.notlogin').show();
                $('#js_center').remove();
            }

            switch (this.account.role_name) {
                case 'student':
                    $('#js_current_role').html('我是学生<em></em>');
                    $('#js_user_center').attr('href', elearningUrl + '/edu/mystudy/user_center');
                    $('#username').attr('href', elearningUrl + '/edu/mystudy/user_center');
                    break;
                case 'teacher':
                    $('#js_current_role').html('我是老师<em></em>');
                    $('#js_user_center').attr('href', elearningUrl + '/tedu/mystudy/user_center');
                    $('#username').attr('href', elearningUrl + '/tedu/mystudy/user_center');
                    break;
                default:
                    $('#js_user_center').parent().remove();
                    break;
            }
        },
        registerEvents: function () {
            //搜索
            $('.wh-secher span').on('click', $.proxy(this.switchType, this));
            $('.wh-secher input').on('click', $.proxy(this.inputClick, this));
            $('#js_types i').on('click', $.proxy(this.selectType, this));
            $('#search').on('click', $.proxy(this.search, this));
            $('#searchval').on('keydown', $.proxy(this.keydown, this));
            //退出
            $('#js_logout').on('click', $.proxy(this.logout, this));
            //角色切换
            $('#js_roles li').on('click', $.proxy(this.switchRole, this));
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
                $("#js_nav li").filter(function () {
                    return $(this).text() === "在线学习" || $(this).text() === "学习";
                }).addClass('wh-hover');
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
        },
        logout: function () {
            if (window.ucManager) {
                ucManager.logOut().then(function (res) {
                    if (res == "success") {
                        location.href = elearningHeaderManager.getLogoutUrl();
                    } else {
                        alert("fail:" + res);
                    }
                });
            }
        },
        switchType: function () {
            $('.wh-secher').toggleClass('cur');
        },
        inputClick: function () {
            $('.wh-secher').removeClass('cur');
        },
        selectType: function (evt) {
            var tx = $(evt.currentTarget).text();
            this.type = tx;
            $('#js_stype').text(tx);
            $('.wh-secher').removeClass('cur');
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
            var url = '', keyword = $('#searchval').val();
            switch (this.type) {
                case '资源':
                    url = resourceUrl + '/doSearch?keyword=' + keyword;
                    break;
                case '新闻':
                    url = newsUrl + '/fjedu#/search/' + keyword;
                    break;
            }
            if (url)
                location.href = url;
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window)