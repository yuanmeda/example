;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    var TRANSITION_END = ['webkitTransitionEnd.flip', 'mozTransitionEnd.flip', 'MSTransitionEnd.flip', 'otransitionend.flip', 'transitionend.flip'].join(' ');

    var ANIMATION_END = ['webkitAnimationEnd.animate', 'mozAnimationEnd.animate', 'MSAnimationEnd.animate', 'oanimationend.animate', 'animationend.animate'].join(' ');

    var service = {
        /**
         * 用户证书查询
         * @param data
         * @returns {*}
         */
        queryUserCertificates: function (data) {
            return $.ajax({
                url: selfUrl + '/' + PROJECT_CODE + '/certificates/user_certificates',
                type: 'GET',
                dataType: 'json',
                data: data
            });
        }
    };

    /**
     * 是否支持css3的某个属性
     * @param style
     * @returns {boolean}
     */
    function supportCss3(style) {
        var prefix = ['webkit', 'Moz', 'ms', 'o'],
            i,
            humpString = [],
            htmlStyle = document.documentElement.style,
            _toHumb = function (string) {
                return string.replace(/-(\w)/g, function ($0, $1) {
                    return $1.toUpperCase();
                });
            };

        for (i in prefix)
            humpString.push(_toHumb(prefix[i] + '-' + style));

        humpString.push(_toHumb(style));

        for (i in humpString)
            if (humpString[i] in htmlStyle) return true;

        return false;
    }

    var Render = {
        supportCss3Animate: (function () {
            return supportCss3('animation');
        }()),
        supportCss3Transition: (function () {
            return supportCss3('transition');
        }()),
        animate: function ($dom, animation, fn) {
            $dom.show().addClass(animation + ' animated')
                .off(ANIMATION_END).on(ANIMATION_END, function () {
                $(this).removeClass(animation + ' animated');
                if (fn) {
                    fn.call(this);
                }
            });
        }
    };

    var ViewModel = function () {

        this.model = {
            search: {
                certificate_number: '',
                user_real_name: '',
                user_id_card: '',
                page: 0,
                size: 999999
            },
            dataList: []
        };
    };

    ViewModel.prototype = {
        constructor: ViewModel,

        initViewModel: function (element) {
            this.model = ko.mapping.fromJS(this.model);

            ko.applyBindings(this, element);
        },
        query: function () {
            var that = this,
                data = ko.mapping.toJS(this.model.search);
            if (this.isSearchValid(data)) {
                service.queryUserCertificates(data).then(function (res) {
                    that.model.dataList(res.items);
                    that.flipBack();
                })
            }
        },
        isSearchValid: function (data) {
            var emptyCount = 0;
            if ($.trim(data.certificate_number) === '') {
                emptyCount++;
            }
            if ($.trim(data.user_real_name) === '') {
                emptyCount++;
            }
            if ($.trim(data.user_id_card) === '') {
                emptyCount++;
            }
            if (emptyCount >= 2) {
                if (Render.supportCss3Animate) {
                    Render.animate($('#helpBlock'), 'flash text-red');
                    Render.animate($('#queryBtn'), 'shake');
                } else {
                    $('#dialog').show();
                }
                return false;
            }
            return true;
        },
        flipBack: function () {
            var $queryBlock = $('#queryBlock'),
                $resBlock = $('#resBlock');
            if (Render.supportCss3Transition) {
                $resBlock.css('position', 'absolute').show();
                $('.flip-3d').off(TRANSITION_END).on(TRANSITION_END, function () {
                    $queryBlock.hide();
                    $resBlock.css('position', 'relative');
                }).addClass('back');
            } else {
                $queryBlock.hide();
                $resBlock.show().css('position', 'relative');
            }
        },
        flipForward: function () {
            var $queryBlock = $('#queryBlock'),
                $resBlock = $('#resBlock');
            $resBlock.css('position', 'absolute');
            $queryBlock.show();
            if (Render.supportCss3Transition) {
                $('.flip-3d').off(TRANSITION_END).on(TRANSITION_END, function () {
                    $resBlock.hide();
                }).removeClass('back');
            } else {
                $resBlock.hide();
            }
        }

    };

    $(function () {
        (function () {
            var loading = null;
            // ajax开始回调
            $(document).ajaxStart(function () {
                loading = layer.load(0, {
                    time: 1000 * 100
                });
            });
            // ajax结束回调
            $(document).ajaxComplete(function () {
                layer.close(loading);
            });
        }());
        new ViewModel().initViewModel($('#bootstrap')[0]);
    });

}());