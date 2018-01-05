;(function (window) {
    var edupf = {};
    /*所有首页顶部轮播*/
    edupf.banner = function () {
        var $swiperContainer = $('.edupf-swiper-container');

        //首页顶部轮播
        var mySwiper = $swiperContainer.swiper({
            loop: true,
            autoplay: 5000,
            speed: 600,
            simulateTouch: false,
            pagination: '.pagination',
            paginationClickable: true,
            autoplayDisableOnInteraction: false
        });
        //根据当前窗口初始化轮播高度
        function resizeSwiper() {
            var h = $swiperContainer.find('.swiper-slide img').eq(0).height();
            $swiperContainer.css("height", h);
            $swiperContainer.find('.swiper-slide').css('height', h);
        }

        resizeSwiper();

        //当窗口尺寸改变时，延时重新初始化轮播高度
        var resizeTime = 0;
        $(window).resize(function () {
            clearTimeout(resizeTime);

            resizeTime = setTimeout(function () {
                resizeSwiper();
            }, 200);
        });

        //根据轮播图数量，显隐箭头及分页器
        if ($swiperContainer.find('.swiper-slide').length <= 3) {
            $('.pagination').hide();
            mySwiper.stopAutoplay();
        }

        $swiperContainer.hover(function () {
            mySwiper.stopAutoplay();
        }, function () {
            if ($swiperContainer.find('.swiper-slide').length <= 3) {
                $('.pagination').hide();
                mySwiper.stopAutoplay();
            } else {
                mySwiper.startAutoplay();
            }
        });
    };
    edupf.zxzy = function () {
        var $swiperLatestR = $('.swiper-latest-resourse');
        if ($swiperLatestR.length <= 0)
            return;

        //老师首页最新资源轮播
        var myLatestResourseSwiper = $swiperLatestR.swiper({
            loop: true,
            autoplay: 5000,
            speed: 600,
            simulateTouch: false,
            pagination: '.latest-resourse-pagination',
            paginationClickable: true,
            autoplayDisableOnInteraction: false
        });

        if ($swiperLatestR.find('.swiper-slide').length <= 3) {
            $('.latest-resourse-pagination').hide();
            myLatestResourseSwiper.stopAutoplay();
        }

        $swiperLatestR.hover(function () {
            myLatestResourseSwiper.stopAutoplay();
        }, function () {
            if ($swiperLatestR.find('.swiper-slide').length <= 3) {
                $('.latest-resourse-pagination').hide();
                myLatestResourseSwiper.stopAutoplay();
            } else {
                myLatestResourseSwiper.startAutoplay();
            }
        });
    };
    edupf.jyxw = function () {
        var $swiperEduNews = $('.swiper-edu-news');
        if ($swiperEduNews.length <= 0)
            return;
        //教育新闻轮播
        var myEduNewsSwiper = $swiperEduNews.swiper({
            loop: true,
            autoplay: 5000,
            speed: 600,
            simulateTouch: false,
            autoplayDisableOnInteraction: false
        });

        //教育新闻轮播方向键
        $('.swiper-edunews-btn-prev').click(function () {
            myEduNewsSwiper.swipePrev();
        });
        $('.swiper-edunews-btn-next').click(function () {
            myEduNewsSwiper.swipeNext();
        });

        //根据教育新闻轮播图数量，停止及开始轮播
        if ($swiperEduNews.find('.swiper-slide').length <= 3) {
            myEduNewsSwiper.stopAutoplay();
        }
    };
    edupf.zxkc = function () {
        //学生首页最新课程轮播
        if ($('.swiper-latest-lesson').length > 0) {
            var $swiperLatestLesson = $('.swiper-latest-lesson');

            var myLatestLessonSwiper = $swiperLatestLesson.swiper({
                loop: true,
                autoplay: 5000,
                speed: 600,
                simulateTouch: false,
                autoplayDisableOnInteraction: false
            });

            //学生首页最新课程轮播方向键
            $('.swiper-btn-prev').click(function () {
                myLatestLessonSwiper.swipePrev();
            });
            $('.swiper-btn-next').click(function () {
                myLatestLessonSwiper.swipeNext();
            });

            //根据最新课程轮播图数量，停止及开始轮播
            if ($swiperLatestLesson.find('.swiper-slide').length <= 3) {
                myLatestLessonSwiper.stopAutoplay();
            }

            $swiperLatestLesson.hover(function () {
                myLatestLessonSwiper.stopAutoplay();
            }, function () {
                if ($(this).find('.swiper-slide').length <= 3) {
                    myLatestLessonSwiper.stopAutoplay();
                } else {
                    myLatestLessonSwiper.startAutoplay();
                }
            });
        }
    };
    edupf.indexScroll = function () {
        var _edupfHeader = $('.edupf-header');
        //首页滚动事件
        $(window).scroll(function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop == 0) {
                _edupfHeader.removeClass('active');
            } else {
                _edupfHeader.addClass('active');
            }
        })
    };
    edupf.setPostWidth = function () {
        var _postTable = $('.post-table'),
            trLength = _postTable.find('tr').length;

        for(var i = 0; i < trLength; i++) {
            var _td = _postTable.find('tr').eq(i).find('td'),
                tdLength = _td.length,
                newWidth;

            switch(tdLength) {
                case 1:
                    newWidth = 100;
                    break;
                case 2:
                    newWidth = 50;
                    break;
                case 3:
                    newWidth = 32;
                    break;
            }
            _td.css('width', newWidth + '%');
        }
    };
    window.edupf = edupf;
})(window);
$(function () {
    edupf.indexScroll();
});
