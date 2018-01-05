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

(function ($, window) {
    var store = {
        //{roleName:'',isVisitor:(0-登录/1-游客账号)}
        getRoleName: function (userId) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/role/get/' + userId, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/role/get/' + userId,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', mac);
                }
            })
        },
        setRole: function (role) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/role/set?role_name=' + role, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/role/set?role_name=' + role,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', mac);
                }
            })
        },
        user: function (role) {
            var mac = JsMAF.getAuthHeader(_FJEDU_CONFIG.mainUrl + '/fjedu/learn_user?role_name=' + role, 'GET');
            return $.ajax({
                url: _FJEDU_CONFIG.mainUrl + '/fjedu/learn_user?role_name=' + role,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', mac);
                }
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
                        store.getRoleName(res.user_id).done(function (data) {
                            t.account = data;
                            t.nextStep(res);
                        });
                    });
                }
                else {
                    t.nextStep();
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
                $('#js_login').attr('href', _FJEDU_CONFIG.mainUrl + '/login?returnurl=' + location.href);
                $('.islogin').hide();
                $('.notlogin').show();
                $('#js_center').remove();
            }

            switch (this.account.role_name) {
                case 'student':
                    $('#js_current_role').html('我是学生<em></em>');
                    $('#js_user_center').attr('href', _FJEDU_CONFIG.elearningUrl + '/edu/mystudy/user_center');
                    $('#username').attr('href', _FJEDU_CONFIG.elearningUrl + '/edu/mystudy/user_center');
                    break;
                case 'teacher':
                    $('#js_current_role').html('我是老师<em></em>');
                    $('#js_user_center').attr('href', _FJEDU_CONFIG.elearningUrl + '/tedu/mystudy/user_center');
                    $('#username').attr('href', _FJEDU_CONFIG.elearningUrl + '/tedu/mystudy/user_center');
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
            $('#logout').on('click', $.proxy(this.logout, this));
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
                    url = _FJEDU_CONFIG.resourceUrl + '/doSearch?keyword=' + keyword;
                    break;
                case '新闻':
                    url = _FJEDU_CONFIG.newsUrl + '/fjedu#/search/' + keyword;
                    break;
            }
            if (url)
                location.href = url;
        },
        logout: function () {
            if (window.ucManager) {
                ucManager.logOut().then(function (res) {
                    if (res == "success") {
                        location.reload();
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

})(jQuery, window);