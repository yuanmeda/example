/**
 * 后台框架脚本
 * 全局变量：currentuser-当前登录用户
 *           staticUrl-静态站地址
 *           localdata（LACALDATA
 *           viewModel-ko主对象接口暴露
 */

(function($) {
    //本地数据存储变量
    var LACALDATA = {};
    LACALDATA.contentBind = document.getElementById('content');
    //主题列表正则判断规则
    var skinReg = new RegExp(window.skinPure.join('|'),'g');

    /**
     * 获取当前主题
     * @return {string} 主题标识
     */
    var getDefaultStyle = function() {
        var _style =$.cookie('BACKENDSKIN') || 'dark';
        LACALDATA.BACKENDSKIN = _style;
        return _style;
    };

    //通过ajax请求获取数据
    var store = {
    };
    //界面模型
    var viewModel = {
        model: {
            frontSite: '',
            userInfo: null,
            skins: skins(),
            breadcrumb: [],
            defaultSkin: getDefaultStyle(),
            search: {
                title: '',
                status: 1
            }
        },
        /**
         * ko初始化
         * @return {null} null
         */
        init: function() {
            this.model = ko.mapping.fromJS(this.model);
            //加载用户信息
            this.model.userInfo(currentuser);
            //加载导航列表
            this.model.breadcrumb(routeList[currentLevel]);
            //加载事件处理器
            this._eventHandler();
            //绑定作用域
            ko.applyBindings(this, document.getElementById('header'));
            ko.applyBindings(this, document.getElementById('sites'));
            //defaultSkin变化订阅函数
            this.model.defaultSkin.subscribe(this._styleNotice);
            //初始化界面主题
            viewModel._updateStyle(getDefaultStyle(), window.document);
        },
        /**
         * 界面事件处理
         * @return {null} null
         */
        _eventHandler: function() {

            //网站主题切换事件
            $('#header').on('click', '[data-skin]', function(e) {
                stopEvent(e);
                var _this = $(this),
                    _src = _this.data('src');
                _this.addClass('active').siblings().removeClass('active');
                setCookie({
                    'BACKENDSKIN': _src
                });
                viewModel.model.defaultSkin(_src);
            });

            //子导航栏展开收缩切换
            $('#nav').on('click', '[data-accordion]', function(e) {
                stopEvent(e);
                var _this = $(this),
                    _i = _this.find('i'),
                    _toggle = _this.next();
                _this.toggleClass('arrow-right');
                _toggle.stop().slideToggle();
            });
            
            //导航栏设置（更新您的位置信息）
            $('#nav').on('click', '[data-level]', function(e) {
                var _this = $(this),
                    _level = _this.data('level');
                stopEvent(e);
                viewModel._setFullPath(_level);
            });
        },
        /**
         * 界面刷新处理(加入当前导航状态)
         * @param {string} level 导航字符串
         */
        _setFullPath: function(level,options) {
            //跳转相应的页面
           var _href= window.routeString[level];
           window.location.href=parseHref(_href,options);
        },
        /**
         * 路径点击事件
         * @param  {[type]} context [description]
         * @param  {[type]} e       [description]
         * @return {null}         null
         */
        _linkClick: function(binds) {
            viewModel._setFullPath(binds.level);
        },
        /**
         * 样式变化通知事件
         * @return {null} null
         */
        _styleNotice: function(val) {
            viewModel._updateStyle(val);
        },
        /**
         * 界面主题更换处理器
         * @param  {string} style 主题名称
         * @param  {dom} score 作用域范围
         * @return {null}       null
         */
        _updateStyle: function(style, score) {
            var _links = $('link', score || window.document);
            $.each(_links, function(i, link) {
                try {
                    var __link = $(link),
                        __pre = __link.attr('href'),
                        __now = __pre.replace(skinReg, style);
                    if (__pre != __now) {
                        __link.attr('href', __now);
                    }
                } catch (e) {
                    console.log(e.message);
                }
            });
            $(document).trigger('themgChange',[style]);
        }
    };

    //暴露viewModel对象，以供子页面使用
    window.parentModel = window.parentModel || viewModel;
    window.LACALDATA = LACALDATA;

    //初始化
    $(function () {
        viewModel.init();
    });

})(jQuery);
