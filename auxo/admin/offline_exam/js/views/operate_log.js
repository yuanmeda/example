;(function ($) {
    "use strict";
    var store = {
        /*操作日志查询*/
        getOperateLog: function (user_id_sr, ip_address, module, op_object, custom_type, log_date_begin, log_date_end) {

            var filter = '$filter=custom_id eq ' + courseId + '&$order=create_time desc';

            // 拼接查询条件
            filter += user_id_sr ? '&user_id_sr eq ' + user_id_sr : '';
            filter += ip_address ? '&ip_address eq ' + ip_address : '';
            filter += module ? '&ip_address eq ' + ip_address : '';
            filter += op_object ?  '&op_object eq ' + op_object : '';
            filter += custom_type ? '&custom_type eq ' + custom_type : '';

            if(log_date_begin&&log_date_end){
                filter += '&log_date gt ' + log_date_begin + 'and log_date_end lt ' + log_date_end;
            } else if (log_date_begin) {
                filter += '&log_date gt ' + log_date_begin;
            } else if (log_date_end) {
                filter += '&log_date lt ' + log_date_end;
            }

            var url = window.elearning_business_course_url + '/v2/logs/search?$filter=custom_id eq ' + courseId + '&$order=create_time desc'
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type:'GET'
            });
        },
    };
    var viewModel = {
        model: {
            operateLogArr: [],
            options: {
               user_id_sr:'',
               ip_address:'',
               module: [],  //bind to select element,so it will be array
               op_object:'',
               custom_type: [], //bind to select element,so it will be array
               log_date_begin:'',
               log_date_end:''
            }
        },
        init: function () {
            var self = this;
            this.model.options = ko.mapping.fromJS(this.model.options);
            store.getOperateLog()
            .then(function(data){
                self.operateLogArr = data.items; 
                ko.applyBindings(self, document.getElementById('operate_log'))
            })
        },
        conditionQuery: function() {
            var self  = this;
            var options = ko.toJS(viewModel.model.options);
            console.log(options);
            store.getOperateLog(
                options.user_id_sr,
                options.ip_address,
                options.options.module&&options.module[0],
                options.op_object,
                options.custom_type&&options.custom_type[0],
                options.log_date_begin,
                options.log_date_end)
            .then(function(data) {
                self.operateLogArr(data.items); 
            })
        }
       
    };
    $(function () {
        viewModel.init();
    });
    $(".form_datetimepicker").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        autoclose: true
    });
})(jQuery);
