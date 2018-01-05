(function ($, window) {
    var store = {
        getResourcesStat: function () {
            return $.ajax({
                url: '/fjedu/resource/resource_stat'
            })
        }
    };

    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none'
            },
            formatter: function (params) {
                return params[0].name + ': ' + params[0].value;
            }
        },
        xAxis: {
            data: [],
            axisTick: {show: false},
            axisLine: {show: false}
        },
        yAxis: {
            splitLine: {show: false},
            axisTick: {show: false},
            axisLine: {show: false},
            axisLabel: {show: false}
        },
        color: ['#71beff'],
        series: [{
            label: {
                normal: {
                    show: true,
                    position: 'outside',
                    offset: [0, -10],
                    formatter: function (param) {
                        return param.value
                    },
                    textStyle: {
                        fontSize: 18,
                        fontFamily: 'Arial',
                        color: '#6db259'
                    }
                }
            },
            name: 'hill',
            type: 'pictorialBar',
            barCategoryGap: '-130%',
            symbol: 'path://M10,10 C13,5 17,5 20,10',
            itemStyle: {
                normal: {
                    opacity: 0.5
                },
                emphasis: {
                    opacity: 1
                }
            },
            data: [],
            z: 10
        }]
    };

    var viewModel = {
        stat: function () {
            store.getResourcesStat().done(function (d) {
                if (d.items.length <= 0)
                    return;

                $('#resource_count').text(d.total);
                var items = d.items;
                var seriesData = [];
                var xAxisData = [];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    xAxisData.push(item.category);
                    seriesData.push(item.count);
                }

                option.xAxis.data = xAxisData;
                option.series[0].data = seriesData;

                var myChart = echarts.init(document.getElementById('chart'));
                myChart.setOption(option);
            })
        }
    };

    $(function () {
        viewModel.stat();
    });

})(jQuery, window)