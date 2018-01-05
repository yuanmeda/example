/*
 考试标签
 */

(function ($, window) {

    var urls = {
        query: '/' + projectCode + '/tags/tree',
        create: '/' + projectCode + '/tags',
        update: function (id) {
            return '/' + projectCode + '/tags/' + id;
        },
        move: function (id) {
            return '/' + projectCode + '/tags/' + id + '/move';
        },
        del: function (id) {
            return '/' + projectCode + '/exam_center/tags/' + id;
        },
        custom_type: custom_type,
        root_name: '测评中心'
    };

    new Label(urls);

})(jQuery, window);