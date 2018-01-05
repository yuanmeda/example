/**
 * 课程考试成绩页
 * 全局变量：courseId
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //课程考试成绩列表
        examScoreList: function (data) {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/users/list';
            return $.ajax({
                url: url,
                data: data
            });
        }
    };
    //是否合格列表
    var qualifyList = [{
        key: 1,
        value: '合格'
    }, {
        key: 0,
        value: '不合格'
    }];
    //是否考试列表
    var examinationList = [{
        key: 1,
        value: '未考'
    }, {
        key: 2,
        value: '已考'
    }];
    //是否批改列表
    var correctList = [{
        key: 1,
        value: '已批改'
    }, {
        key: 2,
        value: '未批改'
    }];
    //课程信息数据模型
    var viewModel = {
        model: {
            items: [], //列表项
            filter: {
                name: '',//姓名
                org_name: '',//部门名称
                score_from: '',//起始分数段
                score_to: '',//截止分数段
                pass_status: '', //合格类型
                exam_status: '', //考试类型
                correctType: '', //批改类型
                page: 0, //分页索引
                size: 20 //每页item数
            },
            qualifyList: qualifyList, //是否合格列表
            examinationList: examinationList, //是否考试列表
            correctList: correctList, //是否批改列表
            isLoadingText: '导出',//按钮文本
            isLoading: false //判断是否处于导出状态
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            this.model.filter.score_from.subscribe(function (val) {
                this.model.filter.score_from(Math.abs(parseInt(val)));
            }, this);
            this.model.filter.score_to.subscribe(function (val) {
                this.model.filter.score_to(Math.abs(parseInt(val)));
            }, this);
            //ko绑定作用域
            ko.applyBindings(this, LACALDATA.contentBind);
            //加载事件 
            this._eventHandler();
            //加载课程基本信息
            this._list(true);
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            //当导出iframe加载成功说明导出失败
            document.getElementById('output').onload = function () {
                var _parseError = JSON.parse($($('#output')[0].contentWindow.document).find('pre').text());
                if (_parseError.detail) {
                    _self.defer.reject(_parseError.detail.substr(8, 23));
                }
            };
        },
        /**
         * 获取课程考试成绩列表
         * @return {null} null
         */
        _list: function (flag) {
            var _self = this,
                _filter = _self.model.filter,
                _postData = _self._filterParams(ko.mapping.toJS(_filter));
            if (_postData.score_from > _postData.score_to) {
                Utils.msgTip('起始分数段必须小于截止分数段！', {icon: 7});
                return;
            }
            store.examScoreList(_postData)
                .done(function (returnData) {
                    if (returnData.items) {
                        _self.model.items(returnData.items);
                    }
                    Utils.pagination(returnData.count,
                        _filter.size(),
                        _filter.page(),
                        function (no) {
                            if (no !== _filter.page()) {
                                _filter.page(no);
                                _self._list();
                            }
                        }
                    );
                    if (flag) {
                        $(document).trigger('showContent');
                    }
                });
        },
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        _filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '' && $.trim(params[key]) !== 'undefined') {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        /**
         * 查看考生答卷--跳转测评组件
         * @return {null} null
         */
        viewPaperDetail: function () {
            window.parentModel._setFullPath('1.2.98');
        },
        /**
         * 列表查询
         * @return {null} null
         */
        doSearch: function () {
            this._list();
        },
        /**
         * 下载导入摸版
         * @return {null} null
         */
        downloadTmpl: function () {

        },
        /**
         * 导入成绩
         * @return {null} null
         */
        importScores: function () {

        },
        /**
         * 导出
         * @return {null} null
         */
        output: function () {
            var _self = this,
                _count = 1,
                _url = '/' + projectCode + '/courses/' + courseId + '/stats/export',
                _search = _self._filterParams(ko.mapping.toJS(_self.model.filter)),
                _str = '';
            _self.defer = $.Deferred();
            if (_self.model.isLoading()) {
                return;
            }
            this.model.isLoading(true);
            _self.model.isLoadingText('导出中 5');
            for (var key in _search) {
                _str += (key + '=' + new Date(_search[key]).getTime() + '&');
            }
            if (_str) {
                _url += ('?' + _str.substr(0, _str.length - 1));
            }
            $('#output').attr('src', _url);
            var _timer = window.setInterval(function () {
                _self.model.isLoadingText('导出中 ' + (5 - _count));
                _count++;
                if (_count > 5) {
                    _self.model.isLoading(false);
                    _self.model.isLoadingText('导出');
                    window.clearInterval(_timer);
                }
            }, 1000);
            _self.defer.promise()
                .done(function (data) {
                    Utils.msgTip(data, {
                        time: 3000
                    });
                })
                .fail(function (data) {
                    Utils.msgTip(data, {
                        time: 2000,
                        icon: 7
                    });
                });
        },
        /**
         * 返回考试管理列表
         * @return {[type]} [description]
         */
        back: function () {
            window.parentModel._setFullPath('1.2.4');
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();

})(jQuery, window);
