/**
 * 课程章节页
 * 全局变量：projectId/courseId
 */
(function ($, window) {
    'use strict';
    var store = {
        queryCourse: function () {
            var url = '/' + projectCode + '/resource_courses/' + courseId;

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
        model: {
            course: {
                id: '',
                name: '',
                summary: '',
                introduction: '',
                user_suit: '',
                front_cover_object_id: '',
                front_cover_url: '',
                status_update_time: '',
                access_total_count: 0,
                video_count: 0,
                video_duration: 0,
                document_count: 0,
                document_page_count: 0,
                exercise_count: 0,
                exercise_question_count: 0,
                url_count: 0,
                vr_count: 0
            },
            chapter_url: '' //课程章节地址
        },
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, LACALDATA.contentBind);
            this._baseInfo();
            this._eventHandler();
        },
        _eventHandler: function () {
            $("#subframe").bind("load", function () {
                var windowHeight = $(window).height();
                var height = windowHeight - this.offsetTop - 170;
                height = height < 900 ? 900 : height;
                $(this).css({
                    height: height + 'px'
                });
            });
        },
        _baseInfo: function () {
            var _self = this;
            if (courseId) {
                $.when(store.queryCourse(), store.getUploadSession())
                    .done(function (returnData, resData) {
                        var data = returnData[0];
                        if (!data.front_cover_url) {
                            data.front_cover_url = defaultImage;
                        }
                        var _model = ko.mapping.toJS(_self.model);
                        data.introduction = data.introduction ? data.introduction.replace(/\n/g, '<br/>').replace(/\$\{cs_host}/gim, resData[0].server_url) : '';
                        _model.course = data;
                        _model.chapter_url = cloudUrl + '/unitcourse/tree?isword=true&unitId=' + data.id + '&cloud_token=' + encodeURIComponent(cloudToken) + '&rootResourceEnable=true&ndrcoverage=' + window.ndr_coverage + '&user_id=' + window.user_id + '&ndr_token=' + window.accessToken + '&upload_param=' + window.upload_param;
                        ko.mapping.fromJS(_model, _self.model);
                        $(document).trigger('showContent');
                    });
            }
        },
        prevStep: function () {
            window.parentModel._setFullPath('1.2.1');
        },
        nextStep: function () {
            window.parentModel._setFullPath('1.2.3');
        }
    };
    viewModel._init();
})(jQuery, window);
