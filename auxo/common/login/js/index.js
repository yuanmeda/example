(function ($) {
    var selfUrl = window.selfUrl || ''
    var store = {
        getSession: function (device_id) {
            return $.ajax({
                url:  selfUrl + "/" + projectCode + "/accounts/session",
                dataType: "json",
                cache: false,
                type:'POST',
                data:{
                    device_id:device_id
                }
            });
        },
        aucLogin: function (data) {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/accounts/login",
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
                                break;
                        }
                    } else {
                        viewModel.setError("Account", r.message);
                    }
                    viewModel.model.user.VCode("");
                    viewModel.model.login(true);
                    if (viewModel.NextHasCode) {
                        $(".ipt-vcode").show();
                        $("#J_Code").attr("src", r.NextverifyCodeImgUrl);
                        t.model.sessionId(r.NextSessionId);
                    }
                }
            });
        }

    };
    var viewModel = {
        model: {
            user: {
                UserId: 0,
                Account: "",
                Password: "",
                VCode: "",
                Remember: false
            },
            banner: {
                Index: 0,
                BannerLeft: "",
                BannerMain: "",
                BannerRight: ""
            },
            errMsg: "",
            usernameCookie: "_username",
            rememberCookie: "_remember",
            login: true,
            sessionId: "",
            sessionKey:"",
            device_id: "",
            isNormal: true,
            r: Math.random()
        },
        init: function (hash) {
            window.go_through_uc = false;
            this.model.device_id = hash;
            document.title = i18nHelper.getKeyValue("common.frontPage.projectLoginIn", {projectTitle: projectTitle || '101教育平台' });
            try{
                if (ucComponent_jsonpComponentItem && ucComponent_jsonpComponentItem.indexOf(window.location.host + "/" + projectCode) >= 0) {
                    go_through_uc = true;
                }
            }catch(ex){}
        
            var t = this,
                banner;
            if (banners.length > 0) {
                banner =  banners[0]
                this.model.banner.BannerLeft = banner.BannerLeft;
                this.model.banner.BannerMain = banner.BannerMain;
                this.model.banner.BannerRight = banner.BannerRight;
            }
            this.model = ko.mapping.fromJS(this.model);
            this.session().then(function(){
                  ko.applyBindings(t);
            })
            var ipt = $(".ipt-item:visible input");
            function locationAt() {
                ipt.each(function (index, element) {
                    if (!$(element).val()) {
                        $(element).focus();
                        return false;
                    }
                });
            }
            this.history();
            $("#J_LoginForm").bind("keydown", function (evt) {
                if (evt.keyCode == 13) {
                    $(".ipt input").blur();
                    viewModel.login();
                }
            });
              $(".ipt input").focus(function (e) {
                t.model.errMsg("");
              });
            locationAt();
        },
        login: function () {
            var account = $("#J_Account").val();
            var password = $("#J_Password").val();
            var vcode = $("#J_Vcode").val();
            if (!$.trim(account).length) {
                this.setError(null, i18nHelper.getKeyValue("login.frontPage.staticText10"));
                return;
            }
            if(isOpen && !(/.+@.+/.test(account))){
                this.setError(null, i18nHelper.getKeyValue("login.frontPage.staticText11"));
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
                session_id: this.model.sessionId(),
                remember_me: this.model.user.Remember(),
                session_key: this.model.sessionKey(),
                identify_code: vcode
            }, t = this;
            this.model.login(false);
            if (go_through_uc) {
                ucManager.login(account, password).then(function (res) {
                    if (typeof res == "object") {
                        var myDate = new Date();
                        myDate.setTime(myDate.getTime() - 1000);//设置时间
                        document.cookie = "sso_version=1.0" + ";path=/" + projectCode;
                        store.aucLogin(data).then(function (data) {
                            t.success(data);
                        },$.proxy(t.session,t)).always(function(){
                             t.model.login(true);
                        });
                    } else {
                        viewModel.setError(null, res);
                        viewModel.model.login(true);
                        t.session();
                    }

                });
            } else {
                store.aucLogin(data).then(function (data) {
                    t.success(data);
                },$.proxy(this.session,this)).always(function(){
                    t.model.login(true);
                })
            }
        },
        success: function (data) {
            viewModel.historySet(viewModel.model.user.Account());
            if (returnurl) {
                    location.href = decodeURIComponent(returnurl).replace('{project_domain}',(data.project_domain||''));
            }
            else {
                if(isOpen){
                    location.href = selfUrl +  '/' + (data.project_domain || '');
                }else{
                    location.href = selfUrl + '/' + projectCode;
                }

            }
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
        },
        session:function(){
            var deviceId = this.model.device_id(),
                that = this;
          return store.getSession(deviceId).then(function(res){
                  that.model.sessionId(res.session_id);
                  that.model.sessionKey(res.session_key);
                  that.model.isNormal(res.is_normal);
            })
        },
        r: function(){
            this.model.r(Math.random())
        }
    };

    $(function () {
        new Fingerprint2().get(function(hash){
            viewModel.init(hash);
        })
    });
}(jQuery));