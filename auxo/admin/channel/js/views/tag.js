(function ($, window) {

    var urls = {
        query: '/' + projectCode + '/channels/' + channelId + '/tags/tree',
        create: tagServiceUrl + '/v2/tags',
        custom_id: channelId,
        update: function (id) {
            return tagServiceUrl + '/v2/tags/' + id;
        },
        move: function (id) {
            return tagServiceUrl + '/v1/tags/' + id + '/move';
        },
        del: function (id) {
            return '/' + projectCode + '/channels/tags/' + id;
        },
        custom_type: customType,
        root_name: '频道标签树'
    };


    $(function () {
        new Label(urls);
    });

})(jQuery, window);