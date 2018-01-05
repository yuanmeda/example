(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据

    var store = {
        // 模块数量
        examsCount: function() {
            var uri = '/v1/datastatistics/exams/stats';
            return $.ajax({
                url: uri,
                global: false
            });
        },

        // 趋势概览
        trend: function(day) {
            var uri = '/v1/datastatistics/exams/trend_overview';
            return $.ajax({
                url: uri,
                data: {
                    day: day || 7
                }
            });
        },

        // 考试排行
        rankBytype: function(type) {
            var uri = '/v1/datastatistics/exams/rank';
            return $.ajax({
                url: uri,
                data: {
                    order_by: (type || 'exam_user')+' desc'
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
            this._examsCount();
            this._trend();
            this._joins();
            this._passed();
        },
        /**
         * 数量查询
         * @return {null} null
         */
        _examsCount: function() {
            var vm = this;
            store.examsCount()
                .done(function(d) {
                    vm.model.count.online(d.online_exam_count);
                    vm.model.count.offline(d.offline_exam_count);
                    vm.model.count.total(d.total_exam_count);
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
                    vm._chartTrendInit('trend_chart_js',d.items);
                });
        },
        /**
         * Trendechart表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartTrendInit: function(id,datas) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));
            // 数据准备
            var chartData = {
                    times: [],
                    joins: [],
                    passed: []
                };
            datas.forEach(function(d) {
                chartData.times.push(d.date);
                chartData.joins.push(d.exam_user);
                chartData.passed.push(d.pass_user);
            });

            // 指定图表的配置项和数据
            var option = {
                tooltip: {},
                legend: {
                    data: ['参与学员', '合格学员']
                },
                xAxis: {
                    type: 'category',
                    data: chartData.times
                },
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '参与学员',
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
                    name: '合格学员',
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
            store.rankBytype('exam_user')
                .done(function(d) {
                    var chartData = {
                        statics: [],
                        items: []
                    };
                    d.items.forEach(function(item) {
                        chartData.statics.push(item.exam_name);
                        chartData.items.push(item.exam_user);
                    });
                    vm._chartModuleInit('part_chart_js', '测评参与度排行', chartData, '{c}人');
                });
        },
        /**
         * 合格度
         * @return {null} null
         */
        _passed: function() {
            var vm = this;
            store.rankBytype('pass_ratio')
                .done(function(d) {
                    var chartData = {
                        statics: [],
                        items: []
                    };
                    d.items.forEach(function(item) {
                        chartData.statics.push(item.exam_name);
                        chartData.items.push(item.pass_ratio.toFixed(2));
                    });
                    vm._chartModuleInit('pass_chart_js', '测评合格率排行', chartData, '{c}%');
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
                tooltip: {
                    // formatter:'{a}<br/>{c}%'
                },
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
                            position: 'left',
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
