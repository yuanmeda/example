$(function () {
    var _funcMainParts = $('.func-main-parts'),
        _funcMainEven = $('.func-main-parts:nth-child(odd)'),
        _sideCatalog = $('.side-catalog'),
        _moduleList = $('.module-list'),
        _moduleListLi = _moduleList.find('li'),
        _moduleName = _moduleList.find('.module-name'),
        _moduleListSub = $('.module-list-sub'),
        _moduleListSubLi = $('.module-list-sub-li'),
        _btnCataImg = $('.btn-catalog'),
        _pptCon = $('.ppt-container'),
        _pptViewPort = $('.ppt-viewport'),
        _pptListCon = $('.ppt-list-container'),
        _pptList = $('.ppt-list'),
        _pptListLi = _pptList.find('li'),
        _pptBd = $('.bd'),
        _prev = $('.prev'),
        _next = $('.next'),
        _hintEsc = $('.hint-func-esc'),
        _funcTabList = $('.func-tab-list'),
        _funcTabListLi = _funcTabList.find('li'),
        _funcMain = $('.func-main'),
        roleType = roleName;

    /*初始化*/
    function initSlide() {
        jQuery(".ppt-viewport").slide({
            mainCell: '.bd ul',
            effect: 'left',
            trigger: 'click',
            pnLoop: 'false',
            switchLoad: '_src',
            vis: 'auto'
        });
    }

    initSlide();
    _funcMainEven.css('background', '#f6faff');

    /*点击tab切换模块*/
    _funcTabListLi.on('click', function () {
        var thisIndex = $(this).index();

        $(this).addClass('active').siblings().removeClass('active');
        _funcMain.eq(thisIndex).addClass('show').siblings().removeClass('show');
        initSuperSlide(".ppt-viewport");
    });

    /*根据变量触发相应tab点击事件*/
    function switchFunc(roleType) {
        switch (roleType) {
            case 'teacher':
                _funcTabListLi.eq(0).trigger('click');
                break;
            case 'student':
                _funcTabListLi.eq(1).trigger('click');
                break;
            case 'guardian':
                _funcTabListLi.eq(2).trigger('click');
                break;
            default:
                _funcTabListLi.eq(0).trigger('click');
        }
    }

    switchFunc(roleType);


    /*初始化：为小图列表的每张图添加序号*/
    for (var i = 0; i < _pptList.length; i++) {
        $('.ppt-container').each(function () {
            var len = $(this).find(_pptListLi).length;

            if (len > 0) {
                for (var j = 0; j < len; j++) {
                    $(this).find('.ppt-no').eq(j).text(j + 1);
                }
                $(this).find('.page-current').text(1);
                $(this).find('.page-total').text(len);
            }
            if (len == 1) {
                $(this).find(_btnCataImg).hide();
            }
        })
    }

    /*点击一级目录显示/隐藏列表*/
    _moduleName.on('click', function () {
        $(this).toggleClass('active')
            .next('.module-list-sub').slideToggle(300);
        $(this).parent().siblings('li').find(_moduleName).removeClass('active');
        $(this).parent().siblings('li').find(_moduleListSub).slideUp(300);
    });

    /*二级目录点击事件*/
    _moduleListSubLi.on('click', function (e) {
        var thisIndex = _moduleListSubLi.index($(this)),
            newTop = _funcMainParts.eq(thisIndex).offset().top;

        e.stopPropagation();

        $('html, body').scrollTop(newTop)
    });

    /*监控滚动*/
    $(window).scroll(function () {
        var scrollHeight = $(this).scrollTop();

        /*调整目录位置*/
        if (scrollHeight >= 465) {
            _sideCatalog.css({
                'position': 'fixed',
                'top': '60px'
            });
        } else {
            _sideCatalog.css({
                'position': 'absolute',
                'top': '465px'
            });
        }

        /*根据页面位置，改变目录激活态*/
        $(".func-main.show").find(_funcMainParts).each(function () {
            var _thisOffsetTop = $(this).offset().top,
                thisIndex = _funcMainParts.index($(this)),
                thisModuleName = _moduleListSubLi.eq(thisIndex).parent().siblings(_moduleName);

            if (_thisOffsetTop - 473 <= scrollHeight && scrollHeight <= _thisOffsetTop + 338) {
                _moduleListSubLi.filter('.active').removeClass('active');
                _moduleListSubLi.eq(thisIndex).addClass('active');
                if (thisModuleName.hasClass('active')) {
                    return false;
                } else {
                    thisModuleName.trigger('click');
                }
            }
        });
    });

    /*小图列表显隐函数*/
    function pptListConShow(el) {
        el.toggleClass('show');
    }

    /*点击列表按钮，显隐图片列表*/
    _btnCataImg.on('click', function () {
        var el = $(this).parent().prev().find(_pptListCon);
        pptListConShow(el);
    });

    /* 离开图片区域，隐藏小图列表*/
    _pptViewPort.on({
        mouseenter: function () {
            if ($(this).find(_pptListLi).length !== 1) {
                $(this).find(_pptListCon).addClass('show');
            }
        },
        mouseleave: function () {
            $(this).find(_pptListCon).removeClass('show');
        }
    });

    /*小图列表滚动动画函数*/
    function pptListConScroll(left, _listCon, _listLi) {
        var centerWidth = (_pptListCon.width() - 150) / 2,
            _thisPptCon = _listCon.parent().parent(),
            thisIndex = _listLi.filter('.on').index();
        if (left > centerWidth && _listLi.length > 6) {
            var x = left - centerWidth;
            _listCon.stop().animate({
                scrollLeft: x + 'px'
            }, 300);
        } else {
            _listCon.stop().animate({
                scrollLeft: 0
            }, 300);
        }
        _thisPptCon.find('.page-current').text(thisIndex + 1);

        /*更换底部文字*/
        _thisPptCon.find('.ppt-intro p').stop().hide().eq(thisIndex).show();
    }

    /*点击箭头触发小图列表滚动*/
    function pptListScroll(el) {
        var _thisPptListLi = el.parent().find(_pptListLi),
            _thisListCon = el.parent().find(_pptListCon);

        if (_thisPptListLi.length > 6) {
            var _liOn = _thisPptListLi.filter('li.on'),
                pptListOnLeft = _liOn.position().left,
                scrollLeft = _thisListCon.scrollLeft();
        }
        pptListConScroll(pptListOnLeft, _thisListCon, _thisPptListLi);
    }

    _prev.on('click', function () {
        pptListScroll($(this))
    });
    _next.on('click', function () {
        pptListScroll($(this))
    });

    /*直接点击图片列表，始终保持图片目录的当前图片在正中央*/
    _pptListLi.on('click', function () {
        var _thisPptList = $(this).parent(),
            _thisPptListLi = _thisPptList.find(_pptListLi),
            _thisListCon = _thisPptList.parent();

        if (_thisPptList.find('li').length > 6) {
            var pptListOnLeft = $(this).position().left,
                scrollLeft = _thisListCon.scrollLeft();
        }
        pptListConScroll(pptListOnLeft, _thisListCon, _thisPptListLi);
    })

    /*初始化superSlide插件*/
    function initSuperSlide(el) {
        jQuery(el).slide({
            mainCell: '.bd ul',
            effect: 'left',
            trigger: 'click',
            pnLoop: 'false',
            switchLoad: '_src',
            vis: 'auto'
        });
    }

    //点击全屏按钮事件
    $('.btn-zoom-out').on('click', function () {
        $(this).parent().parent().toggleClass('full');
        initSuperSlide($(this).parent().siblings('.ppt-viewport'));

        //全屏时禁用滚动条
        $('body').toggleClass('overflow-change')

        //退出全屏提示
        $('.full').find(_hintEsc).show(0).delay(3000).fadeOut();
    });

    //监控按键，按下esc时，退出全屏
    $(document).keyup(function (e) {
        var key = e.which;
        if (key == 27) {
            $('.full').find('.btn-zoom-out').trigger('click');
        }
    });

    // /*图片加载完*/
    // function imgLoad(el) {
    //     for (var i = 0; i < el.length; i++) {
    //
    //         var img = new Image();
    //
    //         if (img.complete || img.width) {
    //         } else {
    //             img.onload = function () {
    //                 var template = '<img class="img-failed" src="http://j11.e.99.com/auxo/front/fjedu/img/loading-fail.png" alt="">\
    //                     <p class="txt-failed">图片加载失败</p>\
    //                     <a class="btn-reload">重新加载</a>'
    //                 el.eq(i).parent().append(template);
    //                 el.eq(i).remove();
    //             }
    //         }
    //         img.src = el.eq(i).attr('src');
    //     }
    // }
    //
    // var imgLoadTimer = setTimeout(function () {
    //     imgLoad($('.ppt-container .ppt-viewport .bd li > a img'));
    // }, 5000);

    //点击重新加载
    // if($('.btn-reload').length) {
    //     $('.btn-reload').on('click', function() {
    //     })
    // }
})
