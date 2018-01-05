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
            knowledge_map_url: '' //课程章节地址
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
                    _self.model.knowledge_map_url(_self._getKnowledgeMapUrl(data));
                    $(document).trigger('showContent');
                });
            }
        },
        _getKnowledgeMapUrl: function (data) {
            var url = window.course_maker_web_url + '/#!/public/' + data.maker_course_id + '/coursesmap?menu=true&readonly=false';

            return url + '&auth=' + base64_encode(TokenUtils.getMacToken("GET", "/#!/public/coursesmap", window.course_maker_web_url.replace("http://", "")));
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
