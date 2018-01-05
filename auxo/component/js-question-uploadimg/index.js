import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue;

function ViewModel(params) {
    this.model = {
        upload_id: +new Date(),
        attach_pictures: params.attach_pictures || ko.observableArray([]),
        api_url: params.api_url,
        isShow: params.is_show || ko.observable(true),
        progress: ko.observable(0),
        message: ko.observable(''),
        filesQueued: ko.observableArray([]),
        hide: ko.observable(false),
        init: false
    };
    ko.options.deferUpdates = true;
    if (this.model.isShow()) {
        this.initUpload();
        this.model.init = true;
    }
    this.model.isShow.subscribe(function (nv) {
        if (nv) {
            !this.model.init && this.initUpload();
            this.model.init = true;
            if (this.model.attach_pictures().length < 9) this.model.hide(false)
        }
    }, this);
}

ViewModel.prototype.store = {
    getUploadInfo: function (api_url) {
        return $.ajax({
            url: api_url + '/v1/upload_sessions',
            cache: false,
            dataType: "json"
        })
    }
};

ViewModel.prototype.remove = function ($data) {
    this.model.attach_pictures.remove($data);
    this.model.hide(false);
};
ViewModel.prototype.reset = function ($data) {
    this.model.filesQueued.remove($data);
    this.model.hide(false);
};
ViewModel.prototype.close = function () {
    this.model.isShow(false);
};
ViewModel.prototype.initUpload = function () {
    this.store.getUploadInfo(this.model.api_url)
        .done($.proxy(function (uploadInfo) {
            this.uploadInfo = uploadInfo;
            this.initPicturePlugin(this.model.upload_id, uploadInfo);
        }, this));
};

ViewModel.prototype.initPicturePlugin = function (domId, uploadInfo) {
    var uploader = this.uploader = new WebUploader.Uploader({
        swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
        server: uploadInfo.server_url + '/upload?session=' + uploadInfo.session,
        auto: true,
        fileVal: 'Filedata',
        threads: 9,
        duplicate: true,
        pick: {
            id: '#' + domId,
            multiple: true
        },
        formData: {
            path: uploadInfo.path
        },
        fileSingleSizeLimit: 3 * 1024 * 1024,
        accept: [{
            title: "Images",
            extensions: "png,jpg",
            mimeTypes: 'image/png,image/jpeg'
        }]
    });
    uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
    uploader.on('filesQueued', $.proxy(this.filesQueued, this));
    uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
    uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
    uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
    uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
    uploader.on('error', $.proxy(this.selectError, this, 'picture'));
};
ViewModel.prototype.selectError = function (type, error) {
    this.model.filesQueued.removeAll();
    if (error == "Q_TYPE_DENIED") {
        if (type == 'picture') {
            this.model.filesQueued.push({
                show: ko.observable(true),
                progress: ko.observable(0),
                message: ko.observable(_i18nValue('qaUploadImg.format'))
            });
        }

    } else if (error == "F_EXCEED_SIZE") {
        this.model.filesQueued.push({
            show: ko.observable(true),
            progress: ko.observable(0),
            message: ko.observable(_i18nValue('qaUploadImg.size'))
        });
    }
};
ViewModel.prototype.uploadProgress = function (selector, file, percentage) {
    $.each(this.model.filesQueued(), function (i, v) {
        if (v.id == file.id) {
            v.progress(Math.floor(percentage * 100));
            return false;
        }
    });
    this.model.filesQueued.valueHasMutated();
};
ViewModel.prototype.beforeFileQueued = function (file) {
    $.each(this.model.filesQueued(), function (i, v) {
        if (v.id == file.id) {
            if (file.size == 0) v.message(_i18nValue('qaUploadImg.reselect'));
            v.show(true);
            return false;
        }
    })

};
ViewModel.prototype.filesQueued = function (file) {
    if (!file.length) return;
    var len = file.length, last = 9 - this.model.attach_pictures().length, t = this;
    if (len > last) {
        for (var i = last; i < len; i++) {
            this.uploader.removeFile(file[i]);
        }
        file.length = last;
    }
    t.model.filesQueued([]);
    $.each(file, function (i, v) {
        t.model.filesQueued.push({
            id: v.id,
            progress: ko.observable(0),
            show: ko.observable(true),
            message: ko.observable()
        })
    });
    (file.length + this.model.attach_pictures().length === 9) ? this.model.hide(true) : this.model.hide(false);

};
ViewModel.prototype.uploadError = function (uploader, domId, file, reason) {
    this.uploaderMap = this.uploaderMap || {};
    this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
    if (++this.uploaderMap[domId] <= 1) {
        this.store.getUploadInfo(this.model.api_url)
            .done($.proxy(function (uploadInfo) {
                uploader.option("server", uploadInfo.server_url + "/upload?session=" + uploadInfo.session);
                uploader.retry();
            }, this));
    } else {
        $.each(this.model.filesQueued(), (i, v) => {
            if (v.id === file.id) {
                v.message(_i18nValue('qaUploadImg.fail'));
                return false;
            }
        });
        this.model.filesQueued.valueHasMutated();
    }
};
ViewModel.prototype.uploadBeforeSend = function (obj, file, headers) {
    file.type = undefined;
    file.scope = 1;
    headers.Accept = "*/*";
    this.model.message('');
};
ViewModel.prototype.uploadSuccess = function (domId, file, response) {
    if (!response.code) {
        this.model.attach_pictures.push({
            resource_id: response.dentry_id,
            resource_path: this.uploadInfo.server_url + '/download?dentryId=' + response.dentry_id
        });
        $.each(this.model.filesQueued(), function (i, v) {
            if (v.id == file.id) {
                v.show(false);
                return false;
            }
        })
    } else {
        $.each(this.model.filesQueued(), function (i, v) {
            if (v.id == file.id) {
                v.message(response ? response.message : _i18nValue('qaUploadImg.fail'));
                return false;
            }
        })
    }
};


ko.components.register('x-question-uploadimg', {
    viewModel: ViewModel,
    template: tpl
});

