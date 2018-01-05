$(function () {

    function sliderBar() {
        if (typeof sliderBar.instance === 'object') {
            return false;
        }
        this._init();
        sliderBar.instance = this;
    }

    sliderBar.prototype = {
        _init: function () {
            if (faqCourseDeclare == "open") {
                this._create();
                this._setPos();
                this._bindEvent();
            }
        },
        _create: function () {
            var tmp = '\
                <div class="slider-bar">\
                </div>\
            ';
            this.slider = $(tmp);
            $('body').append(this.slider).css('position', 'relative');
            var title;
            if (languageCode == "en-US") {
                title = "FAQ";
            } else {
                title = "常见问题";
            }
            $(".slider-bar").css("z-index", "100");
            $(".slider-bar").faqButton({staticUrl: staticUrl, skinStyle: skinStyle, languageCode: languageCode, name: title, question_type: 1, projectCode: projectCode, custom_type: "auxo-recommend"});
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
            this.slider.css('right', le + 'px');
            this._bottomHide();
        },
        _bottomHide: function () {
            var whei = $(window).height();
            var dhei = $(document).height();
            var scot = $(window).scrollTop();
            if ((dhei <= whei) || scot == 0) {
                $(".slider-bar").find("#topButton").hide();
            } else {
                $(".slider-bar").find("#topButton").show();
            }
        },
        _bindEvent: function () {
            var self = this;
            $(window).resize(function () {
                self._setPos();
            });
        }
    };
    new sliderBar();
});