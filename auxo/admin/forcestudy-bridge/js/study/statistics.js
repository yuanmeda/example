;(function ($) {

    var service = {
        userallstat: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "tasks/stat/study",
                type: "GET",
                dataType: "json",
                data: data
            });
        }
    };
    var datePickerType = {
        "昨日学习一览": 1,
        "最近7天学习一览": 2,
        "最近30天学习一览": 3,
        "自定义日期范围": 0
    };

    var viewModel = {
        model: {
            search: {
                time_type: 0,
                start_time: "",
                end_time: "",
                sort_name: "study_course",                 // 排序字段
                sort_type: "desc",                          // 排序类型
                page_no: 0,
                page_size: 10
            },
            dateRangePickerValue: "",
            spur: {
                user_id: "",
                type: ""
            },
            time_type: 0,
            time_label: "自定义日期范围",
            list: [],
            has_inited: false
        },
        store: {
            search: {}
        },
        initViewModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.initEvents();
            this.list(0);
            ko.applyBindings(this, document.getElementById("js_fs_body"));
        },
        initEvents: function () {
            var that = this;
            $("#dateRangePicker").daterangepicker({
                ranges: {
                    "昨日学习一览": [moment().subtract(1, "days"), moment().subtract(1, "days")],
                    "最近7天学习一览": [moment().subtract(7, "days"), moment().subtract(1, "days")],
                    "最近30天学习一览": [moment().subtract(30, "days"), moment().subtract(1, "days")]
                },
                format: "YYYY-MM-DD",
                startDate: moment().subtract(1, "days"),
                endDate: moment().subtract(1, "days"),
                separator: " 至 ",
                showDropdowns: true,
                //minDate: moment().subtract(10, "Years"),
                maxDate: moment().add(1, "days"),
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: '从',
                    toLabel: '至',
                    customRangeLabel: '自定义日期范围'
                }
            }, function (beginTime, endTime, rangeName) {
                var search = that.model.search,
                    dateRangePickerValue = that.model.dateRangePickerValue,
                    beginTimeFormat = beginTime.format("YYYY-MM-DD"),
                    endTimeFormat = endTime.format("YYYY-MM-DD");
                search.time_type(datePickerType[rangeName]);
                search.start_time(beginTimeFormat);
                search.end_time(endTimeFormat);

                that.model.time_label(rangeName);

                // input text will not be updated when we click outside after calling out datePickerRange
                // on it's initialization, but it will notify this fn whenever it is going to close.
                // For that, we try to ensure a consistent performance by updating manually after initialization.
                if (!dateRangePickerValue.peek()) {
                    dateRangePickerValue(beginTimeFormat + " 至 " + endTimeFormat);
                }
            });
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
         * 取任务详情列表
         */
        list: function (pageNo) {
            if(!this.model.search.start_time.peek()
                || !this.model.search.end_time.peek())
            return;
            if (pageNo != null) {
                this.model.search.page_no(pageNo);
            }
            var search = ko.mapping.toJS(this.model.search),
                that = this;
            this.model.time_type(search.time_type);
            this.store.search = search;
            service.userallstat(search).then(function (data){
                that.model.list(data.items);
                that.page(data.total);
            }).always(function () {
                that.model.has_inited(true);
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
        clearSearch: function () {
            var data = ko.mapping.toJS(this.model.search);
            fs.ko.fromJS(this.model.search, {
                page_no: data.page_no,
                page_size: data.page_size,
                time_type: datePickerType["自定义日期范围"],
                sort_name: data.sort_name,
                sort_type: data.sort_type
            });
            $("#dateRangePicker").val("");
        },
        /**
         * 导出Excel
         */
        exportExcel: function () {
            var search = this.store.search,
                exportUrl = fs.auxo.getProjectCodeUrl(fs.API.FORCE_STUDY + "tasks/stat/export/study");
            // 数据流方式导出Excel
            fs.util.postForm(exportUrl, search);
        },
        /**
         * 显示鼓励/鞭策弹出框
         * @param item
         * @param type 0-鼓励，1-鞭策
         */
        showSpurModal: function (item, type) {
            this.model.spur.user_id(item.user_id);
            this.model.spur.type(type);
            $("#js_fs_spurModal").modal("show");
        },
        /**
         * 关闭鼓励/鞭策弹出框
         */
        hideSpurModal: function () {
            $("#js_fs_spurModal").modal("hide");
        }
    };

    $(function () {
        viewModel.initViewModel();
    })


}(jQuery));