(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        query: function(data) {
            return $.ajax({
                url: '/' + projectCode + '/usercertificatepost',
                data: data
            });
        }
    };

    function ViewModel(params) {
        var _model = {
            items: [],
            filter: {
                name: '',
                keyword: '',
                size: 20,
                page: 0,
                type_id: '',
                tag_name: '全部'
            }
        };
        this.model = ko.mapping.fromJS(_model);
        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
            this.modal = {
                tags: $('#catalogTree')
            };
            this._list()
                .then(function() {
                    $('#certificate_container_js').show();
                });
        },
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function() {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            return store.query(_filter)
                .then(function(d) {
                    vm.model.items(d.items || []);
                    vm._pagination(d.count, _filter.size, _filter.page);
                });
        },
        /**
         * 分页
         * @param  {int} total       总数
         * @param  {int} pageSize    每页数量
         * @param  {int} currentPage 页码
         * @return {null}             null
         */
        _pagination: function(total, pageSize, currentPage) {
            var vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function(pageNum) {
                    if (pageNum != currentPage) {
                        vm.model.filter.page(pageNum);
                        vm._list();
                    }
                }
            });
        },
        /**
         * 过滤空参数
         * @param  {Object} obj 待过滤参数
         * @return {Object}     已过滤参数
         */
        _dataEmptyFilter: function(obj) {
            var _obj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== '') {
                    _obj[k] = obj[k];
                }
            }
            return _obj;
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 打开分类modal
         * @return {null}     null
         */
        openCatalogModal: function() {
            this.modal.tags.modal('show');
            tree.show(this.model.filter.type_id(), '#modalTree');
        },
        /**
         * 选择分类
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        confirmModal: function(b, evt) {
            var _node = tree.node();
            this.model.filter.type_id(_node[0].id);
            this.model.filter.tag_name(_node[0].title);
            this.modal.tags.modal('hide');
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
