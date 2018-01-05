/**
 * @file 报名学员列表
 * @remark 非snake写法的属性字段都是与服务端无关的
 */

(function ($) {
    "use strict";

    /**
     * 通用工具类
     */
    var commonTool = {
        /**
         * 获取时间的time值
         *
         * @param dateStr
         * @returns {number}
         */
        getDataTime: function (dateStr) {
            if (dateStr.length < 11)
                dateStr += " 00:00:00";
            return new Date(dateStr.replace(/-/g, '/')).getTime();
        }
    }

    var store = {
        /**
         * 获取报名列表
         *
         * @returns {JQueryXHR|*}
         */
        getList: function (search) {
            return $.ajax({
                url: "/" + projectCode + "/users",
                data: search,
                type: "GET",
                cache: false
            });
        },
        /**
         * 报名审核
         *
         * @returns {JQueryXHR|*}
         */
        audit: function (pass, data) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees/status/" + pass,
                type: 'put',
                dataType: "json",
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data),
                cache: false
            });
        },
        /**
         * 删除学员
         *
         * @returns {JQueryXHR|*}
         */
        deleteUser: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees",
                data: JSON.stringify(data),
                type: 'delete',
                cache: false
            });
        },
        /**
         * 导出学员
         *
         * @returns {JQueryXHR|*}
         */
        export: function (search) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees/reporting",
                data: search,
                type: "get",
                cache: false
            });
        }
    }

    var viewModel = {
        /**
         * viewModel的数据对象
         *
         * @property search 查询参数
         */
        model: {
            train_id: trainId,
            list: [],
            totalCount: 0,
            checkList: [],
            search: {
                'account': '',
                'real_name': '',
                "start_reg_date": "",
                "end_reg_date": "",
                "page_no": 0,
                "page_size": 10
            },
            audit: {
                currentUserId: "",
                comment: ""
            }
        },

        /**
         * 表单数据的验证
         */
        observableValidate: function () {
            var that = this;
            that.model.audit.comment.extend({
                required: {
                    params: true,
                    message: "请输入报名审核"
                }
            });

            that.model.validatedInfo = ko.validatedObservable(that.model.audit, {
                observable: true,
                live: true,
                deep: true
            });
        },

        /**
         * 数据与视图初始化
         */
        init: function () {
            var me = this, js_end = $("#js_endtime"), js_start =  $("#js_starttime");
            this.model = ko.mapping.fromJS(this.model);
            js_start.datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText, inst) {
                    js_end.datepicker("option", "minDate", dateText);
                    me.model.search.start_reg_date(dateText);
                }
            });
            js_end.datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText, inst) {
                    js_start.datepicker("option", "maxDate", dateText);
                    me.model.search.end_reg_date(dateText);
                }
            });

            $("#checkAll").attr("checked", false);
            $("#checkAll").click(this.checkAll);

            this.observableValidate();
            this.search();
            ko.applyBindings(this);

        },
        clearSearch: function () {
            this.model.search.account('');
            this.model.search.start_reg_date('');
            this.model.search.end_reg_date('');
            this.model.search.real_name('');
            $("#js_endtime").datepicker("option", "minDate", null);
            $("#js_starttime").datepicker("option", "maxDate", null);
            this.search();
        },

        /**
         * 查询方法
         */
        search: function () {
            this.model.search.page_no(0);
            this.getList();
        },

        /**
         * 分页方法
         * @param totalCount
         * @param pageIndex
         * @param pageSize
         * @private
         */
        page: function (totalCount, pageIndex, pageSize) {
            var self = this;
            $("#pagination").pagination(totalCount, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: pageIndex,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != pageIndex) {
                        viewModel.model.search.page_no(index);
                        viewModel.getList();
                    }
                }
            });
        },
        /**
         //         * 查询学员的方法
         */
        getList: function () {
            var self = this;
            $("#checkAll").attr("checked", false);
            var search = ko.mapping.toJS(self.model.search);
            search.page = search.page_no;
            search.size = search.page_size;
            search.account = $.trim(search.account);
            search.real_name = $.trim(search.real_name);
            if (search.start_reg_date) search.start_reg_date = search.start_reg_date + 'T00:00:00';
            if (search.end_reg_date) search.end_reg_date = search.end_reg_date + 'T23:59:59';
            store.getList(search)
                .done(function (data) {

                    self.model.list(data.items);
                    self.model.totalCount(data.count);
                    viewModel.page(data.count, self.model.search.page_no.peek(), self.model.search.page_size.peek());
                });
        },

        /**
         * 全选按钮
         */
        checkAll: function () {
            var ids;
            if ($("#checkAll").attr("checked") == "checked") {
                $("input[name*='checkItem']").attr("checked", "checked");
                ids = viewModel._getCheck();
                for (var i = 0; i < ids.length; i++) {
                    viewModel._addCheck(ids[i]);
                }
            }
            else {
                ids = viewModel._getCheck();
                $("input[name*='checkItem']").attr("checked", false);
                for (var i = 0; i < ids.length; i++) {
                    viewModel._removeCheck(ids[i]);
                }
            }
        },
        _getCheck: function () {
            var ids = [];
            $("input[name=checkItem]").each(function () {
                if ($(this).attr("checked")) {
                    ids.push($(this).val());
                }
            });
            return ids;
        },
        _removeCheck: function (id) {
            for (var i = 0; i < this.model.checkList().length; i++) {
                if (this.model.checkList()[i] == id) {
                    this.model.checkList.remove(this.model.checkList()[i]);
                }
            }
        },
        _addCheck: function (id) {
            for (var i = 0; i < this.model.checkList().length; i++) {
                if (this.model.checkList()[i] == id) {
                    return;
                }
            }
            this.model.checkList.push(parseInt(id));
        },

        /**
         * 删除单个学员
         */
        deleteUser: function ($data) {
            $.fn.dialog2.helpers.confirm("确认要删除学员吗？", {
                confirm: function () {
                    store.deleteUser([$data.user_id])
                        .done(function () {
                            viewModel.model.checkList([]);
                            viewModel.getList();
                        })
                }
            });
        },
        /**
         * 批量删除学员
         */
        deleteSomeUser: function () {
            if (viewModel.model.checkList().length == 0) {
                $.fn.dialog2.helpers.alert('请选择要删除的学员');
                return;
            }
            $.fn.dialog2.helpers.confirm("确认要删除所有选中的学员吗？", {
                confirm: function () {
                    var ids = ko.mapping.toJS(viewModel.model.checkList);

                    store.deleteUser(ids)
                        .done(function () {
                            viewModel.model.checkList([]);
                            viewModel.getList();
                        })
                }
            });

        },
        /**
         * 单个审核
         */
        audit: function ($data) {
            var that = viewModel;
            that.model.audit.currentUserId($data.user_id);
            that.model.audit.comment("");
            $("#shmodal").modal("show");
        },
        /**
         * 批量审核
         */
        someAudit: function () {
            var that = viewModel;
            that.model.audit.currentUserId("");
            that.model.audit.comment("");
            if (that.model.checkList().length == 0) {
                $.fn.dialog2.helpers.alert('请选择要审核的学员');
                return;
            }
            $("#shmodal").modal("show");
        },
        checkTraineeSuccess: function () {
            this.checkTrainee(true);
        },
        checkTraineeFalse: function () {
            this.checkTrainee(false);
        },
        checkTrainee: function (pass) {
            if (!viewModel.model.validatedInfo.isValid()) {
                viewModel.model.validatedInfo.errors.showAllMessages();
                return;
            }
            var userIds = [viewModel.model.audit.currentUserId()];
            if (!viewModel.model.audit.currentUserId())
                userIds = viewModel.model.checkList();
            var data = {
                user_ids: userIds,
                comment: viewModel.model.audit.comment()
            };

            store.audit(pass, data)
                .done(function () {
                    $("#shmodal").modal("hide");
                    $.fn.dialog2.helpers.alert('审核成功');
                    if (!viewModel.model.audit.currentUserId())
                        viewModel.model.checkList([]);
                    viewModel.getList();
                });
        },


        export: function () {
            if (viewModel.model.totalCount() == 0)
                return;
            var search = ko.mapping.toJS(viewModel.model.search);
            window.open("/" + projectCode + "/trains/" + trainId + "/trainees/reporting?status=" + search.status + "&start_time=" + search.start_time + "&end_time=" + search.end_time, "_blank");
        }


    };
    $(function () {
        viewModel.init();
    })
})
(jQuery);
