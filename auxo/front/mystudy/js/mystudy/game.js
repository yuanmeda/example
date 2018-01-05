/*!
 * 我的学习中心
 */
(function (window, $) {
    'use strict';
    $.ajaxSetup({
        cache: false
    });
    // 数据仓库
    var store = {
        // 获取学习中心基础数据
        baseInfo: function (data) {
            var url = selfUrl + '';

            return $.ajax({
                url: url,
                data: data
            });
        },
        // 获取我的学习统计
        learningStatistic: function () {
            var url = selfUrl + '/' + projectCode + '/mystudy/stat';

            return $.ajax({
                url: url
            });
        },
        // 获取我的讲授info
        myTeacher: function () {
            var url = teacUrl + '/v1/lecturer_tabs';

            return $.ajax({
                url: url,
                data: {
                    user_id: userId,
                    project_id: projectId,
                    language: localLang
                }
            })
        }
    };

    // 模块属性映射
    var mapModule = {
        'my-study': {
            title: i18nHelper.getKeyValue('myStudy.common.myStudy')
        }
    };

    // 数据模型
    var viewModel = {
        model: {
            teacherInfo: null, //我的讲授信息
            iframeUrl: '', //第三方页面src
            currentModule: 'my-study', //模块名称
            baseInfo: null //用户学习统计数据

        },
        // 排行组件需要参数
        search: {
            tag: 'week_all_in', //当前选中的榜单 例如：周榜 week_all_in ，月榜 month_all_in，总榜 all_in
            start: 1, //start 开始位置，每页条数由服务端配置 --可选，默认值为 1
            rank_id: 'learnHoursSumTabs', // 如果业务方没传，默认为组件的（compentMainTabs）
            show_type: 1, // 显示类型 --可选,0:普通 1:瀑布流
            scroll_type: 1 //滚动类型：向上滚=-1 向下滚=1 ---可选,默认值向下滚1
        },
        /**
         * 初始化函数
         * @return {null} null
         */
        _init: function () {
            // ko对象绑定
            this.model = ko.mapping.fromJS(this.model);
            // 模块名称事件订阅
            //this.model.currentModule.subscribe(this._updateTitle, this);
            // 加载事件
            //this._eventHandler();

            // 获取统计信息
            // ko绑定
            ko.applyBindings(this, document.getElementById('js_app'));
            $(window).trigger('hashchange')
            this._loadLearningStatistic();
            // 获取讲授信息
            (!window.SWITCHES || (window.SWITCHES && window.SWITCHES['switch.lecturer'])) && this._loadTeacherInfo()
                .done(function (d) {
                    this.model.teacherInfo(d);
                    $(window).trigger('hashchange');
                }.bind(this))
                .always(function () {
                    $(window).trigger('hashchange');
                });
            if (window.addEventListener) {
                window.addEventListener('message', this._onMessage);
            } else {
                window.attachEvent('onmessage', this._onMessage);
            }
        },
        /**
         * message通信
         * @return {null} null
         */
        _onMessage: function (e) {
            if (!e) return;
            var _postData = null;
            if (e.data) {
                try {
                    _postData = JSON.parse(e.data);
                    if (_postData.type === '$resize') {
                        $('.iframe-container iframe').css({
                            height: window.parseInt(_postData.data.height, 10) + 'px'
                        });
                    }
                    else if (_postData.type === 'iframe-resize') {
                        $('.iframe-container iframe').css({
                            height: window.parseInt(_postData.height, 10) + 'px',
                            width: window.parseInt(_postData.width, 10) + 'px'
                        });
                    }
                } catch (e) {

                }
            }
        },
        /**
         * dom事件处理
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            $(window).on('hashchange', function () {
                _self._hashChange();
            });
            // 显示dom
            $('#js_app').show();
        },
        /**
         * 加载我的学习统计数据
         * @return {[type]} [description]
         */
        _loadLearningStatistic: function () {
            var _self = this;
            return store.learningStatistic()
                .done(function (data) {
                    _self.model.baseInfo(data);
                });
        },
        /**
         * 加载我的讲授信息
         * @return {[type]} [description]
         */
        _loadTeacherInfo: function () {
            var _self = this;
            var _teacherInfo = JSON.parse($.cookie('$$teacherInfo' + userId) || null);
            var _defer = $.Deferred();
            if (_teacherInfo) {
                _defer.resolve(_teacherInfo)
            } else {
                try {
                    store.myTeacher()
                        .done(function (d) {
                            $.cookie('$$teacherInfo' + userId, JSON.stringify(d), {
                                expires: new Date(d.expires_at)
                            });
                            _defer.resolve(d);
                        })
                } catch (e) {
                    $(window).trigger('hashchange');
                }
            }
            return _defer;
        },
        /**
         * 更新页面title
         * @param  {string} val 模块名称
         * @return {null}     null
         */
        //_updateTitle: function (val) {
        //    var _moduleName = this.model.currentModule();
        //    if (_moduleName === 'my-teacher' && this.model.teacherInfo() && this.model.teacherInfo().show) {
        //        document.title = this.model.teacherInfo().name;
        //    } else {
        //        document.title = mapModule[val || _moduleName] && mapModule[val || _moduleName].title;
        //    }
        //    if (document.title === 'undefined') {
        //        window.location.hash = '';
        //    }
        //    this._updateIframe(val);
        //},
        /**
         * 模块切换函数
         * @param  {string} moduleName 模块名称
         * @return {null}            null
         */
        tabModule_js: function (moduleName) {
            this.model.currentModule('');
            this.model.currentModule(moduleName);
            window.location.hash = moduleName;
        },
        /**
         * 后退前进调用组件调度(hash)
         * @return {null}      null
         */
        //_hashChange: function () {
        //    var _hash = window.location.hash.slice(1);
        //    if (!_hash) {
        //        window.location.hash = '';
        //        this._hashChange();
        //    } else {
        //        this.model.currentModule('');
        //    }
        //}
    };

    // 启动入口
    $(function () {
        viewModel._init();
    });


})(window, jQuery);