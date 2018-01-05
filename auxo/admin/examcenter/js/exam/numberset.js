(function () {
    var store = {
        get: function () {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + examId + '/exam_period',
                cache: false,
                dataType: 'json'
            });
        },
        update: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + examId + '/exam_period',
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var viewModel = {
        model: {
            examPeriod: {
                begin_date: "",
                end_date: "",
                periodic_type: 1, //默认值为1
                periodic_days: [], //周期设置传入数组
                pre_create_seconds: 0 //最小值0，暂无最大值
            }
        },
        return_url:return_url||"",
        init: function () {
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

            // $('#beginDate').datetimepicker({ language: 'zh-CN', autoclose: true, minView: "month" });
            // $('#endDate').datetimepicker({ language: 'zh-CN', autoclose: true, minView: "month" });

            $('#beginDate').datepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                dateFormat: "yy/mm/dd",
                minView: "month"
            });
            $('#endDate').datepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                dateFormat: "yy/mm/dd",
                minView: "month"
            });


            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this);
            this._validateInit();
            this._bindingsExtend();

            if (examId) {
                store.get().done($.proxy(function (data) {
                    if (data) {
                        data.begin_date = data.begin_date && timeZoneTrans(data.begin_date).split(' ')[0];
                        data.end_date = data.end_date && timeZoneTrans(data.end_date).split(' ')[0];
                        $.each(data.periodic_days, function (index, day) {
                            data.periodic_days[index] = "" + day;
                        });
                        data.pre_create_seconds = data.pre_create_seconds ? data.pre_create_seconds / 3600 : 0;
                        ko.mapping.fromJS(data, {}, this.model.examPeriod);
                    }
                }, this));
            }
        },

        _validateInit: function () {
            ko.validation.rules['endDateRules'] = {
                validator: function (obj, params) {
                    if (!obj)
                        return true;
                    var beginDate = params;
                    var endDate = obj;
                    beginDate = beginDate.replace(/-/g, "/");
                    endDate = endDate.replace(/-/g, "/");
                    if (new Date(beginDate).getTime() > new Date(endDate).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }.bind(this),
                message: '结束时间不能早于开始时间'
            };
            ko.validation.rules['periodic_days'] = {
                validator: function (obj) {
                    return obj.length > 0;
                }.bind(this),
                message: '周期设置不能为空'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var examPeriod = this.model.examPeriod;

            examPeriod.pre_create_seconds.extend({
                required: {
                    value: true,
                    message: '考试提前创建时长不能为空',
                },
                min: {
                    params: 0,
                    message: '考试提前创建时长为不能小于0的整数'
                },
                max: {
                    params: 1000,
                    message: '考试提前创建时长不能大于1000'
                }
            });
            examPeriod.begin_date.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空'
                }
            });
            examPeriod.end_date.extend({
                endDateRules: {
                    params: examPeriod.begin_date,
                    onlyIf: function () {
                        return examPeriod.begin_date() && examPeriod.end_date()
                    }
                }
            });
            examPeriod.periodic_days.extend({
                periodic_days: {
                    prams: examPeriod.periodic_days
                }
            });
        },

        cancel: function () {
            if (this.return_url) {
                window.location = this.return_url;
            } else {
                window.location = '/' + projectCode + "/exam_center/index";
            }
        },
        save: function () {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var examPeriod = ko.mapping.toJS(this.model.examPeriod);
            $.each(examPeriod.periodic_days, function (index, period) {
                examPeriod.periodic_days[index] = +period;
            });
            examPeriod.begin_date = timeZoneTrans(examPeriod.begin_date + ' 00:00:00');
            if(examPeriod.end_date){
                examPeriod.end_date = timeZoneTrans(examPeriod.end_date + ' 23:59:59');
            }

            examPeriod.pre_create_seconds = examPeriod.pre_create_seconds * 3600;
            store.update(examPeriod)
                .done(function (data) {
                    $.fn.dialog2.helpers.alert("保存成功");
                });
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));