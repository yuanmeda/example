;
(function ($) {
    function Uswipe(contain, opts) {
        this.opts = opts;
        this.contain = contain;
        this.slideWidth = contain.width();
        this.slideWrap = contain.children('#j_slide');
        this.slides = contain.find('.slide-item');
        this.itemNum = opts.itemNum;
        this.slideItemNum = opts.slideItemNum;
        this.index = 0;
        this.speedTime = parseFloat(opts.speed);
        this.waitTime = parseFloat(opts.wait);
        this.nav;
        this.prevNext;
        this.timer=null;
    }

    $.extend(Uswipe.prototype, {
        createNav: function () {
            var count = this.slideItemNum / this.itemNum, html = [], nav = $("<div>", {'class': 'uswipe-nav'}), t = this;
            for (var i = 0; i < count; i++) {
                if (!i) {
                    html.push("<a href='javascript:;' class='active'></a>");
                } else {
                    html.push("<a href='javascript:;'></a>");
                }
            }
            nav.on("click", "a", function (evt) {
                var a = $(this), idx = a.index();
                t.move(idx);
            }).html(html.join(""));

            return nav;
        },
        createOpts: function () {
            var opts = $("<div>", {'class': 'uswipe-opts'}),
                prev = $("<a>", {"href": "javascript:;", "class": "uswipe-prev"}),
                next = $("<a>", {"href": "javascript:;", "class": "uswipe-next"}),
                self = this;
            prev.on('click', function () {
                self.move(self.index - 1);
            });
            next.on('click', function () {
                self.move(self.index + 1);
            });
            prev.hover($.proxy(this.stop, this));
            next.hover($.proxy(this.stop, this));
            return opts.append(prev, next);
        },
        move: function (idx) {
            var idx = isNaN(idx) ? this.index + 1 : idx;
            if (this.slideWrap.is(':animated') || this.index == idx) return;
            var direction = this.index - idx;
            if (idx == this.slideItemNum / this.itemNum) {
                idx = 0
            } else if (idx < 0) {
                idx = this.slideItemNum / this.itemNum - 1;
            }
            this.index = idx;
            this.animate(direction * this.slideWidth);
            this.showNav();
        },
        play: function () {
            var waitTime = this.waitTime, self = this;
            this.timer = setTimeout(function () {
                self.move(self.index + 1);
                self.play();
            }, waitTime);
        },
        stop: function () {
            clearTimeout(this.timer);
        },
        animate: function (offset) {
            var left = parseInt(this.slideWrap.css('left')) + offset,
                slideWidth = this.slideWidth, slideItemNum = this.slideItemNum,
                itemNum = this.itemNum,
                slideWrap = this.slideWrap;
            if (offset > 0) offset = '+=' + offset;
            else offset = '-=' + Math.abs(offset);
            this.slideWrap.stop(true, true).animate({'left': offset}, this.speedTime, function () {
                if (left < (-slideWidth * slideItemNum / itemNum))
                    slideWrap.css('left', -slideWidth);
                else if (left == 0)
                    slideWrap.css('left', -slideWidth * slideItemNum / itemNum)
            });
        },
        showNav: function () {
            if (this.nav) this.nav.children('a').eq(this.index).addClass('active').siblings().removeClass('active');
        },
        setup: function(isMove){
            this.slideWrap = $('#j_slide');
            this.slideWidth = $('#j_slide').parent().width();
            var slides = this.slideWrap.find('.slide-item');
            slides.css('width',this.slideWidth+'px');
            if(isMove){
                this.slideWrap.css({
                    'left': '0px',
                    'width': (slides.length  * this.slideWidth) + 'px'
                });
            }else{
                this.slideWrap.css({
                    'left': -(this.index+1)*this.slideWidth + 'px',
                    'width': (slides.length  * this.slideWidth) + 'px'
                });
            }
        },
        init: function () {
            var opts = this.opts, ft = $("<div>", {"class": "uswipe-ft"}),
                self = this;
            if (this.itemNum >= this.slideItemNum) {
                this.contain.css('visibility', 'visible');
                return;
            }
            else {
                var itemNum = this.itemNum, slideItemNum = this.slideItemNum, waitTime = opts.wait;
                var cloneLast = this.slides.slice(0, itemNum).clone();
                var cloneFirst = this.slides.slice(-itemNum).clone();
                cloneLast.appendTo(this.slideWrap);
                cloneFirst.prependTo(this.slideWrap);
                this.setup();
                this.play();
            }
            if (opts.nav) {
                this.nav = this.createNav();
                ft.append(this.nav);
            }
            if (opts.pn) {
                this.prevNext = this.createOpts();
                ft.append(this.prevNext);
            }
            ft.appendTo(this.contain);
            this.contain.css('visibility', 'visible');
            this.contain.hover(
                function () {
                    self.stop();
                    if (self.prevNext) self.prevNext.css('display', 'block');
                }, function () {
                    self.play();
                    if (self.prevNext) self.prevNext.css('display', 'none');
                });

        }
    });
    $.fn.uswipe = function (settings) {
        var settings = $.extend({
            speed: 500,
            wait: 5000,
            itemNum: 1,
            slideItemNum: 1,
            pn: false,
            nav: true
        }, settings || {});
        this.each(function () {
            var u = (new Uswipe($(this), settings));
            u.init();
            $(window).on('resize',function(){
                u.stop();
                u.setup((u.slideItemNum/u.itemNum == 1));
                if(u.slideItemNum/u.itemNum >1) u.play();
            });
        });
    };
})(window.jQuery);
