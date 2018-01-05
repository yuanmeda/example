;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    var store = {
        getParentTags: function () {
            return $.ajax({
                url: self_host + '/v1/courses/' + course_id + '/parent_tags?tag_value=' + tag_value + '&tag_type=' + tag_type,
                dataType: 'json',
                cache: false
            });
        },
        getPkRecord: function (data) {
            return $.ajax({
                url: self_host + '/v1/pk_records/search',
                dataType: 'json',
                data: data,
                cache: false
            });
        },
        getUserExerciseResult: function () {
            return $.ajax({
                url: self_host + '/v1/user_exercise_result?session_id=' + session_id + '&course_id=' + course_id + '&tag_type=' + tag_type + '&tag_value=' + tag_value,
                dataType: 'json',
                cache: false
            });
        },
        createUserExamSessions: function (data) {
            return $.ajax({
                url: courseExerciseApiUrl + '/v1/user_exam_sessions',
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(data)
            })
        },
        //加入错题本回调
        onErrorButtonClick: function (questionId, is_wrong) {
            /*对接错题本传入数据*/
            var wrongBookParams = {
                "session_id": session_id,
                "course_id": course_id,
                "question_id": questionId,//作答组件内部去获取
                "tag_type": tag_type,
                "tag_value": tag_value,
                "is_wrong": is_wrong
            };
            var url = courseExerciseApiUrl + '/v1/wrong_question';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'POST',
                data: JSON.stringify(wrongBookParams)
            });
        },
        //是否加入错题本回调
        checkAddQuestionBank: function (questionId) {
            var url = wrongQuestionUrl + '/v1/wrong_questions/users/' + user_id + '/questions/' + questionId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'GET',
                cache: false
            });
        }
    };

    function get_g_config() {
        var g_config = window.Nova.base64.decode(window.G_CONFIG);
        return JSON.parse(g_config);
    }

    function get_local_mac() {
        var mac_key = get_g_config().cookie_mac_key;
        var cookies = document.cookie.split(';');
        var i = 0;
        while (i < cookies.length) {
            var cookie = $.trim(cookies[i]);
            var r = new RegExp('^' + mac_key + '=');
            if (r.test(cookie)) {
                var mac = cookie;
                mac = mac.split('=').pop();
                mac = window.decodeURIComponent(mac);
                mac = window.Nova.base64.decode(mac);
                mac = JSON.parse(mac);
                return mac;
            }
            i++;
        }
        throw new Error('_G_MAC获取失败，需调试');
    }

    function get_mac_token(method, url, host) {
        return Nova.getMacToken(method, url, host);
    }

    var viewModel = {
        model: {
            is_loading: false,
            parentTags: [],
            course_id: window.course_id, //课程标识
            tag_value: window.tag_value,//标签值 type=knowledge_points时： {lesson_id}  {knowledge_id}
            tag_type: window.tag_type,//标签类型:业务课程(course),章节(catalogue),课时(lesson),知识点(knowledge_points)[course, catalogue, lesson, knowledge_points]
            type: window.type,//[0: SMART 智能练习, 1: SEQUENCE 顺序练习(undo+sequence), 2: RANDOM 随机练习, 3: WRONG 错题练习]
            mode: window.mode,//练习模式[0: ANSWER 作答模式(作答完成提交后查看解析), 1: SHOW_FEEDBACK_AFTER_ANSWER 作题模式(做一题立即显示解析), 2: SHOW_FEEDBACK 背题模式(直接显示题目和解析)]
            question_count: window.question_count,//练习题数
            session_id: window.session_id,
            userExamSession: {
                total_question_number: 0,
                accuracy: 0
            },
            nextCourseTag: {
                tag_type: "",
                tag_value: "",
                tag_name: ""
            },
            nextCourseTagText: "",
            buttonText: ""
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('answer-page'));
            var self = this;
            if (course_id && tag_value && tag_type) {
                store.getParentTags()
                    .done(function (data) {
                        if ($.isArray(data) && data.length) {
                            self.model.parentTags(data);
                        }
                    })
            }
            this.displayAnalysis();
        },
        displayAnalysis: function () {
            var self = this;
            require.config({
                baseUrl: static_host
            });
            require(['studying.exercise.factory'], function (factory) {
                var languageVarl;
                if (language == "zh_cn" || language == 'en_us')
                    languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
                else
                    languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
                var config = {
                    host: {
                        'mainHost': el_exam_api_host, // 必填，测评组件API地址
                        'resourceGatewayHost': res_srv_host, // 必填，资源网关API地址
                        'answerGatewayHost': el_answer_api_host, // 必填
                        'periodicExamHost': el_per_exam_gw_host,
                        'noteServiceHost': el_note_api_host, // 必填，笔记组件API地址
                        'questionBankServiceHost': que_bank_gw_host, // 必填，题库服务API地址
                        "markApiHost": window.mark_api_url
                        // 'errorUrl': `${project_domain}/answer/error`, // 必填，初始化过程中发生流程错误是用户显示错误信息的页面，值为完整的URL地址
                        // 'returnUrl': `/${project_domain}/pk/${pk_id}/${vm.is_alone ? 'answer' : 'record'}/${pk_rec_id}/result` // 必填，结果页面地址
                    },
                    envConfig: {
                        "examId": exam_id,
                        'sessionId': session_id, // 必填，当前会话标识
                        'macKey': get_local_mac().mac_key, // 必填，mac_key，登录之后的mac_token中的key
                        'userId': user_id, // 必填，当前登陆用户的标志，用于笔记组件。
                        'i18n': languageVarl, // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                        'element': '#exercise-answer', // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。
                        'language': language, // 可空，默认值“zh-CN”。当前系统的语言。
                        'displayOptions': {
                            "hideTimer": true,
                            'hideNavigator': false, // 可空，默认值 false。是否隐藏答题卡。
                            'showQuestionNum': false, // 是否隐藏题目编号，默认值为true
                            'enableQuestionBank': false, // 是否启用题库服务, 默认值为true
                            'showGotoLearnButton': false, // 是否显示去学习按钮，默认值为false
                            'showQuizButton': false, // 是否显示去提问按钮，默认值为false
                            'showErrorButton': true,//是否显示加入错题本按钮
                            'disablePreButton': false,
                            'disableNextButton': false
                        },
                        'answerOptions': {
                            'forceToAnswer': false // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
                        },
                        'tokenConfig': {
                            // 必填，是否需要传递授权TOKEN
                            'needToken': true,
                            // 可空，如果needToken值为true时该回调必须
                            'onGetToken': function (context) {
                                return {
                                    'Authorization': get_mac_token(context.method, context.path, context.host),
                                    'X-Gaea-Authorization': `GAEA id=${get_g_config().encode_gaea_id}`
                                }
                            }
                        }
                    },
                    eventCallBack: {
                        // 可空，答案保存成功后的回调。
                        onAnswerSaved(data){
                        },
                        // 可空，答案发生变更时的回调。
                        onAnswerChange(data){
                        },
                        // 做题过程中可以接收外部的事情
                        onNumberChanged(question_id, questionAnswerStatus){

                        },
                        onNextButtonClick(context){

                        },
                        //提交后的回调
                        afterSubmitCallBack(submitReturnData){
                        },
                        // 计时
                        onTimerElapsed(timer){
                            // vm.time_countdown(timer.text);
                        },
                        //加入错题本回调
                        onErrorButtonClick: function (questionId, is_wrong) {
                            return store.onErrorButtonClick(questionId, is_wrong);
                        },
                        //是否加入错题本回调
                        checkAddQuestionBank: function (questionId) {
                            return store.checkAddQuestionBank(questionId);
                        }
                    }
                };
                var bussiness = factory.Studying.ExerciseBussinessFactory.CreateStandardExercise(config);
                bussiness.init();
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
