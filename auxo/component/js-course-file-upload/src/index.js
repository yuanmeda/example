/*
*   文件上传组件； 使用SWFImageUpload, 针对CS平台的上传和基础平台进行统一封装
*   @params coverUrl
*   @params coverId
*   @parmas ReadOnly
*   @uploadSession: CS平台Session object or function that return $ajax
*   @uploadUrl: 基础平台的URL
*   @callback: callback for uploader success
*   参数uploadUrl 和uploadSession 二选一，选择作为传入方式, 千万不要两个都传
*/ 


import ko from 'knockout';
import template from './template.html';
import Utils from 'Utils';
import WebUploader from 'WebUploader';

const viewModel = function(params) {
    let uploadSession = params.uploadSession; // CS平台
    let uploadUrl = params.uploadUrl; // 基础平台
    let staticUrl = params.staticUrl;
    let callback = params.callback;
    let id = Date.now();

    this.model = {
        id: id,
        btnText: params.btnText || '选择文件',
        files: ko.isObservable(params.files)?params.files:ko.observableArray(params.files), //TODO：需要确保传入的是Array
        readOnly: ko.observable(ko.unwrap(params.readOnly) === true)
    }
    this.methods = {
        remove: function(item) {
            this.model.files.remove(item);
        }
    }

    if(ko.unwrap(this.model.readOnly)) return;

    let defer = $.Deferred();
    let promise = defer.promise();
    if(typeof uploadSession === 'function') {
        uploadSession().done((resUploadSession) => { defer.resolve(resUploadSession) })
    } else {
        defer.resolve(uploadSession)
    }
    let self = this;

    promise.then((uploadSession) => {
        let  url = uploadUrl? 
                   uploadUrl:
                   'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session + '&name=image.png&scope=1&path=' + uploadSession.path;
        let uploader = new WebUploader.Uploader({
            swf: params.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
            server: 'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session,
            auto: true,
            duplicate: true,
            pick: {
                id: '#' + id,
                multiple: false,
            },
            formData: {
                path: uploadSession.path
            },
            fileSingleSizeLimit: 50 * 1024 * 1024
        })
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
            let item = {
                id: response.dentry_id,
                name: file.name,
                size: file.size,
                description: file.name,
                url: 'http://' + uploadSession.server_url + '/v0.1/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name,
                preview_id: response.dentry_id,
                preview_url: 'http://' + uploadSession.server_url + '/v0.1/download?dentryId=' + response.dentry_id
            }
            self.model.files.push(item);
            if(callback){ callback(item) }
        });
    })
}

ko.components.register('x-course-file-upload', {
    viewModel,
    template
})