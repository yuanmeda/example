$(function() {
    /*返回顶部按钮*/
    var speed = 500;//滚动速度

    /*检测屏幕高度，当页面滚到超过一屏时显示返回顶部按钮*/
    var goTopHeight = $(window).height();
    $(window).scroll(function(){
        if($(window).scrollTop()>goTopHeight){
            $(".go-top").fadeIn(300);
        }
        else{
            $(".go-top").fadeOut(300);
        }
    });

    $(".go-top").click(function () {
        $('html,body').animate({
            scrollTop: '0px'
        },
        speed);
    });
})
