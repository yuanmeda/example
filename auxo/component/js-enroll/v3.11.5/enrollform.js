(function (w, $) {
    'use strict';
    function EnrollFormModel(params) {
        this.type = params.type;
        this.forms = params.forms;
        this.staticUrl = params.staticUrl;
        this.store = {
            getUploadInfo: function () {
                return $.ajax({
                    url: window.self_host + '/v1/upload_sessions',
                    type: 'get'
                });
            }
        };
        this.uploadInfo = null;
        this.init();
    }

    EnrollFormModel.prototype = {
        init: function () {
            this.type.subscribe(function (val) {
            }, this)
        },
        initPlugin: function (element, data) {
            var checkIndex = 1;
            if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
                checkIndex = 0;
            }
            var formIndex = element[checkIndex].id.split('enrollform')[1];
            if (formIndex) $.proxy(this.initPluginFunctions(formIndex, data), this);
        },
        initPluginFunctions: function (formIndex, data) {
            switch (data.input_type) {
                case "date":
                    $("input[id='datepicker" + formIndex + "']").datepicker({
                        changeMonth: true,
                        changeYear: true,
                        dateFormat: 'yy-mm-dd'
                    });
                    break;
                case "attachment":
                    if (this.uploadInfo) {
                        this.uploadInfo = this.initAttachmentPlugin('attachment' + formIndex, data, this.uploadInfo);
                    } else {
                        this.store.getUploadInfo()
                            .done($.proxy(function (uploadInfo) {
                                this.uploadInfo = uploadInfo;
                                this.initAttachmentPlugin('attachment' + formIndex, data, uploadInfo);
                            }, this));
                    }
                    break;
                case "picture":
                    if (this.uploadInfo) {
                        this.uploadInfo = this.initPicturePlugin('picture' + formIndex, data, this.uploadInfo);
                    } else {
                        this.store.getUploadInfo()
                            .done($.proxy(function (uploadInfo) {
                                this.uploadInfo = uploadInfo;
                                this.initPicturePlugin('picture' + formIndex, data, uploadInfo);
                            }, this));
                    }
                    break;
            }
        },
        initDatePlugin: function () {
            $("input[id^='datepicker']").datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });
        },
        initPicturePlugin: function (domId, data, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: this.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 4 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "png,jpg,jpeg",
                    mimeTypes: 'image/png,image/jpeg,image/pjpeg'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, data, "#" + domId));
            uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'picture'));
        },
        initAttachmentPlugin: function (domId, data, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: this.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 4 * 1024 * 1024,
                accept: [{
                    title: "Images & Word",
                    extensions: "txt,doc,docx,xls,xlsx,png,jpg",
                    mimeTypes: 'image/png,image/jpeg,image/pjpeg,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12,application/x-compressed,application/x-zip-compressed,application/zip,multipart/x-zip,application/x-rar-compressed,application/octet-stream'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, data, "#" + domId));
            uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'attachment'));
        },
        selectError: function (type, error) {
            if (error == "Q_TYPE_DENIED") {
                if (type == 'picture') {
                    this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.pictureFormatError'));
                } else if (type == 'attachment') {
                    this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.attachmentFormatError'));
                }

            } else if (error == "F_EXCEED_SIZE") {
                this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.sizeError'));
            }
        },
        uploadProgress: function (selector, file, percentage) {
            $(selector).parents('.upload-control').siblings('.upload-progress').show().text(i18nHelper.getKeyValue('enrollComponent.upload.uploading') + "(" + Math.floor(percentage * 100) + "%)");
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.uploadZero'));
                return false;
            }
        },
        uploadError: function (uploader, domId, file, reason) {
            this.uploaderMap = this.uploaderMap || {};
            this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
            if (++this.uploaderMap[domId] <= 1) {
                this.store.getUploadInfo()
                    .done($.proxy(function (uploadInfo) {
                        uploader.option("server", "http://" + uploadInfo.server_url + "/v0.1/upload?session=" + uploadInfo.session);
                        uploader.retry();
                    }, this));
            } else {
                this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.errorInfo') + reason);
            }
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (data, domId, file, response) {
            if (!response.code) {
                var temp = {
                    id: ko.observable(response.dentry_id),
                    source_file_name: ko.observable(file.name),
                    source: ko.observable('CS'),
                    size: ko.observable(file.size),
                    url: ko.observable('http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id)
                };
                var answer = ko.mapping.toJS(data.answer);
                if (typeof(answer) == 'object') {
                    answer.push(temp);
                } else {
                    answer = [];
                    answer.push(temp);
                }
                data.answer(answer);
            } else {
                response ? this._selfAlert(response.message) : this._selfAlert(i18nHelper.getKeyValue('enrollComponent.upload.error'));
            }
            setTimeout($.proxy(function () {
                $(domId).parents('.upload-control').siblings('.upload-progress').hide();
            }, this), 1000);
        },
        // 弹窗
        _selfAlert: function (text) {
            if ($.fn.dialog2) {
                $.fn.dialog2.helpers.alert(text);
            } else if ($.fn.udialog) {
                $.fn.udialog.alert(text, {
                    width: 550,
                    icon: 'error',
                    title: i18nHelper.getKeyValue('enrollComponent.form.resultTitle'),
                    dialogClass: 'sys-alert udialog enroll-udialog',
                    buttons: [{
                        text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-confirm'
                    }]
                });
            }
        }

    };

    ko.components.register('x-enrollform', {
        viewModel: EnrollFormModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);
