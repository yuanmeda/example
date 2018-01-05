/**
 * 图片加载器
 * Created by Lin Tao on 2016/1/29.
 */

 (function($) {
     $.fn.imageLoader = function(options) {
         opts = $.extend({
             defaultUrl: '',
             targetUrl: ''
         }, opts || {});

         var that = this;
         that.attr('src', that.opts.targetUrl);

         that.on('error', function(evt) {
            if(that.attr('src') !== that.opts.defaultUrl) {
                that.attr('src', that.opts.defaultUrl);
            }
         });
     };
 })(jQuery);
