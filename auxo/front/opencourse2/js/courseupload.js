(function ($, window) {
    'use strict';

    var viewModel = {
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            $(window).off('message').on('message', function (evt) {
                if (evt.originalEvent.data) {
                    var rawData = void 0;
                    try {
                        rawData = JSON.parse(evt.originalEvent.data);
                    } catch (e) {
                    }
                    // if (rawData) callbackList[rawData.action](rawData.data);
                    if(rawData && rawData.action === 'goNextPage'){
                        this._goNextPage(rawData.data.courseId);
                    }
                }
            }.bind(this))
        },
        _goNextPage: function (courseId) {
            location.href =  window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/course_catalog?course_id=' + courseId + '&__return_url=' + window.__return_url;
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
