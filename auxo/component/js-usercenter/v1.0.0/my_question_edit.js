/*!
 * 用户答疑编辑器组件
 */
(function($, window) {
    'use strict';
    /**
     * 答疑编辑器数据模型
     * @param {Object} params 模块参数
     */
    function QuestionKedit(params) {
        var MAX_COUNT = params.max || 200;
        var model = {
            content: params.content || '',
            height: params.h || '135px',
            width: params.width || '100%',
            wordcount: 0
        };
        this.params = params || {};
        // 父组件交互
        this.tag = this.params.tag;
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // 内容监听
        this.model.content.subscribe(function(val) {
            this.model.content(val.substr(0, MAX_COUNT));
        }, this);
        //获取输入字数计算值
        this.model.wordcount = ko.computed(function() {
            var _content = this.model.content();
            return MAX_COUNT - _content.length;
        }, this);
        // 初始化动作
        this._init();
    }
    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    QuestionKedit.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function() {
            // ko校验配置
            ko.validation.init();
            // 校验规则
            this._validate();
            // 加载事件
            // setTimeout($.proxy(this._eventHandler, this), 0);
        },
        /**
         * 事件集合 
         * @return {null} null
         */
        _eventHandler: function() {
            var _self = this;
        },
        /**
         * 校验器
         * @return {null} null
         */
        _validate: function() {
            this.model.content.extend({
                required: {
                    params: true,
                    message: "请输入内容！"
                }
            });
            this.errors=ko.validation.group(this.model.content);
        },
        /**
         * 获取kedit数据
         * @return {string} 编辑数据
         */
        _getKeditData: function() {
            return this.editor.html();
        },
        /**
         * 保存事件
         * @return {null} null
         */
        kedit_save_js: function() {
            if (this.params.confirm_handler_js) {
                if (ko.isObservable(this.params.confirm_handler_js)) {
                    this.params.confirm_handler_js = this.params.confirm_handler_js();
                }
                if (this.errors().length) {
                    this.errors.showAllMessages();
                    return;
                }
                this.params.confirm_handler_js(this.model.content());
                if (ko.isObservable(this.tag)) {
                    this.tag(-1);
                }
            }
        },
        /**
         * 取消返回事件
         * @return {null} null
         */
        kedit_cancel_js: function() {
            if (ko.isObservable(this.tag)) {
                this.tag(-1);
            }
        }
    };

    /**
     * 注册ko组件my-question-edit
     */
    ko.components.register('my-question-edit', {
        synchronous: true,
        viewModel: {
            createViewModel: function(params, componentInfo) {
                var _h = $(componentInfo.element).closest('.qa_detail_js').height();
                params.h = (_h - 50) + 'px';
                return new QuestionKedit(params);
            }
        },
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
