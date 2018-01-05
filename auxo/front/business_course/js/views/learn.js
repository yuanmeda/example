$(function () {
    require(['player', 'document.extend.main', 'index'], function (video, doc, learn) {
        // //初始化各个播放器到业务脚本对象中
        learn.init(video, doc);
    });
    var originalTitle = i18nHelper.getKeyValue('courseComponent.front.learn.title');
    document.title = originalTitle;
    var titleEl = document.getElementsByTagName('title')[0];
    var docEl = document.documentElement;
    if (docEl && docEl.addEventListener) {
        docEl.addEventListener('DOMSubtreeModified', function (evt) {
            var t = evt.target;
            if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
                if (document.title !== originalTitle) {
                    document.title = originalTitle;
                }
            }
        }, false);
    } else {
        document.onpropertychange = function () {
            if (window.event.propertyName === 'title') {
                if (document.title !== originalTitle) {
                    document.title = originalTitle;
                }
            }
        };
    }
    window.onbeforeunload=function (){
        if (window.isAnswering) {
            return false;
        }
    };
});
