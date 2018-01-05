/**
 * 课程章节页
 * 全局变量：projectId/courseId
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //查询课程
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
    //课程信息数据模型
    var viewModel = {
        model: {
            course: {
                id: '', //课程id
                unit_id: 0, //元课程id
                title: '', //课程名称
                pic_id: null, //课程封面id
                pic_url: null, //课程logo地址
                video_id: 0, //课程介绍视频
                description: '', //课程描述
                user_suit: '', //课程适用人群
                course_status: 1, //课程上下线状态 0-下线 1-上线。
                video_count: 0,
                document_count: 0,
                exam_count: 0,
                exercise_count: 0
            },
            chapter_url: '' //课程章节地址
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, LACALDATA.contentBind);
            //加载课程基本信息
            this._baseInfo();
            //加载事件
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
        /**
         * 获取课程基本信息
         * @return {null} null
         */
        _baseInfo: function () {
            var _self = this;
            if (courseId) {
                $.when(store.queryCourse(), store.getUploadSession())
                    .done(function (returnData, resData) {
                        var data = returnData[0];
                        if (!data.pic_url) {
                            data.pic_url = defaultImage;
                        }
                        var _model = ko.mapping.toJS(_self.model);
                        data.description = data.description ? data.description.replace(/\n/g, '<br/>').replace(/\$\{cs_host}/gim, resData[0].server_url) : '';
                        _model.course = data;
                        _model.chapter_url = cloudUrl + '/unitcourse/tree?isword=true&unitId=' + data.unit_id + '&cloud_token=' + encodeURIComponent(cloudToken) + '&rootResourceEnable=true&ndrcoverage=' + window.ndr_coverage + '&user_id=' + window.user_id + '&ndr_token=' + window.accessToken + '&upload_param=' + window.upload_param;
                        ko.mapping.fromJS(_model, _self.model);
                        $(document).trigger('showContent');
                    });
            }
        },

        /**
         * 上一步
         * @return {null} null
         */
        prevStep: function () {
            window.parentModel._setFullPath('1.2.1');
        },

        /**
         * 下一步
         * @return {null} null
         */
        nextStep: function () {
            window.parentModel._setFullPath('1.2.3');
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);
