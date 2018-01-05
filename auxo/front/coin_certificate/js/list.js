;(function (window, $) {
    'use strict';
    // 数据仓库
    var store = {
        // 获取学习中心基础数据
        baseInfo: function (data) {
            var url = '';

            return $.ajax({
                url: url,
                data: data
            });
        }
    };

    // 数据模型
    var viewModel = {
        model: [],
        /**
         * 初始化函数
         * @return {null} null
         */
        _init: function () {
            // ko对象绑定
            this.model = ko.mapping.fromJS(this.model);
            this.model([{
                "coin_certificate_id": "12345678-1234-1234-1234-1234567890ab",
                "receive_user_id": 0,
                "receive_time": "2015-01-01T00:00:00",
                "use_time": "2015-01-01T00:00:00",
                "use_status": 1,
                "use_object_type": "string",
                "use_object_id": "string",
                "use_object_name": "string",
                "coin_certificate_vo": {
                    "id": "12345678-1234-1234-1234-1234567890ab",
                    "name": "Java 技术培训兑换劵",
                    "allow_receive_start_time": "2015-01-01T00:00:00",
                    "allow_receive_end_time": "2015-01-01T00:00:00",
                    "allow_receive_number": 0,
                    "allow_use_start_time": "2015-01-01T00:00:00",
                    "allow_use_end_time": "2015-01-01T00:00:00",
                    "remark": "可兑换任一培训",
                    "receive_status": 0,
                    "use_status": 0,
                    "limit_object_type": "string",
                    "limit_object_id": "string",
                    "limit_object_name": "string"
                }
            }]);
            // 绑定dom
            ko.applyBindings(this, document.getElementById('auxo-coin_certificate'));
        }

    };

    // 启动入口
    $(function () {
        viewModel._init();
    });

})(window, jQuery);
