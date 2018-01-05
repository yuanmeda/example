(function (ko,$,Utils,SWFImageUpload) {
'use strict';

ko = ko && ko.hasOwnProperty('default') ? ko['default'] : ko;
$ = $ && $.hasOwnProperty('default') ? $['default'] : $;
Utils = Utils && Utils.hasOwnProperty('default') ? Utils['default'] : Utils;
SWFImageUpload = SWFImageUpload && SWFImageUpload.hasOwnProperty('default') ? SWFImageUpload['default'] : SWFImageUpload;

var template = "<div class=\"x-course-image-upload\">\r\n    <div class=\"pre-view\">\r\n        <!-- ko if: model.coverUrl -->\r\n        <img class=\"cover\" data-bind=\"attr: { src: \r\n            ko.unwrap(model.coverId) === ko.unwrap(model.defaultCoverId)\r\n            ?\r\n            ko.unwrap(model.defaultCoverSrc)\r\n            :\r\n            ko.unwrap(model.coverUrl)+(\r\n                new RegExp(ko.unwrap(model.coverId)).test(ko.unwrap(model.coverUrl))?'':'!m300x200.jpg'\r\n                ) \r\n        }\" alt=\"封面\">\r\n        <!-- /ko -->\r\n    </div>\r\n    <!-- ko ifnot: model.readOnly -->\r\n    <div class=\"operate-area\">\r\n        <button class=\"x-btn\" data-bind=\"text: model.uploadCoverText, click: method.toggleVisible\"></button>\r\n        <button class=\"x-btn\" data-bind=\"text: model.useDefaultCoverText, click: method.setDefaultCover\"></button>\r\n    </div>\r\n    <div class=\"uploader-outer\" data-bind=\"visible: model.maskVisible\">\r\n        <div class=\"uploader-inner\">\r\n            <button class=\"x-btn\" data-bind=\"text: model.returnBtnText, click: method.toggleVisible\"></button>\r\n            <div>\r\n                <div data-bind=\"attr: { id: model.id }\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <!-- /ko -->\r\n</div>";

var img = new Image();img.src = 'data:image/png;base64,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';

/*
*   课程图片上传组件； 使用SWFImageUpload, 针对CS平台的上传和基础平台进行统一封装
*   @params coverUrl
*   @params coverId
*   @parmas ReadOnly
*   @uploadSession: CS平台Session object or function that return $ajax
*   @uploadUrl: 基础平台的URL
*   @callback: callback for uploader success
*   参数uploadUrl 和uploadSession 二选一，选择作为传入方式, 千万不要两个都传
*/

var defaultCoverId = '00000000-0000-0000-0000-000000000000';
var _id = 0;

function getId() {
    return ++_id;
}

var viewModel = function viewModel(params) {
    var _this = this;

    var self = this;
    var uploadSession = params.uploadSession; // CS平台
    var uploadUrl = params.uploadUrl; // 基础平台
    var staticUrl = params.staticUrl;
    var callback = params.callback;

    this.model = {
        id: Date.now() + getId(),
        uploadUrl: uploadUrl,
        uploadCoverText: '上传封面',
        useDefaultCoverText: '使用默认封面',
        returnBtnText: '返回',
        defaultCoverId: defaultCoverId,
        coverId: ko.isObservable(params.coverId) ? params.coverId : ko.observable(params.coverId),
        defaultCoverSrc: img.src,
        coverUrl: ko.isObservable(params.coverUrl) ? params.coverUrl : ko.observable(params.coverUrl),
        readOnly: ko.observable(ko.unwrap(params.readOnly) === true), // default false
        maskVisible: ko.observable(false)
    };
    this.method = {
        setDefaultCover: function setDefaultCover() {
            this.model.coverId(defaultCoverId);
            this.model.coverUrl(img.src);
            if (callback && typeof callback === 'function') {
                callback(img.src, defaultCoverId);
            }
        },
        toggleVisible: function toggleVisible() {
            this.model.maskVisible(!ko.unwrap(this.model.maskVisible));
        }
    };
    if (ko.unwrap(this.model.readOnly)) return;

    var defer = $.Deferred();
    var promise = defer.promise();
    if (typeof uploadSession === 'function') {
        setTimeout(function () {
            uploadSession().done(function (resUploadSession) {
                defer.resolve(resUploadSession);
            });
        });
    } else {
        setTimeout(function () {
            defer.resolve(uploadSession);
        });
    }

    promise.then(function (uploadSession) {
        var url = uploadUrl ? uploadUrl : 'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session + '&name=image.png&scope=1&path=' + uploadSession.path;
        new SWFImageUpload({
            flashUrl: staticUrl + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
            width: 1024,
            height: 1200,
            htmlId: ko.unwrap(self.model.id),
            pSize: '600|400|360|240|270|180',
            uploadUrl: escape(url),
            showCancel: false,
            limit: 1,
            //imgUrl: ko.unwrap(this.model.coverUrl),
            upload_complete: $.proxy(function (response) {
                var coverUrl, coverId;
                if (uploadUrl) {
                    // 基础平台回调
                    coverUrl = response.absolute_url;
                    coverId = response.store_object_id;
                } else {
                    // CS平台的回调
                    coverUrl = 'http://' + uploadSession.server_url + '/v0.1/download?dentryId=' + response.dentry_id;
                    coverId = response.dentry_id;
                }
                this.model.coverUrl(coverUrl);
                this.model.coverId(coverId);
                this.model.maskVisible(false);
                if (callback && typeof callback === 'function') {
                    callback(coverUrl, coverId);
                }
            }, _this),
            upload_error: $.proxy(function () {
                Utils.alertTip('上传失败');
            }, _this)
        });
    });
};

ko.components.register('x-course-image-upload', {
    viewModel: viewModel,
    template: template
});

}(ko,$,Utils,SWFImageUpload));
