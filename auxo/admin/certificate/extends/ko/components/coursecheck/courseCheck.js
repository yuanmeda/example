/*!
 * 课程选择组件
 */
(function ($, window) {
    'use strict';
    /**
     * 课程选择数据模型
     * @param {Object} params 模块参数(appCode:项目标识)
     */
    function CSModel(params) {
        var that = this;
        var model = {
            filter: {
                key: '', //搜索关键字
                order_type: 0, //排序类型
                size: 12, //分页大小
                custom_type: '', //搜索类型
                tag_id: null, //搜索节点id
                page: 0 //当前页码
            },
            selectIds: [], //选中课程id
            selectItems: [], //选中课程详细
            items: [], //课程
            loadComplete: false, //是否加载完成
            style: params.style || 'checkbox'
        };
        params.outData(null);
        this.params = params || {};
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // 选中课程
        params.outData(null);

        function getItem(checkedData) {
            var datas = (checkedData || "$$$").split("$$$");
            return {
                id: datas[0],
                title: datas[1],
                custom_type: datas[2]
            };
        }

        this.model.selectIds.subscribe(function (val) {
            if (params.outData !== null && ko.isObservable(params.outData)) {
                if ($.type(val) === 'array') {
                    var items = [];
                    $.each(val, function (i, v) {
                        items.push(getItem(v));
                    });
                    params.outData(items);
                } else {
                    var item = getItem(val);
                    params.outData([item]);
                }
            }
        }, this);
        // items改变强制刷新
        this.model.items.extend({
            'notify': 'always'
        });
        // 数据仓库
        this.store = {
            // 获取课程列表
            courseList: function (filter) {
                var url = '/' + window['projectCode'] + '/certificates/studys/search';
                return $.ajax({
                    url: url,
                    data: filter
                });
            }
        };
        // 初始化动作
        this._init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    CSModel.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function () {
            setTimeout(function () {
                this._loadTree()
                    .promise.done(function (treeObj) {
                    // 加载课程列表
                    var _nodes = treeObj.getNodes(),
                        _firstNode;
                    if (_nodes.length) {
                        _firstNode = _nodes[0];
                        treeObj.selectNode(_firstNode);
                    }
                    this._treeSearchInit(_firstNode);
                }.bind(this));
                this.container = $('#csComponent_js').removeClass('hide');
            }.bind(this), 0);
        },
        /**
         * 加载树
         * @return {null}        [null]
         */
        _loadTree: function () {
            return new ToolBar({
                urls: {
                    query: '/' + window['projectCode'] + '/certificates/tags'
                },
                onClick: $.proxy(this._treeSearchInit, this)
            });
        },
        /**
         * 图片懒加载
         * @return {null} null
         */
        _lazyImage: function () {
            var _vm = this;
            $('.lazy-image:not(.loaded)', this.container).lazyload({
                effect: 'fadeIn',
                threshold: 200,
                effect_speed: 800,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('appear');
        },
        /**
         * 加载课程列表
         * @return {promise} promise对象
         */
        _loadList: function () {
            var _vm = this,
                _filter = ko.mapping.toJS(this.model.filter);
            this.model.loadComplete(false);
            return this.store.courseList(_filter)
                .done(function (data) {
                    data.items = data.items || [];
                    $.each(data.items, function (i, v) {
                        v.custom_type = _filter.custom_type;
                    });
                    _vm.model.items(data.items);
                    _vm._pagePlugin(data.count, _filter.size, _filter.page);
                    _vm._lazyImage();
                })
                .always(function () {
                    _vm.model.loadComplete(true);
                });
        },
        /**
         * 分页初始化
         * @param  {int}   total       总条数
         * @param  {int}   pageSize    每页条数
         * @param  {int}   currentPage 当前页码
         * @return {null}               null
         */
        _pagePlugin: function (total, pageSize, currentPage) {
            var _vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        _vm.model.filter.page(pageNum);
                        _vm.model.items([]);
                        _vm._loadList();
                    }
                }
            });
        },
        /**
         * tree点击事件
         * @param  {object} node 树节点对象
         * @return {null}          null
         */
        _treeSearchInit: function (node) {
            //更新搜索条件处理
            if (node && node.parentTId) {
                this.model.filter.tag_id(node.id);
            } else {
                this.model.filter.tag_id(null);
            }
            this.model.filter.custom_type(node ? node.custom_type : null);
            this._beforeLoadList();
        },
        /**
         * 课程列表搜索前置条件设置
         * @return {null} null
         */
        _beforeLoadList: function () {
            this.model.filter.page(0);
            this.model.items([]);
            this._loadList();
        },
        /**
         * 搜索点击事件
         * @return {null} null
         */
        searchFor_js: function () {
            this.model.filter.page(0);
            this.model.items([]);
            var _vm = this,
                _filter = ko.mapping.toJS(this.model.filter);
            _filter.tag_id = null;
            this.model.loadComplete(false);
            return this.store.courseList(_filter)
                .done(function (data) {
                    data.items = data.items || [];
                    $.each(data.items, function (i, v) {
                        v.custom_type = _filter.custom_type;
                    });
                    _vm.model.items(data.items);
                    _vm._pagePlugin(data.count, _filter.size, _filter.page);
                    _vm._lazyImage();
                })
                .always(function () {
                    _vm.model.loadComplete(true);
                });
        },
        formatType: function (type) {
            switch (type) {
                case 'plan':
                    return '培养计划';
                case 'auxo-train':
                    return '培训';
                case 'open-course':
                    return '公开课';
                default:
                    return '未知类型';
            }
        }
    };

    /**
     * 注册ko组件my-voucher
     */
    ko.components.register('x-course-check', {
        synchronous: true,
        // viewModel: CSModel,
        viewModel: {
            createViewModel: function (params, componentInfo) {
                $(componentInfo.element).css('height', '100%').html(componentInfo.templateNodes);
                return new CSModel(params);
            }
        },
        template: '<div></div>'
    });
})(jQuery, window);
