/*
遮罩层弹框插件
*/

(function ($) {
    $(window).on('resize', function () {
        var _height = ($('.container-fluid').height() + window.alterHeight || 0) < $(document).height() ? $(document).height() : $('.container-fluid').height() + window.alterHeight || 0;
        $('.m-modal').css({
            height: _height + 'px'
        });
        var _left=($(window).width()-400)/ 2;
        var _top=($(window).height()-470)/ 2;
        $('.m-panel','body').css({ top: _top, left: _left });
    })
    $.fn.modalPlugin = function (tpl, title, confirm, cancel,callback,data) {

        var _date = new Date().getTime(),
            str = '<div class="m-modal" style="display:none;" id="m_' + _date + '"><div class="m-panel"><div class="m-header"><h2>' + (title || '提示框') + '</h2><a class="m-close">&times;</a></div><div class="m-body"></div><div class="m-footer"><button id="m_confirm" class="btn btn-primary btn-sm">确定</button>&nbsp;&nbsp;<button id="m_cancel" class="btn btn-default btn-sm">取消</button></div></div></div>',
            $body = $(str),
            //跟随按钮位置
            //_right = document.body.clientWidth-(this[0].offsetLeft + this[0].offsetWidth),
            //_top = this[0].offsetTop + this[0].offsetHeight+10,
            //居中
            _left,
            _top;
        $body.find('.m-body').append(tpl);
        _left=($(window).width()-400)/ 2;
        _top=($(window).height()-470)/ 2;
        var alterHeight = document.body.clientHeight + document.documentElement.scrollTop - _top - 470;
        alterHeight = alterHeight < 0 ? -alterHeight : 0;
        window.alterHeight = alterHeight;
        var _height = ($('.container-fluid').height() + alterHeight) < $(document).height() ? $(document).height() : $('.container-fluid').height() + alterHeight;
        $body.css({
            height: _height + 'px'
        });
        $body.find('.m-panel').css({ top: _top, left: _left });
        var handler = {
            show: function () {
                $('#m_' + _date).show();
            },
            hide: function () {
                $('#m_' + _date).hide();
            },
            destory: function () {
                $('#m_' + _date).remove();
                $('html').css({'overflow':'auto'});
                $('html').off('click');
            }
        };

        $('html').on('click', '.m-close', function () {
            handler.destory();
        });
        $('html').on('click', '#m_cancel', function () {
            cancel && cancel();
            handler.destory();
        });
        $('html').on('click', '#m_confirm', function () {
            confirm && confirm($body.find('.m-body'));
            handler.destory();
        });

        
        if ($('#m_' + _date, $('body')).length == 0) {
            $('body').append($body);
        }
        handler.show();
        $('html').css({'overflow':'hidden'});
        callback && callback(data);
        return this;

    }
})(jQuery)