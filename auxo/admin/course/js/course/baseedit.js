;(function ($) {
    "use strict";
    var store = {
        /*编辑和详情用获取课程*/
        getCourse: function () {
            var url = '/' + projectCode + '/courses/' + courseId + '/base';
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json'
            });
        },
        /*编辑*/
        updateCourse: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId;
            return $.ajax({
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(data),
                type: 'PUT'
            });
        },
        createCourse: function (data) {
            var url = '/' + projectCode + '/courses';
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
            var url = '/' + projectCode + '/courses/upload_sessions';
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
                "title": "",
                "pic_id": "",
                // "video_id": "",
                "user_suit": "",
                "summary": "",
                "description": "",
                "course_status": 0,
                "context_id": context_id || "",
                "pic_url": ""
            },
            show: false,
        },
        storeUrl:storeUrl,
        maxlength: 100,
        uploadInfo: {
            path: '',
            server_url: '',
            service_id: '',
            session: ''
        },
        __return_url: __return_url || "",
        custom_type: custom_type || "",
        context_id: context_id || "",
        //页面初始化
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.wordcount = ko.computed(function () {
                if (self.model.course.summary()) {
                    return this.maxlength - self.model.course.summary().length;
                } else {
                    return this.maxlength;
                }
            }, this);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });

            var defer = $.Deferred()
            var promise = defer.promise();
            promise.then(function(){
                ko.applyBindings(self, document.getElementById("js_content"));
            })
           
            if (courseId) {
                document.title = '编辑公开课';
                self.getCourseInfo(defer);
            } else {
                document.title = '新增公开课';
                store.getUploadSession()
                    .done(function (uploadInfo) {
                        if (uploadInfo) {
                            self.uploadInfo.path = uploadInfo.path || "";
                            self.uploadInfo.server_url = uploadInfo.server_url || "";
                            self.uploadInfo.session = uploadInfo.session || "";
                            self._editor();
                            defer.resolve();
                        }
                    });
            }
            $('#validateForm').validate(this.validRules);
            this._bindingsExtend();
        },
        _bindingsExtend: function () {
            var course = this.model.course;
            course.description.extend({
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
                title: {
                    required: true,
                    maxlength: 50,
                    minlength: 2
                },
                userSuit: {
                    required: false,
                    maxlength: 100
                },
                description: {
                    required: false,
                    maxlength: 4
                }
            },
            onkeyup: function (element) {
                $(element).valid();
            },
            messages: {
                title: {
                    required: '请输入课程名称',
                    minlength: $.validator.format('课程名称长度不能小于{0}字符'),
                    maxlength: $.validator.format('课程名称不能多于{0}个字')
                },
                userSuit: {
                    maxlength: $.validator.format('课程介绍不能多于{0}个字')
                },
                description: {
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
        getCourseInfo: function (defer) {
            var self = this, course = this.model.course;
            store.getCourse().done(function (data) {
                course.custom_id(data.custom_id);
                course.custom_type(data.custom_type);
                course.title(data.title);
                course.pic_id(data.pic_id);
                course.user_suit(data.user_suit);
                course.summary(data.summary);
                course.course_status(data.course_status);
                course.context_id(data.context_id);
                course.description(data.description);
                course.pic_url(data.pic_url || window.default_cover_url);
                //获取上传信息及富文本框初始化
                if (!self.uploadInfo.service_id) {
                    store.getUploadSession()
                        .done(function (uploadInfo) {
                            if (uploadInfo) {
                                self.uploadInfo.path = uploadInfo.path || "";
                                self.uploadInfo.server_url = uploadInfo.server_url || "";
                                self.uploadInfo.session = uploadInfo.session || "";
                                if (data.description) {
                                    data.description = data.description.replace(/\$\{cs_host}/gim, self.uploadInfo.server_url);
                                    course.description(data.description);
                                }

                                var editor = self._editor();
                                editor.html(data.description);
                                defer.resolve()
                            }
                        });
                } else {
                    self.model.course.description(data.description.replace(/\$\{cs_host}/gim, self.uploadInfo.server_url));
                    self.desEditor.html(self.model.course.description());
                    defer.resolve();
                }
            })
        },
        //富文本编辑器
        _editor: function () {
            var self = this;
            return self.desEditor = KindEditor.create('#description', {
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
        updateCourseInfo: function (data) {
            store.updateCourse(data).done(function () {
                data.pic_url = undefined;
                if (custom_type == 'auxo-train' || custom_type == 'auxo-open-course') {
                    $.fn.dialog2.helpers.alert("编辑成功!");
                    /*跨域发送消息*/
                    var z = window.parent;
                    var n = new Nova.Notification(z, "*");
                    var message_key = custom_type == 'auxo-train' ? 'train.course' : 'opencourse.course';
                    var message_data = {
                        event_type: "create_course",
                        data: {
                            edit: true
                        }
                    }
                    n.dispatchEvent("message:" + message_key, message_data);
                } else {
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
            });
        },
        savePage: function (next) {
            var self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model.course);
                postData.description = postData.description.replace(new RegExp("" + self.uploadInfo.server_url, "gim"), '${cs_host}');
                if (courseId) {
                    self.updateCourseInfo(postData);
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
                window.parent.location = "/" + projectCode + "/open_course/" + courseId + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
            } else {
                window.parent.location = "/" + projectCode + "/open_course/manage?source=" + source + "&return_url=" + encodeURIComponent(return_url);
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
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
