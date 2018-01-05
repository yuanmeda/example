(function ($) {
    var banners = JSON.parse(banner);
    var store = {
        aucGetVerifyCode: function (success) {
            $.ajax({
                url: "/accounts/verify_code",
                dataType: "json",
                type: "GET",
                cache: false,
                success: success
            });
        },
        aucLogin: function (data) {
            return $.ajax({
                url: "/accounts/login",
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                type: "POST"
            });
        },
        netAucLogin: function (data) {
            data.pwd = aucEncryptPassword(data.pwd);
            return $.ajax({
                url: iframe + "/system/home/AucLoginJsonp",
                data: data,
                dataType: 'jsonp',
                jsonpCallback: 'jsoncallback'
            });
        }
    };

    var viewModel = {
        model: {
            user: {
                Account: "",
                Password: "",
                VCode: "",
                Remember: false,
                SessionId: ""
            },
            code: {
                visible: 0,
                src: ""
            },
            errMsg: "",
            login: true
            , banner: {
                show: false,
                index: 0,
                bannerMain: "",
                bannerLeft: "",
                bannerRight: ""
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            if (banners.length > 0) {
                this.model.banner.show(true);
                this.model.banner.bannerLeft(banners[0].BannerLeft);
                this.model.banner.bannerMain(banners[0].BannerMain);
                this.model.banner.bannerRight(banners[0].BannerRight);
            }
            ko.applyBindings(this);
            this.code();
            this.focus();

        },
        login: function () {
            var vm = this.model,
                user = ko.mapping.toJS(vm.user);
            user.Account = $.trim(user.Account);
            if (!user.Account.length) {
                return this.setError(null, "请输入用户名");
            }
            if (!user.Password.length) {
                return this.setError("Password", "请输入密码");
            }
            if (vm.code.visible() && !$.trim(user.VCode).length) {
                return this.setError("VCode", "请输入验证码");
            }
            var data = {
                user_name: user.Account,
                pwd: user.Password,
                uc_pwd: getMD5Value(user.Password),
                verifyCode: user.VCode,
                session_id: user.SessionId,
                remember_me: user.Remember
            }, that = this;

            vm.login(0);

            store.netAucLogin(data).done(function (r) {
                if (!r.Ok) {
                    vm.login(1);
                    switch (r.Code) {
                        case 400041:
                            that.setError("VCode", r.Message);
                            break;
                        case 888888:

                            that.setError("Password", r.Message);
                            vm.user.Password("");
                            break;
                        case 400128:
                            that.setError("Account", r.Message);
                            break;
                        default:
                            that.setError("Account", r.Message);
                    }
                    vm.user.VCode("");
                    if (r.NextHasCode) {
                        vm.code.visible(1);
                        vm.code.src(r.NextverifyCodeImgUrl);
                        vm.user.sessionId(r.NextSessionId);
                    }
                    return;
                }
                store.aucLogin(data).done(function (java) {
                    that.success();
                }).fail(function (jqXHR) {
                    var r = JSON.parse(jqXHR.responseText);
                    if (r.code.indexOf('UC') == 0) {
                        switch (r.code) {
                            case "UC/PASSWORD_NOT_CORRECT":
                                that.setError("Password", r.message);
                                break;
                            case "UC/IDENTIFY_CODE_INVALID":
                                that.setError("VCode", r.message);
                                break;
                            case "UC/INVALID_LOGIN_NAME":
                                that.setError("Account", '格式不正确(字母数字_.@且最长50字符)');
                                break;
                            default:
                                that.setError("Account", r.message);
                                break;
                        }
                    } else {
                        that.setError("Account", r.message);
                    }
                    vm.login(1);
                });
            }).fail(function () {
                vm.login(1);
            });
        },
        code: function () {
            var vm = this.model;
            vm.code.visible(0);
            store.aucGetVerifyCode(function (ret) {
                var data = ret.Data;
                if (data && data.HasCode) {
                    vm.code.visible(1);
                    vm.code.src(data.Image);
                    vm.user.sessionId(data.SessionId);
                    return;
                }
            });
        },
        success: function (data) {
            location.href = redirect || "/";
        },
        setError: function () {
            var tip = $(".err-tip");
            return function (target, message) {
                this.model.errMsg(message);
                switch (target) {
                    case "Password":
                        tip.css("top", 250);
                        break;
                    case "VCode":
                        tip.css("top", 310);
                        break;
                    case "Account":
                    default:
                        tip.css("top", 188);
                        break;
                }
            }
        }(),
        hideError: function () {
            this.model.errMsg("");
        },
        focus: function () {
            $(".ipt input").focus(function () {
                viewModel.model.errMsg("");
                var input = $(this), element = input.parents(".ipt-item");
                if (element.hasClass("ipt-account") || element.hasClass("ipt-password")) {
                    element.addClass("ipt-active");
                } else {
                    element.addClass("ipt-vcode-active");
                }
            }).keyup(function () {
                var input = $(this), label = input.next();
                if (input.val().length) {
                    label.hide();
                } else {
                    label.show();
                }
            }).blur(function () {
                var input = $(this), label = input.next(), element = input.parents(".ipt-item");
                if (element.hasClass("ipt-account") || element.hasClass("ipt-password")) {
                    element.removeClass("ipt-active");
                } else {
                    element.removeClass("ipt-vcode-active");
                }
                if (!$.trim(input.val()).length) {
                    label.show();
                } else {
                    label.hide();
                }
            });
        },
        rber: function () {
            var r = this.model.user.Remember();
            this.model.user.Remember(!r);
        },
        prev: function () {
            var data = {};
            var banner = this.model.banner;
            data.bannerMain = banner.bannerRight();
            data.bannerLeft = banner.bannerMain();
            data.bannerRight = banner.bannerLeft();
            ko.mapping.fromJS(data, {}, this.model.banner);
            $(".banner-main").hide().fadeIn(500);
        },
        next: function () {
            var data = {};
            var banner = this.model.banner;
            data.bannerMain = banner.bannerLeft();
            data.bannerLeft = banner.bannerRight();
            data.bannerRight = banner.bannerMain();
            ko.mapping.fromJS(data, {}, this.model.banner);
            $(".banner-main").hide().fadeIn(500);

        },
        focusInput: function ($data, event) {
            $(event.delegateTarget).prev().focus();
        }
    };

    $(function () {
        viewModel.init();
    });
}(jQuery));
