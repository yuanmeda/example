;(function ($, viewModel) {

    "use strict";

    var global = this || (0, eval)("this"),
        task_id = global["task_id"];

    $.extend(true, viewModel, {
        model: {
            task: new TaskInfo(),       // 任务对象
            show_user_count: 100,       // 默认显示参与任务的100个用户
            has_inited: false
        },
        initViewModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.getTask(task_id);
            ko.applyBindings(this, $("#js_task_detail")[0]);
        },
        /**
         * 取任务详情
         * @param task_id 任务ID
         */
        getTask: function (task_id) {
            var that = this;
            service.get(task_id).then(function (data) {
                fs.ko.fromJS(that.model.task, data, true);
            }).always(function () {
                that.model.has_inited(true);
            });
        }
    });

    $(function () {
        viewModel.initViewModel();
    });

}(jQuery, (window.viewModel || (window.viewModel = {}))));