;(function (window) {
    var eduSecond = {};
    /*二级页面降级动效*/
    eduSecond.iconAnimate = function() {
        var _edupfSecManage = $('.edupf-sec-manage');

        //判断IE9及以下
        if(navigator.appName == "Microsoft Internet Explorer"&&parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE",""))<=9) {
            _edupfSecManage.find('.animated').fadeIn(1000);
        }
    },
    /*二级页面入口背景线条设置*/
    eduSecond.setLine = function() {
        var _entryList = $('.edu-manage-entry-list'),
            _li = _entryList.find('li'),
            _len = _li.length,
            count = _len % 4;

        _entryList.find('li:nth-child(4n)').css('border-right', '0');

        function setLine(count) {
            for(i=1; i<=count; i++) {
                _entryList.find('li').eq(-i).css({
                    'border-bottom': '0'
                });
            }
        }
        if(count == 0) {
            setLine(4)
        } else {
            setLine(count)
        }
    },
    window.eduSecond = eduSecond;
})(window);
$(function() {
    eduSecond.iconAnimate();
    eduSecond.setLine();
})
