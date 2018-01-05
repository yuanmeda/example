/**
 * Created by Administrator on 2016/12/29 0029.
 */
(function ($) {
    var mac = Nova.getMacToB64(barrierUrl + '/');
    var params = {
        __mac: mac,
        barrier_project_id: barrierId,
        barrier_project_name: barrierName,
        project_code: projectCode,
        project_id:projectId,
        __return_url: 'http://' + window.location.host + '/' + projectCode + '/mystudy/user_center'
    };
    window.barrierPassWrapped.createAndRender('#barrier', params);
})(jQuery);