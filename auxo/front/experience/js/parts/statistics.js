;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    // 当前登录用户ID
    var USER_ID = GLOBAL['userId'];

    // 被访问用户的ID
    var VISITOR_USER_ID = GLOBAL['visitorUserId'];

    var koMapping = ko.mapping;

    var chart = {
        format: {
            time: function (value) {
                var ret = [],
                    minuteText = i18nHelper.getKeyValue('experience.statistics.chart.tile.minute'),
                    time = [{
                        step: 60,
                        text: minuteText
                    }, {
                        step: 24,
                        text: i18nHelper.getKeyValue('experience.statistics.chart.tile.hour')
                    }, {
                        step: 30,
                        text: i18nHelper.getKeyValue('experience.statistics.chart.tile.day')
                    }, {
                        step: 12,
                        text: i18nHelper.getKeyValue('experience.statistics.chart.tile.month')
                    }];
                value = +value || 0;
                if (value > 0 && value < 1) {
                    return value.toFixed(2) + minuteText;
                } else if (value > 1 && value < 10 && (value % 1) != 0) {
                    return value.toFixed(1) + minuteText;
                }
                $.each(time, function (i, t) {
                    var v = Math.floor(value / t.step),
                        r = Math.floor(value % t.step);
                    ret.push(r + t.text);
                    if (v === 0) {
                        return false;
                    }
                    value = v;
                });
                return ret.reverse().join('');
            },
            dateString: function (dateString) {
                var ret = (dateString || '0000-00-00').split('-');
                return ret[1] + '-' + ret[2];
            }
        },
        line: function (element, title, xAxisData, seriesData) {
            var myChart = echarts.init(element);
            myChart.setOption({
                title: {
                    text: title || '',
                    textStyle: {
                        fontWeight: 'normal'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'RGB(255, 174, 75)',
                    position: function (point, params, dom) {
                        return [point[0] - 25, point[1] - 40];
                    },
                    formatter: function (params, ticket, callback) {
                        return chart.format.time(params[0].value);
                    },
                    axisPointer: {
                        type: 'line',
                        lineStyle: {
                            color: 'RGB(255, 174, 75)',
                            type: 'solid',
                            width: 2
                        }
                    }
                },
                grid: {
                    left: '2%',
                    right: '3%',
                    bottom: '2%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        axisLabel: {
                            margin: 15,
                            textStyle: {
                                fontSize: 14,
                                fontFamily: 'microsoft yahei'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        data: xAxisData || []
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        axisLine: {
                            show: false
                        },
                        axisTick: false,
                        axisLabel: {
                            margin: 18,
                            textStyle: {
                                fontSize: 14,
                                fontFamily: 'microsoft yahei'
                            }
                        }
                    }
                ],
                series: [
                    {
                        name: title || '',
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 15,
                        areaStyle: {
                            normal: {
                                color: '#d7efff'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgb(56, 173, 255)',
                                borderWidth: 3,
                                borderColor: '#fff'
                            },
                            emphasis: {
                                color: 'RGB(255, 174, 75)',
                                borderWidth: 5
                            }
                        },
                        data: seriesData || []
                    }
                ]
            });
        }
    };

    var service = {
        /**
         * 用户排行统
         * @api http://api.e.huayu.nd/auxo-webfront.html#/{project_code}/experience/user/study/ranking
         * @param data
         * @returns {*}
         */
        ranking: function (data) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/experience/user/study/ranking',
                type: 'GET',
                data: data
            });
        },
        /**
         * 学习统计
         * @api http://api.e.huayu.nd/auxo-webfront.html#/{project_code}/experience/user/study/stat
         * @param data
         * @returns {*}
         */
        stat: function (data) {
            return $.ajax({
                url:  selfUrl + '/' + PROJECT_CODE + '/experience/user/study/stat',
                type: 'GET',
                data: data
            });
        }
    };

    var ViewModel = function () {
        this.model = {
            search: {
                user_id: VISITOR_USER_ID || USER_ID,
                date_type: 2,      // 排行榜统计类型 1为近七天 2为近30天
                rank_type: 2,      // 排行类型 1公司 2 部门 3职级，默认2
                page: 0,
                size: 9
            },
            ranking: {
                total: 0,
                items: [],
                mine: '',
                ratePercent: 0
            },
            hasInited: false
        };
    };

    ViewModel.prototype = {
        construct: ViewModel,

        initViewModel: function (element) {
            this.model = koMapping.fromJS(this.model);
            this.getRanking();
            this.getStat();
            ko.applyBindings(this, element);
        },
        getRanking: function () {
            var that = this,
                search = koMapping.toJS(this.model.search);
            service.ranking(search).then(function (data) {
                data.mine = data.mine || {
                    user_id: 0,
                    rank: 0,
                    study_hours: 0
                };

                // 处理我的学习时间
                if (data.mine.study_hours > 0 && data.mine.study_hours < 1) {
                    data.mine.study_hours = data.mine.study_hours.toFixed(2);
                } else if (data.mine.study_hours > 1 && data.mine.study_hours < 10) {
                    data.mine.study_hours = data.mine.study_hours.toFixed(1);
                } else {
                    data.mine.study_hours = Math.floor(data.mine.study_hours);
                }

                that.model.ranking.items(data.items);
                that.model.ranking.mine(data.mine);
                that.model.ranking.total(data.total);

                // 击败人数比例
                data.mine.rank && (that.model.ranking.ratePercent(Math.floor((1 - data.mine.rank / data.total) * 100) || 0));
                that.lazyImg('.statistics img.lazy-image');
                that.model.hasInited(true);

                send_resize();
            });
        },
        getStat: function () {
            var that = this,
                search = {
                    user_id: VISITOR_USER_ID || USER_ID,
                    date_type: 2
                };
            setTimeout(function () {
                $('#lineChart').css({
                    width: '750px',
                    height: '400px'
                });
                service.stat(search).then(function (data) {
                    var xAxisData = [''],
                        seriesData = [data[0].avg_hours];
                    $.each(data, function (i, v) {
                        xAxisData.push(chart.format.dateString(v.date));
                        seriesData.push(v.avg_hours);
                    });
                    chart.line($('#lineChart')[0], i18nHelper.getKeyValue('experience.statistics.chart.title'), xAxisData, seriesData);
                    send_resize();
                });
            }, 1000);
        },

        lazyImg: function (selector) {
            setTimeout(function () {
                $(selector || 'img.lazy-image').lazyload({
                    data_attribute: 'src',
                    skip_invisible: false
                }).trigger("appear");
            }, 0);
        },
        toExperience: function (item) {
            if (GLOBAL['erpUrl']) {
                window.open(GLOBAL['erpUrl'].replace('${user_id}', item.user_id), '_blank');
            } else {
                window.open(selfUrl + '/' + PROJECT_CODE + '/experience/training?user_id=' + item.user_id);
            }
        }
    };

    $(function () {
        new ViewModel().initViewModel($('.statistics')[0]);
    });

  function send_resize(){
    window.parent.postMessage(JSON.stringify({
      "type": '$resize',
      data:{
        "width": window.innerWidth+'px',
        "height": document.documentElement.scrollHeight+'px'
      }
    }), '*');
  }
}());