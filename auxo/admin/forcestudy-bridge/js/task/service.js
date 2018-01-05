;(function ($, service) {

    "use strict";

    $.extend(true, service, {
        // 任务查询
        list: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "tasks/search",
                type: "GET",
                dataType: "json",
                data: data
            });
        },
        // 获取任务详情
        get: function (task_id) {
            return $.ajax({
                url: fs.API.forceStudy("tasks/{task_id}", { task_id: task_id }),
                type: "GET",
                dataType: "json"
            });
        },
        // 作废任务
        cancelTask: function (task_id) {
            return $.ajax({
                url: fs.API.forceStudy("tasks/{task_id}", { task_id: task_id }),
                type: "DELETE"
            });
        },
        // 获取任务完成情况统计
        gettaskfinishstat: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "tasks/stat/finish",
                type: "GET",
                dataType: "json",
                data: data
            });
        },
        // 单任务学员学习详情列表
        usertaskdetailslist: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "tasks/users/stat/details",
                type: "GET",
                dataType: "json",
                data: data
            });
        }
    });

}(jQuery, (window.service || (window.service = {}))));