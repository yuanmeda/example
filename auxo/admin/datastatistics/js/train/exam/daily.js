(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        list: function(filter) {
            var uri = '/v1/datastatistics/exams/' + examId + '/daily_stats';
            return $.ajax({
                url: uri,
                data: filter
            });
        },

        output: function(options) {
            var uri = '/v1/datastatistics/exams/' + examId + '/daily_stats/export';
            return $.ajax({
                url: uri,
                data: options
            });
        },
        layer: function(rootId, nodeId) {
            var uri = '/v1/org_tree/' + rootId + '/nodes/' + nodeId + '/layer';
            return $.ajax({
                url: uri
            });
        }
    };
    var sortStatus = {
        date: 'asc',
        study_user: 'asc',
        pass_user: 'asc',
        avg_score: 'asc'
    };
    var initialDay = 30;
    var date = new Date();
    var oneDayTime = 24 * 3600 * 1000;
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 0);
    var beforeDay = new Date(today.getTime() - initialDay * oneDayTime + oneDayTime);

    function ViewModel(params) {
        var _model = {
            items: [],
            activeTimeTab: initialDay,
            exporting: false,
            org: '',
            filter: {
                begin_time: beforeDay.getTime(),
                end_time: today.getTime(),
                root_id: '',
                org_id: '',
                order_by: '',
                size: 20,
                page: 0
            }
        };
        this.model = ko.mapping.fromJS(_model);
        this._datePicker();
        $('#time_end_js').datetimepicker('setDate', today);
        $('#time_begin_js').datetimepicker('setDate', beforeDay);
        // $('#time_end_js').datetimepicker('setStartDate', beforeDay);
        // $('#time_begin_js').datetimepicker('setEndDate', today);
        this.model.org.subscribe(function(v) {
            this.model.filter.root_id(v ? v.root_id : '');
            this.model.filter.org_id(v ? v.node_id : '');
            //if (!this.first) {
                this.rootNode = v;
                this._list();
                //this.first = true;
            //}
        }, this);
        this.model.activeTimeTab.subscribe(function(v) {
            if (!v) {
                return;
            }
            var times = (v - 1) * 24 * 3600 * 1000;
            this.model.filter.end_time(today.getTime());
            this.model.filter.begin_time(today.getTime() - times);
            $('#time_end_js').datetimepicker('setDate', today);
            $('#time_begin_js').datetimepicker('setDate', new Date(today.getTime() - times));
        }, this);
//        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
        },
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function() {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            return store.list(_filter)
                .then(function(d) {
                    vm.model.items(d.items || []);
                    vm._pagination(d.total, _filter.size, _filter.page);
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
         * 初始化datepicker
         * @return {null} null
         */
        _datePicker: function () {
            var vm = this;
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN',
                minuteStep: 10
            });
            // 搜索时间规则
            $('#time_begin_js').on('changeDate', function(e) {
                var _date = e.date ? e.date : '';
                var _time = _date ? _date.getTime() : '';
                // $('#time_end_js').datetimepicker('setStartDate', _date);
                vm.model.filter.begin_time(_time);
                vm.setTimeTab(0);
//                vm.setTimeTab((vm.model.filter.end_time() - vm.model.filter.begin_time()) / oneDayTime + 1);
            });
            $('#time_end_js').on('changeDate', function(e) {
                var _date = e.date ? e.date : '';
                var _time = _date ? _date.getTime() : '';
                // $('#time_begin_js').datetimepicker('setEndDate', _date);
                vm.model.filter.end_time(_time);
                vm.setTimeTab(0);
//                vm.setTimeTab((vm.model.filter.end_time() - vm.model.filter.begin_time()) / oneDayTime + 1);
            });
        },
        /**
         * 排序
         * @return {null} null
         */
        orderBy: function(type) {
            var oType = sortStatus[type];
            sortStatus[type] = oType === 'asc' ? 'desc' : 'asc';
            this.model.filter.order_by(type + ' ' + oType);
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this.model.filter.page(0);
            this.model.filter.order_by('');
            this._list();
        },
        /**
         * 导出
         * @return {null} null
         */
        output: function() {
            var vm = this;
            var options = ko.mapping.toJS(this.model.filter);
            delete options.page;
            delete options.size;
            this.model.exporting(true);
            store.output(this._dataEmptyFilter(options))
                .done(function(file) {
                    window.location.href = file.file_name;
                })
                .always(function() {
                    vm.model.exporting(false);
                });
        },
        clear: function() {
            this.model.org(this.rootNode);
            this.model.activeTimeTab(30);
        },
        setTimeTab: function(day) {
            this.model.activeTimeTab(day);
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
