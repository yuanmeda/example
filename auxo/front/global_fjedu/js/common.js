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
                    ucManager.getUserInfo().then(function (res) {
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
        nextStep: function (res) {
            if (!this.account.is_visitor) {
                $('#username').text(res.nick_name ? res.nick_name : (res.org_exinfo.real_name ? res.org_exinfo.real_name : res.user_id));
                $('#userlogo').attr('src', 'http://cdncs.101.com/v0.1/static/cscommon/avatar/' + res.user_id + '/' + res.user_id + '.jpg?size=80&defaultImage=1');
                $('.islogin').show();
                $('.notlogin').hide();
            } else {
                $('.islogin').hide();
                $('.notlogin').show();
                $('#js_center').remove();
            }

            switch (this.account.role_name) {
                case 'student':
                    $('#js_current_role').html(i18nHelper.getKeyValue('header.student') + '<em></em>');
                    break;
                case 'teacher':
                    $('#js_current_role').html(i18nHelper.getKeyValue('header.teacher') + '<em></em>');
                    break;
            }
        },
        activeCss: function () {
            if (location.href.indexOf('/ls') > 0)
                $('#js_nav li:contains(学习空间)').addClass('wh-hover');
            else if (location.href.indexOf('/social') > 0)
                $('#js_nav li:contains(交流)').addClass('wh-hover');
            else if (location.href.indexOf('/tm') > 0)
                $('#js_nav li:contains(教学管理)').addClass('wh-hover');
            else if (location.href.indexOf('/home') > 0)
                $('#js_nav li:contains(首页)').addClass('wh-hover');
        },
        registerEvents: function () {
            $('#search').on('click', $.proxy(this.search, this));
            $('#logout').on('click', $.proxy(this.logout, this));
            $('#searchval').on('keydown', $.proxy(this.keydown, this));
            $('#js_types i').on('click', $.proxy(this.selectType, this));
            $('.wh-secher span').on('click', $.proxy(this.switchType, this));
            $('.wh-secher input').on('click', $.proxy(this.inputClick, this));
            //角色切换
            $('#js_roles li').on('click', $.proxy(this.switchRole, this));
        },
        switchType: function () {
            $('.wh-secher').toggleClass('cur');
        },
        inputClick: function () {
            $('.wh-secher').removeClass('cur');
        },
        selectType: function (evt) {
            var tx = $(evt.currentTarget).text();
            this.model.type = tx;
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
            switch (this.model.type) {
                case '资源':
                    url = resourceUrl + '/doSearch?keyword=' + keyword;
                    break;
                case '新闻':
                    url = newsUrl + '/fjedu#/search/' + keyword;
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
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window)