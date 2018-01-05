;
(function ($, ko, global) {

    var GLOBAL = (0, eval)('this');

    var STATIC_URL = GLOBAL['staticUrl'];           // 静态站根地址

    var STATIC_VERSION = GLOBAL['staticVersion'];   // 静态站版本号

    var MODULE_CONFIG = GLOBAL['moduleConfig'];     // 大数据中心后台配置

    var chartStyle = null;                          // 图表样式，由皮肤提供该全局变量

    var echarts = GLOBAL['echarts'];                // echarts， http://echarts.baidu.com/option.html#title

    // 窗口响应尺寸
    // [0, 768)         移动端
    // [768, 1280)      PAD端
    // [1280, ++]       WEB端
    var adaptSize = {
        mobileMaxWidth: 768,
        padMaxWidth: 1280
    };

    /**
     * 样式工厂，动态加载css和js，并在加载完成后执行回调函数
     * @type {{loadSkin, ready}}
     */
    var styleFactory = (function () {
        var baseCss = [null,
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/index-web.css',
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/index-pad.css',
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/index-mobile.css'
        ];
        var resetCss = [null,
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/reset-web.css',
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/reset-mobile.css',
            STATIC_URL + 'auxo/front/statistics/css/bigdata/base/css/reset-mobile.css'
        ];
        var skins = {
            'red': {
                'css': [
                    STATIC_URL + 'auxo/front/statistics/css/bigdata/style/red/css/style-base.css',
                    STATIC_URL + 'auxo/front/statistics/css/bigdata/style/red/css/style-web.css',
                    STATIC_URL + 'auxo/front/statistics/css/bigdata/style/red/css/style-pad.css',
                    STATIC_URL + 'auxo/front/statistics/css/bigdata/style/red/css/style-mobile.css'
                ],
                'js': [
                    STATIC_URL + 'auxo/front/statistics/css/bigdata/style/red/chart.js'
                ]
            }
        };

        var readyFnList = [];           // 回调函数队列
        var scriptLoaded = false;       // 脚本载入完成标志
        var $view = $('.view:first');   // 通过$view的显示与否判断css载入完成

        (function skinReady() {

            function check() {
                return $view.is(':visible') && scriptLoaded;
            }

            function ready() {
                chartStyle = GLOBAL['chartStyle'];
                $.each(readyFnList, function (i, readyFn) {
                    readyFn();
                });
            }

            (function poll() {
                check() && setTimeout(ready, 100) || setTimeout(poll, 50);
            }());

        }());


        return {
            /**
             * 载入皮肤
             * @param platform： 0-all, 1-web, 2-pad, 3-mobile
             * @param skinTYpe： 'red'
             * @returns {styleFactory}
             */
            loadSkin: function (platform, skinTYpe) {
                var jsCount = skins[skinTYpe]['js'].length;     // 需要动态载入的js数量，全部载入完成后将 scriptLoaded 置为 true
                var jsLoadedCount = 0;                          // 已加载的js数量

                /**
                 * 载入css
                 * @param url
                 */
                function loadCss(url) {
                    $('head').append('<link rel="stylesheet" href="' + url + '?v=' + STATIC_VERSION + '" />');
                }

                /**
                 * 载入js
                 * @param url
                 */
                function loadJs(url) {
                    $.ajax({
                        url: url + '?v=' + STATIC_VERSION,
                        dataType: 'script',
                        cache: true
                    }).then(function () {
                        if (++jsLoadedCount >= jsCount) {
                            scriptLoaded = true;
                        }
                    });
                }

                loadCss(resetCss[platform]);
                loadCss(baseCss[platform]);
                loadCss(skins[skinTYpe]['css'][0]);
                loadCss(skins[skinTYpe]['css'][platform]);
                $.each(skins[skinTYpe]['js'], function (i, url) {
                    loadJs(url);
                });
                return this;
            },
            /**
             * 添加回调函数
             * @param readyFn
             * @returns {styleFactory}
             */
            ready: function (readyFn) {
                readyFnList.push(readyFn);
                return this;
            }
        };
    }());

    $.extend(true, global, {
        platform: 0,            // 0-初始化, 1-web, 2-pad, 3-mobile
        windowWidth: 0,         // 窗口宽度
        moduleConfig: $.extend(true, {
            projectId: 0,       // 项目ID
            mapOrTable: 1,      // 地图或图表 1地图，2图表
            titleVo: {          // 大数据中心大标题
                moduleTitle: '',        // 模块名称
                viewName: ''            // 前端显示名称
            },
            studyingVo: {       // 学习进行时
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0               // 1-启用，0-禁用
            },
            studyMapVo: {       // 学习实况-地图
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0,              // 1-启用，0-禁用
                mapText: {},            // 地图内容文本
                configmapList: [],      // 经纬度列表
                areaId: 0               // 选中区域ID
            },
            studyLineVo: {      // 学习实况-曲线
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0,              // 1-启用，0-禁用
                weekOrMonth: 1          // 每周或每月 1:每周，2每月
            },
            studyVideoVo: {     // 宣传视频
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0,              // 1-启用，0-禁用
                video: ''               // 视频文本
            },
            studyRankVo: {      // 排行榜
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0,              // 1-启用，0-禁用
                orgName: '',            // 组织排行榜别名
                personName: '',         // 个人排行榜别名
                statOrgName: '',        // 组织排行榜名称
                statPersonName: '',     // 个人排行榜名称
                statOrgNum: 9,          // 组织排行榜数量
                statPersonNum: 9        // 个人排行榜数量
            },
            studyProjectStatVo: {// 项目统计
                moduleTitle: '',        // 模块名称
                viewName: '',           // 前端显示名称
                status: 0,              // 1-启用，0-禁用
                configmoduleList: [
                    {moduleType: 1, moduleStatus: 0},
                    {moduleType: 2, moduleStatus: 0},
                    {moduleType: 3, moduleStatus: 0},
                    {moduleType: 4, moduleStatus: 0},
                    {moduleType: 5, moduleStatus: 0},
                    {moduleType: 6, moduleStatus: 0},
                    {moduleType: 7, moduleStatus: 0},
                    {moduleType: 8, moduleStatus: 0}
                ]    // 项目统计
            },
            studyBottomVo: {    // 底部信息
                moduleTitle: '',
                viewName: ''
            }
        }, MODULE_CONFIG),
        listener: (function () {
            var listenerStore = {};     // 监听器仓库
            return {
                /**
                 * 注册监听器
                 * @param name
                 * @param fn
                 * @returns {true}
                 */
                on: function (name, fn) {
                    var listeners = listenerStore[name] || [];
                    listeners.push(fn);
                    listenerStore[name] = listeners;
                    return this;
                },
                /**
                 * 调用监听器队列
                 * @param name
                 * @returns {true}
                 */
                emit: function (name) {
                    var listeners = listenerStore[name] || [];
                    var args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
                    $.each(listeners, function (i, fn) {
                        fn.apply(null, args);
                    });
                    return this;
                },
                /**
                 * 移除监听器
                 * @param name
                 * @param fn
                 * @returns {true}
                 */
                remove: function (name, fn) {
                    var listeners = listenerStore[name];
                    if (listeners && listeners.length) {
                        var index = $.inArray(fn, listeners);
                        if (index > -1) {
                            listeners.splice(index, 1);
                        }
                    }
                    return this;
                }
            };
        }()),
        utils: {
            /**
             * 是否ko观察对象
             * @param o
             * @returns {*}
             */
            isKo: function (o) {
                return ko.isObservable(o);
            },
            /**
             * 是否ko观察数组
             * @param o
             * @returns {*|boolean}
             */
            isKoArray: function (o) {
                return this.isKo(o) && $.isArray(o.peek());
            },
            /**
             * 将data中的值赋给model，{data中没有对应值的则清空}
             * @param model ko对象
             * @param data js对象
             * @param isClear 是否清空data中没有对应值的属性
             * @returns {*}
             */
            fromJS: function (model, data) {
                if (!model || !data) {
                    return model;
                }
                var isClear = $.type(arguments[2]) === 'boolean' ? arguments[2] : true,
                    that = this;
                $.each(model, function (name, observableObj) {
                    var v = data[name];
                    if (that.isKo(observableObj)) {
                        if (that.isKoArray(observableObj)) {
                            if (!$.isArray(v)) {
                                v = v ? (v + '').split(',') : (isClear ? [] : observableObj.peek());
                            }
                        } else if (v == null) {
                            v = isClear ? '' : observableObj.peek();
                        }
                        observableObj(v);
                    }
                });
            },
            /**
             * 格式化数值，并移除末尾多余的0
             * @param value
             * @param digits
             * @returns {string}
             */
            toFixed: function (value, digits) {
                if (typeof digits !== 'number') {
                    digits = 2;
                }
                value = +value || 0;
                return value % 1 === 0 ? String(value) : value.toFixed(digits).replace(/\.?0+$/g, '');
            }
        },
        chart: (function () {
            function chartInit(el, options) {
                var myChart = echarts.init(el, {
                    noDataLoadingOption: {
                        text: "暂无数据",
                        effect: 'bubble',
                        effectOption: {
                            effect: {
                                n: 0
                            }
                        }
                    }
                });
                myChart.setOption(options);
            }

            return {
                pie: function (el, options) {
                    chartInit(el, chartStyle.pie(options));
                },
                bar: function (el, options) {
                    chartInit(el, chartStyle.bar(options));
                },
                doubleBar: function (el, options) {
                    chartInit(el, chartStyle.doubleBar(options));
                },
                threeBar: function (el, options) {
                    chartInit(el, chartStyle.threeBar(options));
                },
                oneBar: function (el, options) {
                    chartInit(el, chartStyle.oneBar(options));
                },
                mixBar: function (el, options) {
                    chartInit(el, chartStyle.mixBar(options));
                },
                line: function (el, options) {
                    chartInit(el, chartStyle.line(options));
                },
                studyLine: function (el, options) {
                    chartInit(el, chartStyle.studyLine(options));
                },
                map: function (el, options) {
                    chartInit(el, chartStyle.map(options));
                },
                table: function (titles, data) {
                    if (data.length > 0) {
                        $.each(data[0], function (i, v) {
                            v = v || '未知组织';
                            var l = v.length;
                            var title = v.replace(/(.{9})(.+)/, "$1");
                            data[0][i] = {
                                title: v,
                                label: chartStyle.formatTitle(title, 5, '<br />') + (l >= 10 ? '...' : '')
                            };
                        });
                    }
                    $.each(data, function (i, list) {
                        if (i === 0) {
                            list.unshift({
                                title: titles[i],
                                label: titles[i]
                            });
                        } else {
                            list.unshift(titles[i]);
                        }
                    });
                    return data;
                }
            };
        }()),
        ready: function (fn) {
            this.listener.on('platform.ready', fn);
        },
        init: function () {
            var that = this;
            var $win = $(window);

            // 捕捉初次屏幕分辨率，global.platform，以初次捕捉到的分辨率作为平台区分的标准，如若web端的浏览器在首次打开页面时缩放到小尺寸将触发pad/mobile端效果
            function initPlatform() {
                var $win = $(window);
                var w = $win.width();
                if (w < adaptSize.mobileMaxWidth) {
                    that.platform = 3;
                } else if (w >= adaptSize.mobileMaxWidth && w < adaptSize.padMaxWidth) {
                    that.platform = 2;
                } else {
                    that.platform = 1;
                }
            }

            initPlatform();

            styleFactory.ready(function () {
                that.listener.emit('platform.ready', that.platform);
            }).loadSkin(this.platform, 'red');


            this.ready(function () {
                $win.on('resize', function () {
                    var w = $win.width();
                    that.windowWidth = w;
                    that.listener.emit('window.width.change', w);
                }).resize();
            });
        }
    });

    $(function () {
        global.init();
    });

    ko.options.deferUpdates = true;

}(jQuery, window.ko, window.global || (window.global = {})));