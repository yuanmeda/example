(function ($, window) {
    var store = {
        getEnrollForm: function () {
            var url = serviceDomain + '/v1/learning_units/' + unitId + '/enroll_forms';
            return $.ajax({
                url: url,
                type: 'get'
            });
        },
        getUserEnrollDetail: function () {
            var url = serviceDomain + '/v1/user/enrollments/' + userEnrollId + '/enroll_forms';
            return $.ajax({
                url: url,
                type: 'get'
            });
        },
        updateUserEnrollDetail: function (data) {
            var url = serviceDomain + '/v1/user/enrollments/' + userEnrollId + '/enroll_forms';
            return $.ajax({
                url: url,
                type: 'put',
                data: JSON.stringify(data) || null,
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var validFormat = function (item) {
        this.name = item.name;
        this.input_type = item.input_type;
        this.tips = item.tips;
        this.required = item.required;
        this.code = item.code;
        this.extra = item.extra || null;
        if ($.isArray(item.answer)) {
            this.answer = ko.observableArray(item.answer).extend({
                required: {
                    params: this.required,
                    message: this.name + '是必填项'
                }
            });
        } else {
            this.answer = ko.observable(item.answer).extend({
                required: {
                    params: this.required,
                    message: this.name + '是必填项'
                }
                //maxLength: {
                //    params: 200,
                //    message: '最大长度为{0}'
                //}
            });
        }
        switch (this.input_type) {
            case 'picture':
            case 'attachment':
                this.answer.extend({
                    maxLength: {
                        params: this.extra.number_limit,
                        message: this.name + '数量最多为' + this.extra.number_limit
                    }
                });
                break;
            case 'number':
                this.answer.extend({
                    number: {
                        params: true,
                        message: this.name + '必须为数字'
                    },
                    maxLength: {
                        params: 200,
                        message: this.name + '最大长度为{0}'
                    }
                });
                break;
            case 'e-mail':
                this.answer.extend({
                    email: {
                        params: true,
                        message: this.name + '不符合邮箱格式'
                    },
                    maxLength: {
                        params: 200,
                        message: this.name + '最大长度为{0}'
                    }
                });
                break;
            case 'text':
            case 'address':
            case 'textarea':
                this.answer.extend({
                    maxLength: {
                        params: 200,
                        message: this.name + '最大长度为{0}'
                    }
                });
                break;

        }
    };
    var viewModel = {
            model: {
                forms: [],
                init: false,
                verifyText: "点击获取验证码",
                vsSuccess: false,
                ifVerify: false,
                virfycheckSuccess: null
            },
            info: ko.observable(null),
            type: ko.observable('detail'),
            init: function () {
                this._validateInit();
                this.model = ko.mapping.fromJS(this.model);
                this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
                ko.applyBindingsWithValidation(this);
                this._getInitData();
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
            _getInitData: function () {
                var vm = this;
                $.when(store.getEnrollForm(), store.getUserEnrollDetail())
                    .done(function (formLists, details) {
                        var formList = formLists[0].settings;
                        var answers = details[0].settings;
                        var settingFiles = details[0].setting_files || [];
                        $.each(formList, function (index, form) {
                            if (form.input_type == 'checkbox') {
                                form.answer = answers[form.code] ? answers[form.code] : [];
                            } else if (form.input_type == 'date') {
                                form.answer = answers[form.code] ? answers[form.code].split('T')[0] : '';
                            } else if (form.input_type == 'number') {
                                //"" + answers[form.code] 为了避免为0的情况
                                form.answer = ((answers[form.code] != undefined) && ("" + answers[form.code])) ? answers[form.code] : null;
                            } else if (form.input_type == 'picture' || form.input_type == 'attachment') {
                                var uuids = answers[form.code] || [];
                                form.answer = [];
                                if (uuids.length > 0) {
                                    $.each(uuids, function (index, uuid) {
                                        var id = uuid.split(':')[1];
                                        $.each(settingFiles, function (fileIndex, file) {
                                            if (file.id == id) {
                                                form.answer.push({
                                                    id: file.id,
                                                    source_file_name: file.source_file_name,
                                                    source: file.source,
                                                    size: file.size,
                                                    url: file.urls[0]
                                                })
                                            }
                                        });
                                    });
                                }
                            } else {
                                form.answer = answers[form.code] ? answers[form.code] : "";
                            }
                            vm.model.forms.push(new validFormat(form));
                        });
                        vm.model.init(true);
                    });
            },
            editButtonAction: function () {
                this.type('edit');
            },
            saveButtonAction: function () {
                if (!this.validationsInfo.isValid()) {
                    this.validationsInfo.errors.showAllMessages();
                    var errors = this.validationsInfo.errors();
                    $.fn.dialog2.helpers.alert(errors[0]);
                    return;
                }

                var forms = ko.mapping.toJS(this.model.forms);
                this.type('detail');

                var newAnswerList = {};
                $.each(forms, function (index, form) {
                    switch (form.input_type) {
                        case 'date':
                            newAnswerList[form.code] = form.answer ? form.answer + 'T00:00:00Z' : null;
                            break;
                        case 'number':
                            if (form.answer != null && form.answer + "") {
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
                store.updateUserEnrollDetail({settings: newAnswerList})
                    .done($.proxy(function (res) {
                        $.fn.dialog2.helpers.alert("保存成功");
                        this.type('detail');
                    }, this));
            }
        }
        ;

    $(function () {
        viewModel.init();
    });

})(jQuery, window);
