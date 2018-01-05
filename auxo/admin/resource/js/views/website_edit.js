(function ($, window) {
    var store = {
        get: function () {
            return $.ajax({
                url: channelUrl + '/v1/websites/' + websiteId,
                dataType: "json",
                cache: false
            })
        },
        create: function (data) {
            return $.ajax({
                url: channelUrl + '/v1/websites',
                type: 'post',
                dataType: "json",
                data: JSON.stringify(data)
            })
        },
        update: function (data) {
            return $.ajax({
                url: channelUrl + '/v1/websites/' + websiteId,
                type: 'put',
                dataType: "json",
                data: JSON.stringify(data)
            })
        },
        getUploadInfo: function () {
            return $.ajax({
                url: channelUrl + '/v1/users/photo_session',
                cache: false,
                dataType: 'json'
            });
        },
    };
    var viewModel = {
        model: {
            website: {
                name: '',
                cover_id: '',
                description: '',
                url: '',
                open_way: 1,
                cover_url: ''
            }
        },
        init: function () {
            ko.validation.init({
                "errorsAsTitleOnModified": true,
                "decorateInputElement": true
            });
            ko.validation.registerExtenders();
            this.model = ko.mapping.fromJS(this.model);
            this.validate();
            ko.applyBindings(this, document.getElementById('content'));
            if (websiteId) this.get();
            this.initUpload();

        },
        get: function () {
            var self = this, website = this.model.website;
            store.get().done(function (data) {
                website.name(data.name);
                website.cover_id(data.cover_id || '');
                website.description(data.description);
                website.url(data.url);
                website.open_way(data.open_way);
                website.cover_url(data.cover_url)
            })
        },
        setDefaultCover: function () {
            this.model.website.cover_id('');
            this.model.website.cover_url('');
        },
        cancel: function () {
            return_url && (location.href = return_url);
        },
        save: function () {
            var errors = ko.validation.group(this.model.website);
            if (errors().length) {
                errors.showAllMessages();
                return false;
            }
            var postData = ko.mapping.toJS(this.model.website);
            var ajax = window.websiteId ? store.update(postData) : store.create(postData);
            ajax.done(function (res) {
                return_url && ( location.href = return_url + ( window.websiteId ? '' : '&id=' + res.website_id));
            })
        },
        validate: function () {
            this.model.website.name.extend({
                required: {
                    params: true,
                    message: '请填写网站名称'
                },
                maxLength: {
                    params: 30,
                    message: '字数不能超过30'
                }
            });
            this.model.website.description.extend({
                maxLength: {
                    params: 100,
                    message: '字数不能超过100'
                }
            });
            this.model.website.url.extend({
                required: {
                    params: true,
                    message: '请填写URL链接'
                },
                maxLength: {
                    params: 250,
                    message: '字数不能超过250'
                },
                pattern: {
                    params: /^([A-Za-z]{3,6}):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z{}]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z{}]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z{}]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z{}]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    message: 'URL格式不对'
                }
            });
        },
        initUpload: function () {
            store.getUploadInfo()
                .done($.proxy(function (uploadInfo) {
                    this.uploadInfo = uploadInfo;
                    this.initPicturePlugin('js_upload', uploadInfo);
                }, this));
        },
        initPicturePlugin: function (domId, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: uploadInfo.upload_path + '?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                chunked: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path,
                },
                fileSingleSizeLimit: 3 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "gif,jpg,jpeg,png",
                    mimeTypes: 'image/gif,image/jpeg,image/png'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
            uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'picture'));
            return uploader;
        },
        selectError: function (type, error) {
            if (error == "Q_TYPE_DENIED") {
                if (type == 'picture') {
                    $.alert('请上传格式为gif,jpg,jpeg,png的图片！');
                }
            } else if (error == "F_EXCEED_SIZE") {
                $.alert('大小不能超过3M');
            }
        },
        uploadProgress: function (selector, file, percentage) {
            if (~selector.indexOf('js_reupload')) {
                $(selector).next('.tip').show().text('正在上传：' + "(" + Math.floor(percentage * 100) + "%)");
            } else {
                $(selector).parent().next('.tip').show().text('正在上传：' + "(" + Math.floor(percentage * 100) + "%)");
            }
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.alert('请重新选择图片');
                return false;
            }
        },
        uploadError: function (uploader, domId, file, reason) {
            this.uploaderMap = this.uploaderMap || {};
            this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
            if (++this.uploaderMap[domId] <= 1) {
                store.getUploadInfo()
                    .done($.proxy(function (uploadInfo) {
                        uploader.option("server", "http://" + uploadInfo.upload_path + "/v0.1/upload?session=" + uploadInfo.session);
                        uploader.retry();
                    }, this));
            } else {
                $.alert('上传失败：' + reason);
            }
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (domId, file, response) {
            if (!response.code) {
                var img_url = csUrl + '/v0.1/download?dentryId=' + response.dentry_id;
                this.model.website.cover_id(response.dentry_id);
                this.model.website.cover_url(img_url);
            } else {
                response ? this._selfAlert(response.message) : $.alert('上传失败');
            }
        },
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);