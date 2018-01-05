(function ($) {
    "use strict";
    var store = {
        /*编辑和详情用获取课程*/
        getCourse: function () {
            var url = window.elearning_business_course_url + '/v1/business_courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json'
            });
        },
        /*编辑*/
        updateCourse: function (data) {
            var url = window.elearning_business_course_url + '/v1/business_courses/' + courseId;
            return $.ajax({
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(data),
                type: 'PUT'
            });
        },
        // 用于上传新建的课程
        createCourse: function (data) {
            var url = window.elearning_business_course_url + '/v1/business_courses';
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
            var url = '/upload_sessions';
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
            course: {
                "custom_id": "",
                "custom_type": custom_type || "",
                "id": courseId || "",
                "name": "",
                "front_cover_object_id": "",
                "user_suit": "",
                "summary": "",
                "introduction": "",
                "course_status": 0,
                "context_id": context_id || "",
                "front_cover_url": "",
                "introduce_video_id": "", // video的id
                "introduce_video_url": "",
                "brief_video_process": ""// 声明一个数字用来记录上传进度
            },
            show: false,
        },
        maxlength: 100,
        __return_url: __return_url || "",
        custom_type: custom_type || "",
        context_id: context_id || "",
        upload_video_sign: false,
        //页面初始化
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.wordcount = ko.computed(function () {
                return self.model.course.summary() ? this.maxlength - self.model.course.summary().length : this.maxlength;
            }, this);
            this.validationsInfo = ko.validatedObservable(this.model, { deep: true });

            var defer = $.Deferred()
            var promise = defer.promise();
            promise.then(function(){
                ko.applyBindings(self, document.getElementById("js_content"));
            })

            if (courseId) {
                document.title = '编辑公开课';
                var course = this.model.course;
                $.when(store.getCourse(), store.getUploadSession()).then(function (res1, res2) {
                    var data = res1[0], uploadInfo = res2[0];
                    course.custom_id(data.custom_id);
                    course.custom_type(data.custom_type);
                    course.name(data.name);
                    course.front_cover_object_id(data.front_cover_object_id);
                    course.introduce_video_id(data.introduce_video_id)
                    course.user_suit(data.user_suit);
                    course.summary(data.summary);
                    course.course_status(data.course_status);
                    course.context_id(data.context_id);
                    course.front_cover_url(data.front_cover_url || window.default_cover_url);
                    course.introduce_video_url(data.introduce_video_url||'');
                    course.brief_video_process(data.brief_video_process||"")
                    //获取上传信息及富文本框初始化
                    if (!self.uploadInfo) {
                        if (uploadInfo) {
                            self.uploadInfo = uploadInfo;
                            if (data.introduction) {
                                data.introduction = data.introduction.replace(/\$\{cs_host\}/gim, self.uploadInfo.server_url);
                                course.introduction(data.introduction);
                            }
                            var editor = self._editor();
                            editor.html(data.introduction)
                            // 在此处为上传视频绑定功能
                            self._bindUploadVideo();
                        }
                    } else {
                        self.model.course.introduction(data.introduction.replace(/\$\{cs_host\}/gim, self.uploadInfo.server_url));
                        self.desEditor.html(self.model.course.introduction());
                    }
                    defer.resolve();
                });
            } else {
                document.title = '新增公开课';
                store.getUploadSession().done(function (uploadInfo) {
                    if (uploadInfo) {
                        self.uploadInfo = uploadInfo;
                        self._editor();
                        // 在此处为上传课程封面绑定相关功能
                        // 在此处为上传视频绑定功能
                        self._bindUploadVideo();
                    }
                    defer.resolve();
                });
            }
            $('#validateForm').validate(this.validRules);
            this._bindingsExtend();
        },

        //绑定上传视频的功能
        _bindUploadVideo: function () {
            this.uploader = new WebUploader.Uploader({
                title: 'uploadVidoe',
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + this.uploadInfo.server_url + '/v0.1/upload?session=' + this.uploadInfo.session,
                auto: true, // 选完文件后是否自动上传
                duplicate: true,
                pick: {
                    id: '#js_uploader_video',
                    multiple: false
                },
                formData: {
                    path: this.uploadInfo.path
                },
                fileSingleSizeLimit: 500 * 1024 * 1024, // 设置单个文件大小
                accept: [{
                    title: "videos",
                    extensions: "mp4",
                    mimeTypes: 'video/*'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeVideoFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadVideoError, this));
            this.uploader.on('uploadProgress', $.proxy(this.uploadProgressVideo, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadVideoSuccess, this));
        },
        // 声明一个方法用于在上传开始时
        beforeVideoFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
            //在此处将上传视频标签置为true
            this.upload_video_sign = true;
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        // 声明一个方法用于显示显示上传成功与否的方法
        uploadVideoError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
            // 在此处将上传进度改为上传失败
            this.model.course.brief_video_process("上传失败");
            //在此处将上传视频标签置为false
            this.upload_video_sign = false;
        },
        // 声明一个方法给视频上传成功来使用
        uploadVideoSuccess: function (file, response) {
            var url = 'http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id + '&name=' + file.name;
            var id = response.dentry_id;
            this.model.course.introduce_video_url(url);
            this.model.course.introduce_video_id(id);
            this.model.course.brief_video_process("上传成功");
            //在此处将上传视频标签置为false
            this.upload_video_sign = false;
        },
        // 声明一个方法用于派发上传进度
        uploadProgressVideo: function (file, precentage){
            // 输出上传中的进度
            this.model.course.brief_video_process("上传进度："+parseInt(precentage*100)+"%");
        },

        _bindingsExtend: function () {
            var course = this.model.course;
            course.introduction.extend({
                maxLength: {
                    params: 4000,
                    message: '最大长度不能超过{0}'
                }
            });
        },
        _toggle: function () {
            this.model.show(!this.model.show());
        },
        validRules: {
            rules: {
                name: {
                    required: true,
                    maxlength: 50,
                    minlength: 2
                },
                userSuit: {
                    required: false,
                    maxlength: 100
                },
                introduction: {
                    required: false,
                    maxlength: 4
                }
            },
            onkeyup: function (element) {
                $(element).valid();
            },
            messages: {
                name: {
                    required: '请输入课程名称',
                    minlength: $.validator.format('课程名称长度不能小于{0}字符'),
                    maxlength: $.validator.format('课程名称不能多于{0}个字')
                },
                userSuit: {
                    maxlength: $.validator.format('课程介绍不能多于{0}个字')
                },
                introduction: {
                    maxlength: $.validator.format('最大长度不能超过{0}')
                }
            },
            errorPlacement: function (erorr, element) {
                erorr.appendTo(element.parent());
            },
            errorElement: 'p',
            errorClass: 'help-inline',
            highlight: function (label) {
                $(label).closest('.c-group').addClass('error').removeClass('success');
            },
            success: function (label) {
                label.addClass('valid').closest('.c-group').removeClass('error').addClass('success');
            }
        },
        //富文本编辑器
        _editor: function () {
            var self = this;
            return self.desEditor = KindEditor.create('#introduction', {
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
                        self.model.course.introduction('');
                    } else {
                        self.model.course.introduction(self.desEditor.html());
                    }
                }
            });
        },
        postMsgToParent: function() {
            var msg = {
                "action": "goNextPage",
                "data": {},
                "origin": location.host,
                "timestamp": +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        },
        updateCourseInfo: function (data, flag) {
            store.updateCourse(data).done(function () {
                if(!flag){
                    $.fn.dialog2.helpers.alert("保存成功!");
                }else{
                    if(window.is_distribute && window.is_distribute == 1){
                        this.postMsgToParent();
                    }else if (custom_type == 'auxo-train' || custom_type == 'auxo-open-course') {
                        $.fn.dialog2.helpers.alert("保存成功!");
                        /*跨域发送消息*/
                        var z = window.parent;
                        var n = new Nova.Notification(z, "*");
                        var message_key = custom_type == 'auxo-train' ? 'train.course' : 'opencourse.course';
                        var message_data = {
                            event_type: "edit_course",
                            data: {
                                edit: true,
                                return_url: __return_url
                            }
                        }
                        n.dispatchEvent("message:" + message_key, message_data);
                    }else {
                        $.fn.dialog2.helpers.confirm("编辑成功!", {
                            "confirm": function () {
                                window.parent.location.href = __return_url;
                            },
                            "decline": function () {

                            },
                            buttonLabelYes: '返回基本信息',
                            buttonLabelNo: '关闭'
                        });
                    }
                }
                // 在此处清空封面和视频信息
                data.front_cover_url = undefined;
                data.introduce_video_url = undefined;
                data.brief_video_process = "未上传";
            }.bind(this));
        },
        saveThenNextPage: function () { // 保存进度并进行下一步
            if(this.upload_video_sign){
                if(!confirm("视频文件上传中，请点击【取消】等待视频上传成功")){
                    return 
                }
            }
            var self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model.course);
                postData.introduction = postData.introduction.replace(new RegExp("" + self.uploadInfo.server_url, "gim"), '${cs_host}');
                if (courseId) {
                    self.updateCourseInfo(postData, true);
                }
                else {
                    self.createUnitCourse(postData);
                }
            }
        },
        savePage: function (next) { // 保存界面
            // 判断视频是否在上传中，若在上传中则进行提示
            if(this.upload_video_sign){
                if(!confirm("视频文件上传中，请点击【取消】等待视频上传成功")){
                    return 
                }
            }
            var self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model.course);
                postData.introduction = postData.introduction.replace(new RegExp("" + self.uploadInfo.server_url, "gim"), '${cs_host}');
                if (courseId) {
                    self.updateCourseInfo(postData, false);
                }
                else {
                    self.createUnitCourse(postData);
                }
            }
        },
        cancelPage: function () {
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "course.cancel";
            var message_data = {
                event_type: "cancel",
                data: {
                    cancel: true
                }
            }
            n.dispatchEvent("message:" + message_key, message_data);
        },
        backPage: function () {
            if (courseId) {
                window.parent.location = "/" + projectCode + "/admin/open_course/" + courseId + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
            } else {
                window.parent.location = "/" + projectCode + "/admin/open_course/manage?source=" + source + "&return_url=" + encodeURIComponent(return_url);
            }

        },
        //创建公开课课程
        createUnitCourse: function (data) {
            var self = this;
            delete data.id;
            if (data.custom_type == 'auxo-train') {
                data.custom_id = data.context_id.split(':')[1];
            }
            store.createCourse(data).done(function (returnData) {
                var courseId = returnData.id;
                self.model.course.id(returnData.id);
                $.fn.dialog2.helpers.alert("创建成功!");
                /*跨域发送消息*/
                var z = window.parent;
                var n = new Nova.Notification(z, "*");
                var message_key = custom_type == 'auxo-train' ? 'train.course' : "opencourse.course";
                __return_url += ~__return_url.indexOf('?') ? '&course_id=' + courseId : '?course_id=' + courseId;
                var message_data = {
                    event_type: "create_course",
                    data: {
                        returnUrl: __return_url + '&__mac=' + Nova.getMacToB64(__return_url),
                        courseId: courseId
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
            });
        },
        set_default_cover: function () { // 该方法为使用默认封面的方法
            this.model.course.front_cover_object_id(window.default_cover_id);
            this.model.course.front_cover_url(window.default_cover_url);
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
