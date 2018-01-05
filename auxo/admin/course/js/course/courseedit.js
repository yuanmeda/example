/**
 * 课程编辑新建
 * 全局变量：projectId/courseId(编辑时存在)
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //创建课程
        createCourse: function (data) {
            var url = '/' + projectCode + '/resource_courses';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'POST'
            });
        },
        //查询课程
        queryCourse: function () {
            var url = '/' + projectCode + '/resource_courses/' + courseId;
            return $.ajax({
                url: url
            });
        },
        //更新课程
        updateCourse: function (data) {
            var url = '/' + projectCode + '/resource_courses/' + courseId;

            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'PUT'
            });
        }
    };
    //课程信息数据模型
    var viewModel = {
        model: {
            course: {
                id: '',
                name: '',
                summary: '',
                user_suit: '',
                front_cover_object_id: '',
                front_cover_url: '',
                introduction: "",
                uploadInfo: {
                    path: '',
                    server_url: '',
                    service_id: '',
                    session: ''
                }
                //unit_id: 0,
                //pic_id: null,
                //pic_url: null,
                //video_id:  null,
                //description: '',
                //user_suit: '',
                //course_status: 0
            },
            mode: 0//编辑-上传切换
        },

        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this, LACALDATA.contentBind);
            this._baseInfo();
        },
        _baseInfo: function () {
            var _self = this;
            if (courseId) {
                store.queryCourse()
                    .done(function (data) {
                        var des = data.introduction;
                        data.introduction = '';
                        ko.mapping.fromJS(data,{}, _self.model.course);
                        if (des) {
                            if (!_self.model.course.uploadInfo.service_id()){
                                _self.model.course.uploadInfo.service_id.subscribe(function (val) {
                                    if (val) {
                                        _self.model.course.introduction(des.replace(/\$\{cs_host}/gim, _self.model.course.uploadInfo.server_url()));
                                        window.desEditor.html(_self.model.course.introduction());
                                    }
                                });
                            } else {
                                _self.model.course.introduction(des.replace(/\$\{cs_host}/gim, _self.model.course.uploadInfo.server_url()));
                                window.desEditor.html(_self.model.course.introduction());
                            }
                        }
                        $(document).trigger('showContent');
                    });
            } else {
                $(document).trigger('showContent');
            }
        },
        save: function () {
            if (!$('#validateForm').valid()) {
                return;
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var _courseInfo = this.model.course,
                _postData = {
                    name: _courseInfo.name(),
                    summary: _courseInfo.summary() && _courseInfo.summary().substr(0, 100),
                    front_cover_url: _courseInfo.front_cover_url(),
                    front_cover_object_id: _courseInfo.front_cover_object_id(),
                    user_suit: _courseInfo.user_suit(),
                    introduction: _courseInfo.introduction().replace(new RegExp("" + this.model.course.uploadInfo.server_url(), "gim"), '${cs_host}')
                };
            if (courseId) {
                _postData.id = courseId;
                store.updateCourse(_postData)
                    .done(function (returnData) {
                        Utils.msgTip('修改成功!').then(function () {
                            window.open('/' + projectCode + '/course/' + courseId, '_parent');
                        });
                    });
            } else {
                store.createCourse(_postData)
                    .done(function (returnData) {
                        window.courseId = returnData.id;
                        Utils.msgTip('创建成功!').then(function () {
                            window.open('/' + projectCode + '/course/' + courseId, '_parent');
                        });
                    });
            }
        },
        back: function () {
            if (courseId) {
                window.open('/' + projectCode + '/course/' + courseId, '_parent');
            } else {
                window.open('/' + projectCode + '/course/test', '_parent');
            }
        }
    };
    viewModel._init();

})(jQuery, window);
