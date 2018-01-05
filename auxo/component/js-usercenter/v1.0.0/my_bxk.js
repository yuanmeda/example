/*!
 * 用户学习中心组件
 */
(function($, window) {
    'use strict';
    /**
     * 我的学习数据模型
     * @param {Object} params 模块参数(projectCode:项目标识)
     */
    function StudyModel(params) {
        var model = {
            filter: {
                status: [], //课程状态
                size: 12, //分页大小
                page: 0, //当前页码
                group_name: 'course_barrier_group'
            },
            bxk_filter: {
                status: [0,1], //必修课
                size: 12,      //分页大小
                page: 0        //当前页码
            },
            auditCount: 0, //待审核数
            waitPayCount: 0, //待付款数
            learnings: [], //课程列表s
            moreStatus: true, //是否还有数据
            loadComplete: false, //是否加载完成
            showlabel: false, //是否显示提示文本
            type: 1  //必修课:1  ,其他两个tab为：2
        };
        this.params = params || {};
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // status改变事件
 /*       this.model.filter.status.extend({
            'notify': 'always'
        }).subscribe(this._flashByStatus, this);*/
        // learnings改变强制刷新
        this.model.learnings.extend({
            'notify': 'always'
        });
        this.uris=gaea_js_properties||{};
        this.uris.mystudy_mooc_web_url=myStudyMoocWebUrl;
        // 数据仓库
        this.store = {
            // 获取我的学习列表
            learningList: function(filter) {
                var url = gaea_js_properties.auxo_mystudy_url+'/v2/users/'+userId  +'/studies/group_name';
                return $.ajax({
                    url: url,
                    data: filter
                });
            },
            bxkLearningList: function(filter) {
                var url = gaea_js_properties.auxo_mystudy_url+'/v2/users/'+userId  +'/required_courses';
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
        _init: function() {
            // 加载学习列表

            this._loadLearningList(false);
            var obj = document.getElementsByClassName('user-center')[0];     //修改必修课的宽度
            var obj1 = document.getElementsByClassName('user-layout')[0];    //修改必修课的overflow
          obj.setAttribute("class", "fit_user_center");
            obj1.removeAttribute("class",'user-layout');
        },
        /**
         * 窗口滚动加载更多
         * @return {null}   null
         */
        _scrollLoad: function() {
            var _scroll = $('[data-handler-scroll]', '#x-my-bxk'),
                _window = $(window);
            if (!this.willupdate && this.model.loadComplete() && this.model.moreStatus() && _scroll.length && _scroll.position().top < (_window.height() + _scroll.height() + $(window).scrollTop())) {
                if (this.model.type() === 1) {
                    this.model.bxk_filter.page(this.model.bxk_filter.page() + 1);
                } else {
                    this.model.filter.page(this.model.filter.page() + 1);
                }
                this._loadLearningList(true);
            }
        },
        /**
         * 加载我的学习列表
         * @param  {boolean} flag 是否追加learnings
         * @return {promise} promise对象
         */
        _loadLearningList: function(flag) {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter),
                _bxkfilter = ko.mapping.toJS(this.model.bxk_filter);
            _filter.status=_filter.status.join(',');
            _bxkfilter.status=_bxkfilter.status.join(',');
            this.model.loadComplete(!!(false|flag));
            if (_bxkfilter.status == '0,1') {
                return this.store.bxkLearningList(_bxkfilter).done(function(data) {
                    data.items = data.items || [];
                 //   _self.pagination($('#pagination'), data.count);
                    if (flag) {
                        _self.model.learnings(_self.model.learnings().concat(data.items));
                    } else {
                        _self.model.learnings(data.items);
                    }
                    setTimeout(function(){
                        _self._lazyImage();
                    });
                }).fail(function() {
                    // _self.model.learnings([]);
                }).always(function(data, status, xhr) {
                    _self.model.loadComplete(true);
                    _self._judgeHasMore(data.count);
                    if (status === 'success') {
                       _self._scrollLoad();
                    }
                });
            } else {
                return this.store.learningList(_filter).done(function(data) {
                    data.items = data.items || [];
                    if (flag) {
                        _self.model.learnings(_self.model.learnings().concat(data.items));
                    } else {
                        _self.model.learnings(data.items);
                    }
                    setTimeout(function(){
                        _self._lazyImage();
                    });
                }).fail(function() {
                    // _self.model.learnings([]);
                }).always(function(data, status, xhr) {
                    _self.model.loadComplete(true);
                    _self._judgeHasMore(data.count);
                    if (status === 'success') {
                        _self._scrollLoad();
                    }
                });
            }
        },
        /**
         * 图片懒加载
         * @return {null} null
         */
        _lazyImage: function() {
            var _self = this;
            $('#x-my-bxk .lazy-image:not(.loaded)').lazyload({
                effect: 'fadeIn',
                threshold: 200,
                effect_speed: 800,
                load: function() {
                    $(this).addClass('loaded');
                }
            }).trigger('appear');
        },
        /**
         * 判断是否还有更多数据
         * @param  {int} taotal 数据总数
         * @return {null}       null
         */
        _judgeHasMore: function(total) {
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
         * tab页签点击事件
         * @param  {int} tabIndex tabINdex
         * @return {null}          null
         */
        tabHandler_js: function(tabIndex,num) {
            this.model.learnings([]);
            switch(num)
            {
                case 0: 
                    this.model.filter.status([]);
                    this.model.bxk_filter.status(tabIndex);
                    this.model.bxk_filter.page(0);
                    this.model.type(1);
                    this._loadLearningList(false);
                    break;
                case 1:
                    this.model.filter.status(tabIndex);
                    this.model.bxk_filter.status([]);
                    this.model.filter.page(0);
                    this.model.type(2);
                    this._loadLearningList(false);
                    break;
                case 2:
                    this.model.filter.status(tabIndex);
                    this.model.bxk_filter.status([]);
                    this.model.filter.page(0);
                    this.model.type(2);
                    this._loadLearningList(false);
                    break;
            }
        },
        /**
         * 加载更多
         * @return {null} null
         */
        loadMoreHandler_js: function() {
            if (this.model.type() === 1) {
                this.model.bxk_filter.page(this.model.bxk_filter.page() + 1);
            } else {
                this.model.filter.page(this.model.filter.page() + 1);
            }
            this._loadLearningList(true);
        },
        /**
         * 去学习，跳转学习中页签
         * @return {null} null
         */
        goLearning_js: function() {
            this.model.filter.status([0,1]);
            this.model.bxk_filter.status([]);
            this.model.filter.page(0);
            this.model.type(2);
            this._loadLearningList(false);
        },
        /**
         * 是否为学习中
         * @return {Boolean} true or false
         */
        isLearning:function(status){
            return JSON.stringify(status)==='[0,1]';
        }
    };

    /**
     * 注册ko组件my-study
     */
    ko.components.register('x-my-bxk', {
        synchronous: true,
        viewModel: StudyModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
/**
 * Created by Administrator on 2017.7.17.
 */





