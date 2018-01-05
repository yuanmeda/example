(function ($) {
    var Loading = function (content, options) {
        this.time = 0;//记录show的此次 hide的次数>=show的次数 才隐藏loading =>为了同时支持自动控制loading（ajaxerrorjs中）、主动控制（业务代码中）
        this.options = options;
        this.timeout = 0;
        this.$element = $(content);
        //全局默认延时配置
        if (this.options.delay <= 0) {
            this.options.delay = 0;
        } else {
            this.options.delay = this.options.delay || 300;
        }
    };
    Loading.prototype = {
        constructor: Loading,
        show: function (args) {
            var _self = this;
            if (_self.time < 0 || !isFinite(_self.time)) {
                _self.time = 0;
            }
            _self.time++;
            if (!_self._initialized()) {
                _self._render();
            }
            //不需要延迟
            if (args.delay == 0 || _self.options.delay == 0) {
                _self.$element.find('.loading-backdrop').show();
                var m = _self.$element.find('.loading').modal('show');
            } else {
                window.clearTimeout(_self.timeout);
                _self.timeout = setTimeout(function () {
                    _self.$element.find('.loading-backdrop').show();
                    var m = _self.$element.find('.loading').modal('show');
                }, args.delay || _self.options.delay);
            }
        },
        hide: function (isForceHide) {
            var _self = this;
            _self.time--;
            if (_self.time <= 0||isForceHide) {
                _self.time = 0;
                var m = _self.$element.find('.loading');
                m.modal('hide');
                m.hide();
                _self.$element.find('.loading-backdrop').hide();
                window.clearTimeout(_self.timeout);
            }
        },
        _render: function () {
            var html = this._getHtml();
            this.$element
                .data('initialized', true)
                .append(html);
        },
        _initialized: function () {
            return this.$element.data('initialized') == true;
        },
        _getHtml: function () {
            var baseUrl = "";
            if (window._cloudStaticHost) {
                baseUrl = _cloudStaticHost;
            } else {
                baseUrl = ["http://s21.tianyuimg.com/", "http://s22.tianyuimg.com/", "http://s23.tianyuimg.com/", "http://s24.tianyuimg.com/", "http://s25.tianyuimg.com/"][Math.floor(Math.random() * 5)];
                if (window.location.href.indexOf("release.") >= 0) {
                    baseUrl = "http://test.static.huayu.nd/";
                }
                else if (window.location.href.indexOf("test.") >= 0) {
                    baseUrl = "http://test.static.huayu.nd/";
                }
                else if (window.location.href.indexOf("dev.") >= 0 || window.location.href.indexOf("debug.") >= 0) {
                    baseUrl = "http://debug.static.huayu.nd/";
                }
            }

            var html = [];
            Array.prototype.push.call(html,
                '<div class="modal-backdrop loading-backdrop" style="z-index: 10000; display:none;"></div>',
                '<div class="modal loading" data-backdrop="false" style="z-index:100001;width:180px;margin:-120px 0 0 -90px;text-align: center; display:none;">',
                '   <div class="modal-body">',
                '       <img src="' + baseUrl + '/addins/bootstrap/v2.0.2/img/loading_32x32.gif"/ style="margin-bottom:10px;">',
                '       <center>数据加载中...</center>',
                '   </div>',
                '</div>'
            );
            return html.join('');
        }
    };

    //$("body").loading({'delay':500}).//修改默认配置
    //    loading("show").//调用方法
    //    loading('show', { 'delay': 2000 });//调用有参方法
    $.fn.loading = function (option, args) {
        return this.each(function () {
            var $this = $(this),
            data = $this.data('loading');
            
            //option 为对象用来修改 默认配置
            if (typeof option == 'object' || !data) {
                options = $.extend({}, $this.data(), typeof option == 'object' && option)
                $this.data('loading', (data = new Loading(this, options)));
            }
            //option为字符串用来调用方法，第二个参数为object型 是这个方法入参
            if (typeof option == 'string') {
                args = args || {};
                data[option](args);
            }
        });
    };

    $.fn.loading.Constructor = Loading;

})(window.jQuery);