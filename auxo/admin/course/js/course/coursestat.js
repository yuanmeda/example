/*
 课程资源列表
 全局变量：projectId
 */

(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //课程统计列表(GET)
        courseStatList: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/stats/daily';

            return $.ajax({
                url: url,
                data: data,
                cache:false
            });
        },
        //课程统计信息(GET)
        courseStatInfo: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/stats';

            return $.ajax({
                url: url,
                cache:false
            });
        }
    };
    //课程列表数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                start: laydate.now(-31).replace(/-/g,'/'), //开始时间
                end: laydate.now(-1).replace(/-/g,'/') //结束时间
            },
            statInfo: {
                registed_count: 0,
                studied_count: 0,
                finished_count: 0,
                total_time: 0,
                course_time: 0,
                progress_data: []
            },
            isLoadingText: '导出',
            isLoading: false //判断是否处于导出状态
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //课程数组数据强制刷新
            this.model.items.extend({
                notify: 'always'
            });
            //echart数据变化监听事件
            this.model.statInfo.progress_data.subscribe(function (statData) {
                this._loadEchart(statData);
            }, this);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('content'));
            //加载事件 
            this._eventHandler();
            //初始化echart插件
            this._echartsInit();
            //初始化laydate插件
            this._layDateInit();
            //加载程序信息
            this._appBootstrapt();
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            //当导出iframe加载成功说明导出失败
            document.getElementById('output').onload = function () {
                var content = $($('#output')[0].contentWindow.document).find('pre').text();
                var _parseError = content ? JSON.parse(content) : null;
                if (_parseError && _parseError.message) {
                    _self.defer.reject(_parseError.message);
                }
            };
            //主题切换事件
            $(document).on('themgChange', function (e, style) {
                window.skin = style;
                _self._loadEchart(_self.model.statInfo.progress_data());
            });
        },
        /**
         * 初始化时间插件
         * @return {null} null
         */
        _layDateInit: function () {
            var _self = this;
            var startTime = {
                elem: '#startTime',
                format: 'YYYY/MM/DD',
                istoday: true,
                choose: function (datas) {
                    endTime.min = datas; //开始日选好后，重置结束日的最小日期
                    endTime.start = datas; //将结束日的初始值设定为开始日
                    _self.model.filter.start = datas;
                }
            };
            var endTime = {
                elem: '#endTime',
                format: 'YYYY/MM/DD',
                istoday: true,
                choose: function (datas) {
                    startTime.max = datas; //结束日选好后，重置开始日的最大日期
                    _self.model.filter.end = datas;
                }
            };
            laydate(startTime);
            laydate(endTime);
        },
        /**
         * 初始化echart插件
         * @return {null} null
         */
        _echartsInit: function () {
            // 初始化echarts实例
            this.echaret = echarts.init(document.getElementById('echart'));
            this.echaret.showLoading();
        },
        /**
         * 加载echart表格
         * @param  {Array} statData 展示数据
         * @return {null}          null
         */
        _loadEchart: function (statData) {
            this.echaret.hideLoading();
            var _theme = function () {
                return window.skins().filter(function (item, i) {
                    return item.src === skin;
                })[0].color;
            };
            var _options = {
                title: {
                    text: '课程完成进度统计',
                    textStyle: {
                        color: '#000',
                        fontSize: 15
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['人数']
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {
                            show: false
                        },
                        // dataView: {
                        //     show: true,
                        //     readOnly: false,
                        //     buttonColor: _theme(),
                        //     optionToContent: function(opt) {
                        //         var axisData = opt.xAxis[0].data;
                        //         var series = opt.series;
                        //         var table = '<table style="width:100%;text-align:center"><tbody><tr><td>范围</td><td>' + series[0].name + '</td></tr>';
                        //         for (var i = 0, l = axisData.length; i < l; i++) {
                        //             table += '<tr><td>' + axisData[i] + '</td><td>' + series[0].data[i] + '</td></tr>';
                        //         }
                        //         table += '</tbody></table>';
                        //         console.log(opt);
                        //         return table;
                        //         // return opt;
                        //     },
                        //     lang:['数据视图', '关闭', '刷新']
                        // },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        // restore: {
                        //     show: true
                        // },
                        saveAsImage: {
                            show: true
                        }
                    },
                    iconStyle: {
                        emphasis: {
                            borderColor: _theme()
                        }
                    }
                },
                xAxis: {
                    type: 'category',
                    data: statData.map(function (stat, i) {
                        return stat.key;
                    })
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: '人数',
                    type: 'bar',
                    data: statData.map(function (stat, i) {
                        return stat.value;
                    }),
                    itemStyle: {
                        normal: {
                            color: _theme
                        },
                        label: {
                            show: true
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    barGap: '40%',
                    // barWidth: 80,
                    markPoint: {
                        // data: [{
                        //     type: 'max',
                        //     name: '最大值'
                        // }, {
                        //     type: 'min',
                        //     name: '最小值'
                        // }],
                        itemStyle: {
                            normal: {
                                color: _theme(),
                                borderColor: _theme()
                            },
                            emphasis: {
                                color: _theme(),
                                borderColor: _theme()
                            }
                        }
                    }
                    // markLine: {
                    //     data: [{
                    //         type: 'average',
                    //         name: '平均值',
                    //         lineStyle: {
                    //             normal: {
                    //                 color: _theme(),
                    //                 borderColor: _theme()
                    //             },
                    //         }
                    //     }],
                    //     lineStyle: {
                    //         normal: {
                    //             color: _theme(),
                    //             borderColor: _theme()
                    //         },
                    //         emphasis: {
                    //             color: _theme(),
                    //             borderColor: _theme()
                    //         }
                    //     }
                    // }
                }]
            };
            this.echaret.setOption(_options);
            window.onresize = this.echaret.resize;
        },
        /**
         * 启动程序
         * @return {null} null
         */
        _appBootstrapt: function () {
            $.when(this._statBaseInfo(), this._list())
                .done(function (data) {
                    viewModel.model.statInfo.progress_data(data[0].progress_data);
                })
                .always(function () {
                    $(document).trigger('showContent');
                });
        },
        /**
         * 获取统计总信息
         * @return {promise} 延迟对象
         */
        _statBaseInfo: function () {
            var _self = this,
                _statInfo = _self.model.statInfo;
            return store.courseStatInfo()
                .done(function (data) {
                    _statInfo.registed_count(data.registed_count);
                    _statInfo.studied_count(data.studied_count);
                    _statInfo.finished_count(data.finished_count);
                    _statInfo.total_time(data.total_time);
                    _statInfo.course_time(data.course_time);
                    _statInfo.progress_data(data.progress_data);
                });
        },
        /**
         * 课程列表初始化
         * @return {promise} 延迟对象
         */
        _list: function () {
            var _self = this,
                _filter = ko.mapping.toJS(_self.model.filter);
            //获取职位列表
            _filter.start = encodeURIComponent(timeZoneTrans(_filter.start + " 00:00:00"));
            _filter.end = encodeURIComponent(timeZoneTrans(_filter.end + " 23:59:59"));
            return store.courseStatList(_self._filterParams(_filter)).done(function (returnData) {
                if (returnData) {
                    _self.model.items(returnData);
                }
            });
        },
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        _filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && params[key] && $.trim(params[key] !== '')) {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        /**
         * 课程搜索
         * @return {null} null
         */
        doSearch: function () {
            this._list();
        },
        /**
         * 小数点2位数
         * val @number
         */
        _toFixed:function(val){
            var sec= val.toString().split('.')[1];
            if(+sec&&sec.length>2){
                return +(val.toFixed(2));
            }else{
                return val;
            }
        },
        /**
         * 课程数据报表导出
         * @return {null} null
         */
        output: function () {
            var _self = this,
                _loop = 30,
                _count = 1,
                _url = '/' + projectCode + '/courses/' + courseId + '/stats/export',
                _search = _self._filterParams(ko.mapping.toJS(_self.model.filter)),
                _str = '';
            _search.start = encodeURIComponent(timeZoneTrans(_search.start + " 00:00:00"));
            _search.end = encodeURIComponent(timeZoneTrans(_search.end + " 23:59:59"));
            _self.defer = $.Deferred();
            if (this.model.isLoading()) {
                return;
            }
            this.model.isLoading(true);
            _self.model.isLoadingText('导出中 ' + _loop);

            for (var key in _search) {
                _str += (key + '=' + _search[key] + '&');
            }
            if (_str) {
                _url += ('?' + _str.substr(0, _str.length - 1));
            }
            $('#output').attr('src', _url);
            var _timer = window.setInterval(function () {
                _self.model.isLoadingText('导出中 ' + (_loop - _count));
                _count++;
                if (_count > _loop) {

                    _self.model.isLoading(false);
                    _self.model.isLoadingText('导出');
                    window.clearInterval(_timer);
                }
            }, 1000);
            _self.defer.promise()
                .done(function (data) {
                    Utils.msgTip(data, {
                        time: 3000
                    });
                })
                .fail(function (data) {
                    Utils.msgTip(data, {
                        time: 2000,
                        icon: 7
                    });
                });
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();

})(jQuery, window);
