(function (ko,Utils,WebUploader) {
'use strict';

ko = ko && ko.hasOwnProperty('default') ? ko['default'] : ko;
Utils = Utils && Utils.hasOwnProperty('default') ? Utils['default'] : Utils;
WebUploader = WebUploader && WebUploader.hasOwnProperty('default') ? WebUploader['default'] : WebUploader;

var template = "<div class=\"x-course-file-upload\">\r\n    <!-- ko ifnot: ko.unwrap(model.readOnly) -->\r\n    <div class=\"x-btn\" data-bind=\"attr: { id: model.id }, text: model.btnText\">上传文件</div>\r\n    <!-- /ko -->\r\n    <!-- ko if: ko.unwrap(model.files).length > 0 -->\r\n    <table class=\"table table-bordered\" style=\"width: 500px\">\r\n        <thead>\r\n        <tr>\r\n            <td>文件</td>\r\n            <td>操作</td>\r\n        </tr>\r\n        </thead>\r\n        <tbody data-bind=\"foreach: model.files\">\r\n        <tr>\r\n            <td data-bind=\"text: $data.name\"></td>\r\n            <td>\r\n                <!-- ko ifnot: ko.unwrap(model.readOnly) -->\r\n                <a href=\"javscript: void(0)\" data-bind=\"click: $component.methods.remove.bind($component)\">删除</a>\r\n                <!-- /ko -->\r\n                <a data-bind=\"attr: { href: $data.url }\">下载</a>\r\n            </td>\r\n        </tr>\r\n        </tbody>\r\n    </table>\r\n    <!-- /ko -->\r\n    <!-- ko if: ko.unwrap(model.files).length <= 0 && ko.unwrap(model.readOnly) -->\r\n    <div>无附件</div>\r\n    <!-- /ko -->\r\n</div>";

var viewModel = function viewModel(params) {
    var uploadSession = params.uploadSession; // CS平台
    var uploadUrl = params.uploadUrl; // 基础平台
    var staticUrl = params.staticUrl;
    var callback = params.callback;
    var id = Date.now();

    this.model = {
        id: id,
        btnText: params.btnText || '选择文件',
        files: ko.isObservable(params.files) ? params.files : ko.observableArray(params.files), //TODO：需要确保传入的是Array
        readOnly: ko.observable(ko.unwrap(params.readOnly) === true)
    };
    this.methods = {
        remove: function remove(item) {
            this.model.files.remove(item);
        }
    };

    if (ko.unwrap(this.model.readOnly)) return;

    var defer = $.Deferred();
    var promise = defer.promise();
    if (typeof uploadSession === 'function') {
        uploadSession().done(function (resUploadSession) {
            defer.resolve(resUploadSession);
        });
    } else {
        defer.resolve(uploadSession);
    }
    var self = this;

    promise.then(function (uploadSession) {
        var url = uploadUrl ? uploadUrl : 'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session + '&name=image.png&scope=1&path=' + uploadSession.path;
        var uploader = new WebUploader.Uploader({
            swf: params.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
            server: 'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session,
            auto: true,
            duplicate: true,
            pick: {
                id: '#' + id,
                multiple: false
            },
            formData: {
                path: uploadSession.path
            },
            fileSingleSizeLimit: 50 * 1024 * 1024
        });
        uploader.on('beforeFileQueued', function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        });
        uploader.on('uploadBeforeSend', function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        });
        uploader.on('uploadError', function (code) {
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
        });
        uploader.on('uploadSuccess', function (file, response) {
            var item = {
                id: response.dentry_id,
                name: file.name,
                size: file.size,
                description: file.name,
                url: 'http://' + uploadSession.server_url + '/v0.1/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name,
                preview_id: response.dentry_id,
                preview_url: 'http://' + uploadSession.server_url + '/v0.1/download?dentryId=' + response.dentry_id
            };
            self.model.files.push(item);
            if (callback) {
                callback(item);
            }
        });
    });
};

ko.components.register('x-course-file-upload', {
    viewModel: viewModel,
    template: template
});

}(ko,Utils,WebUploader));
