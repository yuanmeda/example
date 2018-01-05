/**
 * 课程详情页
 * 全局变量：projectId/courseId
 * 1. 线下课程需要展示的为两部分 1.基本信息 2. 开始时间和结束时间
 */
(function ($, window) {
    'use strict';
    var store = {
        // 获取基本信息
        getBaseInfo: function() {
            var url = business_course_gateway_url + '/v1/business_courses/' + course_id;
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
        },
        // 获取开始时间和结束时间
        getTimeInfo: function() {
            var url = business_course_service_url + '/v1/business_courses/' + course_id + '/config';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            })
        }
    };
    var viewModel = {
        model: {
            "title": '', // 标题
            "summary": '', // 摘要
            "description": '', // 课程介绍
            "user_suit": '', //  合适人群
            "course_area": '', // 开课地点
            "pic_url": '', //  封面URL地址
            "course_start_time": '', // 课程开始时间
            "course_end_time": '' // 课程结束时间
        },
        _init: function () {
            var self = this;
            $.when(store.getBaseInfo(), store.getTimeInfo())
            .done(function(baseInfo, timeInfo) {
                var baseInfoData = baseInfo[0];
                var timeInfoData = timeInfo[0];
                self.model.title = baseInfoData.title;
                self.model.summary = baseInfoData.summary;
                self.model.description = baseInfoData.description;
                self.model.user_suit = baseInfoData.user_suit;
                self.model.course_area = baseInfoData.course_area;
                self.model.pic_url = (baseInfoData.pic_id == '00000000-0000-0000-0000-000000000000' ? default_cover_url : baseInfoData.pic_url)
                self.model.course_start_time = new Date(timeInfoData.study_start_time).format('yyyy-MM-dd HH:mm');
                self.model.course_end_time = new Date(timeInfoData.study_end_time).format('yyyy-MM-dd HH:mm');
                ko.applyBindings(self, document.getElementById('offline_course_detail'));
            })
        }
    };
    viewModel._init();
})(jQuery, window);