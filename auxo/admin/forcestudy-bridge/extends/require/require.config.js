;(function () {


    window.requireConfig = function (staticUrl, staticVersion) {
        return {
            baseUrl: staticUrl,
            urlArgs: "v=" + (staticVersion || (new Date()).getTime()),
            paths: {
                text: "auxo/addins/require-text/v2.0.14/text",

                jquery: "auxo/addins/jquery/v1.11.1/jquery.min",

                knockout: "auxo/addins/ko/v3.4.0/knockout.min",
                koMapping: "auxo/addins/ko-mapping/v2.4.1/knockout.mapping.min",

                // ko组件所在目录
                koComponent: "auxo/admin/forcestudy-bridge/extends/ko/components",
                // 取component模版地址，相对于forcestudy-bridge/components目录
                koComponentTemplateUrl: (function () {
                    var projectCode = "";
                    if (window.project_code) {
                        projectCode = window.project_code;
                    } else if (window.projectCode) {
                        projectCode = window.projectCode;
                    } else {
                        var array = location.pathname.split("/");
                        if (array.length >= 3 && array[1] && array[2]) {
                            projectCode = array[1];
                        }
                    }
                    return "/" + projectCode + "/forcestudy2/component/get?path=";
                }()),

                fs: "auxo/admin/forcestudy-bridge/extends/fs/fs"
            },
            shim: {
                jquery: {
                    exports: "$"
                }
            }
        };
    };

}());