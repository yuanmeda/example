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

import ko from 'knockout';
import $ from 'jquery';
import Utils from 'Utils';
import SWFImageUpload from 'SWFImageUpload';
import template from './template.html';
import defaultCover from './cover.png';

const defaultCoverId = '00000000-0000-0000-0000-000000000000'; 
let _id = 0;

function getId() { return ++_id;}

const viewModel = function(params) {
    let self = this;
    let uploadSession = params.uploadSession; // CS平台
    let uploadUrl = params.uploadUrl; // 基础平台
    let staticUrl = params.staticUrl;
    let callback = params.callback;

    this.model = {
        id: Date.now() + getId(),
        uploadUrl: uploadUrl,
        uploadCoverText: '上传封面',
        useDefaultCoverText: '使用默认封面',
        returnBtnText: '返回',
        defaultCoverId: defaultCoverId,
        coverId: ko.isObservable(params.coverId)?params.coverId:ko.observable(params.coverId),
        defaultCoverSrc: defaultCover.src,
        coverUrl: ko.isObservable(params.coverUrl)?params.coverUrl:ko.observable(params.coverUrl),
        readOnly: ko.observable(ko.unwrap(params.readOnly) === true), // default false
        maskVisible: ko.observable(false)
    };
    this.method = {
        setDefaultCover() {
            this.model.coverId(defaultCoverId);
            this.model.coverUrl(defaultCover.src);
            if(callback&&typeof callback === 'function') { callback(defaultCover.src, defaultCoverId);}
        },
        toggleVisible() {
            this.model.maskVisible(!ko.unwrap(this.model.maskVisible))
        }
    };
    if(ko.unwrap(this.model.readOnly)) return;

    let defer = $.Deferred();
    let promise = defer.promise();
    if(typeof uploadSession === 'function') {
        setTimeout(function(){
            uploadSession().done((resUploadSession) => { defer.resolve(resUploadSession) })
        })
        
    } else {
        setTimeout(function(){
            defer.resolve(uploadSession)
        })
    }

    promise.then((uploadSession) => {
        let  url = uploadUrl? 
                   uploadUrl:
                   'http://' + uploadSession.server_url + '/v0.1/upload?session=' + uploadSession.session + '&name=image.png&scope=1&path=' + uploadSession.path;
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
            upload_complete: $.proxy(function(response) {
                var coverUrl, coverId;
                if (uploadUrl){
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
                if(callback&&typeof callback === 'function') { callback(coverUrl, coverId);}
            }, this),
            upload_error: $.proxy(function() {
               Utils.alertTip('上传失败') 
            }, this)
        });
    })
}

ko.components.register('x-course-image-upload', {
    viewModel,
    template
})