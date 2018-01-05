;(function ($){

    "use strict";

    var global = this || (0, eval)("this");

    global.TaskInfo = function (data) {
        $.extend(true, this, {
            // 任务uuid
            id: "",
            // 任务名称
            title: "",
			//创建者
			create_user_name:"",
            // 任务描述
			//创建者
			create_user_name:"",
            description: "",
            // 任务类型1普通任务2项目任务3晋升晋级任务
            task_type: "",
            // 学习要求1必修2选修
            require_type: "",
            // 任务状态1作废 2正常
            task_status: "",
            // 实际的任务状态1- 已作废,2-未开始,3-进行中,4-已结束
            task_status_real: "",
            // 任务时间限制1不限时间2限定时间
            time_limit_type: "",
            // 任务时限起始时间
            time_limit_begin: "",
            // 任务时限截止时间
            time_limit_end: "",
            // 学习频率1不限2每日学习3每周学习
            study_freq: "",
            // 每次要求学习时长数单位秒
            everytime_study_mins: "",
            // 学习顺序 1不限顺序 2按顺序学习
            study_order_type: "",
            // 所属项目id
            task_workgroup_id: "",
            // 所属项目名称
            task_workgroup_name: "",
            // 所属职级id
            task_joblevel_id: "",
            // 所属职级
            task_joblevel_name: "",
            // 课程数量
            course_count: "",
            // 任务内学员数
            user_count: "",
            // 是否已查阅，1-未查阅，2-已查阅
            view_status: "",
            // 任务内公开课程/培训详情
            task_details_list: [],
            // 任务内学员
            user_list: []
        }, data);
    };

    $.extend(true, TaskInfo, {
        // 任务状态
        TASK_STATUS: ['', '作废', '正常'],
        // 任务状态的实际描述
        TASK_STATUS_REAL: ['', '已作废', '未开始', '进行中', '已结束'],
        // 任务类型
        TASK_TYPE: ['', '普通任务', '项目任务', '晋升晋级任务'],
        // 学习要求
        REQUIRE_TYPE: ['', '必修', '选修'],
        // 任务时间限制
        TIME_LIMIT_TYPE: ['', '不限时间', '限定时间'],
        // 学习频率
        STUDY_FREQ: ['', '不限', '每日学习', '每周学习'],
        // 学习顺序
        STUDY_ORDER_TYPE: ['', '不限学习顺序', '按顺序学习'],

        // 取实际的任务状态
        getTaskStatusReal: function (item) {
            if (item.task_status == 1) {
                return 1;
            } else {
                // 如果是不限时间的任务类型，始终都是进行中
                if (item.time_limit_type == 1){
                    return 3;
                } else {
                    var now = new Date((new Date()).format("yyyy/MM/dd")).getTime(),
                        timeBegin = fs.util.toDate(item.time_limit_begin).getTime(),
                        timeEnd = fs.util.toDate(item.time_limit_end).getTime();
                    if (timeBegin > now) {
                        return 2;
                    } else if (timeEnd >= now) {
                        return 3;
                    } else {
                        return 4;
                    }
                }
            }
        },
        compat: function (data) {
            if (data) {
                var type = $.type (data);
                if (type === "array") {
                    for (var i = 0, l = data.length; i < l; i++){
                        TaskInfo.compat(data[i]);
                    }
                } else if (type === "object") {
                    data.task_status_real = TaskInfo.getTaskStatusReal(data);
                }
            }
            return data;
        }
    });

}(jQuery));