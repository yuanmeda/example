; (function ($, window) {
    'use strict';
    var _ = ko.utils;
    var store = {
        //GET 报名设置
        getEnrollSetting: function () {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enrolls',
                dataType: 'json',
                type: 'GET',
                contentType: 'application/json;charset=utf8'
            });
        },
        //GET 常用字段
        getCommonEnrollFormFields: function () {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_fields',
                dataType: 'json',
                cache: false
            });
        },
        //GET 报名表单配置
        getEnrollForms: function (unit_id) {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enroll_forms',
                dataType: 'json',
                cache: false
            });
        },
        //DELETE 报名表单配置
        deleteEnrollForms: function (unit_id) {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enroll_forms',
                type: 'delete',
                dataType: 'json'
            });
        },
        //PUT 报名表单配置
        updateEnrollForms: function (unit_id, data) {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enroll_forms',
                type: 'put',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data)
            });
        },
        //GET 模板表单配置
        getEnrollFormTemplates: function (enroll_form_template_id) {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_templates/' + enroll_form_template_id,
                dataType: 'json',
                cache: false
            });
        },
        //POST 模板表单配置
        createEnrollFormTemplates: function (data) {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_templates/',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data)
            });
        },
        //PUT 模板表单配置
        updateEnrollFormTemplates: function (enroll_form_template_id, data) {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_templates/' + enroll_form_template_id,
                type: 'put',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data)
            });
        }
    };
    var inputTypes = [
        { "title": '单行文本框', "input_type": "text", "extra": {} },
        { "title": '数字输入框', "input_type": "number", "extra": {} },
        { "title": '日期选择框', "input_type": "date", "extra": {} },
        { "title": '邮箱输入框', "input_type": "e-mail", "extra": {} },
        { "title": '多行文本框', "input_type": "textarea", "extra": {} },
        { "title": '单选按钮框', "input_type": "radio", "extra": { "options": [] } },
        { "title": '多选按钮框', "input_type": "checkbox", "extra": { "options": [] } },
        { "title": '下拉选择框', "input_type": "select", "extra": { "options": [] } }
    ];
    var viewModel = {
        model: {
            commonSettings: [],
            customSettings: [],
            enroll_form_type: 0,
            formTemplate: {
                title: '',
                settings: []
            },
            type: 'edit',
            showPreview: false,
            verifyText: "点击获取验证码",
            virfycheckSuccess: null,
            ifVerify: false,
            pVerifyValue: false,
            pVerifyValueB: false,
            hasPhone: false,
            phoneCount: 0,
            vsSuccess: false,
            verify_ids: []
        },
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.customSettings(inputTypes);
            ko.validation.init({
                "errorsAsTitleOnModified": true,
                "decorateInputElement": true,
                "messagesOnModified": true
            });
            ko.validation.registerExtenders();
            this.model.formTemplate.title.extend({
                required: { params: true, message: "模板名称不能为空" },
                maxLength: { params: 50, message: "模板名称不能超过50字" }
            });
            this.model.formForPreview = ko.pureComputed(function () {
                var settings = this.model.formTemplate.settings();
                return _.arrayMap(settings, function (item) {
                    return self.transformSetting(item, true, true);
                });
            }, this);
            ko.applyBindings(this, document.getElementById('js-content'));
            this.model.formTemplate.settings.subscribe(function (data) {
                if (data && data.length) {
                    this.initDrag();
                    this.model.validatedInfo = ko.validatedObservable(_.arrayMap(data, function (item) {
                        var validateGroup = [item.name, item.tips];
                        if (item.extra.number_limit) validateGroup.push(item.extra.number_limit);
                        return validateGroup;
                    }), { deep: true });
                } else {
                    this.model.validatedInfo = undefined;
                }
            }, this);
            this.model.pVerifyValue.subscribe($.proxy(function (newValue) {
                this.model.ifVerify=newValue;
            }, this));
            this.getEnrollSetting();
            this.getCommonEnrollFormFields();
            this.getDataSourcce().done(function (data) {
                if (data) {
                    if (data.title) self.model.formTemplate.title(data.title);
                    var settings = _.arrayMap(data.settings, function (item) {
                        return self.transformSetting(item);
                    });
                    self.model.formTemplate.settings(settings);
                }
            });
        },
        getEnrollSetting: function () {
            var self = this;
            store.getEnrollSetting().done(function (data) {
                self.model.enroll_form_type(data.enroll_form_type);
            })
        },
        /**
         * 配置转换器
         * @param item
         * @param isObservable
         * @param forPreview
         * @returns {*}
         */
        transformSetting: function (item, isObservable, forPreview) {
            if(item.name=="手机号"){
                if(item.name == "手机号"){
                    this.model.phoneCount(this.model.phoneCount()+1);
                }
                this.model.hasPhone(true);
                if(item.extra.sms_valid!=null){
                    this.model.pVerifyValueB = item.extra.sms_valid;
                    if(!this.model.pVerifyValue()){
                        this.model.pVerifyValue(this.model.pVerifyValueB);
                    }
                }
            }
            if(isObservable&&this.model.hasPhone()&&item.name()=="手机号"){
                if(this.model.pVerifyValue()){
                    item.extra.sms_valid = true;
                    this.model.ifVerify = item.extra.sms_valid;
                }else{
                    // item.extra.sms_valid = this.model.pVerifyValueB;
                    item.extra.sms_valid = false;
                    this.model.pVerifyValueB = false;
                }
            }
            var returnItem = null;
            if (isObservable) {
                returnItem = {
                    "name": ko.toJS(item.name),
                    "input_type": item.input_type,
                    "tips": ko.toJS(item.tips),
                    "required": ko.toJS(item.required),
                    "extra": $.extend(true, {}, ko.toJS(item.extra)),
                    "code": item.code || ""
                };
                if (forPreview) {
                    if (['picture', 'attachment', 'checkbox'].indexOf(returnItem.input_type) > -1) {
                        returnItem.answer = ko.observableArray([]);
                    } else {
                        returnItem.answer = ko.observable("");
                    }

                }
                if (returnItem.extra.number_limit) returnItem.extra.number_limit = +returnItem.extra.number_limit;
            } else {
                returnItem = {
                    "name": ko.observable(item.name || '').extend({
                        "required": { "params": true, "message": "名称不能为空" },
                        "maxLength": { "params": 5, "message": "名称不能超过5个字" }
                    }),
                    "input_type": item.input_type,
                    "tips": ko.observable(item.tips || '').extend({
                        "maxLength": { "params": 100, "message": "提示信息不能超过100个字" }
                    }),
                    "required": ko.observable(item.required || false),
                    "extra": {},
                    "code": item.code || ""
                };
                if (item.extra && item.extra.options) {
                    returnItem.local = { "addOption": ko.observable(''), "addFlag": ko.observable(false) };
                    returnItem.extra.options = ko.observableArray(item.extra.options.concat());
                }
                if (item.extra && item.extra.number_limit) {
                    returnItem.extra.number_limit = ko.observable(item.extra.number_limit).extend({
                        "required": { "params": true, "message": "限制不能为空" },
                        "digit": { "params": true, "message": "必须为整数" },
                        "min": { "params": 1, "message": "必须在1-100范围内" },
                        "max": { "params": 100, "message": "必须在1-100范围内" }
                    });
                }
            }
            return returnItem || item;
        },
        getCommonEnrollFormFields: function () {
            var self = this;
            store.getCommonEnrollFormFields().done(function (data) {
                var notSupportedTypes = ['address', 'picture', 'attachment'];
                var resItems = _.arrayFilter(data, function (item) {
                    return !~_.arrayIndexOf(notSupportedTypes, item.input_type);
                });
                self.model.commonSettings(data);
            })
        },
        getDataSourcce: function () {
            return window.enroll_form_template_id ? store.getEnrollFormTemplates(window.enroll_form_template_id) : store.getEnrollForms(window.unit_id);
        },
        toggleOption: function ($data) {
            var flag = $data.local.addFlag, option = $data.local.addOption;
            if (flag()) {
                var options = $data.extra.options, input = $.trim(option());
                if (~$.inArray(input, options())) {
                    $.fn.dialog2.helpers.alert("选项不能有重复项");
                } else {
                    input && options.push(input);
                    option('');
                    flag(!flag());
                }
            } else {
                flag(!flag());
            }
        },
        initDrag: function () {
            var self = this, list = $("#setting_list");
            list.dragsort("destroy");
            list.dragsort({
                dragSelector: "li",
                scrollContainer: '#setting_list',
                dragSelectorExclude: "input, textarea, a, label",
                placeHolderTemplate: '<li class="setting-item drag-placeholder"></li>',
                dragBetween: true,
                dragEnd: function () {
                    var dragResult = [], sort_number = this.data("sort_number"), settings = self.model.formTemplate.settings();
                    $("#setting_list").find(".setting-item").each(function (index, element) {
                        dragResult.push(settings[+$(element).data("sort_number") - 1]);
                    });
                    self.model.formTemplate.settings([]);
                    self.model.formTemplate.settings(dragResult);
                }
            });

        },
        saveForm: function (isSaveFormTemplate) {
            if (!this.model.formTemplate.settings().length) return;
            if (this.model.validatedInfo && !this.model.validatedInfo.isValid()) {
                this.model.validatedInfo.errors.showAllMessages();
                return;
            }
            var self = this, settings = this.model.formTemplate.settings(), postData = [], valid = true;
            $.each(settings, function (index, item) {
                var res = self.transformSetting(item, true);
                if (res.extra.options && !res.extra.options.length) {
                    valid = false;
                    return false;
                }
                postData.push(res);
            });
            if (!valid) return;
            postData = { settings: postData };
            if (isSaveFormTemplate) {
                var errors = ko.validation.group(this.model.formTemplate.title);
                if (errors().length) {
                    errors.showAllMessages();
                    return;
                }
                postData.title = this.model.formTemplate.title();
                return window.enroll_form_template_id ? store.updateEnrollFormTemplates(window.enroll_form_template_id, postData) : store.createEnrollFormTemplates(postData);
            } else {
                return store.updateEnrollForms(window.unit_id, postData);
            }
        },
        executeDelete: function () {
            $.fn.dialog2.helpers.confirm("确认要删除表单吗？", {
                "confirm": function () {
                    store.deleteEnrollForms(unit_id).done(function () {
                        var options = { id: 'systemModal' };
                        options.close = function () {
                            window.location.href = __return_url ? decodeURIComponent(__return_url) : "/" + project_code + "/admin/enroll/form?unit_id=" + unit_id;
                        };
                        $.fn.dialog2.helpers.alert("删除自定义表单配置成功！", options);
                        setTimeout(function () {
                            $('#systemModal').closest('.modal').find('.btn').click();
                        }, 3000)
                    })
                },
                title: "确认删除"
            });
        },
        executeSave: function (isSaveFormTemplate) {
            var getter = this.saveForm(isSaveFormTemplate);
            if (getter) {
                getter.done(function () {
                    $('#formTemplateModal').modal('hide');
                    var options = { id: 'systemModal' };
                    if (!isSaveFormTemplate) options.close = function () {
                        window.location.href = __return_url ? decodeURIComponent(__return_url) : "/" + project_code + "/admin/enroll/form?unit_id=" + unit_id;
                    };
                    $.fn.dialog2.helpers.alert(isSaveFormTemplate ? (window.enroll_form_template_id ? "模板保存成功！" : "模板添加成功！") : "报名表单已保存！", options);
                    setTimeout(function () {
                        $('#systemModal').closest('.modal').find('.btn').click();
                    }, 300000)
                }).fail(function (xhr) {
                    var res = $.parseJSON(xhr.responseText);
                    var msg = res.message || (isSaveFormTemplate ? (window.enroll_form_template_id ? "模板保存失败！" : "模板添加失败！") : "报名表单保存失败！");
                    $.fn.dialog2.helpers.alert(msg, { id: 'systemModal' });
                    setTimeout(function () {
                        $('#systemModal').closest('.modal').find('.btn').click();
                    }, 3000)
                });
            }
        },
        closeModel: function() {
            var errors = ko.validation.group(this.model.formTemplate.title);
            errors.showAllMessages(false);
        },
        deleteFormItem: function ($data) {
            if($data.name() == "手机号"){
                this.model.phoneCount(this.model.phoneCount()-1);
            }
            console.log(this.model.phoneCount())
            if($data.name() == "手机号"&&this.model.phoneCount()<=0){
                this.model.hasPhone(false)
            }
            this.model.formTemplate.settings.remove($data);
        },
        deleteOption: function ($parent, $index) {
            $parent.extra.options.splice($index, 1);
        },
        addFormItem: function ($data) {
            this.model.formTemplate.settings.push(this.transformSetting($data));
        },
        showModal: function (id) {
            // if (!this.model.validatedInfo)return;
            // if (!this.model.validatedInfo.isValid()) {
            //     this.model.validatedInfo.errors.showAllMessages();
            //     return;
            // }
            var self = this, settings = this.model.formTemplate.settings(), valid = true;
            $.each(settings, function (index, item) {
                var res = self.transformSetting(item, true);
                if (res.extra.options && !res.extra.options.length) {
                    valid = false;
                    return false;
                }
            });
            if (!valid) return;
            if (id == 'formTemplateModal') {
                if (window.enroll_form_template_id) {
                    this.executeSave(true);
                    return;
                }
                this.model.formTemplate.title("");
            } else if (id == 'previewModal') {
                this.model.showPreview(false);
                this.model.showPreview(true);
            }
            $('#' + id).modal('show')
            var errors = ko.validation.group(this.model.formTemplate.title);
            errors.showAllMessages(false);
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
