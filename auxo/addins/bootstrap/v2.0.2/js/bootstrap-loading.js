(function ($) {
    var Loading = function (content, options) {
        this.time = 0;//记录show的此次 hide的次数>=show的次数 才隐藏loading =>为了同时支持自动控制loading（ajaxerrorjs中）、主动控制（业务代码中）
        this.options = options;
        this.interval = 0;
        this.timeout = 0;
        this.$element = $(content);
    };
    Loading.prototype = {
        constructor: Loading,
        show: function () {
            var _self = this;
            if (_self.time < 0 || !isFinite(_self.time)) {
                _self.time = 0;
            }
            _self.time++;
            if (!_self._initialized()) {
                _self._render();
            }
            window.clearTimeout(_self.timeout);
            _self.timeout = setTimeout(function () {
                var m = _self.$element.find('.loading');
                if (!m.data('shown')) {
                    m.data('shown', true);
                    m.on('shown', function () {
                        var step = 0;
                        _self.interval = window.setInterval(function () {
                            step += 1;
                            if (step > 100) step = 0;
                            m.find('.bar').width(step + '%');
                        }, parseInt(_self.options.duration / 10));
                    });
                }
                m.modal('show');
            }, 1000);            
        },
        hide: function () {
            var _self = this;
            _self.time--;
            if (_self.time <= 0) {
                _self.time = 0;
                var m = _self.$element.find('.loading');
                if (!m.data('hidden')) {
                    m.data('hidden', true);
                    m.on('hidden', function () {
                        m.find('.bar').width('0%');
                        window.clearInterval(_self.interval);
                    });
                }
                m.modal('hide');
                m.hide();
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
            var html = [];
            Array.prototype.push.call(html,
                '<div class="modal loading" data-backdrop="false">',
                '   <div class="modal-body">',
                '       <div class="progress">',
                '           <div class="bar" style="width: 0%;">',
                '           </div>',
                '       </div>',
                '       <p><center>数据加载中...</center></p>',
                '   </div>',
                '</div>'
            );
            return html.join('');
        }
    };


    $.fn.loading = function (option) {
        return this.each(function () {
            var $this = $(this),
            data = $this.data('loading'),
            options = $.extend({}, $.fn.loading.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data('loading', (data = new Loading(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            } else if (options.show) {
                data.show();
            }
        })
    };

    $.fn.loading.defaults = {
        duration: 500
    };

    $.fn.loading.Constructor = Loading;

})(window.jQuery);