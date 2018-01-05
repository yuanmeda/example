void

    function () {
        //标记是否单点登录
        function transfer_token() {
            ucManager.isLogin().then(function (res) {
                var myDate = new Date();
                myDate.setTime(myDate.getTime() - 1000); //设置时间
                if (res == "true") {
                    ucManager.getAccessToken().then(function (access_token) {
                        if (access_token != "") {
                            document.cookie = "sso_version=; expires=" + myDate.toGMTString();
                            document.cookie = "sso_version=1.0" + ";path=/" + projectCode;
                        }
                    });
                }
            });
        }

        window.go_through_uc = false;
        $(function () {
            if (window.ucComponent_jsonpComponentItem && ucComponent_jsonpComponentItem.indexOf(window.location.host + "/" + projectCode) >= 0) {
                go_through_uc = true;
                transfer_token();
            }
        });
    }();