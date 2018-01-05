;(function ($){

    "use strict";

    var global = this || (0, eval)("this");

    global.UserTaskDetail = function (data) {

    };

    $.extend(true, UserTaskDetail, {
        getFinishPercent: function (item) {
            if (item.task_finish_percent >= 100) {
                return "已完成";
            } else {
                return (fs.fmt.range(item.task_finish_percent, 0, 100)) + "%";
            }
        }
    });

}(jQuery));