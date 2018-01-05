/**
 * 课程考试列表页
 * 全局变量：courseId
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //课程考试列表
        examList: function (data) {
            var url = window.elearning_business_course_url +
                '/v1/business_course_exam/actions/search?$filter=business_course_id eq ' +
                courseId + '&$offset=' + (data.page_size() * data.page_no()) + '&$limit=' + data.page_size() + '&$result=pager';
            return $.ajax({
                url: url,
                type: 'GET'
            });
        },
        examListByIds: function (data) {
            var url = window.auxo_exam_url + '/v1/exams/list_by_ids'
            return $.ajax({
                url: url,
                type: 'POST',
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
        candidateCount: function (data) {
            var url = window.auxo_exam_url + '/v1/exams/candidate_count'
            return $.ajax({
                url: url,
                type: 'POST',
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
        //删除课程考试
        delExam: function (id) {
            var url = window.auxo_exam_url + '/v1/exams/' + id;
            return $.ajax({
                url: url,
                type: 'DELETE'
            });
        },
        //上线课程考试
        onlineExam: function (id) {
            var url = window.auxo_exam_url + '/v1/exams/' + id + '/online';
            return $.ajax({
                url: url,
                type: 'PUT'
            });
        },
        //下线课程考试
        offlineExam: function (id) {
            var url = window.auxo_exam_url + '/v1/exams/' + id + '/offline';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: {
                    exam_id: id
                }
            });
        }
    };
    //课程信息数据模型
    var viewModel = {
        model: {
            items: [], //列表项
            filter: {
                page_no: 0, //分页索引
                page_size: 20 //每页item数
            }
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
            this._list(true);
        },
        /**
         * 获取课程考试列表
         * @return {null} null
         */
        _list: function (flag) {
            var _self = this,
                _filter = _self.model.filter;
            if (courseId) {
                store.examList(_filter).done(function (returnData) {
                    var examIds = [];
                    var progress_percent_condition_map = {};
                    for (var i = 0; i < returnData.items.length; i++) {
                        examIds.push(returnData.items[i].exam_id);
                        progress_percent_condition_map[returnData.items[i].exam_id] = returnData.items[i].progress_percent_condition || 0;
                    }
                    $.when(store.examListByIds(examIds), store.candidateCount(examIds)).done($.proxy(function (examRes, candidateCountRes) {
                        var examList = examRes[0];
                        var candidate_count_map = candidateCountRes[0];
                        for (var i = 0; i < examList.length; i++) {
                            examList[i].progress_percent_condition = progress_percent_condition_map[examList[i].id] || 0;
                            examList[i].answering_count = candidate_count_map[examList[i].id]['answering_count'] || 0;
                        }
                        _self.model.items(examList);
                        Utils.pagination(returnData.total,
                            _filter.page_size(),
                            _filter.page_no(),
                            function (no) {
                                _filter.page_no(no);
                                _self._list();
                            }
                        );
                        if (flag) {
                            $(document).trigger('showContent');
                        }
                    }));
                });
            }
        },
        /**
         * 编辑考试
         * @return {null} null
         */
        toEdit: function (binds) {
            window.parentModel._setFullPath('1.2.98-2', {
                courseId: courseId,
                examId: binds.id
            });
        },
        /**
         * 创建考试
         * @return {null} null
         */
        toCreate: function () {
            window.parentModel._setFullPath('1.2.98-1');
        },
        /**
         * 成绩管理
         * @param  {object} binds ko绑定对象数据
         * @return {null}       null
         */
        scoreManage: function (binds) {
            window.parentModel._setFullPath('1.2.95', {
                courseId: courseId,
                examId: binds.id
            });
        },
        /**
         * 删除考试
         * @param  {object} binds ko绑定对象数据
         * @return {null} null
         */
        delExam: function (binds) {
            var _self = this;
            Utils.confirmTip('是否确认删除该考试！')
                .done(function () {
                    store.delExam(binds.id)
                        .done(function (data) {
                            Utils.msgTip('删除成功');
                            _self.model.items.remove(binds);
                        });
                });
        },
        /**
         * 修改考试状态(包含上下线)
         * @param  {object} binds ko绑定对象数据
         * @return {null} null
         */
        examStatusSetting: function (binds) {
            var _self = this,
                _currentData = $.extend({}, binds, {
                    enable: !binds.enable
                }),
                _flag;
            if (_currentData.enable) {
                _flag = 'online';
            } else {
                _flag = 'offline';
            }
            store[_flag + 'Exam'](binds.id)
                .done(function (data) {
                    Utils.confirmTip('设置' + (binds.enable ? '下线' : '上线') + '成功，是否跳转到成绩管理？')
                        .done(function () {
                            window.open(`${examWebpage}/${projectCode}/exam/score?exam_id=${binds.id}&__mac=` +  Nova.getMacToB64(`${examWebpage}/${projectCode}/exam/score?exam_id=${binds.id}`))
                        }).always(function(){
                             _self.model.items.replace(binds, _currentData);
                        });
                });
        },
        /**
         * 上一步
         * @return {null} null
         */
        prevStep: function () {
            window.parentModel._setFullPath('1.2.3');
        },
        /**
         * 下一步
         * @return {null} null
         */
        nextStep: function () {
            window.parentModel._setFullPath('1.2.7');
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);