import tpl from './template.html'
import ko from 'knockout'
import $ from 'jquery';

var _i18nValue = i18nHelper.getKeyValue;

function ViewModel(params) {
    this.params = params;
    this.model = {
        is_loading: false,
        businessCoursesGatewayUrl: params.businessCoursesGatewayUrl,
        exerciseSelfUrl: params.exerciseSelfUrl,
        tab: 1,//切换目录
        percentFlag: false,//标识catalog下的统计正确率已计算出
        /*课程章节通用*/
        courseFilter: {
            user_id: +params.user_id,//用户标识
            course_id: params.course_id,//课程标识
            tag_type: 'course',//标签类型:课程(course),章节(catalogue),课时(lesson),知识点(knowledge_points)
            tag_value: params.course_id//标签值 type=knowledge_points时： lesson_id_knowledge_id
        },
        /*课程下统计数据*/
        courseData: {
            question_count: '',//总题数
            done_question_count: '',//已做题数
            wrong_question_count: ''//错题数
        },
        /*章节，课时，知识点下统计数据*/
        catalogStatisticData: {
            title: '',
            question_count: 0,//总题数
            done_question_count: 0,//已做题数
            wrong_question_count: 0,//错题数
            last_exercise_info: {//最近练习消息
                "type": 0,
                "mode": 0,
                "question_count": 0,
                "session_id": "",
                "exam_id": "",
                "status": 0
            }
        },
        /*练习会话*/
        userExamSessions: {
            course_id: params.course_id,
            tag_type: 'lesson',//标签类型:课程(course),章节(catalogue),课时(lesson),知识点(knowledge_points),默认课程，点击选择其他则改变
            tag_value: params.course_id,//标签值 type=knowledge_points时： {lesson_id}  {knowledge_id},默认课程Id
            type: 1,//练习类型[0: SMART 智能练习, 1: SEQUENCE 顺序练习(undo+sequence), 2: RANDOM 随机练习, 3: WRONG 错题练习]
            mode: 1,//练习模式[0: ANSWER 作答模式对应智能练习(作答完成提交后查看解析), 1: SHOW_FEEDBACK_AFTER_ANSWER 做题模式对应页面选择的答题模式(做一题立即显示解析), 2: SHOW_FEEDBACK 背题模式(直接显示题目和解析)]
            question_count: 10//练习题数
        },
        correctRate: ''
    };
    this.init();
}

