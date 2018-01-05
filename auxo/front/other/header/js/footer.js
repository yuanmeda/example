;(function ($, window) {
    //课程详细数据模型
    var viewModel = {
        _init: function () {
            //ko绑定作用域
            if (document.getElementById('footer')) ko.applyBindings(this, document.getElementById('footer'));
        },
        getUrl: function (type, url) {
            switch (type) {
                /*case 0:
                 return '/e/recommends';
                 case 1:
                 return '/e/courses';
                 case 2:
                 return '/e/trains';
                 case 3:
                 return '/e/jobs';
                 case 4:
                 return '/e/cloudcourses';
                 case 5:
                 return '/' + projectCode + '/open_course';
                 case 6:
                 return '/' + projectCode + '/exam_center';
                 case 7:
                 return '/' + projectCode + '/recommend';
                 case 8:
                 return '/' + projectCode + '/train';
                 case 9:
                 return '/' + projectCode + '/specialty';*/
                case 12:
                    var formatURL = url.substring(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url;
                    return formatURL ? window.open(isLogin ? formatURL + '/101/?project_code=' + projectCode + '&__mac=' + Nova.getMacToB64(formatURL + '/101/?project_code=' + projectCode) : formatURL + '/101/?project_code=' + projectCode) : false;
                case 13:
                    return location.href = (isLogin ? (window.selfUrl || '') + '/' + projectCode + '/ImChart?headerName=' + headerName : window.portal_web_url + "/" + projectCode + '/account/login?returnurl=' + encodeURIComponent(url + '?headerName=' + headerName));
                default:
                    return location.href = url;
            }
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
