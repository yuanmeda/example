$(function () {
    'use strict';
    function FixedBar(opt) {
        if (typeof FixedBar.instance === 'object') {
            return FixedBar.instance;
        }
        var defaultOptions = {
            projectCode: "",
            custom_type: "auxo-recommend",   //业务类型
            question_type: "0",              //问答类型
            name: "选课说明",                 //按钮名称
            languageCode: "zh-CN",           //语言
            skinStyle: "blue",               // 皮肤
            staticUrl: ''             //静态站地址
        };
        this.options = $.extend(true, defaultOptions, opt);
        this._init();
        FixedBar.instance = this;
    }

    FixedBar.prototype = {
        _init: function () {
            this._create();
            this._setPos();
            this._bindEvent();
        },
        _create: function () {
            var options = this.options,
                title = options.languageCode == "en-US" ? "FAQ" : "常见<br>问题",
                faqUrl = options.recommendUrl + "/" + options.projectCode + "/faq?custom_type=" + options.custom_type + "&question_type=" + options.question_type,
                link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = options.staticUrl + "/auxo/front/channel/css/theme/" + options.skinStyle + "/fixed_bar.css";
            document.getElementsByTagName('head')[0].appendChild(link);
            var tmp = '\
                <div class="fixed-bar" style="visibility: hidden;">\
                    <a class="btn faq-btn" href="' + faqUrl + '">\
                        <span>' + title + '</span>\
                    </a>\
                    <a class="btn top-btn" href="javascript:;">\
                        <i class="arrow-up"></i>\
                    </a>\
                </div>';
            this.fixedBar = $(tmp);
            $('body').append(this.fixedBar);
            this.fixedBar.find('.top-btn').click(function () {
                $('html,body').stop().animate({scrollTop: '0px'}, 200);
            });
        },
        _setPos: function () {
            var dwidth = $(window).width(),
                innerWidth = 1415,
                le = 0;
            if (dwidth > 1450) {
                le = Math.floor((dwidth - innerWidth ) / 2);
            } else {
                le = 20;
            }
            this.fixedBar.css({
                'right': le + 'px'
            });

            this._bottomHide();
        },
        _bottomHide: function () {
            var whei = $(window).height();
            var dhei = $(document).height();
            var scot = $(window).scrollTop();
            if ((dhei <= whei) || scot == 0) {
                this.fixedBar.find(".top-btn").hide();
            } else {
                this.fixedBar.find(".top-btn").css('display', 'block');
            }
            var t = this;
            setTimeout(function () {
                t.fixedBar.css({
                    'visibility': 'visible'
                });
            }, 0)

        },
        _bindEvent: function () {
            var self = this;
            $(window).resize(function () {
                self._setPos();
            });
            $(window).scroll(function () {
                self._bottomHide();
            });
        }
    };
    $(function () {
        if (window.faqCourseDeclare == "open")
            new FixedBar({
                recommendUrl: window.recommendUrl,
                staticUrl: window.staticUrl,
                skinStyle: window.skinStyle,
                languageCode: window.languageCode,
                question_type: 1,
                projectCode: projectCode,
                custom_type: "auxo-recommend"
            });
    });
});