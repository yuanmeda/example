;(function ($) {
    //子导航栏展开收缩切换
    $('#nav').on('click', '[data-accordion]', function (e) {
        var _this = $(this),
            _i = _this.find('i'),
            _toggle = _this.next();
        _this.toggleClass('arrow-right');
        _toggle.slideToggle();
    });
})(jQuery);