ViewModel.prototype = {
    store: {
        getTagStat: function (api_url, search) {
            return $.ajax({
                url: api_url + '/v1/user_course_tag_stat',
                dataType: "json",
                type: 'GET',
                data: search,
                cache: false
            })
        },
        /*创建练习会话*/
        createExamSessions: function (api_url, data) {
            return $.ajax({
                url: api_url + '/v1/user_exam_sessions',
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(data)
            })
        }
    },
    init: function () {
        var _self = this;
        /*初始化章节目录或者知识点目录*/
        this.model = ko.mapping.fromJS(this.model);
        /*获取课程下的统计*/
        this.getCourseTagStat();
        setTimeout(function () {
            var firstChapter = $($($('.dlist')[0]).children()[1]);
            firstChapter.click();
        }, 1000);
    },
    /*饼图*/
    pieChart: function () {
        $('.circle-progress2').easyPieChart({
            easing: 'easeOutBounce',
            barColor: this.params.skin == 'red' ? '#ce3f3f' : (this.params.skin == 'green' ? '#3bb800' : '#38adff'),
            trackColor: '#ddd',
            scaleColor: false,
            lineWidth: 10,
            trackWidth: 10,
            size: 190,
            lineCap: 'butt',
            animate: {
                duration: 1000,
                enabled: true
            },
            onStep: function (from, to, percent) {
                $(this.el).find('.percent').text(Math.round(percent));
            }
        });
    },
    /*自定义下拉
     * 形参说明：
     itemName：下拉选择器名；
     resultName: 结果显示选择器名；
     dropListName: 下拉框选择器名；
     dropItemName：下拉选项选择器名；
     * */
    myDropDownList: function (itemName, resultName, dropListName, dropItemName) {
        var _self = this;
        //初始判断结果和下拉选项相同，则给下拉框添加高亮类
        $(itemName).each(function () {
            var strResult = $(this).find(resultName).text();
            $(this).find(dropItemName).each(function () {
                if (strResult === $(this).text()) {
                    $(this).addClass('on').siblings().removeClass('on');
                }
            });
        });
        //点击
        $(itemName).on('click', function (e) {
            e.stopPropagation();
            var $chooseTit = $(this).find(resultName);
            var questionNumber = _self.model.catalogStatisticData.question_count();
            /*判断只有题目选择才走下面的程序*/
            if ($(this).find('#questionSelect').length) {
                var questionList = $('#questionSelect').children();
                /*给不能选择的题目按钮添加样式*/
                $.each(questionList, function (index, item) {
                    var number = $(item).text().substr(0, 2);
                    if (questionNumber < 20) {
                        if (number != 10) $(item).addClass('li_disabled');
                    } else if (questionNumber >= 20 && questionNumber < 30) {
                        if (number == 30) $(item).addClass('li_disabled');
                    }
                });
            }
            $(this).toggleClass('on')
                .find(dropListName).slideToggle()
                .closest(itemName).siblings().removeClass('on')
                .find(dropListName).slideUp();

            $(this).find(dropItemName).on('click', function (evt) {
                evt.stopPropagation();
                var $self = $(this), text = $self.text();
                var dataType = $self.attr('data-type');
                switch (dataType) {
                    case 'question_count':
                        /*判断当前节点下的题目数量来控制题数选择按钮*/
                        var count = +(text.substr(0, 2));
                        if (questionNumber < 20) {
                            if (count != 10) return;
                        } else if (questionNumber >= 20 && questionNumber < 30) {
                            if (count == 30) return;
                        }
                        _self.model.userExamSessions.question_count(count);
                        break;
                    case 'mode':
                        var mode = (text == '答题模式') ? 1 : 2;
                        _self.model.userExamSessions.mode(mode);
                        break;
                    case 'type':
                        var type = (text == '顺序练习') ? 1 : (text == '随机练习' ? 2 : 3);
                        _self.model.userExamSessions.type(type);
                        break;
                }
                $self.addClass('on').siblings().removeClass('on');
                $chooseTit.text(text);
                $(dropListName).slideUp();
            })
        });
        $('document,body').on('click', function () {
            $(dropListName).slideUp();
        });
    },
    getCourseTagStat: function () {
        var _self = this;
        var params = ko.mapping.toJS(this.model.courseFilter);
        this.store.getTagStat(this.params.courseExerciseApiUrl, params).done(function (resData) {
            if (resData) {
                ko.mapping.fromJS(resData, {}, _self.model.courseData);
                _self.myDropDownList('.way-item', '.way-tit', '.way-droplist', '.way-droplist li');
            }
        });
    },
    /*正确率计算*/
    formatCorrectRate: function (rightQuestion, done, type) {
        var correct = rightQuestion, percent;
        if (isNaN(correct) || isNaN(done)) {
            return "NaN";
        }
        if (type == 1) {
            percent = done <= 0 ? "0" : (Math.round(correct / done * 10000) / 100.00);
        } else {
            percent = done <= 0 ? "0%" : (Math.round(correct / done * 10000) / 100.00 + "%");
        }
        return percent;
    },
    /*tab切花*/
    switchTab: function ($element, tab, model) {
        var element = $($element);
        element.addClass('active').siblings().removeClass('active');
        model.model.tab(tab);
    },
    updateChapter: function (callBackData) {
        this.updateLesson(callBackData);
    },
    updateSection: function (callBackData) {
        this.updateLesson(callBackData);
    },
    updateLesson: function (callBackData) {
        var _self = this;
        var lastExerciseInfo = {
            "type": 0,
            "mode": 0,
            "question_count": 0,
            "session_id": "",
            "exam_id": "",
            "status": 0
        };
        var params = ko.mapping.toJS(this.model.courseFilter);
        /*根据点击的对象不同，tag_type和tag_value要对应改变*/
        if (callBackData.parent_id !== undefined && !callBackData.parent_id) {
            //章节
            params.tag_type = 'catalogue';
            params.tag_value = callBackData.id;
        } else if (callBackData.parent_id !== undefined && callBackData.parent_id) {
            //小节
            params.tag_type = 'catalogue';
            params.tag_value = callBackData.id;
        } else if (callBackData.parent_chapter_id) {
            //课时
            params.tag_type = 'lesson';
            params.tag_value = callBackData.id;
        } else {
            //知识点;
            params.tag_type = 'knowledge_points';
            params.tag_value = callBackData.lesson_id + '_' + callBackData.knowledge_id;
        }
        this.model.userExamSessions.tag_type(params.tag_type);
        this.model.userExamSessions.tag_value(params.tag_value);
        this.store.getTagStat(this.params.courseExerciseApiUrl, params).done(function (resData) {
                if (resData) {
                    _self.model.catalogStatisticData.title(callBackData.name ? callBackData.name : callBackData.title);
                    _self.model.catalogStatisticData.question_count(resData.question_count);
                    _self.model.catalogStatisticData.done_question_count(resData.done_question_count);
                    _self.model.catalogStatisticData.wrong_question_count(resData.wrong_question_count);
                    var rate = _self.formatCorrectRate(_self.model.catalogStatisticData.done_question_count() - _self.model.catalogStatisticData.wrong_question_count(), _self.model.catalogStatisticData.done_question_count(), '1')
                    _self.model.correctRate(rate);
                    /*返回信息为空时，再次初始化，覆盖上次信息*/
                    if (!resData.last_exercise_info) {
                        resData.last_exercise_info = lastExerciseInfo;
                    }
                    ko.mapping.fromJS(resData.last_exercise_info, {}, _self.model.catalogStatisticData.last_exercise_info);
                    /*显示用户之前选择的练习模式*/
                    if (resData.last_exercise_info.session_id) {
                        _self.model.userExamSessions.question_count(resData.last_exercise_info.question_count ? (resData.last_exercise_info.question_count <= 10 ? 10 : (resData.last_exercise_info.question_count <= 20 ? 20 : 30)) : 10);
                        _self.model.userExamSessions.mode(resData.last_exercise_info.mode ? resData.last_exercise_info.mode : 1);
                        _self.model.userExamSessions.type(resData.last_exercise_info.type ? resData.last_exercise_info.type : 1);
                    } else {
                        /*注意：当last_exercise_info为Null时，每次点击userExamSessions中的type,model,question_count都要还原成默认值*/
                        _self.model.userExamSessions.type(1);
                        _self.model.userExamSessions.mode(1);
                        _self.model.userExamSessions.question_count(10);
                    }
                    if (!$('.circle-progress2').data('easyPieChart')) _self.pieChart();
                    $('.circle-progress2').data('easyPieChart').update(rate);
                }
            }
        );
    },
    updateKnowledge: function (callBackData) {
        this.updateLesson(callBackData);
    },
    /*立即练习*/
    practiceNow: function () {
        var currentHref = window.location.href;
        var _self = this;
        _self.model.is_loading(true);
        var params = ko.mapping.toJS(this.model.userExamSessions);
        /*注意：当点击节点后，要判断last_exercise_info是否存在，为null时才走下面的创建，否则根据last_exercise_info中的status状态去跳转；ps:初次进入页面，再初次点击节点时要缓存userExamSessions中的question_count、mode、type(之后页面未关闭情况下不改变，除非用户再次设置)*/
        var lastExerciseInfo = ko.mapping.toJS(this.model.catalogStatisticData.last_exercise_info);
        var courseId = this.model.courseFilter.course_id();
        if (lastExerciseInfo.exam_id) {
            var url = "";
            if(this.params.exerciseSelfUrl){
                url = this.params.exerciseSelfUrl + '/' + this.params.projectCode + '/course_exercise/' + lastExerciseInfo.exam_id + '/answer?course_id=' + courseId + '&session_id=' + lastExerciseInfo.session_id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + lastExerciseInfo.type + '&mode=' + lastExerciseInfo.mode + '&question_count=' + lastExerciseInfo.question_count + '&return_url=' + encodeURIComponent(currentHref);
            }else{
                url = this.params.courseExerciseGatewayUrl + '/' + this.params.projectCode + '/course_exercise/' + lastExerciseInfo.exam_id + '/answer?course_id=' + courseId + '&session_id=' + lastExerciseInfo.session_id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + lastExerciseInfo.type + '&mode=' + lastExerciseInfo.mode + '&question_count=' + lastExerciseInfo.question_count + '&return_url=' + encodeURIComponent(currentHref);
            }
            window.location.href = url + '&__mac=' + Nova.getMacToB64(url);
            return;
        }
        this.store.createExamSessions(this.params.courseExerciseApiUrl, params).done(function (resData) {
            if (resData) {
                var url = "";
                if(_self.params.exerciseSelfUrl){
                    url = _self.params.exerciseSelfUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
                }else{
                    url = _self.params.courseExerciseGatewayUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
                }
                window.location.href = url + '&__mac=' + Nova.getMacToB64(url);
            }
        }).always(function () {
            _self.model.is_loading();
        });
    },
    /*智能练习*/
    smartPractice: function () {
        var currentHref = window.location.href;
        var _self = this;
        _self.model.is_loading(true);
        var params = {
            course_id: this.model.courseFilter.course_id(),//课程标识
            tag_type: 'course',
            tag_value: this.model.courseFilter.course_id(),
            type: 0,
            mode: 0,
            question_count: 10
        };
        var courseId = this.model.courseFilter.course_id();
        this.store.createExamSessions(this.params.courseExerciseApiUrl, params).done(function (resData) {
            var url = "";
            if (_self.params.exerciseSelfUrl) {
                url = _self.params.exerciseSelfUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
            } else {
                url = _self.params.courseExerciseGatewayUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
            }
            window.location.href = url + '&__mac=' + Nova.getMacToB64(url);
        })
    },
    /*重新练习*/
    retryPractice: function () {
        var currentHref = window.location.href;
        var _self = this;
        _self.model.is_loading(true);
        var params = ko.mapping.toJS(this.model.userExamSessions);
        var courseId = this.model.courseFilter.course_id();
        this.store.createExamSessions(this.params.courseExerciseApiUrl, params).done(function (resData) {
            if (resData) {
                var url = "";
                if (_self.params.exerciseSelfUrl) {
                    url = _self.params.exerciseSelfUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
                } else {
                    url = _self.params.courseExerciseGatewayUrl + '/' + _self.params.projectCode + '/course_exercise/' + resData.exam_id + '/answer?course_id=' + courseId + '&session_id=' + resData.id + '&tag_type=' + params.tag_type + '&tag_value=' + params.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
                }
                window.location.href = url + '&__mac=' + Nova.getMacToB64(url);
            }
        })
    },
    /*继续练习*/
    continuePractice: function () {
        var _self = this;
        _self.model.is_loading(true);
        var currentHref = window.location.href;
        var data = ko.mapping.toJS(this.model.userExamSessions);
        var params = ko.mapping.toJS(this.model.catalogStatisticData.last_exercise_info);
        var courseId = this.model.courseFilter.course_id();
        var url = "";
        if(_self.params.exerciseSelfUrl){
            url = _self.params.exerciseSelfUrl + '/' + this.params.projectCode + '/course_exercise/' + params.exam_id + '/answer?course_id=' + courseId + '&session_id=' + params.session_id + '&tag_type=' + data.tag_type + '&tag_value=' + data.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
        }else{
            url = _self.params.courseExerciseGatewayUrl + '/' + this.params.projectCode + '/course_exercise/' + params.exam_id + '/answer?course_id=' + courseId + '&session_id=' + params.session_id + '&tag_type=' + data.tag_type + '&tag_value=' + data.tag_value + '&type=' + params.type + '&mode=' + params.mode + '&question_count=' + params.question_count + '&return_url=' + encodeURIComponent(currentHref);
        }
        window.location.href = url + '&__mac=' + Nova.getMacToB64(url);
    }
};

ko.components.register('x-course-exercise', {
    viewModel: ViewModel,
    template: tpl
});