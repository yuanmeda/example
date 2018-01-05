;
(function () {
    var chartStyles = {
        title: {
            color: '#b23c33',
            fontSize: 16,
            fontFamily: "Microsoft Yahei",
            align: 'center'
        },
        title2: {
            color: '#b23c33',
            fontSize: 12,
            fontFamily: "Microsoft Yahei",
            align: 'center'
        },
        label: {
            color: '#505050',
            fontSize: 10,
            fontFamily: "Microsoft Yahei",
            align: 'center'
        },
        label1: {
            fontSize: '14',
            fontWeight: 'bold',
            fontFamily: 'Microsoft Yahei',
            align: 'center'
        },
        label2: {
            color: '#8a8a8a',
            fontSize: 10,
            fontFamily: "Microsoft Yahei",
            align: 'center'
        },
        axisLine: {
            color: '#d9d9d9',
            width: 2
        },
        dashLine: {
            color: ['#ececec'],
            width: 1,
            type: 'dashed'
        },
        formatTitle: function (value, digit, sign, limit8) {
            if (value && typeof value === "string") {
                if (!digit || typeof digit !== "number") {
                    digit = 6;
                }
                if (!sign || typeof sign !== "string") {
                    sign = "\n";
                }
                if (!limit8 || typeof limit8 !== "boolean") {
                    limit8 = false;
                }
                if (limit8) {
                    value = value.substring(0, 8);
                }
                var reg = new RegExp("(.{" + digit + "})", "g");
                value = value.replace(reg, "$1" + sign);
            }
            return value;
        },
        toPercent: function (value, radix) {
            if (!radix || typeof radix !== "number") {
                radix = 1;
            }
            if (typeof value === "object") {
                value = value.value;
            }
            value = +value;
            return (value * radix).toFixed(0) + "%";
        },
        toNumber: function (value, radix) {
            if (!radix || typeof radix !== "number") {
                radix = 1;
            }
            if (typeof value === "object") {
                value = value.value;
            }
            value = +value;
            return (value * radix).toFixed(0);
        },
        normal: function (value) {
            if (typeof value === "object") {
                value = value.value;
            }
            return value;
        }
    }, util = {
        each: function (data, fn) {
            for (var i = 0, l = data.length || 0; i < l; i++) {
                fn(i, data[i]);
            }
        }
    };

    var chart = {
        formatTitle: chartStyles.formatTitle,
        // { title: "", keys: [], items: [], digit: 6 }
        pie: function (opts) {
            return {
                color: ["#b0372e", "#f15600", "#f4b717", "#d5dc00", "#9cd900", "#e31809", "#e3190b", "#eb4d41", "#f08179", "#f6aeaa", "#93003f", "#c2005e", "#d33788", "#e688b9", "#ffb4e9"],
                tooltip: {
                    trigger: 'item',
                    enterable: true,
                    formatter: "{b}(学习比例): {c} ({d}%)"
                },
                title: {
                    text: chartStyles.formatTitle(opts.title, opts.digit),
                    padding: 10,
                    textStyle: chartStyles.title2
                },
                legend: {
                    orient: 'vertical',
                    x: 5,
                    y: 45,
                    data: opts.keys,
                    itemGap: 3,
                    textStyle: chartStyles.label,
                    itemWidth: 15
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: true
                        },
                        magicType: {
                            show: true,
                            type: ['pie', 'funnel'],
                            option: {
                                funnel: {
                                    x: '25%',
                                    width: '50%',
                                    funnelAlign: 'center',
                                    max: 1548
                                }
                            }
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                series: [{
                    name: opts.title,
                    type: 'pie',
                    center: ['70%', '50%'],
                    radius: ['65%', '80%'],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: chartStyles.label1
                            }
                        }
                    },
                    data: opts.items
                }]
            };
        },
        // { legendData: [], data: [], names: [], yLabel: "" }
        threeBar: function (opts) {
            var barColors = ["#f4c521", "#f47b21", "#b23c33"],
                series = [];

            util.each(opts.legendData || [], function (i, v) {
                series.push({
                    name: opts.legendData[i],
                    type: "bar",
                    barWidth: 20,
                    barCategoryGap: 30,
                    itemStyle: {
                        normal: {
                            color: barColors[i],
                            label: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: barColors[i]
                                }
                            }
                        }
                    },
                    data: opts.data[i] || []
                });
            });
            return {
                grid: {
                    x: 60,
                    y: 60,
                    x2: 10,
                    y2: 40
                },
                legend: {
                    data: opts.legendData,
                    x: 'right',
                    y: 20
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    name: opts.yLabel,
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        margin: 30
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: series
            };
        },

        oneBar: function (opts) {
            var series = [];

            util.each(opts.legendData || [], function (i, v) {
                series.push({
                    name: '',
                    type: "bar",
                    barWidth: 20,
                    barCategoryGap: 30,
                    itemStyle: {
                        normal: {
                            color: function(params) {
                                //todo 按照UI的颜色改 build a color map as your need.
                                var colorList = [
                                    '#f47b21','#b23c33'
                                ];
                                return colorList[params.dataIndex % 2]
                            },

                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c} %'
                            }
                        }
                    },
                    data: opts.data[i] || []
                });
            });
            return {
                grid: {
                    x: 60,
                    y: 60,
                    x2: 10,
                    y2: 60
                },
                legend: {
                    data: opts.legendData,
                    x: 'right',
                    y: 20
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    name: opts.yLabel,
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        formatter: '{value} %',
                        margin: 30
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                tooltip: {
                    formatter: function (data) {
                        return data.name;
                    }
                },
                series: series
            };
        },
        // { data: [], names: [] }
        line: function (opts) {
            return {
                grid: {
                    x: 60,
                    y: 30,
                    x2: 10,
                    y2: 60
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}"
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    min: 0,
                    max: 1,
                    type: 'value',
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        margin: 30,
                        formatter: function (value) {
                            return chartStyles.toPercent(value, 100);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: [{
                    type: "line",
                    symbolSize: 8,
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                            },
                            lineStyle: {
                                width: 2,
                                type: "dashed",
                                color: "#c46867"
                            },
                            label: {
                                show: true,
                                position: 'top',
                                formatter: function (value) {
                                    return chartStyles.toPercent(value, 100);
                                },
                                textStyle: {
                                    color: function (params) {
                                        return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                                    }
                                }
                            }
                        }
                    },
                    data: opts.data
                }]
            };
        },
        studyLine: function (opts) {
            return {
                grid: {
                    x: 60,
                    y: 30,
                    x2: 10,
                    y2: 60
                },
                tooltip: {
                    trigger: 'item',
                    alwaysShowContent: true,
                    enterable: true,
                    formatter: function (params, ticket, callback) {
                        return opts.data[params.dataIndex] + "</br>" + opts.tip[params.dataIndex];
                    }
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        rotate: 0,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        margin: 30,
                        formatter: '{value}'
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: [{
                    type: "line",
                    symbolSize: opts.data.length > 8 ? 0 : 5,
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                            },
                            lineStyle: {
                                width: 1,
                                type: "dashed",
                                color: "#c46867"
                            },
                            label: {
                                show: false,
                                position: 'top',
                                textStyle: {
                                    color: function (params) {
                                        return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                                    }
                                }
                            }
                        }
                    },
                    data: opts.data
                }]
            };
        },
        // { data: [], title: "", names: [], isPercent: false }
        bar: function (opts) {
            return {
                title: {
                    text: opts.title,
                    textStyle: chartStyles.title,
                    padding: 10
                },
                grid: {
                    x: 50,
                    y: 60,
                    x2: 20,
                    y2: 90
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}"
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 2);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        margin: 30,
                        formatter: !!opts.isPercent ? chartStyles.toPercent : chartStyles.normal
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: [{
                    type: "bar",
                    barWidth: 15,
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                            },
                            label: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: function (params) {
                                        return ['#f47b21', '#b23c33'][params.dataIndex % 2];
                                    }
                                },
                                formatter: !!opts.isPercent ? chartStyles.toPercent : chartStyles.normal
                            }
                        }
                    },
                    data: opts.data
                }]
            };
        },
        // { legendData: [], data: [], names: [] }
        doubleBar: function (opts) {
            var barColors = ["#f4c521", "#f47b21"],
                series = [];
            util.each(opts.legendData, function (i, v) {
                series.push({
                    name: opts.legendData[i],
                    type: "bar",
                    barWidth: 20,
                    barCategoryGap: "40%",
                    barGap: "3%",
                    itemStyle: {
                        normal: {
                            color: barColors[i],
                            label: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: barColors[i]
                                }
                            }
                        }
                    },
                    data: opts.data[i]
                });
            });
            return {
                grid: {
                    x: 60,
                    y: 60,
                    x2: 10,
                    y2: 80
                },
                legend: {
                    data: opts.legendData,
                    x: 'right',
                    y: 20
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        interval: 10,
                        margin: 30
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: series
            };
        },
        // { data: [], title: "", names: [] }
        mixBar: function (opts) {
            var barColors = ["#f4c521", "#f47b21", "#b23c33"],
                series = [], legendData = [];
            util.each(opts.data, function (i, v) {
                legendData.push(opts.data[i].name);
                series.push({
                    type: "bar",
                    stack: "total",
                    name: opts.data[i].name,
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            color: barColors[i],
                            label: {
                                show: false
                            }
                        }
                    },
                    data: opts.data[i].data
                });
            });
            return {
                title: {
                    text: opts.title,
                    textStyle: chartStyles.title,
                    padding: 10
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} - {a}:{c}"
                },
                grid: {
                    x: 40,
                    y: 60,
                    x2: 0,
                    y2: 70
                },
                legend: {
                    data: legendData,
                    x: 'right',
                    y: 40
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        margin: 10,
                        textStyle: chartStyles.label2,
                        formatter: function (title) {
                            return chartStyles.formatTitle(title, 5);
                        }
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    data: opts.names
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        textStyle: chartStyles.label2,
                        margin: 20
                    },
                    axisLine: {
                        lineStyle: chartStyles.axisLine
                    },
                    splitLine: {
                        lineStyle: chartStyles.dashLine
                    }
                }],
                series: series
            };
        },
        // { model: {}, data: [], pos: {} }
        map: function (opts) {
            var series = [{
                name: '0',
                type: 'map',
                hoverable: false,
                mapType: 'model',
                itemStyle: {
                    normal: {
                        borderColor: '#d2a403',
                        borderWidth: 1,
                        areaStyle: {
                            color: '#fcde75'
                        }
                    }
                },
                data: [],
                markPoint: {
                    symbolSize: 1,
                    large: true,
                    symbol: 'circle',
                    effect: {
                        show: true,
                        color: '#e84c3d'
                    },
                    data: (function () {
                        var items = [];
                        // 制造小数据点
                        $.each(opts.pos, function (key, item) {
                            var len = 5;
                            var dif = 0.05;
                            while (--len) {
                                items.push({
                                    name: key + len,
                                    value: 10,
                                    geoCoord: [item.geoCoord[0] + Math.random() * dif, item.geoCoord[1] + Math.random() * dif]
                                });
                                dif = -dif;
                            }
                        });
                        return items;
                    })()
                }
            }];

            $.each(opts.data, function (i, v) {
                if (v && v.x && v.y) {
                    var j = i + 1;
                    var opt = {
                        name: j.toString(),
                        type: 'map',
                        mapType: 'model',
                        itemStyle: {
                            normal: {
                                borderColor: '#d2a403',
                                borderWidth: 1,
                                areaStyle: {
                                    color: '#fcde75'
                                }
                            }
                        },
                        data: (function () {
                            var r = [];
                            $.each(opts.pos, function (i, item) {
                                r.push(item);
                            });
                            return r;
                        }()),
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: Math.round(Math.sqrt(j + 1)),
                            effect: {
                                show: true,
                                symbolSize: 5,
                                color: '#e84c3d'
                            },
                            data: (function () {
                                var items = [];
                                $.each(v, function (key, item) {
                                    if (opts.pos[item]) {
                                        var temp = $.extend(true, {}, opts.pos[item]);
                                        temp.name = item;
                                        items.push(temp);
                                    }
                                });
                                return items;
                            })()
                        }
                    };
                    series.push(opt);
                }
            });

            echarts.util.mapData.params.params.model = {
                getGeoJson: function (callback) {
                    callback(echarts.util.mapData.params.decode(opts.model));
                }
            };
            return {
                color: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.8)'],
                legend: {
                    show: false,
                    orient: 'vertical',
                    x: 'left',
                    data: ['0', '1', '2', '3', '4'],
                    textStyle: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                series: series
            };
        }
    };

    window.chartStyle = chart;
}());