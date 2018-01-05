(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        list: function(filter) {
            var uri = '/v1/datastatistics/exams/' + examId + '/score_stats';
            return $.ajax({
                url: uri,
                data: filter
            });
        }
    };

    function ViewModel() {
        var _model = {
            items: [],
            org: '',
            filter:{
                root_id: '',
                org_id:''
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
            var vm = this;
            vm.model.org.subscribe(function(v){
                vm.model.filter.root_id(v ? v.root_id : '');
                vm.model.filter.org_id(v ? v.node_id : '');
                if (!vm.first) {
                    vm.rootNode = v;
                    vm.first = true;
                }
                vm._list();
            });
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
                    vm.model.items(d || []);
                    vm._chartInit("statistics_chart_js");
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
         * echart表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartInit: function(id) {
            var data = this.model.items();
            var xData = [];
            var yData = [];
            $.each(data,function(index,item){
                xData.push(item.range);
                yData.push(item.value);
            });
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '考试成绩统计'
                },
                tooltip: {},
                xAxis: {
                    data:xData
                },
                yAxis: {},
                series: [{
                    name: '人数',
                    type: 'bar',
                    data:yData
//                    data: [5, 20, 36, 10, 20]
                }],
                color:['#0cadb7']
            };

            // 使用刚指定的配置项和数据显示图表。
            chart.setOption(option);
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this._list();
        },
        clear: function() {
            this.model.org(this.rootNode);
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
