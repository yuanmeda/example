"use strict";
(function () {
    var store = {
        getUploadSessions: function () {
            var url = '/v1/live/courses/upload_sessions';
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        getGrades: function () {
            var url = '/v1/grades';
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        getSubjectsByGradeId: function (gradeId) {
            var url = '/v1/grades/' + gradeId + '/subjects';
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        createLiveCourses: function (data) {
            var url = '/v1/live/courses';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'POST',
                dataType: 'json',
                cache: false
            });
        },
        getLiveCourse: function () {
            var url = '/v1/live/courses/' + course_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        updateLiveCourse: function (data) {
            var url = '/v1/live/courses/' + course_id;
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'PUT',
                dataType: 'json',
                cache: false
            });
        },
        onlineLiveCourse: function (data) {
            var url = '/v1/live/courses/status/' + data.status;
            return $.ajax({
                url: url,
                data: JSON.stringify(data.onlineCourse),
                contentType: 'application/json',
                type: 'PUT',
                dataType: 'text',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            course: {
                "id": course_id || "",
                "name": "",
                "status": 1,//状态: 0下线 1上线 创建时默认为0
                "summary": "",
                "front_cover_object_id": "",
                "range": 0,//1本班 2本校 3所有
                "live_course_type": null,//1学期同步 2专题强化
                "grade": "",
                "subject": ""
            },
            front_cover_url: "",
            grades: [],
            subjects: [],
            mode: true
        },
        saveButtonDisable: false,
        uploadInfo: {
            path: '',
            server_url: '',
            service_id: '',
            session: ''
        },
        init: function () {
            this._validateInit();
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            ko.applyBindings(this);
            this._bindingsExtend();
            this._initAllGrades();
            this._initSWFUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            if (course_id) {
                store.getLiveCourse()
                    .done($.proxy(function (resData) {
                        if (resData) {
                            this.model.course.name(resData.name || "");
                            this.model.course.status(resData.status || 0);
                            this.model.course.summary(resData.summary || "");
                            this.model.course.front_cover_object_id(resData.front_cover_object_id || null);
                            this.model.course.range(resData.range || 0);
                            this.model.course.live_course_type(resData.live_course_type || 0);
                            if (resData.grade && resData.grade.id) {
                                this.model.course.grade(resData.grade.id);
                                this._getSubjectsByGradeId(resData.grade.id);
                            }
                            this.model.course.subject(resData.subject && resData.subject.id || "");
                            this.model.front_cover_url(resData.front_cover_url || "");
                            // this._initUploadInfo(resData.summary || "");
                        }
                    }, this))
            }
            /*else {
             this._initUploadInfo("");
             }*/
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
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var course = this.model.course;
            course.name.extend({
                required: {
                    params: true,
                    message: '课程标题不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '课程标题最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                    message: '课程标题不可含有非法字符'
                }
            });
            course.summary.extend({
                maxLength: {
                    params: 100,
                    message: '课程简介最多{0}字符'
                }
            });
            course.live_course_type.extend({
                required: {
                    params: true,
                    message: '课程类型为必选项'
                }
            });
            course.grade.extend({
                required: {
                    params: true,
                    message: '课程年级为必选项'
                }
            });
            course.subject.extend({
                required: {
                    params: true,
                    message: '所属学科为必选项'
                }
            });
        },
        _initSWFUpload: function (uc, ue) {
            var swf = new SWFImageUpload({
                flashUrl: staticUrl + 'auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
                width: 1024,
                height: 1200,
                htmlId: 'J_UploadImg',
                pSize: '600|400|360|240|270|180',
                uploadUrl: escape(storeUrl),
                imgUrl: '',
                showCancel: false,
                limit: 1,
                upload_complete: uc,
                upload_error: ue
            });
        },
        //上传成功回调
        _uploadComplete: function (data) {
            if (data) {
                this.model.course.front_cover_object_id(data.id);
                this.model.front_cover_url(data.absolute_url);
                this.model.mode(!this.model.mode());
            }
        },
        //上传失败回调
        _uploadError: function (code) {
            var msg;
            switch (code) {
                case 110:
                    msg = '上传文件超过规定大小';
                    break;
                case 120:
                    msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
                    break;
                default:
                    msg = '上传失败，请稍后再试';
                    break;
            }
            $.errorDialog(msg).show();
        },
        _initUploadInfo: function (originalHtmlText) {
            store.getUploadSessions()
                .done($.proxy(function (resData) {
                    if (resData) {
                        this.uploadInfo.path = resData.path || "";
                        this.uploadInfo.server_url = resData.server_url || "";
                        this.uploadInfo.service_id = resData.service_id || "";
                        this.uploadInfo.session = resData.session || "";
                        if (originalHtmlText) {
                            var replacedText = originalHtmlText.replace(/\$\{cs_host}/gim, resData.server_url);
                            this.model.course.summary(replacedText || "");
                        }
                    }
                    this._initKindEditor(replacedText);
                }, this));
        },
        _toggle: function () {
            this.model.mode(!(this.model.mode()));
        },
        _initKindEditor: function (replacedText) {
            var self = this;
            self.kindEditor = KindEditor.create("#set-editor", {
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
                    if (!self.kindEditor) {
                        return;
                    }
                    if (self.kindEditor.count("text") == 0) {
                        self.model.course.summary('');
                    } else {
                        self.model.course.summary(self.kindEditor.html());
                    }
                }
            })
        },
        _initAllGrades: function () {
            store.getGrades()
                .done($.proxy(function (grades) {
                    if (grades && $.isArray(grades) && grades.length) {
                        this.model.grades(grades);
                    } else {
                        this.model.grades([]);
                    }
                }, this))
        },
        setCourseInfo: function (key, value) {
            this.model.course[key](value);
            if (key == 'grade') {
                this.model.course.subject('');
                this._getSubjectsByGradeId(value);
            }
        },
        _getSubjectsByGradeId: function (gradeId) {
            store.getSubjectsByGradeId(gradeId)
                .done($.proxy(function (subjects) {
                    if (subjects && $.isArray(subjects) && subjects.length) {
                        this.model.subjects(subjects);
                    } else {
                        this.model.subjects([]);
                        this.model.course.subject("");
                    }
                }, this));
        },
        save: function () {
            var self = this;
            if (self.saveButtonDisable) {
                return;
            }
            if (!self.validationsInfo.isValid()) {
                self.validationsInfo.errors.showAllMessages();
                var errors = self.validationsInfo.errors();
                $.errorDialog(errors[0]).show();
                return;
            }
            self.saveButtonDisable = true;
            var course = ko.mapping.toJS(this.model.course);
            // if (course.summary) {
            //     course.summary = course.summary.replace(new RegExp("" + self.uploadInfo.server_url, "gim"), '${cs_host}');
            // }
            if (course_id) {
                store.updateLiveCourse(course)
                    .done(function (resData) {
                        if (resData) {
                            window.location.href = '/' + projectCode + '/admin/live_course/101ppt/' + resData.id + '/chapter?range=' + resData.range;
                        }
                    })
                    .always(function () {
                        self.saveButtonDisable = false;
                    });
            } else {
                delete course.id;
                store.createLiveCourses(course)
                    .done(function (resData) {
                        var data = {
                            'status': course.status,
                            'onlineCourse': [resData.id]
                        };
                        store.onlineLiveCourse(data).done(function () {
                            if (resData) {
                                self.model.course.id(resData.id || "");
                                window.course_id = resData.id;
                                window.location.href = '/' + projectCode + '/admin/live_course/101ppt/' + resData.id + '/chapter?range=' + resData.range;
                                self.saveButtonDisable = false;
                            }
                        })
                    })
                /*.always(function () {

                 });*/
            }

        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
