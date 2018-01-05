void function () {
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
    var viewModel = {
        model: {
            exam: {
                title: '',
                examChance: null,
                beginTime: '',
                endTime: '',
                description: '',
                attachments: [],

                type: 'exercise',
                offlineExam: true,
                offlineExamType: 1,
                cyclicStrategy: 0,
                subType: 0,
                enrollType: 0,
                analysisCondStatus: 1
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
            this.validationsInfo = ko.validatedObservable(this.model.exam, {deep: true});
            ko.applyBindings(viewModel);
            this._validator();

            $('#beginTime').datetimepicker({language: 'zh-CN', autoclose: true, clearBtn: true});
            $('#endTime').datetimepicker({language: 'zh-CN', autoclose: true, clearBtn: true});
            if (tmplId) {
                store.get()
                    .done(function (data) {
                        this.model.exam.title(data.title);
                        this.model.exam.examChance(data.examChance);
                        this.model.exam.description(data.description);
                        this.model.exam.attachments(data.attachments);
                        this.model.exam.cyclicStrategy(data.cyclicStrategy);
                        if (data.cyclicStrategy == 1) {

                        }
                        if (data.beginTime) {
                            this.model.exam.beginTime(Date.format(new Date(Date.formatTimezone(data.beginTime)), 'yyyy-MM-dd HH:mm'));
                        }
                        if (data.endTime) {
                            this.model.exam.endTime(Date.format(new Date(Date.formatTimezone(data.endTime)), 'yyyy-MM-dd HH:mm'));
                        }
                    }.bind(this));
            }
            store.getUploadingInfo()
                .done($.proxy(function (data) {
                    this.attachmentSetting.session = data.session;
                    this.attachmentSetting.url = data.url;
                    this.attachmentSetting.path = data.path;
                    this.attachmentSetting.serverUrl = data.serverUrl;
                    this._bindUpload();
                }, this));
        },
        _validateInit: function () {
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {deep: true, observable: true, live: true}
            });
            ko.validation.rules["endTime"] = {
                validator: $.proxy(function (endTime) {
                    var endTime = endTime.replace(/-/g, "/");
                    var beginTime = this.model.exam.beginTime().replace(/-/g, "/");
                    if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }, this),
                message: "结束时间不可早于开始时间"
            };

            ko.validation.rules['maxArrayLength'] = {
                validator: function (obj, params) {
                    return obj.length <= params.maxLength;
                }
            };
            //注册
            ko.validation.registerExtenders();
        },
        _validator: function () {
            this.model.exam.title.extend({
                required: {
                    params: true,
                    message: '练习名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '长度最多{0}'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                    message: '不可含有非法字符'
                }
            });
            this.model.exam.examChance.extend({
                maxLength: {
                    params: 9,
                    message: '考试机会最多{0}位数'
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '请输入数字'
                }
            }, this);
            this.model.exam.beginTime.extend({
                required: {
                    params: true,
                    message: '练习时间不可只设一个',
                    onlyIf: function () {
                        return (this.model.exam.endTime() == undefined || this.model.exam.endTime() == '') ? false : true;
                    }.bind(this)
                }
            });
            this.model.exam.endTime.extend({
                required: {
                    params: true,
                    message: '练习时间不可只设一个',
                    onlyIf: function () {
                        return (this.model.exam.beginTime() == undefined || this.model.exam.beginTime() == '') ? false : true;
                    }.bind(this)
                },
                endTime: {
                    params: ko.unwrap(this.model.exam.endTime)
                }
            });
            this.model.exam.description.extend({
                required: {
                    params: true,
                    message: '练习说明不可为空'
                },
                maxLength: {
                    params: 200,
                    message: '长度最多{0}'
                }
            });
            this.model.exam.attachments.extend({
                maxArrayLength: {
                    params: {maxLength: 10},
                    message: '附件数不能超过10'
                }
            });
        },
        doSave: function (callback) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                return;
            }
            var data = ko.mapping.toJS(this.model.exam);

            if(data.examChance) {
                data.examChance = parseInt(data.examChance);
            }
            if (data.beginTime) {
                data.beginTime = Date.toJavaTime(data.beginTime);
            }
            if (data.endTime) {
                data.endTime = Date.toJavaTime(data.endTime);
            }
            if (data.beginTime || data.endTime) {
                data.cyclicStrategy = 1;
                data.dateList = [{
                    beginDate: data.beginTime,
                    endDate: data.endTime
                }];
            } else {
                data.cyclicStrategy = 0;
            }
            if (tmplId) {
                store.update(data)
                    .done(function (data) {
                        callback && callback();
                    })
            } else {
                store.create(data)
                    .done(function (data) {
                        tmplId = data.id;
                        callback && callback();
                    })
            }
        },
        saveThenBack: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam";
            });
        },
        saveThenNext: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam/exercise/paper?tmpl_id=" + tmplId;
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
            if(file && file.size == 0){
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
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);