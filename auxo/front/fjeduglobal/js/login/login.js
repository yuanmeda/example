;(function (window) {
    var edupfLogin = {};
    /*登录页轮播*/
    edupfLogin.banner = function() {
        var $loginSwiper = $('.edupf-login-swiper');

        //轮播
        var mySwiper = $loginSwiper.swiper({
            loop: true,
            autoplay : 5000,
            speed: 600,
            simulateTouch : false,
            pagination : '.pagination',
            paginationClickable : true,
            autoplayDisableOnInteraction : false
        });

        //根据轮播图数量，显隐箭头及分页器
        if($loginSwiper.find('.swiper-slide').length <= 3) {
            $('.pagination').hide();
            mySwiper.stopAutoplay();
        }

        $loginSwiper.hover(function() {
            mySwiper.stopAutoplay();
        }, function() {
            if($loginSwiper.find('.swiper-slide').length <= 3) {
                $('.pagination').hide();
                mySwiper.stopAutoplay();
            }else {
                mySwiper.startAutoplay();
            }
        });
    },
        //密码开关
        edupfLogin.pwdSwitch = function() {
            var _lock = $('.lock'),
                _switch = $('.switch');

            _lock.on('click', function() {
                $(this).toggleClass('active');
            })
        },
        //登录页动画
        edupfLogin.animate = function() {
            $('.animate-icons').find('.icon-phone, .icon-app1, .icon-app2, .icon-app3').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(this).addClass('upSideDown').removeClass('loginIconFadeIn');
            });
        }
    window.edupfLogin = edupfLogin;
})(window);
$(function(){
    edupfLogin.banner();
    edupfLogin.pwdSwitch();
    edupfLogin.animate();
});

(function () {
    var service = {
        login: function (data) {
            return $.ajax({
                url: "/login/index",
                addMac: true,
                cache: true,
                contentType: 'application/json'
            });
        }
    };

    var viewModel = {
        model: {
            user: {
                login_name: "",
                password: ""
            },
            message: ''
        },
        initViewModel: function () {
            if (window.top != window) {
                window.top.location.href = location.href;
            }
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        login: function () {
            this.model.message('');
            var that = this, user = ko.mapping.toJS(this.model.user);
            $.each(user, function (k, v) {
                user[k] = $.trim(v);
            });
            if (!user.login_name || !user.password) {
                this.model.message('用户名或密码不能为空');
                return;
            }
            $('#loading').show();
            ucManager.logOut().then(function (res) {
                if (res == "success") {
                    ucManager.login(user.login_name, user.password).then(function (res) {
                        //登陆成功
                        if (typeof res == "object") {
                            service.login(user).then(function (data) {
                                if (data.code == "0") {
                                    var returnurl = that.getQueryStringByName('returnurl');
                                    var referrer = document.referrer;
                                    if (returnurl)
                                        window.location.href = decodeURIComponent(returnurl);
                                    else if (referrer && referrer.indexOf('app_id=glbedu') < 0 && referrer.indexOf('/login') < 0)
                                        window.location.href = decodeURIComponent(referrer);
                                    else
                                        window.location.href = "/home";
                                } else {
                                    $('#loading').hide();
                                    that.model.message(data);
                                    ucManager.logOut().then(function (res) {
                                    });
                                }
                            });
                        } else {
                            $('#loading').hide();
                            that.model.message(res);
                        }
                    });
                }
            });
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        }
    };

    $(function () {
        viewModel.initViewModel();
    });

}());