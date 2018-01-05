(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据

    var store = {
        // 模块数量
        useCount: function(status) {
            var uri = ' /v1/datastatistics/project/use_data';
            return $.ajax({
                url: uri,
                global: false
            });
        },

        // 趋势概览
        trend: function(filter) {
            var uri = '/v1/datastatistics/project/data_sort';
            return $.ajax({
                url: uri,
                data: filter
            });
        },

        // 导出
        output: function(options) {
            var uri = '/v1/datastatistics/project/data_sort/export';
            return $.ajax({
                url: uri,
                data: options
            });
        }
    };
    var initialDay = 30;
    var date = new Date();
    var oneDayTime = 24 * 3600 * 1000;
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 0);
    var beforeDay = new Date(today.getTime() - initialDay * oneDayTime + oneDayTime);

    function ViewModel(params) {
        var _model = {
            count: {
                total: '--',
                web: '--',
                android: '--',
                ios: '--'
            },
            frequency: {
                total: '--',
                web: '--',
                android: '--',
                ios: '--'
            },
            exporting: false,
            orgName: '',
            activeTimeTab: initialDay,
            org: '',
            type: 'use',
            filter: {
                begin_time: beforeDay.getTime(),
                end_time: today.getTime(),
                root_id: '',
                org_id: ''
            },
            items:[]
        };
        this.model = ko.mapping.fromJS(_model);
        this._datePicker();
        $('#time_end_js').datetimepicker('setDate', today);
        $('#time_begin_js').datetimepicker('setDate', beforeDay);
        $('#time_end_js').datetimepicker('setStartDate', beforeDay);
        $('#time_begin_js').datetimepicker('setEndDate', today);
        this.model.org.subscribe(function(v) {
            this.model.orgName(v.node_name);
            this.model.filter.root_id(v ? v.root_id : '');
            this.model.filter.org_id(v ? v.node_id : '');
            if (!this.first) {
                this.rootNode = v;
                this._bar();
                this.first = true;
            }
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
        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
            this._useCount();
        },
        /**
         * 数量查询
         * @return {null} null
         */
        _useCount: function() {
            var vm = this;
            store.useCount()
                .done(function (d) {
                    vm.model.count.total(d.user_count);
                    vm.model.count.web(d.web_user_count);
                    vm.model.count.android(d.android_user_count);
                    vm.model.count.ios(d.ios_user_count);

                    vm.model.frequency.total(d.use_times);
                    vm.model.frequency.web(d.web_user_times);
                    vm.model.frequency.android(d.android_user_times);
                    vm.model.frequency.ios(d.ios_user_times);
                });
        },
        /**
         * 初始化datepicker
         * @return {null} null
         */
        _datePicker: function() {
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
                $('#time_end_js').datetimepicker('setStartDate', _date);
                vm.model.filter.begin_time(_time);
                vm.setTimeTab(0);
//                vm.setTimeTab((vm.model.filter.end_time() - vm.model.filter.begin_time()) / oneDayTime + 1);
            });
            $('#time_end_js').on('changeDate', function(e) {
                var _date = e.date ? e.date : '';
                var _time = _date ? _date.getTime() : '';
                $('#time_begin_js').datetimepicker('setEndDate', _date);
                vm.model.filter.end_time(_time);
                vm.setTimeTab(0);
//                vm.setTimeTab((vm.model.filter.end_time() - vm.model.filter.begin_time()) / oneDayTime + 1);
            });
        },
        /**
         * 柱状图
         * @return {null} null
         */
        _bar: function() {
            var vm = this;
            store.trend(ko.mapping.toJS(this.model.filter))
                .done(function(d) {
                    var chartData = {
                        statics: [],
                        useCounts: [],
                        webUseCounts: [],
                        androidUseCounts: [],
                        iosUseCounts: [],
                        useTimes: [],
                        webUseTimes: [],
                        androidUseTimes: [],
                        iosUseTimes: []
                    };
                    var chartData = {
                        statics: [],
                        use: {
                            total: [],
                            web: [],
                            android: [],
                            ios: []
                        },
                        fre: {
                            total: [],
                            web: [],
                            android: [],
                            ios: []
                        }
                    };
                    vm.model.items(d.items||[]);
                    d.items.forEach(function(item, i) {
                        chartData.statics.push(item.date.replace('T', ' ').substr(5, 10));
                        chartData.use.total.push(item.user_count);
                        chartData.use.web.push(item.web_user_count);
                        chartData.use.android.push(item.android_user_count);
                        chartData.use.ios.push(item.ios_user_count);
                        chartData.fre.total.push(item.use_times);
                        chartData.fre.web.push(item.web_user_times);
                        chartData.fre.android.push(item.android_user_times);
                        chartData.fre.ios.push(item.ios_user_times);
                    });
                    vm.chartData = chartData;
                    vm._chartBarInit(chartData.statics, chartData[vm.model.type()], vm.model.type());
                });
        },
        /**
         * chart-bar表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartBarInit: function(statics, chartData, type) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById('bar_chart_js'));
            var typeName = type === 'use' ? '使用学员总数' : '使用学员频次';

            // 指定图表的配置项和数据
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: ['WEB端', 'IOS端', 'Android端', typeName]
                },
                xAxis: {
                    type: 'category',
                    data: statics
                },
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: 'WEB端',
                    type: 'bar',
                    stack: '前端',
                    itemStyle: {
                        normal: {
                            color: '#d83f44'
                        }
                    },
                    data: chartData.web
                }, {
                    name: 'IOS端',
                    type: 'bar',
                    stack: '前端',
                    itemStyle: {
                        normal: {
                            color: '#e37d0c'
                        }
                    },
                    data: chartData.ios
                }, {
                    name: 'Android端',
                    type: 'bar',
                    stack: '前端',
                    itemStyle: {
                        normal: {
                            color: '#446493'
                        }
                    },
                    data: chartData.android
                }, {
                    name: typeName,
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#000'
                        }
                    },
                    data: chartData.total
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            chart.setOption(option);
        },
        /**
         * 切换图表类型
         * @return {null} null
         */
        tabClick: function(tab) {
            this.model.type(tab);
            this._chartBarInit(this.chartData.statics, this.chartData[this.model.type()], this.model.type());
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this._bar();
        },
        /**
         * 切换时间范围
         * @param {null} day null
         */
        setTimeTab: function(day) {
            this.model.activeTimeTab(day);
        },
        /**
         * 导出
         * @return {null} null
         */
        output: function() {
            var vm = this;
            var options = ko.mapping.toJS(this.model.filter);
            this.model.exporting(true);
            store.output(options)
                .done(function(file) {
                    window.location.href = file.file_name;
                })
                .always(function() {
                    vm.model.exporting(false);
                });
        },
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
