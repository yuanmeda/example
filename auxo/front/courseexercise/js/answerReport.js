;(function ($, window) {
    'use strict';
    var store = {
        getSmartResult: function (search) {
            return $.ajax({
                url: self_host + '/v1/user_exercise_result/smart',
                dataType: 'json',
                cache: false,
                data: search
            });
        },
        getResult: function (search) {
            return $.ajax({
                url: self_host + '/v1/user_exercise_result',
                dataType: 'json',
                cache: false,
                data: search
            });
        },
        /*创建练习会话(智能练习)*/
        createExamSessions: function (data) {
            return $.ajax({
                url: courseExerciseApiUrl + '/v1/user_exam_sessions',
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(data)
            })
        },
        /*根据会话获取用户试卷作答记录*/
        getSessions: function () {
            return $.ajax({
                url: elAnswerApiHost + '/v1/user_paper_answers/sessions/' + sessionId,
                dataType: 'json',
                cache: false
            });
        },
        /*获取tag*/
        getTags: function (search) {
            return $.ajax({
                url: self_host + '/v1/courses/' + courseId + '/parent_tags',
                dataType: 'json',
                cache: false,
                data: search
            });
        }
    };
    var viewModel = {
        model: {
            is_loading: false,
            type: exerciseType,
            exerciseTitle: '',
            smartSearch: {
                session_id: sessionId,
                user_latest_answer_time: '',
                course_id: courseId
            },
            search: {
                session_id: sessionId,
                user_latest_answer_time: '',
                course_id: courseId,
                tag_type: tagType,
                tag_value: tagValue
            },
            user_exam_session: {
                total_question_number: 0,
                answer_question_number: 0,
                correct_question_number: 0
            },
            next_course_tag: {
                tag_type: "",
                tag_value: "",
                tag_name: ""
            },//其他练习
            question_knowledge_stats: []//智能练习
        },
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('answer-report'));
            this.getTags();
            this.getSessions();
        },
        /*获取title*/
        getTags: function () {
            var _self = this;
            var params = {
                tag_type: tagType,
                tag_value: tagValue
            };
            store.getTags(params).done(function (resData) {
                if (resData) {
                    var arr = [];
                    $.each(resData, function (index, item) {
                        arr.push(item.tag_name);
                    });
                    _self.model.exerciseTitle(arr.join(' < '));
                }
            })
        },
        /*获取最新作答时间*/
        getSessions: function () {
            var _self = this;
            store.getSessions().done(function (resData) {
                if (resData) {
                    var time = new Date(resData.latest_answer_time ? resData.latest_answer_time : '').getTime();
                    _self.model.smartSearch.user_latest_answer_time(time);
                    _self.model.search.user_latest_answer_time(time);
                    _self.initData();
                }
            })
        },
        initData: function () {
            var _self = this;
            if (exerciseType == '0') {
                var params = ko.mapping.toJS(this.model.smartSearch);
                store.getSmartResult(params).done(function (resData) {
                    if (resData) {
                        ko.mapping.fromJS(resData.user_exam_session, {}, _self.model.user_exam_session);
                        _self.model.question_knowledge_stats(resData && resData.question_knowledge_stats ? resData.question_knowledge_stats : []);
                    }
                    _self.pieChart();
                })
            } else {
                var params1 = ko.mapping.toJS(this.model.search);
                store.getResult(params1).done(function (resData) {
                    if (resData) {
                        ko.mapping.fromJS(resData.user_exam_session, {}, _self.model.user_exam_session);
                        ko.mapping.fromJS(resData.next_course_tag, {}, _self.model.next_course_tag);
                    }
                    _self.pieChart();
                })
            }
        },
        formatError: function (answer, correct) {
            if (isNaN(answer) || isNaN(correct)) {
                return '-';
            }
            return answer - correct;
        },
        formatUndo: function (total, answer) {
            if (isNaN(answer) || isNaN(total)) {
                return '-';
            }
            return total - answer;
        },
        formatCorrectRate: function (correct, answer) {
            if (isNaN(answer) || isNaN(correct)) {
                return '-';
            }
            return answer <= 0 ? '0' : Math.round(correct / answer * 10000) / 100.00;
        },
        /*饼图*/
        pieChart: function () {
            $('.circle-progress2').easyPieChart({
                easing: 'easeOutBounce',
                barColor: skin == 'red' ? '#ce3f3f' : (skin == 'green' ? '#3bb800' : '#38adff'),
                trackColor: '#ddd',
                scaleColor: false,
                lineWidth: 10,
                trackWidth: 10,
                size: 190,
                lineCap: 'butt',
                onStep: function (from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });
        },
        /*重新练习*/
        retry: function () {
            this.model.is_loading(true);
            if (exerciseType == '0') {
                var params = {
                    course_id: courseId,
                    tag_type: 'course',
                    tag_value: courseId,
                    type: 0,
                    mode: 0,
                    question_count: 10
                };
                store.createExamSessions(params).done(function (resData) {
                    window.location.href = 'http://' + window.location.host + self_host + '/' + projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(return_url);
                })
            } else {
                var data = ko.mapping.toJS(viewModel.model.user_exam_session);
                window.location.href = 'http://' + window.location.host + self_host + '/' + projectCode + '/course_exercise/' + data.exam_id + '/answer?course_id=' + courseId + '&session_id=' + sessionId + '&tag_type=' + tagType + '&tag_value=' + tagValue + '&type=' + exerciseType + '&mode=' + exerciseMode + '&question_count=' + data.total_question_number + '&return_url=' + encodeURIComponent(return_url);
            }
        },
        /*查看全部解析*/
        seeAllAnalysis: function () {
            this.model.is_loading(true);
            var data = ko.mapping.toJS(viewModel.model.user_exam_session);
            window.location.href = 'http://' + window.location.host + self_host + '/' + projectCode + '/course_exercise/' + data.exam_id + '/analysis?course_id=' + courseId + '&session_id=' + sessionId + '&tag_type=' + tagType + '&tag_value=' + tagValue + '&type=' + exerciseType + '&mode=' + exerciseMode + '&question_count=' + data.total_question_number + '&return_url=' + encodeURIComponent(return_url);
        }
        // back: function () {
        //     var data = ko.mapping.toJS(viewModel.model.user_exam_session);
        //     window.location.href = 'http://' + window.location.host  + self_host+ '/' + projectCode + '/course_exercise/' + data.exam_id + '/answer?course_id=' + courseId + '&session_id=' + sessionId + '&tag_type=' + tagType + '&tag_value=' + tagValue + '&type=' + exerciseType + '&mode=' + exerciseMode + '&question_count=' + data.total_question_number + '&return_url=' + encodeURIComponent(return_url);
        // }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
