(function () {
    var service = {
        login: function (data) {
            return $.ajax({
                url: "/login/index",
                addMac: true,
                cache: true,
                contentType: 'application/json'
            });
        }
    };

    var viewModel = {
        model: {
            user: {
                login_name: "",
                password: ""
            },
            message: ''
        },
        initViewModel: function () {
            if (window.top != window) {
                window.top.location.href = location.href;
            }
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        login: function () {
            this.model.message('');
            var that = this, user = ko.mapping.toJS(this.model.user);
            $.each(user, function (k, v) {
                user[k] = $.trim(v);
            });
            if (!user.login_name || !user.password) {
                this.model.message('用户名或密码不能为空');
                return;
            }
            $('#loading').show();
            ucManager.logOut().then(function (res) {
                if (res == "success") {
                    ucManager.login(user.login_name, user.password).then(function (res) {
                        //登陆成功
                        if (typeof res == "object") {
                            service.login(user).then(function (data) {
                                if (data.code == "0") {
                                    var returnurl = that.getQueryStringByName('returnurl');
                                    var referrer = document.referrer;
                                    if (returnurl)
                                        window.location.href = decodeURIComponent(returnurl);
                                    else if (referrer && referrer.indexOf('app_id=glbedu') < 0 && referrer.indexOf('/login') < 0)
                                        window.location.href = decodeURIComponent(referrer);
                                    else
                                        window.location.href = "/home";
                                } else {
                                    $('#loading').hide();
                                    that.model.message(data);
                                    ucManager.logOut().then(function (res) {
                                    });
                                }
                            });
                        } else {
                            $('#loading').hide();
                            that.model.message(res);
                        }
                    });
                }
            });
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        }
    };

    $(function () {
        viewModel.initViewModel();
    });

}());