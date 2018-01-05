;(function (window, $, ko) {
    var store = {
        code: function (data) {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/accounts/sms",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: 'POST'
            });
        },
        register: function (data) {
            return $.ajax({
                url: selfUrl + "/" + projectCode + "/accounts/register",
                dataType: "json",
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8"
            });
        }
    };
    var viewModel = {
        model: {
            user: {
                mobile: "",
                mobile_code: "",
                nick_name: "",
                password: "",
                comfirmPassword: "",
                country_code: ""
            },
            send: {
                text: i18n.register.frontEnd.get_code,
                enable: 0,
                zero: 0
            },
            login: {
                enable: 1,
                index: -1,
                error: ""
            },
            countries: allCountries,
            country: {
                name: 'CN',
                code: '+86'
            }
        },
        init: function () {
            document.title = i18nHelper.getKeyValue("common.frontPage.projectSignUpIn", {projectTitle: projectTitle});
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('sign-up-container'));
            this.validate();
            this.model.country.name.subscribe(function (nv) {
                if (nv) {
                    this.model.country.code('+' + countryCodes[nv.toLowerCase()].code);
                }
            }, this);
            this.model.user.mobile.subscribe(function (data) {
                if (!data) {
                    viewModel.model.send.enable(0);
                    viewModel.model.login.index(-1);
                }
            }, this);
//            if(mobile) $('#mobile').valid();
            viewModel.initMobile();
        },
        validate: function () {
            var form = $('#j_reg'),
                that = this;
            $.validator.addMethod('user', function (value, element) {
                that.model.login.index(-1);
                var result = /^[1][3,4,5,7,8][0-9]{9}$/.test($.trim(value));
                that.model.send.enable(Number(result));
                return this.optional(element) || result;
            }, i18n.register.validate.invalid_mobile);
            $.validator.addMethod('foreignMobile', function (value, element) {
                that.model.login.index(-1);
                var result = /^[0-9]{6,21}$/.test($.trim(value));
                that.model.send.enable(Number(result));
                return this.optional(element) || result;
            }, i18n.register.validate.invalid_mobile);
            $.validator.addMethod('nickname', function (value, element) {
                var reg = /^[\u4e00-\u9fa5A-Za-z\d_]{3,20}$/;
                return this.optional(element) || (reg.test(value));
            }, i18n.register.validate.invalid_nickname_char);
            $.validator.addMethod('pwd', function (value, element) {
                return /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{6,20}$/.test(value) && value.length < 21;
            }, i18n.register.validate.invalid_password);

            $.validator.addMethod('blankcharacter', function (value, element) {
                return !(/\s/.test(value));
            }, i18n.register.validate.blank_character);
            form.validate({
                onkeyup: false,
                errorElement: "p",
                errorClass: 'reg-layer-error-text',
                errorPlacement: function (error, element) {
                    error.appendTo(element.parents('.reg-layer-control-group'));
                },
                rules: {
                    mobile: {
                        user: true,
                        required: true
                    },
                    foreign: {
                        required: true,
                        foreignMobile: true
                    },
                    code: {
                        required: true
                    },
                    nickName: {
                        required: true,
                        minlength: 3,
                        maxlength: 20,
                        nickname: true
                    },
                    password: {
                        pwd: true,
                        blankcharacter: true
                    },
                    confirmPassword: {
                        equalTo: '#password'
                    }
                },
                messages: {
                    mobile: {
                        required: i18n.register.validate.none_mobile
                    },
                    foreign: {
                        required: i18n.register.validate.none_mobile,
                        foreignMobile: i18n.register.validate.invalid_mobile
                    },
                    code: {
                        required: i18n.register.validate.invalid_verification_code
                    },
                    nickName: {
                        required: i18n.register.validate.invalid_nickname,
                        minlength: i18n.register.validate.invalid_nickname_min,
                        maxlength: i18n.register.validate.invalid_nickname_max
                    },
                    confirmPassword: {
                        equalTo: i18n.register.validate.invalid_confirm_password
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
        code: function () {
            var send = this.model.send;
            if (!send.enable() || send.zero()) return;
            this.model.login.index(-1);
            var mobile = this.model.user.mobile(),
                that = this;
            var data = {
                mobile: mobile,
                sign: getMD5Value(mobile + mobile.split('').reverse().join('')),
                country_code: this.model.country.code()
            };
            store.code(data)
                .done(function () {
                    that.countZero();
                })
                .fail(function (res) {
                    var res = JSON.parse(res.responseText);
                    that.error(res.code, res.message);
                });
        },
        countZero: function () {
            var count = 60,
                obj = this.model.send,
                text = obj.text();

            function zero() {
                setTimeout(function () {
                    --count;
                    if (!count) {
                        obj.text(text);
                        obj.zero(0);
                        return;
                    }
                    obj.text(count + 's');
                    zero();
                }, 1000);
            }

            zero();
            obj.zero(1);
        },
        reg: function () {
            var form = $('#j_reg'),
                that = this;
            this.model.login.index(-1);
            form.validate().resetForm();
            if (!form.valid()) return;
            var user = ko.mapping.toJS(this.model.user);
            user.mobile = $.trim(user.mobile);
            user.mobile_code = encodeURIComponent($.trim(user.mobile_code));
            user.password = getMD5Value(user.password);
            user.country_code = this.model.country.code();
            user.comfirmPassword = undefined;
            var fn = this.model.login.enable;
            if (!fn()) return;
            fn(0);
            store.register(user)
                .done(function () {
                    var searchArr = location.search.split('='), returnUrl = "";
                    $.each(searchArr, function (i, v) {
                        if (~v.toLowerCase().indexOf('returnurl')) {
                            returnUrl = decodeURIComponent(searchArr[i + 1]);
                            return false;
                        }
                    });
                    if (returnUrl) {
                        location.href = returnUrl;
                    } else {
                        window.location = selfUrl + '/' + projectCode + '/account/login';
                    }
                    fn(1);
                })
                .fail(function (res) {
                    var res = JSON.parse(res.responseText);
                    that.error(res.code, res.message);
                    fn(1);
                });
        },
        initMobile: function () {
            var result = [];
            $.each(allCountries, function () {
                if (countryCodes[this.countryCode.toLowerCase()]) {
                    this.mobile_country = this.name + (countryCodes[this.countryCode.toLowerCase()] ? ' (+' + countryCodes[this.countryCode.toLowerCase()].code + ')' : '');
                    result.push(this);
                }
            });
            viewModel.model.countries(result);
            viewModel.model.country.name('CN');
        },
        error: function (code, message) {
            var index = this.model.login.index,
                error = this.model.login.error;
            switch (code) {
                case "UC/SMS_EXPIRED":
                case "UC/SMS_INVALID":
                    index(1);
                    break;
                case "UC/PHONE_HAS_REGISTER":
                    index(0);
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
        }
    };
    $(function () {
        viewModel.init();
    });

})(window, jQuery, ko);