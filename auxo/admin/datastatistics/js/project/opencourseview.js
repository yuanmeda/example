(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据

    var store = {
        // 模块数量
        countByStatus: function(status) {
            var uri = '/v1/datastatistics/opencourse_counts';
            return $.ajax({
                url: uri
            });
        },

        // 趋势概览
        trend: function(day) {
            var uri = '/v1/datastatistics/opencourse_userstat';
            return $.ajax({
                url: uri,
                data: {
                    day: day || 7
                }
            });
        },

        // 参与度排行
        joins: function(top) {
            var uri = '/v1/datastatistics/opencourse_rank_join';
            return $.ajax({
                url: uri,
                data: {
                    size: top || 10
                }
            });
        },

        // 合格度排行
        passed: function(top) {
            var uri = '/v1/datastatistics/opencourse_rank_pass';
            return $.ajax({
                url: uri,
                data: {
                    size: top || 10
                }
            });
        }
    };

    function ViewModel(params) {
        var _model = {
            count: {
                total: 0,
                online: 0,
                offline: 0
            },
            trend: {
                day: 7,
                items: []
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
            this._countByStatus();
            this._trend();
            this._joins();
            this._passed();
        },
        /**
         * 数量查询
         * @return {null} null
         */
        _countByStatus: function() {
            var vm = this;
            store.countByStatus().done(function(d) {
                vm.model.count.online(d.online_course_count);
                vm.model.count.offline(d.down_course_count);
                vm.model.count.total(d.course_count);
            });
        },
        /**
         * 趋势概览 
         * @return {null} null
         */
        _trend: function() {
            var vm = this;
            store.trend(this.model.trend.day())
                .done(function(d) {
                    vm.model.trend.items(d);
                    vm._chartTrendInit('trend_chart_js');
                });
        },
        /**
         * Trendechart表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartTrendInit: function(id) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));
            // 数据准备
            var datas = this.model.trend.items(),
                chartData = {
                    times: [],
                    joins: [],
                    passed: []
                };
            datas.forEach(function(d) {
                chartData.times.push(d.stat_date);
                chartData.joins.push(d.join_count);
                chartData.passed.push(d.pass_count);
            });

            // 指定图表的配置项和数据
            var option = {
                tooltip: {},
                legend: {
                    data: ['参与人员', '合格人员']
                },
                xAxis: {
                    type: 'category',
                    data: chartData.times
                },
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '参与人员',
                    type: 'bar',
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: 'rgba(216, 223, 152, 1)'
                        }
                    },
                    data: chartData.joins
                }, {
                    name: '合格人员',
                    type: 'bar',
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: 'rgba(181, 195, 52, 1)'
                        }
                    },
                    data: chartData.passed
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            chart.setOption(option);
        },

        /**
         * 参与度
         * @return {null} null
         */
        _joins: function() {
            var vm = this;
            store.joins()
                .done(function(d) {
                    var chartData = {
                        statics: [],
                        items: []
                    };
                    d.forEach(function(item) {
                        chartData.statics.push(item.open_course_name);
                        chartData.items.push(item.user_count);
                    });
                    vm._chartModuleInit('part_chart_js', '公开课参与度排行', chartData, '{c}人');
                });
        },
        /**
         * 合格度
         * @return {null} null
         */
        _passed: function() {
            var vm = this;
            store.passed()
                .done(function(d) {
                    var chartData = {
                        statics: [],
                        items: []
                    };
                    d.forEach(function(item) {
                        chartData.statics.push(item.open_course_name);
                        chartData.items.push((+item.pass_rate).toFixed(2));
                    });
                    vm._chartModuleInit('pass_chart_js', '公开课合格率排行', chartData, '{c}%');
                });
        },
        /**
         * moduleechart表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartModuleInit: function(id, title, data, formatter) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: title,
                    right: '43%'
                },
                tooltip: {},
                legend: {
                    data: ['排行'],
                    show: false
                },
                xAxis: {},
                yAxis: {
                    data: data.statics.reverse(),
                    axisLabel: {
                        inside: true,
                        textStyle: {
                            color: '#666'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    z: 10
                },
                series: [{
                    name: '排行',
                    type: 'bar',
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: formatter
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: 'rgba(46, 199, 201, 1)'
                        }
                    },
                    data: data.items.reverse()
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            chart.setOption(option);
        },
        /**
         * 查找
         * @return {null} null
         */
        tabClick: function(tab) {
            this.model.trend.day(tab);
            this._trend();
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
