/**
 * 线下课程创建
 * 全局变量：无
 * 创建课程 分三步走~ 
    1. 保存基本信息  http://api.e.huayu.nd/business_course_service.html#/v1/business_courses@post
    2. 保存开始时间和结束时间 http://api.e.huayu.nd/business_course_service.html#/v1/business_courses/{business_course_id}/config@put
    3. 保存学时规则 http://api.e.huayu.nd/business_course_service.html#/v1/business_courses/{business_course_id}/time_rules@put
 */
(function ($, window) {
    'use strict';
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    var store = {
        getUploadSession: function () {
            var url = business_course_gateway_url + '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        // 获取基本信息
        getBaseInfo: function () {
            var url = business_course_gateway_url + '/v1/business_courses/' + course_id;
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
        },
        // 获取开始时间和结束时间
        getTimeInfo: function () {
            var url = business_course_service_url + '/v1/business_courses/' + course_id + '/config';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
        },

        //  修改基本信息
        saveBasicInfo: function (data) {
            var url = business_course_service_url + '/v1/business_courses/' + course_id;
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                type: 'PUT',
                cache: false
            })
        },
        // 保存开始时间和结束时间
        saveStudyTime: function (id, data) {
            if (!id) throw new Error('no course_id')
            var url = business_course_service_url + '/v1/business_courses/' + id + '/config';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                type: 'PUT',
                cache: false
            })
        },
        // 保存学时规则(参数写死)
        saveTimeRule: function (id) {
            if (!id) throw new Error('no course_id')
            var url = business_course_service_url + '/v1/business_courses/' + id + '/time_rules';
            return $.ajax({
                url: url,
                data: JSON.stringify({
                    "enable_custom": false,
                    "adjusted_time": 3600,
                    "video_effect_max": 0,
                    "document_effect_max": 0,
                    "exercice_effect_max": 0,
                    "vr_effect_max": 0,
                }),
                dataType: 'json',
                contentType: 'application/json',
                type: 'PUT',
                cache: false
            })
        }
    }
    var offlineCourseAreaKey = location.href + ':' + 'offline_course_area';
    function getUsedArea() {
        var UsedArea = localStorage.getItem(offlineCourseAreaKey)
        try {
            UsedArea = JSON.parse(UsedArea)
            if (/Array/.test(Object.prototype.toString.call(UsedArea))) {
                return UsedArea
            }
        } catch (e) { }
    }
    function setUsedArea(area) {
        if (!area) return
        var UsedArea = localStorage.getItem(offlineCourseAreaKey)
        try {
            var UsedArea = JSON.parse(UsedArea)
            if (!/Array/.test(Object.prototype.toString.call(UsedArea))) {
                UsedArea = []
            }
            if (UsedArea.indexOf(area) === -1) { UsedArea.unshift(area) }
            UsedArea.length > 5 ? UsedArea.length = 5 : '';
            localStorage.setItem(offlineCourseAreaKey, JSON.stringify(UsedArea))
        } catch (e) { }
    }

    var viewModel = {
        model: {
            "title": '', // 标题
            "summary": '', // 摘要
            "description": '', // 课程介绍
            "user_suit": '', //  合适人群
            "used_area": getUsedArea() || [], // 常用地点
            "course_area": '', // 开课地点
            "pic_url": '', //  封面URL地址
            "pic_id": '',   // 图片ID
            "course_start_time": '', // 课程开始时间
            "course_end_time": '' // 课程结束时间
        },
        store: store,
        uploadSessions: {
            path: '',
            server_url: '',
            service_id: '',
            session: ''
        },
        _init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            this._initEditor()
            ko.applyBindings(self, document.getElementById('offline_course_edit'));

            store.getUploadSession()
                .then(function (data) {
                    $.extend(self.uploadSessions, data);
                    // 初始化日期选择器
                    $(".form_datetimepicker").datetimepicker({
                        format: 'yyyy-mm-dd hh:ii',
                        language: 'zh-CN',
                        autoclose: true,
                        showTime: true,
                        showHour: true,
                        showMinute: true,
                        showSecond: false,
                        minDate: new Date().format('yyyy-MM-dd HH:mm') // 设置当前时间之前的时间，不能被选中 format 是必要的不然有bug
                    });
                    // 初始化上传组件
                    self._initUpload($.proxy(self._uploadComplete, self), $.proxy(self._uploadError, self));
                })
                .then(function () {
                    $.when(store.getBaseInfo(), store.getTimeInfo()).done(function (baseInfo, timeInfo) {
                        var baseInfoData = baseInfo[0];
                        var timeInfoData = timeInfo[0];
                        self.model.title(baseInfoData.title);
                        self.model.summary(baseInfoData.summary);
                        self.model.description(baseInfoData.description);
                        self.editor.html(baseInfoData.description);
                        self.model.user_suit(baseInfoData.user_suit);
                        self.model.course_area(baseInfoData.course_area);
                        self.model.course_start_time(timeInfoData.study_start_time && 'Invalid Date' !== new Date(timeInfoData.study_start_time).toString() ? Date.format(new Date(timeInfoData.study_start_time), 'yyyy-MM-dd hh:mm') : '');
                        self.model.course_end_time(timeInfoData.study_end_time && 'Invalid Date' !== new Date(timeInfoData.study_end_time).toString() ? Date.format(new Date(timeInfoData.study_end_time), 'yyyy-MM-dd hh:mm') : '');
                        self.model.pic_url(baseInfoData.pic_id == '00000000-0000-0000-0000-000000000000' ? default_cover_url : baseInfoData.pic_url);
                        self.model.pic_id(baseInfoData.pic_id);
                    })
                })

        },
        _initUpload: function (uc, ue) {
            var self = this;
            self.uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + self.uploadSessions.server_url + '/v0.1/upload?session=' + self.uploadSessions.session,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false,
                },
                formData: {
                    path: self.uploadSessions.path
                },
                fileSingleSizeLimit: 50 * 1024 * 1024,
                accept: [{
                    title: 'Image',
                    extension: 'png, jpg',
                    mimeTypes: 'image/*'
                }]
            })
            this.uploader.on('beforeFileQueued', $.proxy(this._beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this._uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this._uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this._uploadSuccess, this));
        },
        _initEditor: function() {
            var self = this;
            this.editor = KindEditor.create('#kind_editor', {
                width: "750px",
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: true,
                resizeType: 0,
                imageUploadServer: self.uploadSessions.server_url,
                imageUploadSession: self.uploadSessions.session,
                imageUploadPath: self.uploadSessions.path,
                staticUrl: staticUrl,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link', 'imageswf'
                ],
            })
        },
        createOfflineCourse: function () {
            var self = this;
            var course_id = ''; // 课程ID
            var model = ko.mapping.toJS(this.model);
            model.description = self.editor.html();
            if (new Date(model.course_start_time) > new Date(model.course_end_time)) {
                $.fn.dialog2.helpers.alert('开始时间不能大于结束时间');
                return;
            }
            if (!model.title) {
                $.fn.dialog2.helpers.alert('课程标题不能为空');
                return;
            }
            if(!model.course_area) {
                return $.fn.dialog2.helpers.alert('课程地点不能为空');
                return
            }

            setUsedArea(ko.unwrap(model.course_area));
            return store.saveBasicInfo({
                name: model.title,
                summary: model.summary,
                introduction: model.description,
                front_cover_url: model.pic_url,
                front_cover_object_id: model.pic_id || '00000000-0000-0000-0000-000000000000',  // '默认封面使用000'
                course_area: model.course_area,
                user_suit: model.user_suit,
                business_type: 'offline_course'
            })
                .then(function (data) {
                    course_id = data.id;
                    return
                })
                .then(function (data) {
                    return store.saveStudyTime(course_id, {
                        drawable: true,
                        sequential: "0",
                        skippable: true,
                        page_require_time: 0,
                        resource_downloadable: true,
                        study_time_limit_type: 2,
                        study_start_time: Date.format(new Date(model.course_start_time)),
                        study_end_time: Date.format(new Date(model.course_end_time))
                    })
                })
                .then(function () {
                    return store.saveTimeRule(course_id).then(function(){
                        $.fn.dialog2.helpers.alert("保存成功", {
                            close: function(){
                                if(return_url) {
                                    var z = window.parent;
                                    var n = new Nova.Notification(z, "*");
                                    var message_key = "opencourse2.return_url";
                                    var message_data = {
                                        event_type: "return_url",
                                        data: {
                                            returnUrl: return_url
                                            // returnUrl: return_url.indexOf('?') == -1 ? return_url + '?__mac=' + Nova.getMacToB64(return_url) : return_url + '&__mac=' + Nova.getMacToB64(return_url),
                                        }
                                    }
                                    n.dispatchEvent("message:" + message_key, message_data);
                                } else {
                                    window.history.back();
                                }
                            }
                        })
                    })
                })

        },
        setCourseArea: function (area) {
            viewModel.model.course_area(area);
        },
        goBack: function () {
            if(return_url) {
                var z = window.parent;
                var n = new Nova.Notification(z, "*");
                var message_key = "opencourse2.return_url";
                var message_data = {
                    event_type: "return_url",
                    data: {
                        returnUrl: return_url.indexOf('?') == -1 ? return_url + '?__mac=' + Nova.getMacToB64(return_url) : return_url + '&__mac=' + Nova.getMacToB64(return_url),
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
            } else {
                window.history.back();
            }
        }
    };
    viewModel._init()
})(jQuery, window);