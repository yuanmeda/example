/*
 公开课标签
 */
;(function ($, window) {
    var viewModel = {
        model: {
            url: ko.observable("")
        },
        _init: function () {
            var url = courseWebpage + '/' + projectCode + '/admin/course/' + course_id + '/resource_chapter?__mac=' + Nova.getMacToB64(courseWebpage + '/' + projectCode + '/admin/course/' + course_id + '/resource_chapter');
            this.model.url(url);
            ko.applyBindings(viewModel);
            /*跨域发送监听消息*/
            var z = document.getElementById('chapterIFrame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_create = "opencourse.course";
            n.addEventListener(message_key_create, function (receiveData) {
                if (receiveData.event_type == 'chapter_next_page') {
                    window.location.href = '/' + projectCode + '/admin/open_course/' + course_id + '/content?business_type=' + business_type + '&source=' + source + '&return_url=' + returnUrl;
                }
            });
        }
    };
    viewModel._init();
})(jQuery, window);
