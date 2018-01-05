(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        get: function () {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/detail';
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/exams/templates';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'post',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId;
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'put',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        getUploadingInfo: function () {
            var url = '/' + projectCode + '/v1/exams/templates/uploading' + (tmplId ? ('?tmpl_id=' + tmplId) : '');
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };

    function dateTimeObject(beginDate, endDate) {
        ko.validation.rules["beginEndDateRules"] = {
            validator: function (val, begin) {
                var beginDate = begin.replace(/-/g, "/");
                var endDate = val.replace(/-/g, "/");
                if (new Date(beginDate).getTime() >= new Date(endDate).getTime()) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '结束时间不能早于开始时间'
        };
        ko.validation.registerExtenders();
        this.beginDate = ko.observable(beginDate).extend({
            required: {
                params: true,
                message: '开始时间不可以为空'
            }
        });
        this.endDate = ko.observable(endDate).extend({
            required: {
                params: true,
                message: '结束时间不可以为空'
            },
            beginEndDateRules: {
                params: this.beginDate,
                onlyIf: function () {
                    return (this.beginDate() == undefined || this.beginDate() == '') ? false : true;
                }.bind(this)
            }
        });
    }

    function timeObject(beginTime, endTime) {
        ko.validation.rules["beginEndTimeRules"] = {
            validator: function (val, begin) {
                if (begin >= val) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '截止时间需大于开始时间'
        };
        ko.validation.registerExtenders();
        this.beginTime = ko.observable(beginTime).extend({
            required: {
                params: true,
                message: '开始时间不可以为空'
            }
        });
        this.endTime = ko.observable(endTime).extend({
            required: {
                params: true,
                message: '开始时间不可以为空'
            },
            beginEndTimeRules: {
                params: this.beginTime,
                onlyIf: function () {
                    return (this.beginTime() == undefined || this.beginTime() == '') ? false : true;
                }.bind(this)
            }
        });
    }

    var viewModel = {
        model: {
            timeSetDisabled: false,
            validatePeriod: 0,
            exam: {
                title: '',
                examChance: 1,
                cyclicStrategy: '0',//0: Unlimite 不限时间, 1: Noncyclic 自定义时间, 2: DailyCycle 每天循环, 3: WeeklyCycle 每周循环, 4: MonthlyCycle 每月循环!!!!!!
                dateList: [new dateTimeObject()],//自定义时间段{"begin_date": "2015-01-01T00:00:00","end_date": "2015-01-01T00:00:00" }
                beginTime: '',
                endTime: '',
                timeList: [new timeObject()],//循环时的开放时间{beginTime:00:00:00, endTime:00:00:00}
                weekdays: [],//0,1,2,3,4,5,6 周日至周六
                dates: [],//1-30
                examNumPerUser: null,//勾上传Null, 不勾上传1 每次开放时间允许重考!!!!!
                analysisCondStatus: '0',//0: NotAllow 不允许查看, 1: AfterSubmit 交卷后立即查看, 2: NoneExamChance 考试机会用完后查看, 3: TimeLimit 固定时间段查看, 4: DurationLimit 考试截止后查看
                analysisCondData: '',//考试截止后查看，多少分钟后不能查看。格式：string:{"end_seconds" : 1800}
                markApplyEndTime: 0,//改卷申请截止时间（秒）

                description: '',//考试说明
                attachments: [],

                beginDate: '',//循环时的开始日期
                endDate: '',//循环时的结束日期

                type: 'exam',
                offlineExam: true,
                offlineExamType: 1,
                subType: 0,
                enrollType: 0
            }
        },
        attachmentSetting: {
            session: '',
            url: '',
            path: '',
            serverUrl: ''
        },
        init: function () {
            this._validateInit();
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            ko.applyBindings(this);
            this._bindingsExtend();

            this.model.exam.cyclicStrategy.subscribe(function (newStrategy) {
                if (newStrategy == '1') {
                    if (this.model.exam.dateList().length < 1) {
                        this.model.exam.dateList.push(new dateTimeObject())
                    }
                    $("input[id^='datetimepicker']").datetimepicker({
                        language: 'zh-CN',
                        autoclose: true,
                        clearBtn: true
                    });
                } else if (newStrategy == '3') {
                    if (this.model.exam.timeList().length < 1) {
                        this.model.exam.timeList.push(new timeObject());
                    }
                    $("input[id^='timepicker']").timepicker({
                        minuteStep: 5,
                        maxHours: 24,
                        showMeridian: false,
                        defaultTime: false,
                        showSeconds: true,
                        snapToStep: true,
                        showInputs: false
                    });
                    var timeList = ko.mapping.toJS(this.model.exam.timeList);
                    if (timeList.length > 0 && (timeList[0].beginTime || timeList[0].endTime)) {

                    } else {
                        $("input[id^='timepickerBegin']").timepicker().on('show.timepicker', function (e) {
                            $("input[id^='timepickerBegin']").timepicker('setTime', '00:00:00');
                        });
                        $("input[id^='timepickerEnd']").timepicker().on('show.timepicker', function (e) {
                            $("input[id^='timepickerEnd']").timepicker('setTime', '23:00:00');
                        });
                    }
                }
            }.bind(this));

            $("input[id^='datepicker']").datetimepicker({
                autoclose: true,
                clearBtn: true,
                minView: 2,
                format: 'yyyy-mm-dd',
                todayHighlight: 1,
                language: 'zh-CN'
            });
            $('#datepickerWeekBegin').on('changeDate', $.proxy(function (e) {
                $('#datepickerWeekEnd').datetimepicker('setStartDate', e.date);
                //this.model.exam.beginDate(+e.date ? e.date.toJSON() : '');
            }, this));
            $('#datepickerWeekEnd').on('changeDate', $.proxy(function (e) {
                $('#datepickerWeekBegin').datetimepicker('setEndDate', e.date);
                //this.model.exam.endDate(+e.date ? e.date.toJSON() : '');
            }, this));

            store.getUploadingInfo()
                .done($.proxy(function (data) {
                    this.attachmentSetting.session = data.session;
                    this.attachmentSetting.url = data.url;
                    this.attachmentSetting.path = data.path;
                    this.attachmentSetting.serverUrl = data.serverUrl;

                    this._bindUpload();
                }, this));

            if (tmplId) {
                this.model.timeSetDisabled(true);
                store.get()
                    .done(function (data) {
                        this.model.exam.title(data.title);
                        this.model.exam.examChance(data.examChance);
                        this.model.exam.cyclicStrategy(data.cyclicStrategy + '');
                        if (data.cyclicStrategy == 1) {
                            this.model.exam.dateList([]);
                            $.each(data.dateList, function (index, item) {
                                var beginDate = item.beginDate ? Date.format(new Date(Date.formatTimezone(item.beginDate)), 'yyyy-MM-dd HH:mm') : null;
                                var endDate = item.endDate ? Date.format(new Date(Date.formatTimezone(item.endDate)), 'yyyy-MM-dd HH:mm') : null;
                                this.model.exam.dateList.push(new dateTimeObject(beginDate, endDate));
                            }.bind(this));
                            $("input[id^='datetimepicker']").datetimepicker({
                                language: 'zh-CN',
                                autoclose: true,
                                clearBtn: true
                            });
                        } else if (data.cyclicStrategy == 3) {//每周循环
                            this.model.exam.timeList([]);
                            $.each(data.weekdays, function (index, item) {
                                data.weekdays[index] = item + '';
                            });
                            this.model.exam.weekdays(data.weekdays);
                            this.model.exam.beginDate(data.beginDate.split("T")[0]);
                            this.model.exam.endDate(data.endDate.split("T")[0]);
                            $('#endDate').datetimepicker('setStartDate', this.model.exam.beginDate());
                            $('#beginDate').datetimepicker('setEndDate', this.model.exam.endDate());
                            $.each(data.timeList, function (index, item) {
                                this.model.exam.timeList.push(new timeObject(item.beginTime, item.endTime));
                            }.bind(this));
                            $("input[id^='timepicker']").timepicker({
                                minuteStep: 5,
                                maxHours: 24,
                                showMeridian: false,
                                defaultTime: false,
                                showSeconds: true,
                                snapToStep: true,
                                showInputs: false
                            });
                        }
                        this.model.exam.analysisCondStatus(data.analysisCondStatus + '');
                        if (data.analysisCondStatus == 4) {
                            this.model.validatePeriod(((JSON.parse(data.analysisCondData)).end_seconds) / 60);
                        }
                        this.model.exam.markApplyEndTime(data.markApplyEndTime / 60);
                        this.model.exam.description(data.description);
                        data.attachments && data.attachments.length > 0 && this.model.exam.attachments(data.attachments);
                    }.bind(this));
            }
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
            ko.validation.rules['maxArrayLength'] = {
                validator: function (obj, params) {
                    return obj.length <= params.maxLength;
                }
            };
            ko.validation.rules['dateList'] = {
                validator: function (obj, params) {
                    var dateList = ko.mapping.toJS(this.model.exam.dateList);
                    return this.checkDateList(dateList, this.model.exam.markApplyEndTime());
                }.bind(this)
            };

            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var exam = this.model.exam;
            this.model.exam.title.extend({
                required: {
                    params: true,
                    message: '考试名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '考试名称最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                    message: '不可含有非法字符'
                }
            });
            exam.examChance.extend({
                required: {
                    value: true,
                    message: "考试机会不可为空"
                },
                maxLength: {
                    params: 9,
                    message: '考试机会最多{0}位数'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试机会需为大于0的整数'
                }
            }, this);
            exam.weekdays.extend({
                required: {
                    value: true,
                    message: '频次至少选一',
                    onlyIf: $.proxy(function () {
                        return this.model.exam.cyclicStrategy() == '3'
                    }, this)
                }
            });
            exam.beginDate.extend({
                required: {
                    value: true,
                    message: '开放日期不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.exam.cyclicStrategy() == '3'
                    }, this)
                }
            });
            exam.endDate.extend({
                required: {
                    value: true,
                    message: '结束日期不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.exam.cyclicStrategy() == '3'
                    }, this)
                }
            });
            exam.timeList.extend({
                timeList: {
                    params: ko.mapping.toJS(this.model.exam.timeList)
                }
            });
            this.model.validatePeriod.extend({
                required: {
                    value: true,
                    message: "不可为空",
                    onlyIf: $.proxy(function () {
                        return this.model.exam.analysisCondStatus() == '4'
                    }, this)
                },
                maxLength: {
                    params: 7,
                    message: '长度最多{0}'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '请输入正整数',
                    onlyIf: $.proxy(function () {
                        return this.model.exam.analysisCondStatus() == '4'
                    }, this)
                }
            }, this);
            exam.markApplyEndTime.extend({
                required: {
                    value: true,
                    message: "分钟数不可为空"
                },
                maxLength: {
                    params: 5,
                    message: '最多{0}位数'
                },
                pattern: {
                    params: "^[1-9][0-9]*",
                    message: '请输入正整数'
                }
            }, this);
            exam.description.extend({
                maxLength: {
                    params: 200,
                    message: '长度最多{0}'
                }
            });
            exam.attachments.extend({
                maxArrayLength: {
                    params: {maxLength: 10},
                    message: '附件数不能超过10'
                }
            });
            exam.dateList.extend({
                dateList: {
                    params: ko.mapping.toJS(this.model.exam.dateList),
                    message: '自定义时间段不可以重叠(包含改卷申请截止时间！)',
                    onlyIf: $.proxy(function () {
                        return this.model.exam.cyclicStrategy() == '1'
                    }, this)
                }
            });
        },
        addItemToDateList: function () {
            this.model.exam.dateList.push(new dateTimeObject());
            $("input[id^='datetimepicker']").datetimepicker({language: 'zh-CN', autoclose: true, clearBtn: true});
        },
        checkDateList: function (dateList, markApplyEndTime) {
            var flag = true;
            $.each(dateList, function (index, date) {
                date.beginDate = date.beginDate && date.beginDate.replace(' ', 'T');
                date.endDate = date.endDate && date.endDate.replace(' ', 'T');

                for (var i = index + 1; i < dateList.length; i++) {

                    var ifContinue = date.beginDate && date.endDate && dateList[i].beginDate && dateList[i].endDate;
                    if (ifContinue) {

                        dateList[i].beginDate = dateList[i].beginDate.replace(' ', 'T');
                        dateList[i].endDate = dateList[i].endDate.replace(' ', 'T');

                        if (new Date(date.beginDate).getTime() >= new Date(dateList[i].endDate).getTime() + markApplyEndTime * 60000 || new Date(date.endDate).getTime() + markApplyEndTime * 60000 <= new Date(dateList[i].beginDate).getTime()) {
                        } else {
                            flag = false;
                        }
                    }
                }
            });
            return flag;
        },
        doSave: function (callback) {
            if (this.model.exam.cyclicStrategy() != '1') {
                this.model.exam.dateList([]);
            }
            if (this.model.exam.cyclicStrategy() != '3') {
                this.model.exam.timeList([]);
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }

            var exam = ko.mapping.toJS(this.model.exam);

            exam.cyclicStrategy = parseInt(exam.cyclicStrategy);
            if (exam.cyclicStrategy == 1) {//自定义时间
                var dateList = exam.dateList;
                $.each(dateList, $.proxy(function (index, item) {
                    item.beginDate = Date.toJavaTime(item.beginDate);
                    item.endDate = Date.toJavaTime(item.endDate);
                }, this));
            } else if (exam.cyclicStrategy == 3) {//每周循环
                $.each(exam.weekdays, function (index, item) {
                    item = parseInt(item);
                });
            }
            exam.analysisCondStatus = parseInt(exam.analysisCondStatus);
            if (exam.analysisCondStatus == 4) {
                exam.analysisCondData = JSON.stringify({"end_seconds": this.model.validatePeriod() * 60});
            }
            exam.markApplyEndTime = exam.markApplyEndTime * 60;

            if (tmplId) {
                store.update(exam)
                    .done(function () {
                        callback && callback();
                    });
            } else {
                store.create(exam)
                    .done(function (data) {
                        tmplId = data.id;
                        callback && callback();
                    });
            }
        },
        saveThenNext: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam/paper?tmpl_id=" + tmplId;
            });

        },
        saveThenBack: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam";
            });
        },
        _bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: this.attachmentSetting.url,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                formData: {
                    path: this.attachmentSetting.path
                },
                fileSingleSizeLimit: 50 * 1024 * 1024,
                accept: [{
                    title: "Images & Word",
                    extensions: "txt,doc,docx,xls,xlsx,png,jpg",
                    mimeTypes: 'image/*,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this));
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：文件大小超过50MB！");
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (file, response) {
            $('body').loading('hide');
            this.model.exam.attachments.push({
                id: response.dentry_id,
                name: file.name,
                description: file.name,
                url: this.attachmentSetting.serverUrl + '/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name
            });
        },
        removeSubQuestionAttachment: function (data) {
            var event = arguments[3],
                index = arguments[1];
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    this.model.exam.attachments.remove(data);
                }, this)
            });
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);