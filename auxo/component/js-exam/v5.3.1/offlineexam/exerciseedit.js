(function (w, $) {
    function Model(params) {
        this.model = params.model;
        this.show = ko.observable(false);
        this._init();
    };

    Model.prototype = {
        _init: function () {
            // $('#beginTime').datetimepicker({language: 'zh-CN', autoclose: true, clearBtn: true});
            // $('#endTime').datetimepicker({language: 'zh-CN', autoclose: true, clearBtn: true});
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
            this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            this._validateInit();
            this._validator();
            this.initSwf();
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
        initSwf: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: this.model.attachmentSetting.url(),
                auto: true,
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                formData: {
                    path: this.model.attachmentSetting.path()
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
                url: this.model.attachmentSetting.serverUrl() + '/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name
            });
            setTimeout($.proxy(function () {
                $('#js_uploader').parent().siblings('.parcent').hide();
            }, this), 1000);
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
                    message: '附件数不能超过10',
                    onlyIf: function () {
                        if (this.model.exam && this.model.exam.attachments()) {
                            return true;
                        } else {
                            return false;
                        }
                    }.bind(this)
                }
            });
        }
    };
    ko.components.register('x-exerciseedit', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(window, jQuery);