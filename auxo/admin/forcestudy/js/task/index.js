;(function ($, viewModel) {

    "use strict";

    var global = this || (0, eval)("this");

    $.extend(true, viewModel, {
        model: {
            search: {
                page_no: 0,                     // 页码
                page_size: 10,                  // 分页大小
                title: "",                      // 任务名称
				create_user_name:"",            // 创建者名称
                require_type: "",               // 学习要求，1-必修， 2-选修
                task_status: "",                // 任务状态， 1-作废， 2-未开始， 3-已开始， 4-已结束
                start_time: "",                 // 时间范围开始
                end_time: "",                   // 时间范围结束
                sort_name: "create_time",// 排序字段
                sort_type: "desc"              // 排序类型
            },
            disable_task_id: "",                // 作废任务的ID
            has_inited: false,                  // viewModel是否初始化完成
            list: []                            // 任务数据列表
        },
        /**
         * 初始化viewModel
         */
        initViewModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.list(0);
            ko.applyBindings(this, $("#js_fs_body")[0]);
        },
        /**
         * 改变查询条件[学习要求]的值
         * @param value
         */
        changeRequireType: function (value) {
            this.model.search.require_type(value);
        },
        /**
         * 修改排序规则
         * @param sortName
         */
        changeSort: function (sortName) {
            var searchSortName = this.model.search.sort_name,
                searchSortType = this.model.search.sort_type;
            if (searchSortName() == sortName) {
                if (searchSortType() == "desc") {
                    searchSortType("asc");
                } else {
                    searchSortType("desc");
                }
            } else {
                searchSortName(sortName);
                searchSortType("desc");
            }
            this.list(0);
        },
        /**
         * 取数据列表
         * @param pageNo 页码
         */
        list: function (pageNo) {
            if (pageNo != null) {
                this.model.search.page_no(pageNo);
            }
            var search = ko.mapping.toJS(this.model.search),
                that = this;
            service.list(fs.util.removeEmpty(search)).then(function (data) {
                that.model.list(TaskInfo.compat(data.items));
                that.page(data.total);
            }).always(function () {
                that.model.has_inited(true);
            });
        },
        /**
         * 清空查询区域
         */
        clearSearch: function () {
            var data = ko.mapping.toJS(this.model.search);
            fs.ko.fromJS(this.model.search, {
                page_no: data.page_no,
                page_size: data.page_size,
                sort_name: data.sort_name,
                sort_type: data.sort_type
            });
        },
        /**
         * 生成分页脚本
         * @param totalCount 总记录数
         */
        page: function (totalCount) {
            var that = this,
                currentPageIndex = this.model.search.page_no(),
                pageSize = this.model.search.page_size();
            fs.util.generalBackenPagination($("#js_fs_pagination"), totalCount, {
                items_per_page: pageSize,
                current_page: currentPageIndex,
                callback: function (index) {
                    if (index != currentPageIndex) {
                        that.list(index);
                    }
                }
            });
        },
        /**
         * 显示任务作废Modal
         * @param item 任务对象
         */
        showDisableTaskModal: function (item) {
            this.model.disable_task_id(item.id);
            $("#disableTaskModal").modal("show");
        },
        /**
         * 执行任务作废请求
         */
        cancelTask: function (){
            var that = this;
            $("#disableTaskModal").modal("hide");
            service.cancelTask(this.model.disable_task_id()).then(function () {
                that.list();
            });
        }
    });

    $(function () {
        // 初始化日期插件
        $(".datetime").datetimepicker({
            language: 'zh-CN',
            todayBtn: true,
            autoclose: true,
            todayHighlight: true,
            format: 'yyyy-mm-dd',
            minView: "month",
            pickerPosition: "bottom-left"
        });
        fs.util.enterSubmitForm($(".search-form"));
        viewModel.initViewModel();
    });

}(jQuery, (window.viewModel || (window.viewModel = {}))));