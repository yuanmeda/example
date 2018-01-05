;(function (window) {
    var eduCommon = {};
    /*返回顶部按钮*/
    eduCommon.goTop = function () {
        var speed = 500,//滚动速度
            goTopHeight = $(window).height(),
            _goTop = $('.go-top');

        /*返回顶部按钮，监控屏幕高度，当页面滚到超过一屏时显示返回顶部按钮*/
        $(window).scroll(function () {
            if ($(window).scrollTop() > goTopHeight) {
                _goTop.fadeIn(300);
            }
            else {
                _goTop.fadeOut(300);
            }
        });

        _goTop.click(function () {
            $('html,body').animate({
                    scrollTop: '0px'
                },
                speed);
        });
    };
    //浏览器版本检测
    eduCommon.support = {
        userAgent: navigator.userAgent.toLocaleLowerCase(),
        ie: function () {
            var isIE = eduCommon.support.userAgent.indexOf('msie') !== -1 || !!eduCommon.support.userAgent.match(/trident\/7\./) || eduCommon.support.userAgent.indexOf('edge') !== -1;
            if (isIE) {
                var isLteIE8 = isIE && !+[1,],
                    ieVer = 6,
                    dm = document.documentMode;
                if (dm) {
                    switch (dm) {
                        case 6 :
                            ieVer = 6;
                            break;
                        case 7 :
                            ieVer = 7;
                            break;
                        case 8 :
                            ieVer = 8;
                            break;
                        case 9 :
                            ieVer = 9;
                            break;
                        case 10 :
                            ieVer = 10;
                            break;
                        case 11 :
                            ieVer = 11;
                            break;
                    }
                } else {
                    if (navigator.userAgent.toLocaleLowerCase().indexOf('edge') !== -1) {
                        return ieVer = 'edge';
                    } else if (isLteIE8 && !XMLHttpRequest) {
                        ieVer = 6;
                    } else if (isLteIE8 && !document.documentMode) {
                        ieVer = 7;
                    }
                    if (isLteIE8 && document.documentMode) {
                        ieVer = 8;
                    }
                    if (!isLteIE8 && (function () {
                            "use strict";
                            return !!this;
                        }())) {
                        ieVer = 9;
                    }
                    if (isIE && !!document.attachEvent && (function () {
                            "use strict";
                            return !this;
                        }())) {
                        ieVer = 10;
                    }
                    if (isIE && !document.attachEvent) {
                        ieVer = 11;
                    }
                }
                return ieVer;
            } else {
                return false;
            }
        },

        chrome: function () {
            if (eduCommon.support.userAgent.indexOf('chrome') !== -1 && eduCommon.support.userAgent.indexOf('edge') === -1) {
                return eduCommon.support.userAgent.replace(/^[\w\W]+chrome\/([0-9\.]+)[\w\W]+/, '$1');
            } else {
                return false;
            }
        }
    };
    //头部个人中心弹窗
    eduCommon.showPersonCenter = function () {
        var _edupfHeader = $('.edupf-header'),
            _loginName = _edupfHeader.find('.login-name'),
            _loginIconHead = _edupfHeader.find('.login-icon-head'),
            _personCenter = _edupfHeader.find('.person-center'),
            _searchCon = _edupfHeader.find('.search-con');

        //判断IE9及以下
        var isOldBroswer = navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) <= 9;

        if (isOldBroswer) { //ie89
            $('.login-name, .login-icon-head').on('mouseover', function () {
                _personCenter.css('top', '47px')
                    .slideDown().removeClass('false');
            })

            //点击其他区域收起个人中心
            $(document).on('click', function () {
                if (_personCenter.hasClass('false')) {
                    // return false;
                } else {
                    _personCenter.slideUp();
                }
            });
        } else { //ie10+
            $('.login-name, .login-icon-head').on('mouseover', function () {
                _personCenter.addClass('myCenterFadeInDown').removeClass('myCenterFadeOutUp false');
            });

            $(document).on('click', function () {
                hideCenterPopup();
            });
        }

        _edupfHeader.find('.msg-list').on('click', '.status', function () {
            var $ctx = $(this);
            $(this).parent().animate({
                left: '-374px',
                opacity: '0',
                filter: 'Alpha(opacity=0)'
            }, 300, function () {
                $ctx.parent().remove();
            });
        });

        _personCenter.on('click', function (e) {
            e.stopPropagation();
        });

        //解决iframe不能触发click事件问题
        function hideCenterPopup() {
            if (_personCenter.hasClass('false')) {
                // return false;
            } else {
                _personCenter.addClass('myCenterFadeOutUp').removeClass('myCenterFadeInDown');
            }
        }

        var iframe = document.getElementById('js_frame');
        if (iframe) {

            var myConfObj = {
                iframeMouseOver: false
            }
            window.addEventListener('blur', function () {
                if (myConfObj.iframeMouseOver) {
                    hideCenterPopup()
                }
            });

            iframe.addEventListener('mouseover', function () {
                myConfObj.iframeMouseOver = true;

            });
            iframe.addEventListener('mouseout', function () {
                myConfObj.iframeMouseOver = false;
                window.focus();
            });
        }
    };
    //展开关闭搜索框
    eduCommon.search = function () {
        var _edupfHeader = $('.edupf-header'),
            _navList = _edupfHeader.find('.nav-list'),
            _searchCon = _edupfHeader.find('.search-con'),
            _btnSearchFake = _searchCon.find('.btn-search-fake'),
            _btnClose = _searchCon.find('.btn-close'),
            _btnNewFunc = _edupfHeader.find('.btn-new-func');

        //头部搜索框
        _btnSearchFake.on('click', function () {
            _searchCon.addClass('active');
            _navList.hide();
            _btnNewFunc.hide();
        });

        _btnClose.on('click', function () {
            _searchCon.removeClass('active');
            _navList.show();
            _btnNewFunc.show();
        });
    };
    //改变角色
    eduCommon.changeRole = function () {
        var _edupfHeader = $('.edupf-header'),
            _headContainer = _edupfHeader.find('.head-container'),
            _link = _headContainer.find('.link'),
            _role = _headContainer.find('.role'),
            _roleWrap = _edupfHeader.find('.role-change-wrap'),
            _head = _roleWrap.find('.head'),
            _btnConfirm = _roleWrap.find('.btn-confirm');

        function slideInLeft() {
            _roleWrap.animate({
                left: '50px'
            })
        };
        function slideInRight() {
            _roleWrap.animate({
                left: '374px'
            })
        };
        _role.on('click', function () {
            _headContainer.fadeOut();
            slideInLeft();
        });
        _head.on('click', function () {
            $(this).find('.status').addClass('checked')
                .parent().parent().siblings('.role-content').find('.status')
                .removeClass('checked');
            $(this).parent().addClass('on').siblings().removeClass('on');
            _headContainer.fadeIn();
            slideInRight();
        });
    };
    window.eduCommon = eduCommon;
})(window);
$(function () {
    var _personCenter = $('.person-center');

    eduCommon.goTop();
    eduCommon.showPersonCenter();
    eduCommon.search();
    eduCommon.changeRole();
})
