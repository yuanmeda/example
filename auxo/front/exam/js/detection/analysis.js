(function ($, window) {

    /**
     * 参数配置
     * @espServer： esp_developer内容服务地址
     * @playerCode 定制播放器编码 [测试环境：online_integration_player; 正式环境：basic_pack_player_daily]
     * @renderCode 作答分析渲染器编码 [SpeakingTrainingAnalysis]
     * @containerCode 作答分析渲染容器
     */
    var espServer = "http://cs.101.com/v0.1/static/esp_developer",
        playerCode = "SpeakingTrainingPlayer",
        renderCode = "SpeakingTrainingAnalysis",
        containerCode = "#container";


    var viewModel = {
        model: {
            popFailTip: ko.observable(false)
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko绑定作用域
            ko.applyBindings(this);
            window.TokenUtils.init();

            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                originalOptions.bodyProxy = false;
                originalOptions.headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                };
            });

            $.ajaxSetup({
                beforeSend: function (xhr, opts) {
                    if(opts.url.indexOf("/answers") >= 0 || opts.url.indexOf('/exam/v2/ref_path') >= 0 || opts.url.indexOf('/exam/papers/coursewareobjects') >= 0 ) {
                        var host = opts.url.split('//')[1].split('/')[0];
                        var shortUrl = opts.url.split(host)[1];

                        xhr.setRequestHeader('Authorization', Nova.getMacToken(opts.type, shortUrl, host));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                }
            });
            //程序入口
            $.when(this.getPlayerVersion(), this.getRenderModel()).done(function (playerVersion, renderModel) {
                //启动作答分析
                this.startup(playerCode, playerVersion, renderModel);
            }.bind(this)).fail(function () {
                // TODO 异常情况由业务方处理
                this.showFailDialog();
            }.bind(this));
        },
        /**
         * 启动作答分析
         * @param playerCode 定制播放器编码
         * @param playerVersion 定制播放器版本号
         * @param renderModel 作答分析渲染数据
         */
        startup: function(playerCode, playerVersion, renderModel) {
            //Step1. 中间层组件的配置
            Midware.globalConfig({
                BasePath: espServer,
                LanguageBasePath: "languages",
                StyleBasePath: "style",
                AssetsBasePath: ""
            });
            Midware.componentConfig(playerCode, playerVersion);
            Midware.startup({
                i18n: {
                    configPath: ["players", playerCode, playerVersion, "languages"].join("/"),
                    configFile: "language_default.json"
                },
                extend: {
                    context: "_"
                },
                style: {
                    configPath: ["players", playerCode, playerVersion].join("/"),
                    containVersion: true
                },
                async: false
            });

            //Step2. 中间层容器的配置
            Midway.config({
                BasePath: espServer,
                BundlePath: "presenters"
            });

            //Step3. 执行渲染
            Midway.runMidway({code: playerCode, version: playerVersion}).done(function () {
                var instance = new Midway.Bundle({
                    el: containerCode,
                    launcher: renderCode,
                    model: renderModel
                });

                instance.start();
            });
        },

        /**
        * 获取定制播放器版本号
        */
        getPlayerVersion: function() {
            var dtd = $.Deferred();
            $.ajax({
                url: "http://esp-developer-service.edu.web.sdp.101.com/v0.1/players/" + playerCode + "/latest_version",
                dataType: "json",
                success: function (config) {
                    dtd.resolve(config.version);
                },
                error: function (err) {
                    dtd.reject(err);
                }
            });

            return dtd;
        },


        /**
         * 获取习题地址host
         */
        getQuestionHost: function() {
            var dtd = $.Deferred();
            $.ajax({
                url: window.examWebfrontUrl + '/' + window.projectCode + '/exam/v2/ref_path',
                dataType: "json",
                success: function (data) {
                    dtd.resolve(data);
                },
                error: function (err) {
                    dtd.reject(err);
                }
            });

            return dtd;
        },

        /**
         * 获取习题地址
         */
         getQuestionUrl: function() {
            var dtd = $.Deferred();
            var data = [window.questionId];
            $.ajax({
                url: window.examWebfrontUrl + '/' + window.projectCode + '/exam/papers/coursewareobjects',
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(data) || null,
                success: function (data) {
                    dtd.resolve(data);
                },
                error: function (err) {
                    dtd.reject(err);
                }
            });

            return dtd;
        },
        /**
         * 异常弹窗提示
         */
        showFailDialog: function () {
            this.model.popFailTip(true);
        },
        hideFailTipPop: function () {
            this.model.popFailTip(false);
        },
        /**
         * 获取用户作答结果
         */
        getAnswerData: function() {
            var dtd = $.Deferred();
            $.ajax({
                url: window.auxoExamUrl + '/v1/m/exams/' + window.examId + '/sessions/' + window.sessionId + '/answers',
                dataType: "json",
                type: "POST",
                data: JSON.stringify([window.questionId]),
                success: function (data) {
                    if(data && data.length>0){
                        dtd.resolve(data);
                    }else {
                        this.showFailDialog();
                    }
                }.bind(this),
                error: function (err) {
                    dtd.reject(err);
                }
            });

            return dtd;
        },
        /**
         * 构建作答分析渲染数据模型
         */
        getRenderModel: function() {
            var dtd = $.Deferred();
            $.when(this.getQuestionHost(), this.getQuestionUrl(), this.getAnswerData()).done(function (hostData, urlData, answerData) {
                var questionUrl = '';
                var answerObj = answerData[0].qti_answer || {};
                if(urlData.length>0 && urlData[0].location){
                    questionUrl = urlData[0].location;
                    if (urlData[0].location.indexOf('ref-path') > -1 && hostData && hostData.ref_path) {
                        questionUrl = urlData[0].location.replace(/^\$\{ref-path\}/i, hostData.ref_path);
                    }
                }
                var renderModel = {
                    question_url: questionUrl,    //习题地址（同：题目作答时的习题地址）
                    answer_data: answerObj        //用户作答结果（同：教学颗粒题目作答时提交的数据）
                };
                dtd.resolve(renderModel);
            }).fail(function () {
                this.showFailDialog();
            }.bind(this));

            return dtd;
        }
    };
    $(function () {
        viewModel._init();
    });
})(jQuery, window);
