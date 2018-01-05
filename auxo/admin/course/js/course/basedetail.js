/**
 * 课程详情页
 * 全局变量：projectId/courseId
 */
(function ($, window) {
    'use strict';
    var store = {
        queryCourse: function () {
            var url = '/' + projectCode + '/courses/' + courseId + '/base';
            return $.ajax({
                url: url
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
            "custom_id": "",
            "custom_type": "",
            "id": "",
            "title": "",
            "pic_id": "",
            "video_id": "",
            "user_suit": "",
            "summary": "",
            "description": "",
            "course_status": 0,
            "context_id": "",
            "unit_id": "",
            "pic_url": "",
            "video_url": "",
            "video_count": 0,
            "document_count": 0,
            "exercise_count": 0,
            "exam_count": 0
        },
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this._baseInfo();
        },
        _baseInfo: function () {
            var self = this;
            if (courseId) {
                $.when(store.getUploadSession(), store.queryCourse())
                    .done(function (sessionData, courseData) {
                        var uploadSessionInfo = sessionData[0];
                        var course = courseData[0];
                        if (!course.pic_url) {
                            course.pic_url = defaultImage;
                        }
                        course.description = (course.description) && course.description.replace(/\$\{cs_host}/gim, uploadSessionInfo.server_url);
                        ko.mapping.fromJS(course, {}, self.model);
                        $(document).trigger('showContent');
                    }
                ).always(function(){
                    ko.applyBindings(self, document.getElementById('content'));
                })
            }
        },
        goToEdit: function () {
            /*跨域发送消息*/
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "opencourse.course";
            var message_data = {
                event_type: "edit_course",
                data: {
                    returnUrl: __return_url.indexOf('?') == -1 ? __return_url + '?__mac=' + Nova.getMacToB64(__return_url) : __return_url + '&__mac=' + Nova.getMacToB64(__return_url),
                    courseId: courseId
                }
            }
            n.dispatchEvent("message:" + message_key, message_data);
        }
    };
    viewModel._init();
})(jQuery, window);