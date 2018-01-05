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
        var refPath = $request("ref-path") || defaultPath;//"http://sdpcs.beta.web.nd/v0.1/static";

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
        exam: {
            info: function (data) {
                return $.ajax({
                    url: '/' + projectCode + '/v1/m/exams/' + exam_id + '/sessions/' + session_id,
                    type: "GET",
                    dataType: "json",
                    data: JSON.stringify(data),
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
            },
            getAnswer: function (qids) {
                return $.ajax({
                    url: '/' + projectCode + '/v2/m/exams/' + exam_id + '/sessions/' + session_id + '/answers?resource_type=assessment_courseware_object',
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(qids),
                    contentType: "application/json;charset=utf-8",
                    cache: false,
                    traditional: true
                });
            },
            setAnswer: function (answer) {
                return $.ajax({
                    url: '/' + projectCode + '/v2/m/exams/' + exam_id + '/sessions/' + session_id + '/answers?resource_type=assessment_courseware_object',
                    type: "PUT",
                    dataType: "json",
                    data: JSON.stringify(answer),
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
                            "onAnswerQuestion": $.proxy(function (id, answer) {
                                var answerData = {
                                    'qti_answer': answer,
                                    'id': question_id,
                                    'qv': 0
                                };
                                store.questions.setAnswer([answerData]);

                                for (var i = 0; i < callbacks.length; i++) {
                                    callbacks[i].apply(window, answerData);
                                }

                                this.showAnswer({
                                    'answer': answerData
                                });

                                store.exam.info().done($.proxy(function (session) {
                                    if (session.status > 8 && session.status < 112) {
                                        this.lockPlayer();
                                    }
                                }, viewModel));

                                return true;
                            }, viewModel),
                            /**
                             * 颗粒调用这个回调，将录音文件传递给测评服务
                             * @params audioStream 二进制的数据流
                             * @params callback 
                             */
                            "onSaveRecordFile": $.proxy(function(audioStream, callback) {
                                // Step 1：这里做保存文件到CS



                                /**
                                 * Step 2: 回调callback将录音文件地址传递给颗粒，例如：
                                 * 
                                 * callback({
                                 *     cs_path: "http://cs.101.com/download/00000-0000000-00000-0000"
                                 * })
                                 */
                            })
                        }
                    };
                    player = icCreatePlayer.create(playerConfig);
                    window.player = player;
                    player.render('#_icplayer');

                    if (data.answer && data.answer.qti_answer) {
                        player.getController().getPlayerEvent().addEventListener("PresenterLoaded", $.proxy(function (eventname, eventData) {
                            window.console && console.log('PresenterLoad - TEST');

                            this.showAnswer(data);
                            if (data.isAnalysis) {
                                this.lockPlayer();
                            }
                        }, viewModel));
                    }

                    if (!data.isAnalysis) {
                        window.setInterval($.proxy(function () {
                            $.when(store.exam.info(), store.questions.getAnswer([question_id])).done($.proxy(function (session, answer) {
                                session = session[0], answer = answer[0];
                                if (session.status > 8 && session.status < 112) {
                                    this.showAnswer({
                                        'answer': answer[0]
                                    });
                                    this.lockPlayer();
                                }
                            }, viewModel));
                        }, viewModel), 30000);
                    }
                } else {
                    $('#loadingdiv_index').html('config.json找不到');
                }
            });
        },
        lockPlayer: function () {
            window.player.startFlow('SetQuestionStatus', {
                'status': 'lock'
            });
        },
        showAnswer: function (data) {
            if (data && data.answer) {

                var answer = null;
                for (var i in data.answer.qti_answer.answers) {
                    answer = data.answer.qti_answer.answers[i]
                }

                player.startFlow('PreviewShowCorrectAnswer', {
                    'finish': true,
                    'whoAnswer': 'special',
                    'specialAnswer': answer
                });
            }
        }
    };

    $(function () {
        if (typeof (MathJax) !== 'undefined') {
            MathJax.Hub.Config({
                showMathMenu: false //不显示公式右键长安菜单
            });
        }

        var qids = [question_id];
        $.when(store.exam.info(), store.questions.info(qids), store.cs.path(), store.questions.getAnswer(qids)).done(function (session, info, path, answer) {
            info = info[0], path = path[0], answer = answer[0], session = session[0];

            var data = {
                "answer": answer && answer.length > 0 ? answer[0] : null,
                "type": 'coursewareobject',
                "main_url": info[0].location,
                "ref_path": path.ref_path,
                "isAnalysis": session.status > 8 && session.status < 112 ? true : false
            };

            return viewModel.init(data);
        });
    });

})(window, jQuery);