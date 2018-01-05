;
(function ($, ko, global) {

    var service = {
        /**
         * 热门课程统计
         * @returns {*}
         */
        getTopCourse: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/top_course',
                type: 'GET',
                data: data
            })
        },
        /**
         * 各组织学习分析
         * @returns {*}
         */
        getOrgStudy: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/org_study',
                type: 'GET',
                data: data
            });
        },
        /**
         * 各组织学习进度
         * @returns {*}
         */
        getOrgProgress: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/org_progress',
                type: 'GET',
                data: data
            });
        },
        /**
         * 考试合格率统计
         * @returns {*}
         */
        getExamPass: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/exam_pass',
                type: 'GET',
                data: data
            });
        },
        /**
         * 学习完成情况统计
         * @returns {*}
         */
        getStudyPass: function (data) {
            return $.ajax({
                url: '/v1/big_statistics/study_pass',
                type: 'GET',
                data: data
            });
        }
    };

    var chartMapping = {
        1: {
            moduleKey: "用户登录情况",
            left: 0,
            right: 114,
            width: 114,
            loadModule: function (vm, search) {

            }
        },
        2: {
            moduleKey: "学习占比分析",
            left: 116,
            right: 230,
            width: 114,
            loadModule: function (vm, search) {

            }
        },
        3: {
            moduleKey: "热门课程统计",
            left: 232,
            right: 346,
            width: 114,
            loadModule: function (vm, search) {
                service.getTopCourse(search).then(function (data) {
                    var names = [];
                    var items1 = [];
                    var items2 = [];
                    $.each(data, function (i, v) {
                        names.push(v.title);
                        items1.push(v.study_count);
                        items2.push(v.pass_count);
                    });
                    global.chart.doubleBar(document.getElementById('chart-doublebar'), {
                        legendData: ["课程学习人数", "课程完成学习人数"],
                        names: names,
                        data: [items1, items2]
                    });
                });
            }
        },
        4: {
            moduleKey: "各组织学习进度",
            left: 348,
            right: 476,
            width: 128,
            loadModule: function (vm, course_type) {
                var _search = ko.mapping.toJS(vm.model.search);
                service.getOrgProgress(_search).then(function (data) {
                    var names = [];
                    var progress = [];
                    $.each(data, function (i, v) {
                        names.push(v.org_name);
                        progress.push(v.progress);
                    });
                    global.chart.oneBar(document.getElementById('chart-orgbar'), {
                        yLabel: "",
                        legendData: [""],
                        data: [progress],
                        names: names
                    });
                });
            }
        },
        5: {
            moduleKey: "各职级学习进度",
            left: 478,
            right: 606,
            width: 128,
            loadModule: function (vm, search) {

            }
        },
        6: {
            moduleKey: "各组织学习分析",
            left: 608,
            right: 736,
            width: 128,
            hasLoaded: ko.observable(false),
            loadModule: function (vm, search) {
                var that = this;
                var titles = ["一级组织", "人均学时", "人均学习时长"];
                service.getOrgStudy(search).then(function (data) {
                    if (data.length && data[0] && data[0].length) {
                        vm.model.orgStudyList(global.chart.table(titles, data));
                    }
                    that.hasLoaded(true);
                });
            }
        },
        7: {
            moduleKey: "考试合格率统计",
            left: 738,
            right: 866,
            width: 128,
            hasLoaded: ko.observable(false),
            loadModule: function (vm, search) {
                var that = this;
                var titles = ["一级组织", "考试人次", "通过人次", "平均通过率"];
                service.getExamPass(search).then(function (data) {
                    if (data.length && data[0] && data[0].length) {
                        vm.model.examPassList(global.chart.table(titles, data));
                    }
                    that.hasLoaded(true);
                });
            }
        },
        8: {
            moduleKey: "学习完成情况统计",
            left: 868,
            right: 1010,
            width: 142,
            loadModule: function (vm, search) {
                service.getStudyPass(search).then(function (data) {
                    var names = [];
                    var items1 = [];
                    var items2 = [];
                    $.each(data, function (i, v) {
                        names.push(v.node_name);
                        items1.push(v.study_count);
                        items2.push(v.pass_count);
                    });
                    global.chart.threeBar(document.getElementById('chart-threebar'), {
                        yLabel: "人次",
                        legendData: ["参与人次", "学习合格人次"],
                        data: [items1, items2],
                        names: names
                    });
                });
            }
        }
    };

    function ViewModel() {
        this.model = {
            size: [5, 5, 5, 5, 5, 5, 5, 5],
            title: global.moduleConfig.studyProjectStatVo.viewName || '平台统计',
            chartModule: [],        // 所有的图表
            orgStudyList: [],       // 各组织学习分析
            examPassList: [],       // 考试合格率
            currentChart: 0,        // 当前图表索引
            chartTitleWidth: 0,     // 图表标题总宽度
            activeChartCount: 0,     // 启用的图表数量
            search: {
                course_type: 1      //切换各组织学习进度的必修和选修
            }
        };
    }

    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (el) {
            var that = this;
            this.model = ko.mapping.fromJS(this.model);
            that.initReady();
            ko.applyBindings(this, el);
        },
        initReady: function () {
            this.initChartModule();
            if (this.model.currentChart.peek() > -1) {
                this.initEvents();
            }
        },
        /**
         * 初始化图表模块配置
         */
        initChartModule: function () {
            var chartModule = [];                   // 启用的图表
            var firstEnabledChartIndex = -1;        // 第一个启用的图表索引，设置第一个启用的图表为active图表
            var poses = [];                         // 可用图表的位置
            var chartMarginRight = 2;               // 标题TAB的间距
            var configmoduleList = global.moduleConfig.studyProjectStatVo.configmoduleList || [];
            configmoduleList.sort(function (o1, o2) {
                return o1.moduleType - o2.moduleType;
            });
            $.each(configmoduleList, function (i, v) {
                v = $.extend(true, {}, chartMapping[v.moduleType], v);
                chartModule.push(v);

                if (v.moduleStatus === 1) {
                    // 重新计算标题的left 和 right
                    // 因为图表模块可能是禁用的，不会被渲染出来
                    var enabledLength = poses.length;
                    var left = !enabledLength ? 0 : poses[enabledLength - 1].right + chartMarginRight;
                    var right = !poses.length ? v.width : left + v.width;
                    poses.push({
                        left: left,
                        right: !poses.length ? v.width : left + v.width
                    });
                    v.left = left;
                    v.right = right;

                    // 记录第一个启用的图表
                    if (firstEnabledChartIndex === -1) {
                        firstEnabledChartIndex = i;
                    }
                }
            });
            this.model.activeChartCount(poses.length);
            this.model.currentChart(firstEnabledChartIndex);
            this.model.chartModule(chartModule);
        },
        /**
         * 初始化事件
         */
        initEvents: function () {
            var that = this;

            /**
             * 加载所有图表
             */
            function loadAllCharts() {
                var chartModule = that.model.chartModule.peek();
                for (var i = 0, l = chartModule.length; i < l; i++) {
                    that.loadChart(i);
                }
            }

            // 初始化图表数据的读取数量
            switch (global.platform) {
                // WEB
                case 1:
                    this.model.size([10, 20, 10, 20, 20, 10, 10, 8]);
                    this.loadChart(this.model.currentChart());
                    break;
                // PAD
                case 2:
                    this.model.size([7, 7, 7, 7, 7, 7, 7, 5]);
                    loadAllCharts();
                    break;
                // MOBILE
                case 3:
                    this.model.size([5, 5, 3, 5, 4, 3, 3, 3]);
                    loadAllCharts();
                    break;
            }

            // 注册窗口宽度改变事件
            global.listener.on('window.width.change', function (w) {
                if (global.platform === 1) {
                    that.model.chartTitleWidth($('#chart-title').width());
                    that.chartTitleStyle();
                }
            });
        },
        /**
         * 切换图表
         * @param chartIndex
         */
        switchChart: function (chartIndex) {
            chartIndex = Math.max(0, Math.min(chartIndex, this.model.chartModule.peek().length));
            this.model.currentChart(chartIndex);
            this.loadChart(chartIndex);
        },
        /**
         * 切换必修、选修
         * @param chartIndex
         */
        switchType: function (course_type) {
            this.model.search.course_type(course_type);
            this.loadChoseChart(course_type);
        },
        loadChoseChart: function(course_type) {
            var chartModule = this.model.chartModule.peek()[3];
            if (chartModule) {
                chartModule.loadModule(this, course_type);
            }
        },
        /**
         * 上一个图表
         */
        prevChart: function () {
            var chartModule = this.model.chartModule.peek();
            var currentChartIndex = this.model.currentChart.peek();
            var prevChart = null;
            while (currentChartIndex >= 0 && !!(prevChart = chartModule[--currentChartIndex]) && prevChart.moduleStatus !== 1) {
            }
            if (currentChartIndex >= 0) {
                this.switchChart(currentChartIndex);
            }
        },
        /**
         * 下一个图表
         */
        nextChart: function () {
            var chartModule = this.model.chartModule.peek();
            var currentChartIndex = this.model.currentChart.peek();
            var allChartCount = this.model.chartModule.peek().length;
            var nextChart = null;
            while (currentChartIndex < allChartCount && !!(nextChart = chartModule[++currentChartIndex]) && nextChart.moduleStatus !== 1) {
            }
            if (currentChartIndex < allChartCount) {
                this.switchChart(currentChartIndex);
            }
        },
        /**
         * 载入图表
         * @param chartIndex
         */
        loadChart: function (chartIndex) {
            var chartModule = this.model.chartModule.peek()[chartIndex];
            if (chartModule) {
                chartModule.loadModule(this, {
                    size: this.model.size.peek()[chartIndex]
                });
            }
        },
        /**
         * 计算图表web端时的滑动动画
         */
        chartTitleStyle: (function () {
            var chartTitleMarginLeft = 0;
            return function () {
                var chartTitleWidth = this.model.chartTitleWidth();
                if (chartTitleWidth === 0 || global.platform !== 1) {
                    return {};
                }
                var marginLeft = 0;
                var chartModule = this.model.chartModule();
                var currentChart = chartModule[this.model.currentChart()];
                if (currentChart.right > chartTitleWidth) {
                    marginLeft = chartTitleWidth - currentChart.right;
                } else if (currentChart.left < Math.abs(chartTitleMarginLeft)) {
                    marginLeft = -currentChart.left;
                } else {
                    marginLeft = 0;
                }
                chartTitleMarginLeft = marginLeft;
                return {
                    'margin-left': marginLeft + 'px'
                };
            };
        }())
    }
    ;

    global.ready(function () {
        new ViewModel().initViewModel($('.md-chart')[0]);
    });

}
(jQuery, window.ko, window.global || (window.global = {}))
)
;