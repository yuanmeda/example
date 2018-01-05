; (function ($, window) {
    'use strict';
    var _ = ko.utils;
    //数据仓库
    var store = {
        //获取用户最近一次报名信息
        getLatestEnroll: function () {
            var url = window.self_host + '/v1/user/latest_enrollments?unit_id=' + unitId;
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        //获取报名配置(GET)
        getEnrollInfo: function () {
            var url = serviceDomain + '/v1/learning_units/' + unitId + '/enrolls';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        //报名(POST)
        userEnroll: function () {
            var url = serviceDomain + '/v1/user/enrollments/actions/enroll?unit_id=' + unitId;
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf8'
            });
        },
        //获取表单配置 
        getEnrollForm: function () {
            var url = serviceDomain + '/v1/learning_units/' + unitId + '/enroll_forms';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        //更新用户报名表单        
        updateEnrollForm: function (enrollId, data) {
            var url = serviceDomain + '/v1/user/enrollments/' + enrollId + '/enroll_forms';
            return $.ajax({
                url: url,
                data: JSON.stringify(data) || null,
                dataType: 'json',
                type: 'PUT',
                contentType: 'application/json;charset=utf8'
            });
        },
        //查询用户报名表单
        getUserEnrollDetail: function (enrollId) {
            var url = serviceDomain + '/v1/user/enrollments/' + enrollId + '/enroll_forms';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        //获取验证
        verifyPhone: function (num) {
            var url = window.self_host + '/v1/mobile_verification_codes';
            return $.ajax({
                url: url,
                data: JSON.stringify(num) || null,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf8'
            });
        },
        //手机后台验证
        verifyBackPhone: function (num) {
            var url = window.self_host + '/v1/mobile_verification_code/actions/valid';
            return $.ajax({
                url: url,
                data: JSON.stringify(num) || null,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: function (data) {
                    var aaa = viewModel.model.verifyBackResponse(JSON.parse(data.responseText).message);
                    viewModel._selfAlertB(viewModel.model.verifyBackResponse());
                    viewModel.model.verifyBackDisable(false);
                }
            });
        },
    };
    var validFormat = function (item) {
        this.name = item.name;
        this.input_type = item.input_type;
        this.tips = item.tips;
        this.required = item.required;
        this.code = item.code;
        this.extra = item.extra || null;
        if (item.name == "手机号") {
            viewModel.model.hasPhone(true);
            viewModel.model.ifVerify = item.extra.sms_valid;
        }
        if ($.isArray(item.answer)) {
            this.answer = ko.observableArray(item.answer).extend({
                required: {
                    params: this.required,
                    message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.require')
                }
            });
        } else {
            this.answer = ko.observable(item.answer).extend({
                required: {
                    params: this.required,
                    message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.require')
                }
            });
        }
        switch (this.input_type) {
            case 'picture':
            case 'attachment':
                this.answer.extend({
                    maxLength: {
                        params: this.extra.number_limit,
                        message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.numLimit') + this.extra.number_limit
                    }
                });
                break;
            case 'number':
                this.answer.extend({
                    number: {
                        params: true,
                        message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.mustNum')
                    },
                    maxLength: {
                        params: 200,
                        message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.longLimit') + '{0}'
                    }
                });
                break;
            case 'e-mail':
                this.answer.extend({
                    email: {
                        params: true,
                        message: i18nHelper.getKeyValue('enrollComponent.valid.mailLimit')
                    },
                    maxLength: {
                        params: 200,
                        message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.longLimit') + '{0}'
                    }
                });
                break;
            case 'text':
            case 'address':
            case 'textarea':
                this.answer.extend({
                    maxLength: {
                        params: 200,
                        message: this.name + i18nHelper.getKeyValue('enrollComponent.valid.longLimit') + '{0}'
                    }
                });
                break;

        }
    };
    var form = {
        input_type: 'text',
        name: '验证码',
        answer: '',
        required: false,
        tips: ''
    }
    //课程列表数据模型
    var viewModel = {
        model: {
            enroll_form_type: 0,//0、不需表单1、需要表单
            enroll_status: 0, //0、待审核 1、审核拒绝 2、待付款 3、已取消 4、报名成功 5、待填写表单
            user_enroll_id: '',
            show_page: false,
            forms: [],
            error: {
                verifyError1: "手机号码格式不正确",
                verifyError2: "缺少参数：mobile"
            },
            init_status: true,
            isNewEnroll: true,
            verifyText: '发送手机验证',
            verifyTextBack: '验证',
            hasPhone: false,
            ifVerify: false,
            countdown: 60,
            verifyDisable: false,
            verifyBackDisable: false,
            verifyI: 0,
            verifyTime: null,
            verifyResponse: 'null',
            verifyBackResponse: 'null',
            virfycheckForm: form,
            virfySuccess: false,
            virfycheckSuccess: false,
            vcSuccess: null,
            virfycheckInstred: false,
            vsSuccess: null
        },
        info: ko.observable(null),
        type: ko.observable('edit'),
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            window.document.title = window.i18nHelper ? window.i18nHelper.getKeyValue('enrollComponent.form.editTitle') : '填写报名信息';
            this.model = ko.mapping.fromJS(this.model);
            this._validateInit();
            this.validationsInfo = ko.validatedObservable(this.model, { deep: true });
            ko.applyBindings(this, document.getElementById('container'));
            this.init();
        },
        init: function () {
            var self = this;
            $.when(store.getEnrollInfo(), store.getLatestEnroll()).then(function (data1, data2) {
                var enrollInfo = data1[0], latestEnroll = data2[0];
                if (enrollInfo.enroll_time_limit_type == 1) {
                    var enrollStartTime = enrollInfo.enroll_start_time ? new Date(enrollInfo.enroll_start_time.substr(0, 19).replace('T', ' ').replace(/-/g, '\/')).getTime() : '';
                    var enrollEndTime = enrollInfo.enroll_end_time ? new Date(enrollInfo.enroll_end_time.substr(0, 19).replace('T', ' ').replace(/-/g, '\/')).getTime() : '';
                    if (enrollEndTime < nowTime) {
                        self._selfAlert(i18nHelper.getKeyValue('enrollComponent.form.enrollOver'), 'error', __return_url);
                        return;
                    }
                    if (nowTime < enrollStartTime) {
                        self._selfAlert(i18nHelper.getKeyValue('enrollComponent.form.notStarted'), 'error', __return_url);
                        return;
                    }
                }
                //排除 0待审核 2待付款
                if (!latestEnroll || ~_.arrayIndexOf([1, 3, 4], latestEnroll.status)) {//新流程  无上次报名 或 1审核失败 3已取消 4审核成功
                    if (!enrollInfo.enroll_form_type) {
                        store.userEnroll().done(function () {
                            self._toResultPage();
                        });
                    } else {
                        self.initEnrollForm();
                    }
                } else if (latestEnroll.status == 5) { //继续上次报名 5待填写表单
                    self.model.user_enroll_id(latestEnroll ? latestEnroll.id : '');
                    self.initEnrollForm();
                } else {
                    self._toResultPage();
                }
            })
        },
        _validateInit: function () {
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            ko.validation.registerExtenders();
        },
        initEnrollForm: function () {
            var self = this;
            store.getEnrollForm().done(function (form) {
                if (form && form.settings) {
                    var forms = [];
                    $.each(form.settings, function (index, item) {
                        if (~_.arrayIndexOf(['checkbox', 'picture', 'attachment'], item.input_type)) {
                            item.answer = [];
                        } else if (item.input_type == 'number') {
                            item.answer = null;
                        } else {
                            item.answer = "";
                        }
                        forms.push(new validFormat(item))
                    });
                }
                self.model.forms(forms);
                self.model.show_page(true);
                self.model.init_status(false);
            })
        },

        //更新报名表单
        _updateEnrollForm: function () {
            var _self = this;
            if (!_self.validationsInfo.isValid()) {
                _self.validationsInfo.errors.showAllMessages();
                var errors = _self.validationsInfo.errors();
                this._selfAlert(errors[0]);
                return;
            }
            var forms = ko.mapping.toJS(_self.model.forms);
            var newAnswerList = {}, putData = { settings: newAnswerList };
            $.each(forms, function (index, form) {
                switch (form.input_type) {
                    case 'date':
                        newAnswerList[form.code] = form.answer ? form.answer + 'T00:00:00Z' : null;
                        break;
                    case 'number':
                        if ((form.answer != null) && (form.answer + "")) {
                            newAnswerList[form.code] = +form.answer
                        } else {
                            newAnswerList[form.code] = null;
                        }
                        break;
                    case 'picture':
                    case 'attachment':
                        newAnswerList[form.code] = [];
                        if (form.answer.length > 0) {
                            $.each(form.answer, function (attIndex, ans) {
                                newAnswerList[form.code].push(ans.source + ':' + ans.id);
                            })
                        }
                        break;
                    default:
                        newAnswerList[form.code] = form.answer;
                }
            });
            if (!_self.model.user_enroll_id()) {
                store.userEnroll().done(function (enrollData) {
                    _self.model.user_enroll_id(enrollData.id);
                    store.updateEnrollForm(_self.model.user_enroll_id(), putData).done(function (data) {
                        _self._toResultPage(__return_url);
                    })
                })
            } else {
                store.updateEnrollForm(_self.model.user_enroll_id(), putData).done(function (data) {
                    _self._toResultPage(__return_url);
                })
            }
        },
        saveEnroll: function () {
            var self = this;
            if (self.model.hasPhone() && self.model.ifVerify) {
                if (self.model.virfycheckSuccess()) {
                    this._updateEnrollForm();
                } else {
                    self._selfAlertB("请先完成手机验证")
                }
            } else {
                this._updateEnrollForm();
            }
        },
        cancelEnroll: function () {
            if (__return_url) window.location.href = __return_url;
        },
        //手机验证码
        verify: function () {
            var self = this, phoneCode = '';
            var text = self.model.verifyText();
            var countdown = self.model.countdown();
            var forms = self.model.forms();
            self.model.verifyDisable(true);
            var i = self.model.verifyI();
            for (var o in forms) {
                if (forms[o].name == '手机号') {
                    var data = {};
                    data.mobile = forms[o].answer();
                    if (!self.validatemobile(data.mobile)) {
                        self.model.verifyDisable(false);
                        return;
                    } else {
                        store.verifyPhone(data).done(function (verifyData) {
                            if (verifyData == null) {
                                // self.model.verifyText("重新发送");
                                // self.model.verifyDisable(false);
                                // self.model.verifyResponse(null);
                                // clearInterval(self.model.verifyTime);
                                self.model.virfySuccess(true);
                                self.verifyCheck();
                                self.model.verifyTime = setInterval(function () {
                                    self.update_p(i++, countdown);
                                }, 1000)
                            }
                        }).fail($.proxy(function (data) {
                            $(".ui-dialog").remove();
                            var aaa = this.model.verifyResponse(JSON.parse(data.responseText).message);
                            // if(viewModel.model.verifyResponse() != viewModel.model.error.verifyError1()){
                            this._selfAlert(this.model.verifyResponse());
                            // }
                            this.model.verifyDisable(false);
                        }, this));
                    }
                }
            }
        },
        update_p: function (num, t) {
            var self = this;
            if (num == t) {
                self.model.verifyText("重新发送");
                self.model.virfySuccess(false);
                self.model.verifyDisable(false);
                clearInterval(self.model.verifyTime);
            } else {
                var printnr = t - num;
                self.model.verifyText(" (" + printnr + ")秒后重新发送");
            }
        },
        validatemobile: function(mobile){
            if(mobile.length==0) 
            { 
                viewModel._selfAlert('请输入手机号码！'); 
                return false; 
            }     
            if(mobile.length!=11) 
            { 
                viewModel._selfAlert('请输入有效的手机号码！'); 
                return false; 
            } 
                
            var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
            if(!myreg.test(mobile)) 
            { 
                viewModel._selfAlert('请输入有效的手机号码！'); 
                return false; 
            }
            return true;
        },
        verifyCheck: function () {
            var self = this;
            var forms = self.model.forms();
            if (self.model.virfycheckInstred()) {
                return;
            }
            for (var o in forms) {
                if (forms[o].name == '手机号') {
                    var index = parseInt(o) + 1;
                    forms.splice(index, 0, { input_type: 'text', name: '验证码', answer: '', required: false, tips: '', code: '8103ca96-6e4e-452d-1111-51961b6206a6', extra: {} });
                    self.model.virfycheckInstred(true);
                    self.model.forms([]);
                    self.model.forms(forms);
                }
            }
        },
        verifyBack: function () {
            var self = this;
            var forms = self.model.forms();
            self.model.verifyBackDisable(true);
            var data = {};
            for (var o in forms) {
                if (forms[o].name == '手机号') {
                    data.mobile = forms[o].answer();
                }
                if (forms[o].name == '验证码') {
                    data.code = forms[o].answer;
                    if (data.code == "") {
                        viewModel._selfAlertB("验证码不能为空！");
                        self.model.verifyBackDisable(false);
                        return;
                    }
                    store.verifyBackPhone(data).done(function (verifyData) {
                        if (verifyData == null) {
                            var index = parseInt(o);
                            forms.splice(index, 1);
                            self.model.virfycheckInstred(false);
                            self.model.virfycheckSuccess(true);
                            self.model.forms([]);
                            self.model.forms(forms);
                        } else {
                            var aaa = self.model.verifyBackResponse(verifyData.message);
                            self.model.verifyBackDisable(false);
                            viewModel._selfAlertB(viewModel.model.verifyBackResponse());
                        }
                    })
                    break;
                }
            }
        },
        // 弹窗
        _selfAlert: function (text, icon, url) {
            $.fn.udialog.alert(text, {
                icon: icon || '',
                title: i18nHelper.getKeyValue('enrollComponent.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                        if (url) window.location.href = url;
                    },
                    'class': 'ui-btn-confirm'
                }]
            }, function () {
                if (url) window.location.href = url;
            });
        },
        _selfAlertB: function (text, icon, url) {
            $.fn.udialog.alert(text, {
                icon: icon || '',
                title: i18nHelper.getKeyValue('enrollComponent.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                    },
                    'class': 'ui-btn-confirm'
                }]
            }, function () {
            });
        },
        _toResultPage: function () {
            window.location.replace(window.self_host + "/" + projectCode + "/enroll/enroll_status?unit_id=" + unitId + (__return_url ? '&__return_url=' + encodeURIComponent(__return_url) : ''));
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);
