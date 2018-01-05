(function ($) {
    var store = {
        aucGetVerifyCode: function (success) {
            $.ajax({
                url: "logins/aucGetVerifyCode",
                dataType: "json",
                type: "get",
                cache: false,
                success: success,
                error: function () {
                    $.fn.udialog.alert(i18nHelper.getKeyValue("login.frontPage.staticText8"), {
                        disabledClose: false
                    });
                }
            });
        },
        aucLogin: function (data) {
            return $.ajax({
                url: (isOpen ? "/accounts/login" : "/" + projectCode + "/accounts/login"),
                data: JSON.stringify(data),
                dataType: 'json',
                type: "POST",
                contentType: 'application/json;charset=utf8',
                error: function (jqXHR) {
                    var r = JSON.parse(jqXHR.responseText);
                    if (r.code.indexOf('UC') == 0) {
                        switch (r.code) {
                            case "UC/PASSWORD_NOT_CORRECT":
                                viewModel.setError("Password", languageCode == 'zh-CN' ? r.message : 'PASSWORD_NOT_CORRECT');
                                break;
                            case "UC/IDENTIFY_CODE_INVALID":
                                viewModel.setError("VCode", languageCode == 'zh-CN' ? r.message : 'IDENTIFY_CODE_INVALID');
                                break;
                            case "UC/INVALID_LOGIN_NAME":
                                viewModel.setError("Account", languageCode == 'zh-CN' ? '格式不正确(字母数字_.@且最长50字符)' : 'IDENTIFY_CODE_INVALID');
                                break;
                            default:
                                viewModel.setError("Account", languageCode == 'zh-CN' ? r.message : r.code.substring(3));
//                            viewModel.model.user.Password("");
                                break;
                        }
                    } else {
                        viewModel.setError("Account", r.message);
//                        $.fn.udialog.alert((r.message),{
//                            width: 368,
//                            icon: ''
//                        });
                    }
                    viewModel.model.user.VCode("");
                    viewModel.model.login(true);
                    if (viewModel.NextHasCode) {
                        $(".ipt-vcode").show();
                        $("#J_Code").attr("src", r.NextverifyCodeImgUrl);
                        t.model.sessionId(r.NextSessionId);
                    }
//                    $.fn.udialog.alert(i18nHelper.getKeyValue("login.frontPage.staticText9"), {
//                        disabledClose: false
//                    });
                }
            });
        }

    };
    var BannerMain='http://e.101.com/data/uploadfile/banner/banner_1397205525.31186.jpg';
    var BannerLeft='http://e.101.com/data/uploadfile/banner/banner_1397205529.5932.jpg';
    var BannerRight='http://e.101.com/data/uploadfile/banner/banner_1397205531.87449.jpg';
    var viewModel = {
        model: {
            user: {
                UserId: 0,
                Account: "",
                Password: "",
                VCode: "",
                Remember: false
            },
//            stuUser: {
//                UserId: 0,
//                Account: "",
//                Password: "",
//                VCode: "",
//                Remember: false
//            },
//            techUser: {
//                UserId: 0,
//                Account: "",
//                Password: "",
//                VCode: "",
//                Remember: false
//            },
//            admin: {
//                UserId: 0,
//                Account: "",
//                Password: "",
//                VCode: "",
//                Remember: false
//            },
            banner: {
                Index: 0,
                BannerLeft: "",
                BannerMain: "",
                BannerRight: ""
            },
//            userType: undefined,
            errMsg: "",
            usernameCookie: "_username",
            rememberCookie: "_remember",
            login: true,
            sessionId: ""
        },
        init: function () {
            window.go_through_uc = false;
            try{
                if (ucComponent_jsonpComponentItem && ucComponent_jsonpComponentItem.indexOf(window.location.host + "/" + projectCode) >= 0) {
                    go_through_uc = true;
                }
            }catch(ex){}
            document.title = i18nHelper.getKeyValue("common.frontPage.projectLoginIn", {projectTitle: projectTitle||'101教育平台'});
            var t = this;
            if (banners.length > 0) {
                this.model.banner.BannerLeft = banners[0].BannerLeft;
                this.model.banner.BannerMain = banners[0].BannerMain;
                this.model.banner.BannerRight = banners[0].BannerRight;
            }
            if(isOpen){
                this.model.banner.BannerLeft = BannerLeft;
                this.model.banner.BannerMain = BannerMain;
                this.model.banner.BannerRight = BannerRight;
            }
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

//            this.code();
            var ipt = $(".ipt-item:visible input");

            function locationAt() {
                ipt.each(function (index, element) {
                    if (!$(element).val()) {
                        $(element).focus();
                        return false;
                    }
                });
            }

//            this.model.userType.subscribe(function (nv) {
//                var data;
//                switch (nv) {
//                    case 0:
//                        this.model.usernameCookie("_username");
//                        this.model.rememberCookie("_remember");
//                        data = ko.mapping.toJS(t.model.stuUser);
//                        break;
//                    case 1:
//                        this.model.usernameCookie("_username_teach");
//                        this.model.rememberCookie("_remember_teach");
//                        data = ko.mapping.toJS(t.model.techUser);
//                        break;
//                    case 2:
//                        this.model.usernameCookie("_username_admin");
//                        this.model.rememberCookie("_remember_admin");
//                        data = ko.mapping.toJS(t.model.admin);
//                        break;
//                    default:
//                        break;
//                }
//                if (!$.trim(data.Account).length && $.cookie(this.model.rememberCookie())) {
//                    this.history();
//                    return;
//                }
//                ko.mapping.fromJS(data, {}, t.model.user);
//                ipt.trigger('input').trigger('propertychange');
//                locationAt();
//            }, this);
//            this.model.userType(userType);
            this.focus();
            this.history();
            $("#J_LoginForm").bind("keydown", function (evt) {
                if (evt.keyCode == 13) {
                    $(".ipt input").blur();
                    viewModel.login();
                }
            });
//            $("#J_Tabs").on("click", "li", function () {
//                t.hideError();
//                var data = ko.mapping.toJS(t.model.user);
//                switch (t.model.userType()) {
//                    case 0:
//                        ko.mapping.fromJS(data, {}, t.model.stuUser);
//                        break;
//                    case 1:
//                        ko.mapping.fromJS(data, {}, t.model.techUser);
//                        break;
//                    case 2:
//                        ko.mapping.fromJS(data, {}, t.model.admin);
//                        break;
//                    default:
//                        break;
//                }
//                t.model.userType($(this).data("type"));
//
//
//            });
            locationAt();
            var count = 0;
            (function cFn() {
                ++count;
                if (count > 3) return;
                setTimeout(function () {
                    ipt.trigger('input').trigger('change');
                    cFn();
                }, 150);
            }());
        },
        login: function () {
            var account = $("#J_Account").val();
            var password = $("#J_Password").val();
            var vcode = $("#J_Vcode").val();
            if (!$.trim(account).length) {
                this.setError(null, i18nHelper.getKeyValue("login.frontPage.staticText10"));
                return;
            }
            if (!$.trim(password).length) {
                this.setError("Password", i18nHelper.getKeyValue("login.frontPage.staticText4"));
                return;
            }
            if (!$.trim(vcode).length && $(".ipt-vcode:visible").length) {
                this.setError("VCode", i18nHelper.getKeyValue("login.frontPage.staticText5"));
                return;
            }
            this.model.user.Account($.trim(account));
            var data = {
                login_name: account,
                password: getMD5Value(password),
//                verify_code: vcode,
                session_id: this.model.sessionId(),
                remember_me: this.model.user.Remember()//,
//                userType: this.model.userType()
            }, t = this;
            this.model.login(false);
            if (go_through_uc) {
                ucManager.login(account, password).then(function (res) {
                    if (typeof res == "object") {
                        var myDate = new Date();
                        myDate.setTime(myDate.getTime() - 1000);//设置时间
                        document.cookie = "sso_version=1.0" + ";path=/" + projectCode;
                        store.aucLogin(data).done(function (data) {
                            t.success(data);
                        });
                    } else {
                        viewModel.setError(null, res);
                        viewModel.model.login(true);
                    }

                });
            } else {
                store.aucLogin(data).done(function (data) {
                    t.success(data);
                });
            }
        },
//        code: function () {
//            var t = this;
//
//            store.aucGetVerifyCode(function (ret) {
//                if (ret.Data && ret.Data.HasCode) {
//                    $(".ipt-vcode").show();
//                    $("#J_Code").attr("src", ret.Data.Image);
//                    t.model.sessionId(ret.Data.SessionId);
//                }
//                else {
//                    $(".ipt-vcode").hide();
//                }
//            });
//        },
        success: function (data) {
//            if (data.Ok) {
            viewModel.historySet(viewModel.model.user.Account());
//                if (data.NeedFillUserInfo) {
//                    location.href = data.Rtn;
//                }
//                else {
//                    if (viewModel.model.userType() == 0) {
//                    var returnurl = viewModel.queryString('returnurl') || "";

            if (returnurl) {
                    location.href = decodeURIComponent(returnurl).replace('{project_domain}',(data.project_domain||''));
            }
            else {
                if(isOpen){
                    location.href = '/' + (data.project_domain || '');
                }else{
                    location.href = '/' + projectCode;
                }

            }
//                    }
//                    else {
//                        var returnurl = viewModel.queryString('returnurl') || "";
//
//                        if (data.Rtn) {
//                            location.href = data.Rtn;
//                        }
//                        else {
//                            location.href = returnurl;
//                        }
//                    }
//                }
//            }
        },
        setError: function (target, message) {
            var tip = $("#J_Tip");
            this.model.errMsg(message);
            if (languageCode && languageCode == 'en-US') {
                if (message.length > 40) {
                    tip.css("padding", '3px 0 0 8px');
                }
            } else {
                if (message.length > 19) {
                    tip.css("padding", '3px 0 0 8px');
                }
            }
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
        },
        hideError: function () {
            this.model.errMsg("");
        },
        historySet: function () {
            if (this.model.user.Remember()) {
                $.cookie(this.model.rememberCookie(), true, { domain: document.domain, expires: 7 });
                $.cookie(this.model.usernameCookie(), this.model.user.Account(), { domain: document.domain, expires: 7 });
            } else {
                $.removeCookie(this.model.rememberCookie(), { domain: document.domain });
                $.removeCookie(this.model.usernameCookie(), { domain: document.domain });
//                $.cookie(this.model.rememberCookie(), null, { domain: document.domain });
//                $.cookie(this.model.usernameCookie(), null, { domain: document.domain });
            }
        },
        history: function () {
            if ($.cookie(this.model.rememberCookie())) {
                this.model.user.Remember(true);
                if ($.cookie(this.model.usernameCookie())) {
                    this.model.user.Account($.cookie(this.model.usernameCookie()));
                    this.place($(".ipt-item:first input"), 1);
                }
            }
        },

        focus: function () {
            var that = this, isIE9 = document.documentMode === 9;
            $(".ipt input").focus(function (e) {
                viewModel.model.errMsg("");
                var input = $(this), element = input.parents(".ipt-item");
                if (element.hasClass("ipt-account") || element.hasClass("ipt-password")) {
                    element.addClass("ipt-active");
                } else {
                    element.addClass("ipt-vcode-active");
                }
                if (isIE9) that.selectionChange(e);

            }).blur(function (e) {
                var input = $(this), element = input.parents(".ipt-item");
                if (element.hasClass("ipt-account") || element.hasClass("ipt-password")) {
                    element.removeClass("ipt-active");
                } else {
                    element.removeClass("ipt-vcode-active");
                }
                if (isIE9) that.selectionChange(e);
            });
            if (document.addEventListener) {
                $(".login-ipts").on("input", "input", this.place);
            } else {
                $(".login-ipts input").on("propertychange", this.place);
            }

        },
        place: function (e, i) {
            var ipt = i ? e : $(e.currentTarget), label = ipt.next();
            ipt.val().length ? label.hide() : label.show();
        },
        selectionChange: function (e) {
            var ipt = $(e.currentTarget);
            if (e.type == "focus") {
                document.addEventListener("selectionchange", $.proxy(this.place, this, ipt));
            } else {
                document.removeEventListener("selectionchange", $.proxy(this.place, this, ipt));
            }
        },
        rber: function () {
            var r = this.model.user.Remember() ? false : true;
            this.model.user.Remember(r);
        },
        prev: function () {
            var count = banners.length, i = this.model.banner.Index(), index = (i > 0 && i <= count - 1) ? i - 1 : count - 1;
            var data = banners[index];
            data.Index = index;
            ko.mapping.fromJS(data, {}, this.model.banner);
            $(".banner-main").hide().fadeIn(500);
        },
        next: function () {
            var count = banners.length, i = this.model.banner.Index(), index = i < count - 1 ? i + 1 : 0;
            var data = banners[index];
            data.Index = index;
            ko.mapping.fromJS(data, {}, this.model.banner);
            $(".banner-main").hide().fadeIn(500);
        },
        queryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        }
    };

    $(function () {
        viewModel.init();
    });
}(jQuery));