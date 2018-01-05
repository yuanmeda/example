;
(function (window, $) {
    'use strict';

    var isApp = false;
    var WaitImage = {
        show: function () {
            if (document.getElementById("loadingdiv_index") != undefined)
                document.getElementById("loadingdiv_index").style.display = 'block';
        },
        hide: function () {
            if (document.getElementById("loadingdiv_index") != undefined)
                document.getElementById("loadingdiv_index").style.display = 'none';
        }
    };

    var defaultLocation = "zh";
    var defaultCsPath = "/edu_product/esp";
    if (typeof icCreatePlayer === "undefined") {
        alert('找不到播放器的版本号，请检查player-version参数');
    }
    var $request = icCreatePlayer.request;

    var resolveUrl = function (url, defaultPath) {
        var refPath = $request("ref-path") || defaultPath; //"http://sdpcs.beta.web.nd/v0.1/static";

        //临时解决tomcat问题
        var _tmp = url.replace(/^\$\{ref-path\}/i, refPath);
        if (_tmp.indexOf('{ref-path}') >= 0)
            _tmp = url.replace(/^\\$\{ref-path\}/i, refPath);
        return _tmp;
    };

    var sender = function (config) {
        return $.ajax($.extend(config, {
            type: "get",
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            cache: false
        }));
    }

    var getPlayerSender = {
        "ebook": "ebooks",
        "coursewareobject": "coursewareobjects",
        "courseware": "coursewares",
        "lessonplans": "lessonplans"
    };


    //设置config.json的在线路径
    var getPlayerCode = function (data) {
        var defer = $.Deferred();
        var player_code = $request('player-code') || 'nd_icr_statistic_dev';
        if (player_code) {
            var ver = '';
            var uri = 'http://esp-developer-service.edu.web.sdp.101.com/v0.1/players/' + player_code + '/latest_version?state=' + ($request('state') || 'ONLINE');
            sender({
                url: uri
            }).always(function (data, status) {
                if (status == 'success') {
                    ver = data.version;
                }
                defer.resolve(ver, player_code);
            });
        } else {
            defer.resolve("");
        }
        return defer.promise();
    };

    var getUrl = function (data) {
        var defer = $.Deferred();
        var mainUrl = data.main_url;
        if (mainUrl) {
            defer.resolve(mainUrl, "");
        } else if (data.page_url) {
            defer.resolve("", data.page_url);
        } else {
            var type = data.type || "courseware";
            sender({
                url: "http://esp-lifecycle.web.sdp.101.com/v0.6/" + (getPlayerSender[type] || type) + "/a8440ffb-a199-4c83-af25-305582b7bff9?include=TI&isAll=true"
            }).done(function (data) {
                defer.resolve(data.tech_info.href.location, "");
            }).fail(function () {
                $("#loadingdiv_index").html('获取main地址错误');
                defer.reject();
            });
        }
        return defer.promise();
    };


    window.ICplayerBridge.onAnswerChange = function (callback) {
        callbacks.push(callback);
    }

    var player, callbacks = [];
    var store = {
        cs: {
            path: function () {
                return $.ajax({
                    url: '/' + projectCode + '/exam/v2/ref_path',
                    type: "GET",
                    dataType: "json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: false,
                    contentType: "application/json;charset=utf-8",
                    cache: false,
                    traditional: true,
                });
            }
        },
        questions: {
            info: function (qids) {
                return $.ajax({
                    url: '/' + projectCode + "/exam/papers/coursewareobjects",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(qids),
                    contentType: "application/json;charset=utf-8",
                    cache: false,
                    traditional: true
                });
            }
        }
    }

    var viewModel = {
        init: function (data) {
            $.when(getPlayerCode(data), getUrl(data)).done(function (playerCode, url) {
                var ver = playerCode[0];
                var player_code = playerCode[1];
                var mainUrl = url[0] && resolveUrl(url[0], data.ref_path);
                var pageUrl = url[1] && resolveUrl(url[1], data.ref_path);
                if (ver) {
                    player_code = ($request('ref-path-addon') || 'http://cs.101.com/v0.1/static/esp_developer') + '/players/' + player_code + '/' + ver + '/';
                    var playerConfig = {
                        'refPath': {
                            "ref-path": data.ref_path,
                            "ref-path-addon": "http://cs.101.com/v0.1/static/esp_developer"
                        },
                        'playerCode': player_code,
                        "location": {
                            "default": defaultLocation
                        },
                        'url': mainUrl ? (mainUrl + '?' + new Date().getTime()) : '',
                        'pageUrl': pageUrl ? (pageUrl + '?' + new Date().getTime()) : '',
                        'hidePage': "footer",
                        'waitDialog': WaitImage,
                        'callbackList': {
                            onAnswerQuestion: $.proxy(function (id, answer) {
                                
                            }, viewModel)
                        }
                    };
                    player = icCreatePlayer.create(playerConfig);
                    window.player = player;
                    player.render('#_icplayer');
                } else {
                    $('#loadingdiv_index').html('config.json找不到');
                }
            });
        }
    };

    $(function () {
        if (typeof (MathJax) !== 'undefined') {
            MathJax.Hub.Config({
                showMathMenu: false // 不显示公式右键长安菜单
            });
        }

        var qids = [question_id];
        $.when(store.questions.info(qids), store.cs.path()).done(function (info, path) {
            info = info[0], path = path[0];

            var data = {
                "answer": null,
                "type": 'coursewareobject',
                "main_url": info[0].location,
                "ref_path": path.ref_path,
                "isAnalysis": false
            };

            return viewModel.init(data);
        });
    });

})(window, jQuery);