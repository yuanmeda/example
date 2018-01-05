/**
 * Created by Administrator on 2016/11/2 0002.
 */
void function () {
    var store = {
        get: function () {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enrolls',
                dataType: 'json',
                type: 'GET',
                contentType: 'application/json;charset=utf8'
            });
        },
        create: function (data) {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enrolls',
                dataType: 'json',
                type: 'PUT',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        }
    };

    var viewModel = {
        model: {
            enroll: {
                unit_id: unit_id,
                enroll_type: '0',
                enroll_audit_type: '0',
                enroll_time_limit_type: '0',
                enroll_start_time: "",
                enroll_end_time: "",
                enroll_num_limit: '0',
                payment_amount: '0',
                enroll_attention: ""
            }
        },
        init: function () {
            $('#beginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#endTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });

            this.model = ko.mapping.fromJS(this.model);
            this._validateInit();
            this._bindingsExtend();
            this._editor();
            this.desEditor.readonly(true);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this);
            this.model.enroll.enroll_time_limit_type.subscribe($.proxy(function (newValue) {
                if (newValue == '0') {
                    this.model.enroll.enroll_start_time('');
                    this.model.enroll.enroll_end_time('');
                }
            }, this));
            this.model.enroll.enroll_type.subscribe($.proxy(function (newValue) {
                if (newValue != '1') {
                    this.model.enroll.enroll_audit_type('0');
                    this.model.enroll.enroll_time_limit_type('0');
                    this.model.enroll.enroll_num_limit('0');
                    this.model.enroll.payment_amount('0');
                    this.model.enroll.enroll_attention("");
                    this.desEditor.html("");
                    this.desEditor.readonly(true);
                } else {
                    this.desEditor.readonly(false);
                }
            }, this));

            if (unit_id) {
                store.get().done($.proxy(function (data) {
                    if (data) {
                        data.enroll_type = data.enroll_type ? data.enroll_type + "" : '0';
                        data.enroll_audit_type = data.enroll_audit_type ? data.enroll_audit_type + "" : '0';
                        data.enroll_time_limit_type = data.enroll_time_limit_type ? data.enroll_time_limit_type + "" : '0';
                        data.enroll_num_limit = data.enroll_num_limit ? data.enroll_num_limit + "" : '0';
                        data.payment_amount = data.payment_amount ? data.payment_amount + "" : '0';
                        data.enroll_attention = data.enroll_attention ? data.enroll_attention : '';
                        this.desEditor.html(data.enroll_attention);

                        if (data.enroll_type == '1') {
                            this.desEditor.readonly(false);
                        }
                        ko.mapping.fromJS(data, {}, this.model.enroll);
                        if (data.enroll_start_time) {
                            this.model.enroll.enroll_start_time(timeZoneTrans(data.enroll_start_time));
                        }
                        if (data.enroll_end_time) {
                            this.model.enroll.enroll_end_time(timeZoneTrans(data.enroll_end_time));
                        }
                    }
                }, this));
            }
        },
        //富文本编辑器
        _editor: function () {
            this.desEditor = KindEditor.create('#description', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
                resizeType: 0,
                items: [
                    'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'
                ],
                afterChange: function () {
                    if (!this.desEditor) {
                        return;
                    }
                    if (this.desEditor.count("text") == 0) {
                        this.model.enroll.enroll_attention('');
                    } else {
                        this.model.enroll.enroll_attention(this.desEditor.html());
                    }
                }.bind(this)
            });
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

            ko.validation.rules['endTimeRules'] = {
                validator: function (obj, params) {
                    if (!obj)
                        return true;
                    var beginTime = params;
                    var endTime = obj;
                    if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }.bind(this),
                message: '结束时间不能早于开始时间'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var enroll = this.model.enroll;
            enroll.enroll_start_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.enroll.enroll_time_limit_type() == '1';
                    }, this)
                }
            });
            enroll.enroll_end_time.extend({
                required: {
                    value: true,
                    message: '结束时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.enroll.enroll_start_time() != null && enroll.enroll_start_time();
                    }, this)
                },
                endTimeRules: {
                    params: enroll.enroll_start_time,
                    onlyIf: $.proxy(function () {
                        return this.model.enroll.enroll_start_time() != null && enroll.enroll_start_time();
                    }, this)
                }
            });
            enroll.enroll_num_limit.extend({
                required: {
                    value: true,
                    message: '报名人数限制不能为空',
                },
                digit: {params: true, message: "请输入0~1000的整数"},
                min: {params: 0, message: "请输入不小于0的整数"},
                max: {params: 1000, message: "请输入不大于1000的正整数"}
            });
            enroll.payment_amount.extend({
                required: {
                    value: true,
                    message: '报名付费金额不能为空',
                },
                min: {params: 0, message: "请输入不小于0的数字"},
                max: {params: 10000, message: "请输入不大于10000的正数"}
            });

            enroll.enroll_attention.extend({
                maxLength: {
                    params: 500,
                    message: "输入字数不能大于500字",
                    onlyIf: $.proxy(function () {
                        return this.model.enroll.enroll_attention() != '';
                    }, this)
                }
            });
        },
        prepareData: function (callBack) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var data = ko.mapping.toJS(this.model.enroll);
            data.enroll_type = parseInt(data.enroll_type);
            data.enroll_audit_type = parseInt(data.enroll_audit_type);
            data.enroll_time_limit_type = parseInt(data.enroll_time_limit_type);
            data.enroll_num_limit = parseInt(data.enroll_num_limit);
            data.payment_amount = Number(data.payment_amount);
            /*过滤掉脚本*/
            data.enroll_attention = data.enroll_attention.replace(/&lt;script.*?&gt;.*?&lt;\/script&gt;/ig, '');
            if (data.enroll_time_limit_type) {
                data.enroll_start_time = timeZoneTrans(data.enroll_start_time);
                data.enroll_end_time = timeZoneTrans(data.enroll_end_time);
            }

            if (unit_id) {
                store.create(data).done($.proxy(function (returnData) {
                    if (callBack)
                        callBack();
                    else
                        $.fn.dialog2.helpers.alert('报名设置已保存！');
                }, this));
            }
        },
        /*跳至设置报名表单页*/
        toNext: function () {
            window.location.href = '/' + project_code + "/admin/enroll/enroll_form?unit_id=" + unit_id + '&__return_url=' + encodeURIComponent(__return_url);
        },
        /*点击保存要提示是否保存成功*/
        save: function () {
            this.prepareData.call(this);
        },
        saveThenNext: function () {
            this.prepareData.call(this, this.toNext);
        },
        saveThenSetPay: function () {
            this.prepareData.call(this, function () {
                var pay_url = auxo_pay_gateway_url + "/" + project_code + "/admin/pay/units/" + unit_id + "/strategy?__return_url=" + encodeURIComponent(location.href);
                location.href = pay_url + "&__mac=" + Nova.getMacToB64(pay_url);
            });
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);