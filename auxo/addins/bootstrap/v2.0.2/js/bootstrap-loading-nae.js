(function ($) {
    var Loading = function (content, options) {
        this.options = options;
        this.interval = 0;
        this.timeout = 0;
        this.$element = $(content);
    };
    Loading.prototype = {
        constructor: Loading,
        show: function () {
            var _self = this;
            if (!_self._initialized()) {
                _self._render();
            }
            window.clearTimeout(_self.timeout);
            _self.timeout = setTimeout(function () {
                _self.$element.find(".cu-loading")
                    .addClass("cu-loading-show")
                    .data("hidden", false);
            }, 1000);
        },
        hide: function () {
            var _self = this;
            var m = _self.$element.find(".cu-loading");
            if (!m.data('hidden')) {
                m.data('hidden', true);
            }
            m.removeClass("cu-loading-show");
            window.clearTimeout(_self.timeout);
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
                '<div class="cu-loading">',
                '   <div class="cu-loading-img">',
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