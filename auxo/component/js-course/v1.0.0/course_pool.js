/*!
 * 课程池组件
 * 依赖bootstrap-v2.0.2,pagination-v2.2
 */
(function($, window) {
    'use strict';
    /**
     * 课程数据模型
     * @param {Object} params 模块参数(code:项目标识)
     */
    function CoursePool(params) {
        var model = {
            filter: {
                page_no: 0, //当前页码
                page_size: 20, //分页大小
                name: undefined //关键字搜索
            },
            // 搜索默认文本
            textLabel: {
                modalTitle: '选择课程',
                modalClose: '关闭',
                modalConfirm: '确认',
                placeholder: '关键字',
                searchLabel: '查找'
            },
            isAllChecked: false, //是否全选
            projectItems: [],
            items: [], //数据列表
            selectItems: [], //选中的数据列表
            nodataText: '暂无课程', //无数据显示文本
            selectedProjectValue: ''
        };

        // 整合用户文本显示
        if (params.textLabel) {
            $.extend(model.textLabel, params.textLabel);
        }
        this.params = $.extend(params || {}, {
            pagination: '#cp_pagination_js'
        });
        // 接收modal开关条件
        if (!this.params.switchStatus || !ko.isObservable(this.params.switchStatus)) {
            throw new Error('缺少可监听的switchStatus。');
        }
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // checkedbox-isAllChecked事件
        this.model.isAllChecked = ko.computed({
            write: function(val) {
                this.model.selectItems(val ? this.model.items().slice(0) : []);
            },
            read: function() {
                return this.model.items().length === this.model.selectItems().length;
            },
            owner: this
        });
        // 数据仓库
        this.store = {
            // 获取课程列表
            courseList: function(filter, project_id) {
                var url = (params && params.courseWebpage ? params.courseWebpage : '') + '/' + params.code + '/' + (params.fetchUrl || 'courses/pools/search?project_id=' + project_id);

                return $.ajax({
                    url: url,
                    data: filter
                });
            },
            /*获取项目列表*/
            projectList: function () {
                var url = (params && params.courseWebpage ? params.courseWebpage : '') + '/' + params.code + '/courses/auth_projects';

                return $.ajax({
                    url: url
                });
            }
        };
        //给下拉列表定义订阅函数
        this.model.selectedProjectValue.subscribe($.proxy(function (newValue) {
                var self = this;
                if (this.model.selectedProjectValue() != undefined) {
                    this.model.filter.page_no(0);
                    this._loadCourseList()
                        .done(function(data) {
                            self.model.items(data.items);
                            self._pagination(data.total);
                        })
                        .always(function(data, flag, xhr) {
                            $('div[data-auto-show="true"]', '.x-coursepool').show();
                        });
                }
        }, this));
        // 初始化动作
        this._init();
    }
    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    CoursePool.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function() {
            var _self=this;
            //加载项目列表
            this._loadProjectList();
            // 加载事件
            this._eventHandler();
            // 显示弹层
            setTimeout(function() {
                $('.x-coursepool').modal('show');
                $('.x-coursepool').on('hidden', function() {
                    _self.params.switchStatus(false);
                });
            }, 500);
        },
        /**
         * 事件集合
         * @return {null} null
         */
        _eventHandler: function() {
            var _self = this;

        },
        /**
         * 加载项目列表
         */
        _loadProjectList: function () {
            var _self = this;
            return this.store.projectList().done(function(returnData) {
                /*当得到项目列表时，下拉列表会默认显示列表中的第一个值，第一次触发订阅函数，因此不需要再次发送获取当前项目下课程列表的请求*/
                for (var i = 0; i < returnData.length; i++) {
                    if (returnData[i].project_id == projectId) {
                        returnData.unshift(returnData.splice(i,1)[0]);
                        break;
                    }
                }
                _self.model.projectItems(returnData);
            })
        },

        /**
         * 加载课程列表
         * @param  {boolean} isFirst 是否第一次加载
         * @return {promise} promise对象
         */
        _loadCourseList: function(isFirst) {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter);
            // 清空selectItems
            this.model.selectItems([]);
            return this.store.courseList(_filter,  _self.model.selectedProjectValue())
                .done(function(data) {
                    _self.model.items(data.items);
                    _self._pagination(data.total);
                })
                .always(function(data, flag, xhr) {
                    $('div[data-auto-show="true"]', '.x-coursepool').show();
                });
        },
        /**
         * 分页初始化
         * @param  {int} totalCount 总条数
         * @return {null}            null
         */
        _pagination: function(totalCount) {
            var _target = $(this.params.pagination),
                _filter = this.model.filter,
                _self = this;
            _target.pagination(totalCount, {
                items_per_page: _filter.page_size(),
                num_display_entries: 5,
                current_page: _filter.page_no(),
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function(page_no) {
                    if (page_no != _filter.page_no()) {
                        _filter.page_no(page_no);
                        _self._loadCourseList();
                    }
                }
            });
        },
        /**
         * 课程搜索事件
         * @return {null} null
         */
        searchHandler_js: function() {
            this.model.filter.page_no(0);
            this._loadCourseList();
        },
        /**
         * 确认按钮事件(有回调则调用)
         * @return {null} null
         */
        modalConfirm_js: function() {
            if (this.params.confirmCallback) {
                this.params.confirmCallback(this.model.selectItems());
            }
            $('.x-coursepool').modal('hide');
        }
    };

    /**
     * 注册ko组件course-pool
     */
    ko.components.register('x-course-pool', {
        synchronous: true,
        viewModel: CoursePool,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
