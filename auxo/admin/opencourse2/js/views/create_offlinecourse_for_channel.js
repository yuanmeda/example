;(function ($) {
    "use strict";
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
    };
    var store = {
        getUploadSession: function () {
            var url = businessCourseGatewayUrl + '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
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
        getOrgTree: function () {
            var url = '/v1/open_courses/orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        getMixOrgTree: function () {
            var url = '/v1/open_courses/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        getTree: function () {
            var url = '/v1/tags/tree?custom_type=' + custom_type;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        // 保存开始时间和结束时间
        saveStudyTime: function (id, data) {
            if (!id) throw new Error('no course_id')
            var url = courseApiUrl + '/v1/business_courses/' + id + '/config';
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
            var url = courseApiUrl + '/v1/business_courses/' + id + '/time_rules';
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
    };


    var offlineCourseAreaKey = location.href + ':' + 'offline_course_area';

    function getUsedArea() {
        var UsedArea = localStorage.getItem(offlineCourseAreaKey)
        try {
            UsedArea = JSON.parse(UsedArea)
            if (/Array/.test(Object.prototype.toString.call(UsedArea))) {
                return UsedArea
            }
        } catch (e) {
        }
    }

    function setUsedArea(area) {
        if (!area) return
        var UsedArea = localStorage.getItem(offlineCourseAreaKey)
        try {
            var UsedArea = JSON.parse(UsedArea)
            if (!/Array/.test(Object.prototype.toString.call(UsedArea))) {
                UsedArea = []
            }
            if (UsedArea.indexOf(area) === -1) {
                UsedArea.unshift(area)
            }
            UsedArea.length > 5 ? UsedArea.length = 5 : '';
            localStorage.setItem(offlineCourseAreaKey, JSON.stringify(UsedArea))
        } catch (e) {
        }
    }

    var viewModel = {
        store: store,
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
            "course_end_time": '', // 课程结束时间
            "context_id": window.context_id || ""
        },
        uploadSessions: {
            path: '',
            server_url: '',
            service_id: '',
            session: ''
        },
        //页面初始化
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(_self, document.getElementById("offline_course_edit"));

            store.getUploadSession()
                .then(function (data) {
                    $.extend(_self.uploadSessions, data);
                    _self._initEditor();
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
                })
        },
        _initEditor: function () {
            var self = this;
            self.desEditor = KindEditor.create('#kind_editor', {
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
                afterChange: function () {
                    if (!self.desEditor) {
                        return;
                    }
                    if (self.desEditor.count("text") == 0) {
                        self.model.description('');
                    } else {
                        self.model.description(self.desEditor.html());
                    }
                }
            });
        },
        createOfflineCourse: function () {
            var self = this;
            // 本地存储 课程地点
            var course_id = ''; // 课程ID
            var model = ko.mapping.toJS(this.model);

            if (new Date(model.course_start_time) > new Date(model.course_end_time)) {
                $.fn.dialog2.helpers.alert('开始时间不能大于结束时间');
                return;
            }
            if (!model.title) {
                $.fn.dialog2.helpers.alert('课程标题不能为空');
                return;
            }
            if (!model.course_area) {
                return $.fn.dialog2.helpers.alert('课程地点不能为空');
                return
            }
            setUsedArea(ko.unwrap(model.course_area));
            return store.createCourse({
                title: model.title,
                summary: model.summary,
                introduction: model.description,
                pic_url: model.pic_url,
                pic_id: model.pic_id || '00000000-0000-0000-0000-000000000000',  // '默认封面使用000'
                course_area: model.course_area,
                user_suit: model.user_suit,
                business_type: 'offline_course',
                context_id: window.context_id || ""
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
                    return store.saveTimeRule(course_id).then(function () {
                        $.fn.dialog2.helpers.alert("保存成功", {
                            close: function () {
                                var return_url = decodeURIComponent(self.getQueryStringByName('return_url'));
                                if (return_url) {
                                    var hasParams = return_url.indexOf('?') >= 0;
                                    window.location.href = return_url + (hasParams ? '&' : '?') + 'id=' + course_id;
                                }
                            }
                        })
                    })
                })

        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        },
        setCourseArea: function (area) {
            viewModel.model.course_area(area);
        },
        goBack: function () {
            var return_url = decodeURIComponent(this.getQueryStringByName('return_url'));
            if (return_url) {
                window.location.href = return_url;
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
