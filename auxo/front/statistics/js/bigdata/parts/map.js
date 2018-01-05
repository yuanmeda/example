;
(function ($, ko, global) {

    var service = {
        /**
         * 取统计曲线数据
         * @returns {*}
         */
        getLine: function () {
            return $.ajax({
                url: '/v1/big_statistics/day_study',
                type: 'GET'
            });
        }
    };

    function ViewModel() {
        this.model = {};
    }

    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (el) {
            this.model = ko.mapping.fromJS(this.model);
            if (global.moduleConfig.mapOrTable === 1) {
                this.renderMap();
            } else if (global.moduleConfig.mapOrTable === 2) {
                this.renderLine();
            }
            ko.applyBindings(this, el);
        },
        /**
         * 渲染地图
         */
        renderMap: function () {
            var data = global.moduleConfig.studyMapVo.configmapList || [];
            var pos = {};
            $.each(data, function (i, v) {
                if (v && v.x && v.y) {
                    pos[v.title] = {
                        geoCoord: [+v.x, +v.y]
                    };
                }
            });

            global.chart.map(document.getElementById('map'), {
                data: data,
                model: (function () {
                    try {
                        return $.parseJSON(global.moduleConfig.studyMapVo.mapText || '{}');
                    } catch (err) {
                        return {};
                    }
                }()),
                pos: pos
            });
        },
        /**
         * 渲染曲线图表
         */
        renderLine: function () {
            service.getLine().then(function (data) {
                var items = [],
                    tip = [],
                    names = [],
                    length = data.length;

                // 显示一个月时，X轴只显示[开始，中间，结尾]三个节点
                if (length > 3) {
                    data[0].readAsXAxis = true;
                    data[Math.floor(length / 2)].readAsXAxis = true;
                    data[length - 1].readAsXAxis = true;
                    if (global.moduleConfig.studyLineVo.weekOrMonth == 2) {
                        data.push({
                            study_hours: data[length - 1].study_hours,
                            date: ''
                        });
                    }
                }
                $.each(data, function (i, v) {
                    items.push(v.study_hours);
                    tip.push(v.date || '');
                    if (length <= 3 || v.readAsXAxis === true) {
                        names.push(v.date || '');
                    } else {
                        names.push('');
                    }
                });

                global.chart.studyLine(document.getElementById('map'), {
                    data: items,
                    tip: tip,
                    names: names
                });
            });
        }
    };

    global.ready(function () {
        new ViewModel().initViewModel($('.md-map')[0]);
    });

}(jQuery, window.ko, window.global || (window.global = {})));