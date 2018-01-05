;(function (window, $, ko) {
    var _getKeyValue = i18nHelper.getKeyValue;
    var selfUrl = window.selfUrl || "";
    var store = {
        savePassword: function (data) {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/accounts/password/modify",
                dataType: "json",
                type: "PUT",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
            });
        }
    };
    var viewModel = {
        model: {
            user: {
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            },
            login: {
                enable: 1,
                index: -1,
                error: ""
            }
        },
        init: function () {
            document.title = _getKeyValue("common.frontPage.projectPasswordModify", {projectTitle: projectTitle});
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('sign-up-container'));
            this.validate();
        },
        validate: function () {
            var form = $('#j_reg'),
                that = this;
            $.validator.addMethod('pwd', function (value, element) {
                return /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/.test(value) && value.length < 21;
            }, _getKeyValue("password.validate.invalid_password"));
            $.validator.addMethod('blankCharacter', function (value, element) {
                return !(/\s/.test(value));
            }, _getKeyValue("password.validate.blank_character"));
            form.validate({
                onkeyup: false,
                errorElement: "p",
                errorClass: 'reg-layer-error-text',
                errorPlacement: function (error, element) {
                    error.appendTo(element.parents('.reg-layer-control-group'));
                },
                rules: {
                    oldPassword: {
                        blankCharacter: true
                    },
                    newPassword: {
                        pwd: true,
                        blankCharacter: true
                    },
                    confirmPassword: {
                        equalTo: '#newPassword'
                    }
                },
                messages: {
                    confirmPassword: {
                        equalTo: _getKeyValue("password.validate.invalid_confirm_password")
                    }
                },
                highlight: function (input) {
                    $(input).parents('.reg-layer-control-group').addClass('reg-layer-error');
                },
                success: function (label) {
                    $(label).parents('.reg-layer-control-group').removeClass('reg-layer-error');
                }

            })

        },
        savePassword: function () {
            var form = $('#j_reg'),
                that = this;
            this.model.login.index(-1);
            form.validate().resetForm();
            if (!form.valid()) return;
            var user = ko.mapping.toJS(this.model.user), postData = {
                old_password: getMD5Value(user.oldPassword),
                new_password: getMD5Value(user.newPassword)
            };
            var fn = this.model.login.enable;
            if (!fn()) return;
            fn(0);
            store.savePassword(postData).done(function () {
                $.fn.udialog.alert(_getKeyValue('password.modify.success'), {
                    width: '460px',
                    title: _getKeyValue('dialogWidget.frontPage.systemTip'),
                    buttons: [{
                        text: _getKeyValue('dialogWidget.frontPage.confirm'),
                        click: function () {
                            $(this).udialog('hide');
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
                fn(1);
                that.logout();
                setTimeout(function () {
                    location.href = selfUrl +  "/" + projectCode + "/account/login";
                }, 2000)
            }).fail(function (res) {
                var res = JSON.parse(res.responseText);
                that.error(res.code, res.message);
                fn(1);
            });
        },
        error: function (code, message) {
            var index = this.model.login.index,
                error = this.model.login.error;
            switch (code) {
                case "UC/ACCOUNT_NOT_EXIST":
                case "UC/PASSWORD_INVALID":
                    index(0);
                    break;
                case "UC/PASSWORD_SAME":
                    index(1);
                    break;
                default:
                    index(0);
                    break;
            }
            var text;
            if (code.indexOf('UC') == 0 && languageCode != ('zh-CN')) {
                text = code.substring(3);
            } else {
                text = message;
            }
            error(text || 'Account Error, Please Change Account');
        },
        logout: function () {
            window.CloudAtlas && CloudAtlas.onProfileSignOff();
            if (go_through_uc) {
                var need_uc_logout = false;
                var myDate = new Date();
                myDate.setTime(myDate.getTime() - 1000);//设置时间
                var data = document.cookie;
                var dataArray = data.split(";");
                for (var i = 0; i < dataArray.length; i++) {
                    var varName = dataArray[i].split("=");
                    var name = $.trim(varName[0]);
                    if (name.indexOf("sso_version") >= 0) {
                        need_uc_logout = true;
                    }
                }
                if (need_uc_logout) {
                    ucManager.logOut().then(function (res) {
                        if (res == "success") {
                            document.cookie = "sso_version=; expires=" + myDate.toGMTString();
                            (new Image()).src = selfUrl + "/" + projectCode + "/account/logout";
                        }
                    });
                } else {
                    (new Image()).src = selfUrl + "/" + projectCode + "/account/logout";
                }
            } else {
                (new Image()).src = selfUrl + "/" + projectCode + "/account/logout";
            }
        },
    };
    $(function () {
        viewModel.init();
    });

})(window, jQuery, ko);