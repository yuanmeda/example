(function ($, window) {
    'use strict';
    var store = {
        queryCourse: function () {
            var url = window.elearning_business_course_url + '/v1/business_courses/' + courseId;

            return $.ajax({
                url: url
            });
        }
    };
    var viewModel = {
        model: {
            isNext: ko.observable(0),
            content_url: '' //课程章节地址
        },
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, LACALDATA.contentBind);
            this.model.isNext(window.is_next ? 1 : 0);
            this._baseInfo();
            this._eventHandler();
        },
        _eventHandler: function () {
            $("#subframe").bind("load", function () {
                var windowHeight = $(window).height();
                var height = windowHeight - this.offsetTop - 170;
                height = height < 900 ? 900 : height;
                $(this).css({
                    height: height + 'px'
                });
            });
        },
        _baseInfo: function () {
            var _self = this;
            if (courseId) {
                $.when(store.queryCourse()).done(function (data) {
                    _self.model.content_url(_self._getContentUrl(data));
                    $(document).trigger('showContent');
                });
            }
        },
        _getContentUrl: function (data) {
            var url = window.course_maker_web_url + '/#!/public/' + data.maker_course_id + '/course?edit_catalogue=false';
            if(window.business_type == "teaching_course"){
                url = url + '&restypes=101';
            }else if(window.business_type == "exercise_course"){
                url = url + '&restypes=011';
            }

            return url + '&auth=' + base64_encode(TokenUtils.getMacToken("GET", "/#!/public/course", window.course_maker_web_url.replace("http://", "")));
        },
        _getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        },
        nextPage: function () {
            if(window.is_next == 1){
                this.postMsgToParent();
            }
        },
        postMsgToParent: function() {
            var msg = {
                "action": "goNextPage",
                "data": {},
                "origin": location.host,
                "timestamp": +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        }
    };
    viewModel._init();
})(jQuery, window);
