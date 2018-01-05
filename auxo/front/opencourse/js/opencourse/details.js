(function ($) {
    'use strict';
    var store = {
        getCourseList: function (data, success) {
            var url = (window.selfUrl || '') + "/" + projectCode + "/auxo/opencourse/front/opencourses";
            this.sendRequest(url, data, success);
        },
        sendRequest: function (url, data, success) {
            $.ajax({
                url: url,
                cache: false,
                data: data,
                dataType: "json",
                async: true,
                type: 'GET',
                success: success
            });
        }
    };
    var viewModel = {
        model: {
            cover_url: '',
            description: '',
            name: ''
        },
        //页面初始化
        init: function () {
            var _self = this;
            this.getCourse();

            this.model = ko.mapping.fromJS(this.model);

            ko.applyBindings(_self, document.getElementById("js_content"));
        }

    }
    $(function () {
        viewModel.init();
    });

})(jQuery);
