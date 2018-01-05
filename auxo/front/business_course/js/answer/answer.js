(function ($) {
    /**
     * 作答组件的简单封装，初始化配置参考下面
     * {
     *     "serviceHosts": {
     *         "examApi":  新考试API
     *         "resourceGateway": 资源网关URL,
     *         "answerGateway": 答题网关URL,
     *         "markApi": 批改API
     *     },
     *     "staticUrl": 静态站URL,
     *     "language": 项目当前配置的语言,
     *     "macKey": 当前登陆用户的MacKey,
     *     "userId": 当前登陆用户的标识,
     *     "element": 作答组件要渲染的元素占位符,
     *     "sessionId": 考试会话标识
     * }
     * 
     * @param {any} config 
     */
    var Answer = function (config, callback) {
        this.bussiness = null;
        this.config = $.extend({
            "serviceHosts": {
                "examApi": window.eLearningExamApiDomain,
                "resourceGateway": window.resourceServiceDomain,
                "answerGateway": window.eLearningAnswerApiDomain,
                "markApi": window.eLearningMarkApiDomain
            },
            "returnUrl": "",
            "staticUrl": window.staticurl,
            "language": window.language,
            "macKey": TokenUtils.getMacKey(),
            "userId": TokenUtils.getUserId(),
            "element": "#exercise",
            "sessionId": "",
            "displayOptions": {
                'hideToolbar': true, // 可空，是否隐藏工具栏
                "hideNavigator": false, // 可空，默认值 false。是否隐藏答题卡。
                "autoNext": false
            },
            "MarkDataStrategy": {
                "RealTimeSync": false // 是否实时同步批改结果
            },
            "eventCallBack": {
                onAnswerSaved: $.noop(),
                //渲染完毕
                onRenderComplete: $.noop(),
                // 时钟回调
                onTimerElapsed: $.noop(),
                // 考试提交成功后的回调
                afterSubmitCallBack: $.noop(),
                //点击继续答题的回调
                onContinueAnswer: $.noop()
            }
        }, config);

        this._factoryInstance().done($.proxy(function () {
            callback();
        }, this))
    }

    /**
     * 初始化作答配置并返回
     */
    Answer.prototype._initConfig = function () {
        var that = this;
        var languageVarl = this.config.language == "en-US" ? (i18n["en-US"])["learning"] : (i18n["zh-CN"])["learning"];
        var answerConfig = {
            "host": {
                "mainHost": this.config.serviceHosts.examApi, // 必填，测评组件API地址
                "resourceGatewayHost": this.config.serviceHosts.resourceGateway, // 必填，资源网关API地址
                "answerGatewayHost": this.config.serviceHosts.answerGateway, // 必填
                "markApiHost": this.config.serviceHosts.markApi, // 必填
                "returnUrl": this.config.returnUrl
            },
            "envConfig": {
                "sessionId": this.config.sessionId, // 必填，当前会话标识
                "macKey": this.config.macKey, // 必填，mac_key
                "userId": this.config.userId, // 必填，当前登陆用户的标志，用于笔记组件。
                "i18n": languageVarl, // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                "element": this.config.element, // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。
                "language": this.config.language, // 可空，默认值“zh-CN”。当前系统的语言。
                "currentQuestionId": "", // 5.4.2 初始化后的第一道题目
                "displayOptions": {
                    "singleCommitShowAnalysis": false,
                    "autoNext": this.config.displayOptions.autoNext,
                    'hideToolbar': this.config.displayOptions.hideToolbar, // 可空，是否隐藏工具栏
                    "hideTimer": false, // 可空，默认值 false。是否隐藏计时器。
                    "hideNavigator": this.config.displayOptions.hideNavigator, // 可空，默认值 false。是否隐藏答题卡。
                    "disableNavigatorJump": false, // 可空，默认值 false。点击答题卡题目时是否允许定位到该题目。
                    "disablePreButton": false, // 5.4.2 默认值为false, 为true时，“上一题”按钮不显示。
                    "disableNextButton": false, // 默认值为false, 为true时，“下一题”按钮不显示。
                    "showQuestionNum": true, // 是否隐藏题目编号，默认值为true
                    "enableQuestionBank": false, // 是否启用题库服务, 默认值为true
                    "showGotoLearnButton": false, // 是否显示去学习按钮，默认值为false
                    "showQuizButton": false, // 是否显示去提问按钮，默认值为false
                    "autoHidePrev": false, // 是否自动隐藏上一题按钮, 默认值为false
                    "autoHideNext": false // 是否自动隐藏下一题按钮,默认值为false
                },
                "MarkDataStrategy": {
                    "RealTimeSync": (this.config.MarkDataStrategy && this.config.MarkDataStrategy.RealTimeSync) ? this.config.MarkDataStrategy.RealTimeSync : false // 是否实时同步批改结果
                },
                "answerOptions": {
                    "forceToAnswer": false // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
                },
                "tokenConfig": {
                    "needToken": false, // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function (context) {
                        return {
                            "Authorization": TokenUtils.getMacToken(context.method, context.path, context.host),
                            "X-Gaea-Authorization": TokenUtils.getGaeaId()
                        };
                    } // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            },
            "eventCallBack": {
                "onAnswerSaved": function (data) {
                    window.console && console.log(JSON.stringify(data));
                    that.config.eventCallBack.onAnswerSaved();
                }, // 可空，默认值 function() {}。答案保存成功后的回调。
                "onAnswerChange": function (data) {
                    window.console && console.log(JSON.stringify(data));
                }, // 可空，默认值 function() {}。答案发生变更时的回调。
                "onNumberChanged": function (questionId, questionAnswerStatus) {
                    window.console && console.log('onNumberChanged:' + questionId + ":" + questionAnswerStatus);
                },
                "onNextButtonClick": function (context, questionId, questionAnswerStatus) {
                    window.console && console.log("onNextButtonClick");
                },
                "onLearnButtonClick": function () {
                    window.console && console.log("onLearnButtonClick");
                }, // 去学习按钮点击事情回调。可空，默认值function(){}
                "onQuestionButtonClick": function () {
                    window.console && console.log("onQuestionButtonClick")
                }, // 提问按钮可空，默认值function(){}
                "onSubmitCallBack": function () {
                    window.console && console.log("onSubmitCallBack")
                },
                "onRenderComplete": function (data) {
                    window.console && console.log("onRenderComplete")
                    that.config.eventCallBack.onRenderComplete(data);
                }, // 题目显示完成过后的回调，默认值function(){}  
                "onTimerElapsed": function (data) {
                    window.console && console.log("onTimerElapsed")
                    that.config.eventCallBack.onTimerElapsed(data);
                }, // 时钟滴答
                "afterSubmitCallBack": function (data) {
                    window.console && console.log("afterSubmitCallBack")
                    that.config.eventCallBack.afterSubmitCallBack(data);
                }, // 考试提交成功后的回调
                "onContinueAnswer": function() {
                    window.console && console.log("afterSubmitCallBack")
                    that.config.eventCallBack.onContinueAnswer();
                }
            }
        }

        return answerConfig;
    }

    /**
     * 获取工厂实例
     * 
     * @param {any} sessionId 
     */
    Answer.prototype._factoryInstance = function (sessionId) {
        var def = $.Deferred();
        var _this = this;
        require.config({
            baseUrl: _this.config.staticUrl
        });
        require(["studying.exercise.factory"], function (factory) {
            _this.factory = factory;
            def.resolve();
        });

        return def;
    },

        /**
         * 进入考试作答界面
         */
        Answer.prototype.start = function (sessionId, type) {
            if (sessionId) {
                this.config.sessionId = sessionId;
                this.config.returnUrl = "";
            }

            if (this.factory != null) {
                var config = this._initConfig();
                switch (type.toLowerCase()) {
                    case "singlecommit": // 适用于连续答题模式
                        this.bussiness = this.factory.Studying.ExerciseBussinessFactory.CreateSingleCommitExercise(config);
                        break;
                    case "standard": // 对应记忆曲线模式、快速答题模式
                        this.bussiness = this.factory.Studying.ExerciseBussinessFactory.CreateStandardExercise(config);
                        break;
                    case "showanalysis":
                        this.bussiness = this.factory.Studying.ExerciseBussinessFactory.CreateShowAnalysisExercise(config);
                        break;
                    case "autonext":
                        config.envConfig.displayOptions.autoNext = true;
                        this.bussiness = this.factory.Studying.ExerciseBussinessFactory.CreateStandardExercise(config);
                        break;
                    default:
                        this.bussiness = this.factory.Studying.ExerciseBussinessFactory.CreateStandardExercise(config);
                        break;
                }

                this.bussiness.init();
            }
        }

    /**
     * 下一题
     */
    Answer.prototype.next = function () {
        this.bussiness.next();
    }

    /**
     * 上一题
     */
    Answer.prototype.prev = function () {
        this.bussiness.prev();
    }

    /**
     * 跳转到指定的题目
     * 
     * @param {any} questionId 
     */
    Answer.prototype.goto = function (questionId) {
        this.bussiness.goto(questionId);
    }

    /**
     * 结束考试
     */
    Answer.prototype.end = function (showDialog) {
        this.bussiness.finish(showDialog);
    }

    /**
     * 获取当前答题统计数据
     */
    Answer.prototype.getQuestionStatistic = function () {
        return this.bussiness.getQuestionStatistic();
    }

    window.Answer = Answer;
}(jQuery));
