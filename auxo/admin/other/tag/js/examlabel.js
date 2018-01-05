/*
 公开课标签
 */

;(function ($, window) {
    var urls = {
        query: '/v1/tags/tree_no_cache',
        create: '/v1/tags',
        update: function (id) {
            return '/v1/tags/' + id;
        },
        move: function (id) {
            return '/v1/tags/' + id + '/move';
        },
        del: function (id) {
            return '/v1/tags/' + id;
        },
        custom_type: custom_type,
        root_name: custom_type == 'auxo-open-course' ? '公开课' : (custom_type == 'auxo-train' ? '培训认证' : '测评中心')
    };
    new Label(urls);
})(jQuery, window);
