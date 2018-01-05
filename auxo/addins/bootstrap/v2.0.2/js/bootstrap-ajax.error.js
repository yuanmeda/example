(function ($) {
    $.ajaxSetup({
        error: function (jqXHR, textStatus, errorThrown) {
            if (typeof $.fn.loading != 'undefined') {
                $('body').loading('hide');
            }
            //有时返回的错误信息非json格式，无法解析
            try {
                var errorInfo = $.parseJSON(jqXHR.responseText);
            }
            catch (error) {
                //alert(jqXHR.responseText);
                //errorThrown = "未知错误";
                var errorInfo = { code: "", error: jqXHR.responseText, exception: "" };
            }
            var html = [];
            Array.prototype.push.call(html
                , '<div>'
                , '    <h2>', errorThrown, '</h2>'
                , '    <dl class="dl-horizontal">'
                , '        <dt style="width:60px;">错误代码</dt><dd style="margin-left:70px;">', errorInfo.code, '</dd>'
                , '        <dt style="width:60px;">错误描述</dt><dd style="margin-left:70px;">', errorInfo.error, '</dd>'
            //  , '        <dt style="width:60px;">错误详细</dt><dd style="margin-left:70px;">', errorInfo.exception, '</dd>'
                , '    </dl>'
                , '</div>'
                );
            $.fn.dialog2.helpers.alert(html.join(''), { title: '出错了' });
        }
    });
})(jQuery);