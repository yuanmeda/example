/*!
 * 用户学习中心组件
 */
(function ($, window) {
    'use strict';
    /**
     * 我的学习数据模型
     * @param {Object} params 模块参数(projectCode:项目标识)
     */
    function StudyModel(params) {
        var model = {
            filter: {
                size: 15, //分页大小
                page: 0, //当前页码

            },
            learnings: [], //课程列表
            moreStatus: true, //是否还有数据
            loadComplete: false, //是否加载完成
            showlabel: false //是否显示提示文本
        };
        this.params = params || {};
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // learnings改变强制刷新
        this.model.learnings.extend({
            'notify': 'always'
        });
        this.uris = gaea_js_properties || {};
        this.uris.mystudy_mooc_web_url = myStudyMoocWebUrl;
        // 数据仓库
        this.store = {
            // 获取我的学习列表
            learningList: function (filter) {
                var url = gaea_js_properties.auxo_mystudy_url + '/v1/mine/favorites';
                return $.ajax({
                    url: url,
                    data: filter
                });
            }
        };
        // 初始化动作
        this._init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    StudyModel.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function () {
            // 加载学习列表
            this._loadLearningList(false);
        },
        /**
         * 窗口滚动加载更多
         * @return {null}   null
         */
        _scrollLoad: function () {
            var _scroll = $('[data-handler-scroll]', '#x-my-study'),
                _window = $(window);
            if (!this.willupdate && this.model.loadComplete() && this.model.moreStatus() && _scroll.length && _scroll.position().top < (_window.height() + _scroll.height() + $(window).scrollTop())) {
                this.model.filter.page(this.model.filter.page() + 1);
                this._loadLearningList(true);
            }
        },
        /**
         * 加载我的学习列表
         * @param  {boolean} flag 是否追加learnings
         * @return {promise} promise对象
         */
        _loadLearningList: function (flag) {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter);
            this.model.loadComplete(!!(false | flag));
            return this.store.learningList(_filter)
                .done(function (data) {
                    data.items = data.items || [];
                    if (flag) {
                        _self.model.learnings(_self.model.learnings().concat(data.items));
                    } else {
                        _self.model.learnings(data.items);
                    }
                    setTimeout(function () {
                        _self._lazyImage();
                    });

                })
                .always(function (data, status, xhr) {
                    _self.model.loadComplete(true);
                    _self._judgeHasMore(data.count);
                    if (status === 'success') {
                        _self._scrollLoad();
                    }
                });
        },
        /**
         * 图片懒加载
         * @return {null} null
         */
        _lazyImage: function () {
            var _self = this;
            $('#x-my-study .lazy-image:not(.loaded)').lazyload({
                effect: 'fadeIn',
                threshold: 200,
                effect_speed: 800,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('appear');
        },
        /**
         * 判断是否还有更多数据
         * @param  {int} taotal 数据总数
         * @return {null}       null
         */
        _judgeHasMore: function (total) {
            var _learns = this.model.learnings(),
                _moreData = _learns.length < total;
            this.model.moreStatus(_moreData);
            // 判断是否显示没有更多数据label
            if (_moreData && _learns > 9) {
                this.model.showlabel(true);
            } else {
                this.model.showlabel(false);
            }
        },
        /**
         * 加载更多
         * @return {null} null
         */
        loadMoreHandler_js: function () {
            this.model.filter.page(this.model.filter.page() + 1);
            this._loadLearningList(true);
        }
    };

    /**
     * 注册ko组件my-study
     */
    ko.components.register('x-my-collection', {
        synchronous: true,
        viewModel: StudyModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
