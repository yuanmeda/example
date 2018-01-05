(function ($, window) {

    var urls = {
        query: '/' + projectCode + '/resource_pool/tags/tree',
        create: tagServiceUrl + '/v2/tags',
        update: function (id) {
            return tagServiceUrl + '/v2/tags/' + id;
        },
        move: function (id) {
            return tagServiceUrl + '/v1/tags/' + id + '/move';
        },
        del: function (id) {
            return '/' + projectCode + '/resource_pool/tags/' + id;
        },
        custom_type: customType,
        root_name: '资源池标签树'
    };


    $(function () {
        new Label(urls);
    });

})(jQuery, window);