/*!
 * 前台头部nav
 */
(function($, window) {
    'use strict';
    //数据仓库
    var store = {

    };
    //课程详细数据模型
    var viewModel = {
        model: {
            searchTitle: '',
            placeholder: '请输入关键字....'
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function() {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('header'));
            //加载事件 
            this._eventHandler();
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function() {
            //用户头像hover事件
            $(".logined").hover(function() {
                $(this).find(".user-nav").stop(true, true).fadeIn();
            }, function() {
                $(this).find(".user-nav").stop(true, true).fadeOut();
            });
            //移动端hover事件
            $(".link-mobile").hover(function() {
                $(this).find(".link-down").stop(true, true).fadeIn();
            }, function() {
                $(this).find(".link-down").stop(true, true).fadeOut();
            });
        },
        /**
         * 搜索框搜索事件
         * @param  {string} data 搜索关键字
         * @return {null}      null
         */
        submit: function(data) {
            alert(data);
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);
