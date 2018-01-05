(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据

    var store = {
        // 模块数量
        userCount: function(status) {
            var uri = '/v1/datastatistics/project/data';
            return $.ajax({
                url: uri,
                global: false
            });
        },

        // 趋势概览
        trend: function(day) {
            var uri = '/v1/datastatistics/project/trend_data';
            return $.ajax({
                url: uri,
                data: {
                    stat_time: day || 7
                }
            });
        }
    };

    function ViewModel(params) {
        var _model = {
            count: {
                total: '--',
                join: '--',
                online: '--'
            },
            trend: {
                day: 30,
                items: []
            },
            itemList: []
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
            this._userCount();
            this._trend();
        },
        /**
         * 数量查询
         * @return {null} null
         */
        _userCount: function() {
            var vm = this;
            store.userCount()
                .done(function(d) {
                    vm.model.count.online(d.online_count);
                    vm.model.count.join(d.study_count);
                    vm.model.count.total(d.user_count);
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
                    var chartData = {
                        statics: [],
                        addCounts: [],
                        useCounts: [],
                        webCounts: [],
                        andriodCounts: [],
                        iosCounts: []
                    }
                    d.items.forEach(function(item, i) {
                        chartData.statics.push(item.date.replace('T', ' ').substr(5, 10));
                        chartData.addCounts.push(item.add_count);
                        chartData.useCounts.push(item.user_count);
                        chartData.webCounts.push(item.web_user_count);
                        chartData.andriodCounts.push(item.android_user_count);
                        chartData.iosCounts.push(item.ios_user_count);
                    });
                    vm._chartPolyInit('poly_chart_js', chartData);
                    vm._chartBarInit('bar_chart_js', chartData);
                    var itemList = d.items.slice(-2).reverse();
                    if (itemList.length === 2) {
                        itemList[0].uc = vm._judgeNumber(itemList[0].user_count , itemList[1].user_count);
                        itemList[0].ac = vm._judgeNumber(itemList[0].add_count , itemList[1].add_count);
                        itemList[0].sc = vm._judgeNumber(itemList[0].study_count , itemList[1].study_count);
                    } else if(itemList.length) {
                        itemList[0].uc = 'up';
                        itemList[0].ac = 'up';
                        itemList[0].sc = 'up';
                    }
                    vm.model.itemList(itemList);
                });

        },
        /**
         *比较大小
         */
        _judgeNumber: function (n1, n2) {
            if (n1 > n2) {
                return 'up';
            } else if (n2 > n1) { 
                return 'down';
            }
            return '';
        },
        /**
         * chart-poly表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartPolyInit: function(id, chartData) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));
            // 指定图表的配置项和数据
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'line' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: ['新增学员', '使用学员总数']
                },
                xAxis: {
                    type: 'category',
                    data: chartData.statics
                },
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '新增学员',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#c3dbde'
                        }
                    },
                    data: chartData.addCounts
                }, {
                    name: '使用学员总数',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#2f4554'
                        }
                    },
                    data: chartData.useCounts
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            chart.setOption(option);
        },
        /**
         * chart-bar表格初始化
         * @param  {string} id dom id
         * @return {null}    null
         */
        _chartBarInit: function(id, chartData) {
            // 初始化echarts实例
            var chart = echarts.init(document.getElementById(id));

            // 指定图表的配置项和数据
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: ['WEB端', 'IOS端', 'Android端', '使用学员总数']
                },
                xAxis: {
                    type: 'category',
                    data: chartData.statics
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
                    data: chartData.webCounts
                }, {
                    name: 'IOS端',
                    type: 'bar',
                    stack: '前端',
                    itemStyle: {
                        normal: {
                            color: '#e37d0c'
                        }
                    },
                    data: chartData.iosCounts
                }, {
                    name: 'Android端',
                    type: 'bar',
                    stack: '前端',
                    itemStyle: {
                        normal: {
                            color: '#446493'
                        }
                    },
                    data: chartData.andriodCounts
                }, {
                    name: '使用学员总数',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            color: '#000'
                        }
                    },
                    data: chartData.useCounts
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
