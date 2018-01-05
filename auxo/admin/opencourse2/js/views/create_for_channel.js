;(function ($) {
    "use strict";
    var store = {
        createCourse: function (data) {
            var url = '/v1/open_courses';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'POST',
                dataType: 'json',
                cache: false
            });
        },
        //获取上传cs用的session
        getUploadSession: function () {
            var url = businessCourseGatewayUrl + '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };
    var viewModel = {
        store: store,
        model: {
            isNext: ko.observable(0),
            course: {
                description: "",
                title: "",
                pic_url: '',
                pic_id: "",
                context_id: context_id || '',
                business_type: window.business_type
            }
        },
        uploadInfo:null,
        //页面初始化
        init: function () {
            var _self = this;
            this._validateInit();
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            this.model.isNext(window.is_next ? 1 : 0);
            ko.applyBindings(_self, document.getElementById("js_content"));
            this._bindingsExtend();
            store.getUploadSession().done(function (uploadInfo) {
                if (uploadInfo) {
                    _self.uploadInfo = uploadInfo;
                    _self._editor();
                    _self._bindUpload();
                }
            });
        },
        _bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + this.uploadInfo.server_url + '/v0.1/upload?session=' + this.uploadInfo.session,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                formData: {
                    path: this.uploadInfo.path
                },
                fileSingleSizeLimit: 50 * 1024 * 1024,
                accept: [{
                    title: "Images & Word",
                    extensions: "png,jpg",
                    mimeTypes: 'image/*'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this));
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("图片大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (file, response) {
            var url = 'http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id + '&name=' + file.name;
            var id = response.dentry_id;

            this.model.course.pic_url(url);
            this.model.course.pic_id(id);
        },
        //富文本编辑器
        _editor: function () {
            var self = this;
            self.desEditor = KindEditor.create('#description', {
                width: "750px",
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: true,
                resizeType: 0,
                imageUploadServer: self.uploadInfo.server_url,
                imageUploadSession: self.uploadInfo.session,
                imageUploadPath: self.uploadInfo.path,
                staticUrl: staticUrl,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link', 'imageswf'
                ],
                afterChange: function () {
                    if (!self.desEditor) {
                        return;
                    }
                    if (self.desEditor.count("text") == 0) {
                        self.model.course.description('');
                    } else {
                        self.model.course.description(self.desEditor.html());
                    }
                }
            });
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
        },
        _bindingsExtend: function () {
            var course = this.model.course;
            course.title.extend({
                required: {
                    params: true,
                    message: '课程名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '课程名称最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                    message: '不可含有非法字符'
                }
            });
        },
        savePage: function () {
            var self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var postData = ko.mapping.toJS(self.model);
            self.createUnitCourse(postData);
        },
        backPage: function () {
            if (return_url) {
                window.location.href = return_url;
            }

        },
        //创建公开课课程
        createUnitCourse: function (data) {
            var postData = {
                pic_id: data.course.pic_id,
                description: data.course.description,
                title: data.course.title,
                course_status: 0,
                custom_type: custom_type,
                context_id: data.course.context_id,
                source: window.source,
                business_type: data.course.business_type
            };
            var return_url = decodeURIComponent(this.getQueryStringByName('return_url'));
            store.createCourse(postData).done(function (returnData) {
                var courseId = returnData.id;
                if (window.source === 'UGC') {
                    this.postMsgToParent(courseId);
                } else if (return_url) {
                    var hasParams = return_url.indexOf('?') >= 0;
                    window.location.href = return_url + (hasParams ? '&' : '?') + 'id=' + courseId;
                }
            }.bind(this));
        },
        postMsgToParent: function (courseId) {
            var msg = {
                "action": "goNextPage",
                "data": {
                    "courseId": courseId
                },
                "origin": location.host,
                "timestamp": +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        },
        set_default_cover: function () {
            this.model.course.pic_id(window.default_cover_id);
            this.model.course.pic_url(window.default_cover_url);
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
