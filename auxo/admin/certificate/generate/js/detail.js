;
(function () {

    var GLOBAL = (0, eval)('this');

    var $ = GLOBAL['jQuery'];

    var ko = GLOBAL['ko'];

    var koMapping = ko.mapping;

    var PROJECT_CODE = GLOBAL['projectCode'];

    var CERTIFICATE_ID = GLOBAL['certificateId'];

    var GENERATE_STATUS = GLOBAL['generateStatus'];

    var service = {
        /**
         * 用户证书查询
         * @param data
         * @returns {*}
         */
        getUserCertificateList: function (data) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/user_certificates',
                type: 'GET',
                dataType: 'json',
                data: master.utils.removeEmpty(data)
            });
        },
        /**
         * 用户证书批量生成
         * @param data
         */
        generateUserCertificate: function (data) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/user_certificates/generate',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        },
        /**
         * 用户证书驳回
         * @param id
         @param reason
         * @returns {*}
         */
        rejectUserCertificate: function (id, reason) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/certificates/user_certificates/' + id + '/rejected',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    rejected_reason: reason
                })
            });
        },
        /**
         * 导出证书
         * @param data
         */
        exportCertificate: function (data) {
            location.assign(master.utils.compatUrl('/' + PROJECT_CODE + '/certificates/user_certificates/export', master.utils.removeEmpty(data)));
        }
    };

    var ViewModel = function () {

        this.model = {

            search: {
                certificate_id: CERTIFICATE_ID,
                user_real_name: '',
                user_id_card: '',
                generate_status: GENERATE_STATUS,
                begin_generate_time: '',
                end_generate_time: '',
                page: 0,
                size: 10
            },

            reject: {
                id: '',
                rejected_reason: '',
                error: ''
            },

            totalCount: 0,              // 总记录数

            dataList: [],               // 列表数据

            checkedList: [],            // 选中的记录

            hasInitialized: false

        };

        return this;
    };

    ViewModel.prototype = {

        constructor: ViewModel,

        initViewModel: function (element) {
            var that = this;
            this.model = koMapping.fromJS(this.model);

            // 初始化datepicker
            $('.datetime').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN',
                minuteStep: 10
            });
            // 领用时间规则
            $('#beginTime').on('changeDate', function (e) {
                $('#endTime').datetimepicker('setStartDate', e.date);
            });
            $('#endTime').on('changeDate', function (e) {
                $('#beginTime').datetimepicker('setEndDate', e.date);
            });

            this.model.reject.rejected_reason.subscribe(function (value) {
                if (value) {
                    that.model.reject.error('');
                } else {
                    that.model.reject.error('请输入驳回理由');
                }
            });

            this.search();
            ko.applyBindings(this, element);
        },

        list: function () {
            var searchData = koMapping.toJS(this.model.search),
                that = this;
            if (searchData.begin_generate_time) {
                searchData.begin_generate_time = master.utils.toDate(searchData.begin_generate_time).getTime();
            }
            if (searchData.end_generate_time) {
                var endDate = master.utils.toDate(searchData.end_generate_time);
                endDate.setDate(endDate.getDate() + 1);
                searchData.end_generate_time = endDate.getTime();
            }
            service.getUserCertificateList(searchData).then(function (data) {
                var unwrapCheckedList = that.model.checkedList.peek(),
                    items = data.items;

                // 确保翻页后选中状态不丢失
                var checkedCount = 0;
                $.each(items, function (i, v) {
                    if (unwrapCheckedList.length) {
                        var firstIndex = master.fmt.index(v, unwrapCheckedList, 'id');
                        if (firstIndex > -1) {
                            items[i] = unwrapCheckedList[firstIndex];
                            checkedCount++;
                        }
                    }
                    var trainsTitle = [];
                    $.each(v.trains || [], function (i, t) {
                        trainsTitle.push(t.title);
                    });
                    items[i]['trains_title'] = trainsTitle.join('\n');
                });
                // 全选按钮选中/不选中
                if (checkedCount == items.length) {
                    $('#checkAll').prop('checked', 'checked');
                } else {
                    $('#checkAll').removeAttr('checked');
                }
                that.model.dataList(items);
                that.model.totalCount(data.count);
                that.generalPagination($('#pagination'), data.count, searchData.page, searchData.size);
                that.model.hasInitialized(true);
            });
        },

        search: function () {
            $('#checkAll').removeAttr('checked');
            this.model.checkedList([]);
            this.model.search.page(0);
            this.list();
        },

        generalPagination: function ($pagination, total, currentPage, pageSize) {
            var that = this;
            $pagination.pagination(total, {
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
                        that.model.search.page(pageNum);
                        that.list();
                    }
                }
            });
        },

        /**
         * 当前页 全选/全不选
         * @param context
         * @param e
         * @returns {boolean}
         */
        checkAll: function (context, e) {
            var isChecked = $(e.target).is(':checked'),
                checkedList = this.model.checkedList,
                unwrapCheckedList = checkedList.peek();
            $.each(this.model.dataList.peek(), function (i, v) {
                var firstIndex = checkedList.indexOf(v);
                if (isChecked && firstIndex == -1) {
                    unwrapCheckedList.push(v);
                } else if (!isChecked && firstIndex > -1) {
                    unwrapCheckedList.splice(firstIndex, 1);
                }
            });
            checkedList(unwrapCheckedList);
            return true;
        },

        /**
         * 生成单个证书
         * @param item
         */
        generateCertificate: function (item) {
            var that = this;
            $.confirm({
                title: '生成证书',
                content: '确认生成为[<span style="color: red;">' + item.user_real_name + '</span>]生成证书',
                buttons:{
                    confirm: {
                        text: '确认',
                        btnClass: 'btn-primary',
                        action: function(){
                            service.generateUserCertificate([{id: item.id}]).then(function () {
                                that.list();
                                $.alert('生成成功');
                            });                            
                        }
                    },
                    cancel:{
                        text: '取消',
                        action: $.noop
                    }
                }
            })
        },
        /**
         * 批量生成证书
         */
        generateCheckedCertificate: function () {
            var that = this,
                checkedList = this.model.checkedList.peek();
            if (!checkedList.length) {
                return $.alert('请先选择记录');
            } else {
                $.confirm({
                    title: '生成证书',
                    content: '确认生成共' + checkedList.length + '份证书',
                    buttons:{
                        confirm: {
                            text: '确认',
                            btnClass: 'btn-primary',
                            action: function(){
                                var ids = [];
                                $.each(checkedList, function (i, v) {
                                    ids.push({
                                        id: v.id
                                    });
                                });
                                service.generateUserCertificate(ids).then(function () {
                                    that.model.checkedList([]);
                                    that.list();
                                    $.alert('生成成功');
                                });                   
                            }
                        },
                        cancel:{
                            text: '取消',
                            action: $.noop
                        }
                    }
                })
            }
        },

        /**
         * 显示驳回Modal
         */
        showRejectModal: function (item) {
            var that = this;
            this.model.reject.id(item.id);
            this.model.reject.rejected_reason('');
            this.model.reject.error('');
            $('#rejectModal').modal('show');
        },
        /**
         * 驳回
         */
        rejectCertificate: function () {
            var that = this,
                data = ko.mapping.toJS(this.model.reject);
            data.rejected_reason = $.trim(data.rejected_reason);
            if (!data.rejected_reason) {
                this.model.reject.error('请输入驳回理由');
                return false;
            }
            this.model.reject.error('');
            service.rejectUserCertificate(data.id, data.rejected_reason).then(function () {
                $('#rejectModal').modal('hide');
                that.list();
                $.alert('驳回成功');
            });
        },
        /**
         * 导出证书
         */
        exportCertificate: function () {
            var data = ko.mapping.toJS(this.model.search);
            service.exportCertificate(data);
        }
    };

    $(function () {
        (new ViewModel()).initViewModel(document.getElementById('boot'));
    });

}());