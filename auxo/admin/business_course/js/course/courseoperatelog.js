; (function ($) {
    "use strict";
    var store = {
        /*操作日志查询*/
        getOperateLog: function (user_id_sr, ip_address, module, op_object, action, log_date_begin, log_date_end, page_size, current_page) {
            // var filter = "$filter=custom_id eq "  + courseId + "&$order=create_time desc";
            var filter = "$filter=custom_id eq " + courseId + "";

            // 拼接查询条件
            filter += user_id_sr ? (" and user_id eq " + user_id_sr + "") : "";
            filter += ip_address ? " and ip_address eq '" + ip_address + "'": '';
            filter += module ? " and module eq '" + module + "'": '';
            filter += op_object ? " and op_object eq '" + op_object + "'": '';
            filter += action ? " and action eq '" + action + "'": '';

            if (log_date_begin && log_date_end) {
                filter += ' and log_date gt ' + log_date_begin + ' and log_date lt ' + log_date_end;
            } else if (log_date_begin) {
                filter += ' and log_date gt ' + log_date_begin;
            } else if (log_date_end) {
                filter += ' and log_date lt ' + log_date_end;
            }

            filter += '&$order=log_date desc&$result=pager';
            filter += page_size&&current_page ? '&$offset=' + page_size * current_page : '';

            var url = window.logServiceUrl + '/v2/logs/search?' + filter;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'GET'
            });
        },
    };
    var viewModel = {
        model: {
            operateLogArr: [],
            options: {
                user_id_sr: '',
                ip_address: '',
                module: [],  //bind to select element,so it will be array
                op_object: '',
                action: [], //bind to select element,so it will be array
                log_date_begin: '',
                log_date_end: '',
                pageTotal: '',  // 分页数据总数
                currentPage: 0, // 当前分页数
                pageSize: 20,   // 分页的大小
            }
        },
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(self, document.getElementById('operate_log'))

            store.getOperateLog().then(function (data) {
                self.model.operateLogArr(data.items);
                self._pagePlugin(data.total, ko.unwrap(self.model.options.pageSize), ko.unwrap(self.model.options.currentPage));
            })
        },
        _pagePlugin: function(total, pageSize, currentPage){
            var self = this;
            $('#pagination').pagination(total, {
                current_page: currentPage,
                items_per_page: pageSize,
                prev_text: '上一页',
                next_text: '下一页',
                callback: function(currentPage){
                    self.model.options.currentPage(currentPage);
                    self.conditionQuery();
                }
            });
        },
        conditionQuery: function () {
            var self = this;
            var options = ko.mapping.toJS(viewModel.model.options);
            return store.getOperateLog(
                options.user_id_sr,
                options.ip_address,
                options.module && options.module[0],
                options.op_object,
                options.action && options.action[0],
                options.log_date_begin?new Date(options.log_date_begin).format('yyyy-MM-ddTHH:mm:ss'):'',
                options.log_date_end?new Date(options.log_date_end).format('yyyy-MM-ddTHH:mm:ss'):'',
                options.pageSize,
                options.currentPage
            ).then(function (data) {
                viewModel.model.operateLogArr(data.items);
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
