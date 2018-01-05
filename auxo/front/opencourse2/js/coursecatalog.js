(function ($, window) {
    'use strict';
    var store = {

    };

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
                    if (rawData){
                        if(rawData.data[0].event_type === 'chapter_next_page'){
                            this._goNextPage();
                        }else if (rawData.data[0].event_type === 'resize') {
                            this._resize(rawData.data[0].data);
                        }
                    }
                }
            }.bind(this))
        },
        _resize: function (data) {
            $('#frame').height(data.height);
            $('.upload-content').height(data.height);
        },
        _goNextPage: function () {
            location.href = window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/course_content?course_id=' + window.course_id + '&__return_url=' + window.__return_url;
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
