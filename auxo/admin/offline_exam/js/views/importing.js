(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        sessionQuery: function (startTime, endTime, page) {
            // var url = service_domain + '/v1/periodic_exam_sessions';
            // var params = {
            //     periodic_exam_id: periodic_exam_id,
            //     page: page,
            //     size: 10
            // };
            // if (startTime && endTime) {
            //     params.start_time = startTime.replace(' ', '');
            //     params.end_time = endTime.replace(' ', '');
            // }
            // return $.ajax({
            //     url: url,
            //     cache: false,
            //     type: 'get',
            //     dataType: 'json',
            //     data: params,
            //     error: this.errorCallback
            // });
            var def = $.Deferred();
            def.resolve({
                "total": 1,
                "items": [
                    {
                        "id": "12345678-1234-1234-1234-1234567890ab",
                        "periodic_exam_id": "12345678-1234-1234-1234-1234567890ab",
                        "exam_id": "12345678-1234-1234-1234-1234567890ab",
                        "start_time": "2015-01-01T00:00:00",
                        "end_time": "2015-01-01T00:00:00",
                        "participant_user_number": 0,
                        "qualified_user_number": 0,
                        "user_exam_session_number": 0,
                        "qualified_user_exam_session_number": 0,
                        "create_time": "2015-01-01T00:00:00",
                        "update_time": "2015-01-01T00:00:00"
                    }
                ]
            });
            return def;
        },
    };

    var viewModel = {
        start_time: '',
        end_time: '',
        model: {
            exams: {
                total: 0,
                items: [
                    // {
                    //     "id": "8f3c55f1-7bb7-4120-a6ce-3591f37890af",
                    //     "periodic_exam_id": "64eb360e-f2b4-42d6-8448-d991a47e6623",
                    //     "exam_id": "8e364a00-3229-45b1-ad63-8a42be5847d0",
                    //     "start_time": "2017-05-04T04:00:00.000+0800",
                    //     "end_time": "2017-05-04T23:03:00.000+0800",
                    //     "participant_user_number": null,
                    //     "qualified_user_number": null,
                    //     "user_exam_session_number": null,
                    //     "qualified_user_exam_session_number": null,
                    //     "create_time": "2017-05-28T01:14:04.000+0800",
                    //     "update_time": "2017-05-28T01:14:06.000+0800"
                    // }
                ]
            },
            filter: {
                size: 10,
                page: 0
            }
        },

        init: function () {
            var _self = this;
            $('.datepicker').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy-mm-ddT",
                timeFormat: "hh:mm:ss.000z",
                showSecond: true,
            });
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this, document.getElementById('session-list'));
            this.query();


        },

        query: function (n) {
            if (n) this.model.filter.page(0)
            var _self = this;
            var _filter = ko.mapping.toJS(_self.model.filter);
            store.sessionQuery(_self.start_time.replace(/\s/g, ''), _self.end_time.replace(/\s/g, ''), _filter.page).then(function (data) {
                _self.model.exams.total(data.total)
                _self.model.exams.items(data.items)
                _self._pagePlugin(data.total, _filter.size, _filter.page);
            });
        },

        export: function () {
            var _self = this;
        },

        /**
         * 分页初始化
         * @param  {int}   total       总条数
         * @param  {int}   pageSize    每页条数
         * @param  {int}   currentPage 当前页码
         * @return {null}               null
         */
        _pagePlugin: function (total, pageSize, currentPage) {
            var _vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        _vm.model.filter.page(pageNum);
                        _vm.model.exams.total(0);
                        _vm.model.exams.items([]);
                        _vm.query();
                    }
                }
            });
        },
        percent: function (item) {
            var data = ko.mapping.toJS(item);
            var n1 = data.participant_user_number, n2 = data.qualified_user_number;
            if (!n2) {
                return '0%';
            } else {
                return parseInt((n1 / n2) * 100) + '%';
            }
        },

        dateFmt: function (item) {
            var data = ko.mapping.toJS(item);
            var start_date = (new Date(data.start_time)).format('yyyy-MM-dd');
            var end_date = (new Date(data.end_time)).format('yyyy-MM-dd');
            var start = (new Date(data.start_time)).format('yyyy-MM-dd HH:mm');
            if (start_date == end_date) {
                var end = (new Date(data.end_time)).format('HH:mm')
            } else {
                var end = (new Date(data.end_time)).format('yyyy-MM-dd HH:mm')
            }
            return start + ' 至 ' + end;
        },

        gopage: function (item) {
            var item = ko.mapping.toJS(item);
            window.open('/' + projectCode + '/admin/offline_exam/admin/importing_users?exam_id=' + exam_id + '&periodic_exam_id=' + item.periodic_exam_id);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));


