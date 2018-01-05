;
(function () {

    var GLOBAL = (0, eval)('this');

    var PROJECT_CODE = GLOBAL['projectCode'];

    var SPECIALTY_PLAN_ID = GLOBAL['specialtyId'];


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
        return;
        service.getCourseMap(SPECIALTY_PLAN_ID).then(function (data) {
            var $container = $('#container');
            if (!data || !data.length) {
                $container.html('<div class="item-nodata">无图谱数据</div>');
                return;
            }
            new Altas($container, {
                data: data,
                alias: {
                    id: 'id',           // ID别名
                    title: 'name',      // 标题别名
                    relyId: 'rely_id'   // 依赖ID别名
                },
                style: {
                    title: {
                        font: '16px/48px "microsoft yahei"',
                        color: '#38adff'
                    },
                    shape: {
                        stroke: '#ddd',
                        fill: '#ddd'
                    },
                    arrow: {
                        stroke: '#38adff',
                        'stroke-width': 1
                    }
                }
            });
        });


    });

}());