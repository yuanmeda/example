(function ($, w) {
    'use strict';
    var TEMP_ID = w.tmplId,
        STATIC_URL = w.staticurl;

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

    function Model(params) {
        this.model = params.exam;
        this.show = ko.observable(false);
        this.init();
    };

    Model.prototype = {
        init: function () {
            this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            this.validateInit();
            this.bindingsExtend();

            // 绑定上传控件
            this.initSwf();

            // 循环策略初始化
            this.model.exam.cyclicStrategy.subscribe(function (newStrategy) {
                if (newStrategy == '1') {
                    if (this.model.exam.dateList().length < 1)
                        this.model.exam.dateList.push(new dateTimeObject())

                    $("input[id^='datetimepicker']").datetimepicker({
                        changeMonth: true,
                        changeYear: true,
                        language: 'zh-CN',
                        showAnim: 'slideDown',
                        dateFormat: "yy/mm/dd",
                        timeFormat: "hh:mm:ss",
                        showSecond: true
                    });
                }
            }.bind(this));
        },
        /**
         * 上传初始化
         * @param  {function} uc 上传成功回调
         * @param  {function} ue 上传失败回调
         * @return {object}    上传插件对象
         */
        _initUpload: function (uc, ue) {
            var _self = this,
                _swf = new SWFImageUpload({
                    flashUrl: staticUrl + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
                    width: 1024,
                    height: 1200,
                    htmlId: 'J_UploadImg',
                    pSize: '600|400|360|240|270|180',
                    uploadUrl: escape(storeUrl),
                    imgUrl: this.model.exam.cover_url() || '',
                    showCancel: false,
                    limit: 1,
                    upload_complete: uc,
                    upload_error: ue
                });
            return _swf;
        },
        /**
         * 上传成功回调
         * @param  {object} data 成功回调数据
         * @return {null}      null
         */
        _uploadComplete: function (data) {
            var _self = this;
            if (!data.Code) {
                // var _imgData = data.shift();
                this.model.exam.cover(data.store_object_id);
                this.model.exam.cover_url(data.absolute_url);
                this.show(!this.show());
            } else {
                Utils.alertTip(data.Message, {
                    title: '警告',
                    icon: 7
                });
            }
        },
        /**
         * 上传失败回调
         * @param  {int} code 上传错误码
         * @return {null}      null
         */
        _uploadError: function (code) {
            var _msg;
            switch (code) {
                case 120:
                    _msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
                    break;
                case 110:
                    _msg = '上传文件超过规定大小';
                    break;
                default:
                    _msg = '上传失败，请稍后再试';
                    break;
            }
            Utils.alertTip(_msg);
        },
        /**
         * 编辑-上传页切换
         * @return {null} null
         */
        _toggle: function () {
            // if(this.readOnly){
            //     return;
            // }else{
            this.show(!this.show());
            $('#hiddenTool').css('display', 'block');
            // }
        },
        set_default_cover: function () {
            this.model.exam.cover(window.default_cover_id);
            this.model.exam.cover_url(window.default_cover_url);
        },
        formatCoverUrl: function () {
            if (/default/.test(this.model.exam.cover_url()) || (ko.unwrap(window.tmplId) && !ko.unwrap(this.model.exam.cover_url))) {
                return window.default_cover_url;
            }
            return this.model.exam.cover_url() ? this.model.exam.cover_url() + '!m300x200.jpg' : ''
        },
        initDatetimepicker: function () {
            $("input[id^='datetimepicker']").datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
        },
        validateInit: function () {
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
        bindingsExtend: function () {
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
                    message: '开始日期不能为空',
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
                    message: '最多{0}位数'
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
                    params: 7,
                    message: '最多{0}位数'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '请输入正整数'
                }
            }, this);
            exam.description.extend({
                required: {
                    value: true,
                    message: "考试说明不可为空"
                },
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
        initSwf: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: this.model.uploadInfo.url(),
                auto: true,
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                formData: {
                    path: this.model.uploadInfo.path()
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
            this.uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#js_uploader'));
        },
        uploadProgress: function (selector, file, percentage) {
            $(selector).parent().siblings('.parcent').show().text("正在上传： (" + Math.floor(percentage * 100) + "%)");
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
                url: this.model.uploadInfo.serverUrl() + '/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name
            });
            setTimeout($.proxy(function () {
                $('#js_uploader').parent().siblings('.parcent').hide();
            }, this), 1000);
        },
        removeSubQuestionAttachment: function (data) {
            var event = arguments[3],
                index = arguments[1];
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    this.model.exam.attachments.remove(data);
                }, this)
            });
        },
        addItemToDateList: function () {
            this.model.exam.dateList.push(new dateTimeObject());
            $("input[id^='datetimepicker']").datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
        },
        checkDateList: function (dateList, markApplyEndTime) {
            var flag = true;
            $.each(dateList, function (index, date) {
                date.beginDate = date.beginDate && timeZoneTrans(date.beginDate);
                date.endDate = date.endDate && timeZoneTrans(date.endDate);

                for (var i = index + 1; i < dateList.length; i++) {

                    var ifContinue = date.beginDate && date.endDate && dateList[i].beginDate && dateList[i].endDate;
                    if (ifContinue) {

                        dateList[i].beginDate = timeZoneTrans(dateList[i].beginDate);
                        dateList[i].endDate = timeZoneTrans(dateList[i].endDate);

                        if (new Date(date.beginDate).getTime() >= new Date(dateList[i].endDate).getTime() + markApplyEndTime * 60000 || new Date(date.endDate).getTime() + markApplyEndTime * 60000 <= new Date(dateList[i].beginDate).getTime()) {
                        } else {
                            flag = false;
                        }
                    }
                }
            });
            return flag;
        }
    };

    ko.components.register('x-methodologyedit', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(jQuery, window);



