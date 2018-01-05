(function () {
    'use strict';

    function ViewModel(params) {
        this.model = {
            upload_id: +new Date() + Math.floor(Math.random() * 1000 + 1),
            picture: {
                id: params.id || ko.observable(''),
                url: params.url || ko.observable('')
            },
            img_url: ko.observable(params.default_image || ''),
            image_width: params.image_width || 400,
            image_height: params.image_height || 400,
            api_url: params.api_url || '',
            progress: ko.observable(0),
            message: ko.observable(''),
            load: ko.observable(false)
        };
        this.upload_info = ko.unwrap(params.upload_info);
        var t = this;
        if (t.upload_info) {
            setTimeout(function () {
                t.initPicturePlugin(t.model.upload_id, t.upload_info)
            }, 300);
        }
    }

    ViewModel.prototype.store = {
        getUploadInfo: function (api_url) {
            return $.ajax({
                url: api_url + '/v1/users/photo_session',
                cache: false
            });
        }
    };
    ViewModel.prototype.load = function () {
        this.model.load(true);
    };
    ViewModel.prototype.initPicturePlugin = function (domId, uploadInfo) {
        var uploader = this.uploader = new WebUploader.Uploader({
            swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
            server: uploadInfo.upload_path + '?session=' + uploadInfo.session + '&path=' + uploadInfo.path + '&scope=1',
            auto: true,
            fileVal: 'Filedata',
            duplicate: true,
            pick: {
                id: '#' + domId
            },
            compress: null,
            fileSingleSizeLimit: 2 * 1024 * 1024,
            accept: [{
                title: "Images",
                extensions: "png,jpg",
                mimeTypes: 'image/png,image/jpeg,image/gif'
            }]
        });
        uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
        uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
        uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
        uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
        uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
        uploader.on('error', $.proxy(this.selectError, this, 'picture'));
    };
    ViewModel.prototype.selectError = function (type, error) {
        if (error === "Q_TYPE_DENIED") {
            if (type === 'picture') {
                this.model.message('仅支持png,jpg,gif格式');
            }

        } else if (error === "F_EXCEED_SIZE") {
            this.model.message('大小不能超过2M');
        }
    };
    ViewModel.prototype.uploadProgress = function (selector, file, percentage) {
        this.model.progress(Math.floor(percentage * 100));
    };
    ViewModel.prototype.beforeFileQueued = function (file) {
        if (!file.size) this.model.message('请重新选择图片');
    };
    ViewModel.prototype.uploadError = function (uploader, domId, file, reason) {
        this.uploaderMap = this.uploaderMap || {};
        this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
        if (++this.uploaderMap[domId] <= 1) {
            this.store.getUploadInfo(this.model.api_url)
                .done($.proxy(function (uploadInfo) {
                    uploader.option("server", uploadInfo.upload_path + "?session=" + uploadInfo.session + '&path=' + uploadInfo.path + '&scope=1');
                    uploader.retry();
                }, this));
        } else {
            this.model.message('上传失败');
        }
    };
    ViewModel.prototype.uploadBeforeSend = function (obj, file, headers) {
        file.type = undefined;
        file.scope = 1;
        headers.Accept = "*/*";
        this.model.message('');
        this.model.progress(0);
        this.model.load(false);
        this.model.img_url('');
    };
    ViewModel.prototype.uploadSuccess = function (domId, file, response) {
        if (!response.code) {
            this.model.picture.id(response.dentry_id);
            this.model.picture.url(response.path);
            this.model.img_url(csUrl + '/v0.1/download?dentryId=' + response.dentry_id);
        } else {
            this.model.message('上传失败');
        }
    };
    ko.components.register('x-channel-upload', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})();
