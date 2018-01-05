;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    var SPECIALTY_PLAN_ID = GLOBAL['specialtyPlanId'];


    var service = {
        /**
         * 查询课程图谱
         * @param specialtyPlanId
         * @returns {*}
         */
        getCourseMap: function (specialtyPlanId) {
            return $.ajax({
                url: '/' + PROJECT_CODE + '/specialty/plans/' + specialtyPlanId + '/course_map',
                type: 'GET',
                dataType: 'json'
            });
        }
    };


    $(function () {

        service.getCourseMap(SPECIALTY_PLAN_ID).then(function (data) {
            var $container = $('#container');
            new Altas($container, {
                data: data,
                alias: {
                    id: 'id',           // ID别名
                    title: 'name',      // 标题别名
                    relyId: 'rely_id'   // 依赖ID别名
                },
                align: 'h',
                setting: {
                    cell: {
                        width: 200
                    },
                    intervalV: 100,
                    intervalH: 50
                }
            });
        });

    });

}());