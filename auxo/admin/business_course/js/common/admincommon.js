//ajax开始回调
$(document).ajaxStart(function() {
   // loading = layer.load(0, {
   //     time: 1000 * 100
   // });
   var mask='<div id="ajaxmask" class="ajaxmask"><div class="spinner"></div></div>';
   $('body').append(mask);
});
////ajax结束回调
$(document).ajaxComplete(function() {
   // layer.close(loading);
   $('#ajaxmask').remove();
});