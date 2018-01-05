"use strict";
(function () {
    var store = {
        getLiveCourse: function () {
            var url = '/v1/live/courses/' + course_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        },
        deleteLiveCourse: function () {
            var url = '/v1/live/courses/m/' + course_id;
            return $.ajax({
                url: url,
                contentType: 'application/json',
                type: 'DELETE',
                cache: false
            });
        },
        toggle_online_course: function (data) {
            return $.ajax({
                url:  '/v1/live/courses/status/' + data.status,
                type: 'PUT',
                data: JSON.stringify(data.id)
            });
        }
    };

    function prefixPaddedZeros(value, width) {
        var leadingZeroes = function () {
            var zeros = '';
            for (var i = 0; i < width; i++) {
                zeros += '0';
            }
            return zeros;
        }();
        return (leadingZeroes + (value || 0)).slice(-width);
    }

    function timezoneNum2Str(tzNum) {
        var symbol;
        var hours, minutes;
        symbol = tzNum < 0 ? '+' : '-';
        minutes = tzNum.toFixed(2).substr(-2, tzNum.length) / 100 * 60;
        hours = Math.abs(parseInt(tzNum, 10)).toString();
        return symbol + prefixPaddedZeros(hours, 2) + prefixPaddedZeros(minutes, 2);
    }

    var viewModel = {
        model: {
            course: {
                "name": "",
                "summary": "",
                "status": 0,//状态: 0下线 1上线 默认为0
                "front_cover_url": "",
                "range": "",//直播范围：1本班 2本校 3所有
                "live_course_type": "",//课程类型：1学期同步 2专题强化
                "live_type": 0,//直播类型:0直播 1录播
                "grade": "",
                "subject": "",
                "id": ""//课程id
            },
            chapter_url: ""
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            if (course_id) {
                store.getLiveCourse()
                    .done($.proxy(function (resData) {
                        if (resData) {
                            var range = "";
                            switch (resData.range) {
                                case 1:
                                    this.model.course.range('本班');
                                    range = "private";
                                    break;
                                case 2:
                                    this.model.course.range('本校');
                                    // range = "public";
                                    range = "private";
                                    break;
                                case 3:
                                    this.model.course.range('所有');
                                    // range = "all";
                                    range = "private";
                                    break;
                                default:
                                    this.model.course.range('未设置');
                                    // range = "all";
                                    range = "private";
                                    break;
                            }
                            var chapterUrl = cloud_url + '/unitcourse/tree?isword=true&unitId=' + resData.unit_id + '&cloud_token=' + encodeURIComponent(cloud_token) + '&rootResourceEnable=true&ndrcoverage=' + ndr_coverage + '&user_id=' + user_id + '&ndr_token=' + access_token + '&upload_param=' + upload_param + '&coursetypeids=0000100&range='+range;
                            this.model.chapter_url(chapterUrl);
                            this.model.course.name(resData.name || "未设置");
                            this.model.course.summary(resData.summary || "未设置");
                            this.model.course.status(resData.status != null ? resData.status : "未设置");
                            this.model.course.front_cover_url(resData.front_cover_url || "");
                            this.model.course.id(resData.id || "");
                            switch (resData.live_course_type) {
                                case 1:
                                    this.model.course.live_course_type('学期同步');
                                    break;
                                case 2:
                                    this.model.course.live_course_type('专题强化');
                                    break;
                                default:
                                    this.model.course.live_course_type('未设置');
                                    break;
                            }
                            switch (resData.live_type) {
                                case 1:
                                    this.model.course.live_type('直播');
                                    break;
                                case 2:
                                    this.model.course.live_type('录播');
                                    break;
                                default:
                                    this.model.course.live_type('未设置');
                                    break;
                            }
                            this.model.course.grade(resData.grade.name);
                        }
                    }, this))
            }
            $("#live-course-chapter-iframe").bind("load", function () {
                var windowHeight = $(window).height();
                var height = windowHeight - this.offsetTop - 170;
                height = height < 900 ? 900 : height;
                $(this).css({
                    height: height + 'px'
                });
            });
            var z = document.getElementById('live-course-chapter-iframe');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_course = "live.course.chapter";
            this.BroadcastUtils = new BroadcastUtils();
            var self = this;
            n.addEventListener(message_key_course, function (receiveData) {
                if (receiveData.event_type == 'live_course_chapter') {
                    if (receiveData.data) {
                        var data = receiveData.data;
                        //var title = data.title;
                        //var tag = data.tag;
                        //var beginTime = self.formatTimestamp(+tag.split(":")[0]);
                        //var finishTime = self.formatTimestamp(+tag.split(":")[1]);
                        var resourceId = data.resourceId;
                        var liveId = data.liveId;
                        self.BroadcastUtils.broadcast(liveId, course_id, resourceId);
                    }
                }
            });
        },
        /*课程上下线*/
        toggle_online: function (data) {
            var _self = this;
            var txt = data.status() === 0 ? '上线' : '下线';
            var params = {
                status: data.status() == 0 ? 1 : 0,
                id: [data.id()]
            };
            store.toggle_online_course(params).done(function (resData) {
                $.errorDialog((txt + '成功'), _self.changeLine.bind(_self)).show();
            });
        },
        //上下线成功后改变上线下状态
        changeLine: function () {
            var status = viewModel.model.course.status();
            viewModel.model.course.status(status == 1 ? 0 : 1);
        },
        formatTimestamp: function (timestamp) {
            var dateTime = new Date(timestamp);
            var date = dateTime.toLocaleDateString().replace(/\//g, '-');
            var time = dateTime.toLocaleTimeString('en-US', {hour12: false});
            var currentTimeZone = new Date().getTimezoneOffset() / 60;
            return date + 'T' + time + ".000" + timezoneNum2Str(currentTimeZone);
            ;
        },

        deleteCourse: function () {
            $.confirmDialog("确认删除本课程？", "取消", null, "确定", $.proxy(this.doDeleteCourseAction, this)).show();
        },
        doDeleteCourseAction: function () {
            store.deleteLiveCourse()
                .done(function () {
                    window.location.href = '/' + projectCode + '/admin/live_course/101ppt/list';
                })
        }

    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
