;(function ($, viewModel) {

    "use strict";

    var global = this || (0, eval)("this"),
        task_id = global["task_id"];

    var chart = {
        /**
         * 渲染柱状图
         * @param dom
         * @param opts  opts.title 标题
         *              opts.legendData X轴坐标label
         *              opts.seriesData 数据
         */
        line: function (dom, opts) {
            var option = {
                title : {
                    text: opts.title,
                    left:'center'
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        type: "shadow"
                    }
                },
                legend: {
                    show: false
                },
                xAxis: [{
                    type: "category",
                    data: opts.legendData
                }],
                yAxis: [{
                    type: "value"
                }],
                series : [
                    {
                        name: opts.title,
                        type: 'bar',
                        data: opts.seriesData,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            var myChart = echarts.init(dom);
            myChart.setOption(option);
        }
    };

    $.extend(true, viewModel, {
        model: {
            search: {
                page_no: 0,
                page_size: 10,
                sort_name: "finish_course",             // 排序字段
                sort_type: "desc",                      // 排序类型
                task_id: task_id                        // 任务ID
            },
            taskStat: {
                // 需参与学习人数
                join_study_count: 0,
                // 已开始学习人数
                begin_study_count: 0,
                // 已完成学习人数
                finish_study_count: 0,
                // 任务完成百分比
                task_finish_percent: 0,
                // 任务剩余时间
                task_rest_time: 0,
                // 未参与学习人数
                no_join_study_count: 0,
                // 各任务完成进度区间的人数
                task_finish_stat_item_list: []
            },
            has_inited: false,
            list: []                                    // 任务详情列表
        },
        store: {
            search: {}
        },
        /**
         * 初始化viewmOdel
         */
        initViewModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.list();
            this.gettaskfinishstat();
            ko.applyBindings(this, $("#js_fs_body")[0]);
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
            if (pageNo != null) {
                this.model.search.page_no(pageNo);
            }
            var search = ko.mapping.toJS(this.model.search),
                that = this;
            this.store.search = search;
            service.usertaskdetailslist(search).then(function (data){
                that.model.list(data.items);
                that.page(data.total);
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
         * 初始化统计图表
         */
        initChart: function () {
            var data = this.model.taskStat.task_finish_stat_item_list() || [],
                legendData = [],
                seriesData = [],
                colors = ["#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#2c4d75", "#772c2a"];
            $.each(data || [], function (i, item) {
                var itemKey = (item.item_key || "").replace(/([\u4E00-\u9FA5\uF900-\uFA2D]{4})/g, "$1\n");
                legendData.push(itemKey);
                seriesData.push({
                    name: itemKey,
                    value: item.item_value,
                    itemStyle: {
                        normal: {
                            color: colors[i%7]
                        }
                    }
                });
            });
            chart.line(document.getElementById('chart-line'), {
                title: "学习完成情况统计",
                legendData: legendData,
                seriesData: seriesData
            });
        },
        /**
         * 导出Excel
         */
        exportExcel: function () {
            var search = this.store.search,
                exportUrl = fs.auxo.getProjectCodeUrl(fs.API.FORCE_STUDY + "tasks/users/stat/export/details");
            // 数据流方式导出Excel
            fs.util.postForm(exportUrl, search);
        },
        /**
         * 获取任务完成情况统计
         */
        gettaskfinishstat: function () {
            var that = this;
            service.gettaskfinishstat({
                task_id: task_id
            }).then(function (data) {
                fs.ko.fromJS(that.model.taskStat, data, true);
                that.initChart();
            }).always(function () {
                that.model.has_inited(true);
            });
        }
    });

    $(function () {
        viewModel.initViewModel();
    });

}(jQuery, (window.viewModel || (window.viewModel = {}))));