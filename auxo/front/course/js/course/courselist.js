/*!
 * 课程组件前台列表
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //课程列表(GET)
        courseList: function (data) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/courses/search';

            return $.ajax({
                url: url,
                data: data
            });
        }
    };
    //课程列表数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                page_size: 20, //分页大小
                page_no: 0, //分页索引
                course_status: 1 //上线状态
            },
            defaultUrl: defaultImage
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            //加载事件 
            this._eventHandler();
            //加载列表
            this._list();
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {

        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function () {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._filterParams(ko.mapping.toJS(_filter));
            // newItems = [];
            store.courseList(_search).done(function (returnData) {
                if (returnData.items) {
                    _self.model.items(returnData.items);
                }
                $('#pagination').pagination(returnData.total, {
                    items_per_page: _filter.page_size(),
                    num_display_entries: 5,
                    current_page: _filter.page_no(),
                    is_show_total: false,
                    is_show_input: true,
                    pageClass: 'pagination-box',
                    prev_text: '<&nbsp;上一页',
                    next_text: '下一页&nbsp;>',
                    callback: function (pageNum) {
                        if (pageNum != _filter.page_no()) {
                            _filter.page_no(pageNum);
                            _self._list();
                        }
                    }
                });
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
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        /*
         * 跳转详细页
         *
         */
        _toDetail: function (binds) {
            var id = binds.id;
            window.location.href = (window.selfUrl || '') + '/' + projectCode + '/course/' + id;
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();

})(jQuery, window);
