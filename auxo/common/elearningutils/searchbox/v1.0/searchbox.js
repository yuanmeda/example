(function($, window) {
    'use strict';
    /**
     * 搜索框构造函数
     * @param {object} params 组件参数
     */
    function SearchBox(params) {
        this.dataSource = ko.observableArray([]); //下拉选项数组
        this.keyWord = ko.observable(''); //搜索关键字
        this.focus = ko.observable(false); //input是否聚焦
        this.active = ko.observable(false); //是否打开输入框
        this.activeIndex = ko.observable(-1); //下拉列表选中索引
        this.placeholder = params.placeholder || '请输入关键字'; //input占位符
        this.cookieKey = params.cookieKey || 'search_key'; //cookie对应key值
        this.submit = params.submit || function(data) {
            console.log(data);
        }; //提交事件
        this.init(); //初始化默认动作
    }
    /**
     * 原型事件定义
     * @type {Object}
     */
    SearchBox.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        init: function() {
            this.eventHandler();
        },
        /**
         * DOM事件定义集合
         * @return {null} null
         */
        eventHandler: function() {
            var _self = this;
            //下拉框上下键事件
            $(document).on('keyup', function(e) {
                var _keyCode = e.keyCode,
                    _dataSource = _self.dataSource(),
                    _num = _self.activeIndex();
                if (_self.focus() && _dataSource.length) {
                    switch (_keyCode) {
                        case 40:
                            _num += 1;
                            slideKey(_num);
                            break;
                        case 38:
                            _num -= 1;
                            slideKey(_num);
                            break;
                        default:
                            break;
                    }
                }
            });
            /**
             * 下拉框选中处理
             * @param  {int} index 选中项索引
             * @return {null}       null
             */
            function slideKey(index) {
                var _dataSource = _self.dataSource(),
                    _len = _dataSource.length;
                if (console && console.log) {
                    console.log(index);
                }
                if (index === _len) {
                    index = 0;
                } else if (index < 0) {
                    index = _len + index;
                }
                _self.activeIndex(index).keyWord(_dataSource[index]);
            }
        },
        /**
         * 输入框聚焦事件
         * @return {null} null
         */
        onFocus: function() {
            this.dataSource(this.getCookie()).focus(true);
        },
        /**
         * 输入框失去焦点事件
         * @return {null} null
         */
        onBlur: function() {
            this.activeIndex(-1);
            setTimeout(function() {
                this.focus(false);
            }.bind(this), 200);
        },
        /**
         * 输入框键盘按键事件
         * @param  {object} binds input上下文
         * @param  {event} e     keyup事件对象
         * @return {null}       null
         */
        onKeyUp: function(binds, e) {
            if (e.keyCode === 13) {
                this.onSearch($.trim(this.keyWord()));
            }
        },
        /**
         * 输入框点击事件
         * @param  {object} binds input上下文
         * @param  {event} e     keyup事件对象
         * @return {null}       null
         */
        onInputClick: function(binds, e) {
            this.dataSource(this.getCookie()).focus(true);
        },
        /**
         * 下拉框点击事件
         * @return {null} null
         */
        onClick: function() {
            var _searchTitle = $.trim(this.keyWord());
            if (!_searchTitle) {
                if (this.active()) {
                    this.active(false);
                    this.activeIndex(-1);
                } else {
                    this.active(true);
                }
            } else {
                this.onSearch(_searchTitle);
            }
        },
        /**
         * 搜索事件
         * @param  {string} searchTitle 搜索关键词
         * @return {null}             [null]
         */
        onSearch: function(searchTitle) {
            this.setCookie(searchTitle).activeIndex(-1).focus(false).submit(searchTitle);
        },
        /**
         * 下拉框点击事件
         * @param  {string} data 选中关键词
         * @return {null}      null
         */
        onItemClick: function(data) {
            this.keyWord(data).onSearch(data);
        },
        /**
         * 获取下拉列表数据源
         * @return {object} 数据源数组
         */
        getCookie: function() {
            return JSON.parse($.cookie(this.cookieKey) || "[]");
        },
        /**
         * 更新数据源
         * @param {ko} searchTitle ko组件对象
         */
        setCookie: function(searchTitle) {
            var _dataSource = this.dataSource;
            _dataSource.remove(searchTitle);
            _dataSource.unshift(searchTitle);
            if (_dataSource().length > 5) {
                _dataSource().length = 5;
            }
            $.cookie('search_key', JSON.stringify(_dataSource()), {
                expire: 7,
                path: "/"
            });
            return this;
        }
    };
    /**
     * ko组件注册
     * @type {object}
     */
    ko.components.register('search-box', {
        viewModel: SearchBox,
        template: '<div class="search-wrapper" data-bind="css:{active:active}">\
					<div class="input-holder">\
	                 	<input type="text" class="searchinput scinput" data-bind="event:{focus:onFocus,blur:onBlur,keyup:onKeyUp,click:onInputClick},value:keyWord,valueUpdate:\'keyup\',attr:{placeholder:placeholder}" />\
	                    <a href="javascript:;" class="search-icon" data-bind="click:onClick">\
	                        <i class="icon-search"></i>\
	                    </a>\
	                    <ul class="cookie-list cookie-auto" data-bind="foreach:dataSource,visible:focus">\
	                    	<li data-bind="text:$data,css:{active:$index()===$parent.activeIndex()},click:$parent.onItemClick.bind($parent,$data)"></li>\
	                    </ul>\
                    </div>\
                </div>'
    });
})(jQuery, window);
