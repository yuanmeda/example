import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        let {activities} = params.data;
        this.model = {
            RESOURCE_TYPE: { //资源类型
                VIDEO: 0, //视频
                DOC: 1, //文档
                EVALUATE: 10 // 评测
            },
            //答题类型
            ANSWER_TYPE: {
                'MEMORY': 'standard',
                'CONTINUOUS': 'singlecommit',
                'QUICK': 'autonext'
            },
            evaluatingInfo: params.data.evaluatingInfo,
            isAnswerExp: ko.observable(params.data.isAnswerExp),
            resourceId: params.data.resourceId,
            lessonId: params.data.lessonId,
            currentSessionId: ko.observable(activities.current_session_id),
            sessionId: ko.observable(null),
            //已连续答对题数
            conRightCount: ko.observable(0),
            //快速答题统计
            quickStatObj: ko.observable(null),
            timer: ko.observable(""),
            popOutAnswer: ko.observable(false),
            popTimeEnd: ko.observable(false),
            popErrorEnd: ko.observable(false),
            popFailed: ko.observable(false),
            state: {
                hideLeft: ko.observable(false).publishOn('HIDELEFT'),
                hideRight: ko.observable(false).publishOn('HIDERIGHT')
            },
            isBackToState:  ko.observable(true),
            exitEventData: ko.observable(null)
        };
        this.config = params.config;
        this.store = {
            getUserExamSessions: (examId) => {
                return $.ajax({
                    url: window.eLearningExamApiDomain + `/v1/user_exam_sessions?exam_id=` + examId,
                    type: "POST",
                    dataType: "json",
                    cache: false
                });
            },
            getActivities: () => {
                var dataObj = {
                    "resource_type": this.model.RESOURCE_TYPE.EVALUATE,
                    "need_extra_data": true,
                    "lesson_id": this.model.lessonId
                };
                if(window.answerSubmitTime){
                    var timestamp = 0;
                    timestamp = new Date(window.answerSubmitTime).getTime();
                    if(timestamp > 0){
                        dataObj['timestamp'] = timestamp;
                    }
                    window.answerSubmitTime = '';
                }
                return $.ajax({
                    url: `/v1/business_courses/${this.config.courseId}/resources/${this.model.resourceId}/activities`,
                    dataType: 'json',
                    data: dataObj,
                    cache: false
                });
            }
        };
        this.init();
        EventDispatcher.addEventListener("onLinkClick", function(evt) {
            this.model.exitEventData(evt.data);
            this.showExitPop();
        }.bind(this));
    }

    init() {
        var that = this;
        this.answer = new window.Answer({
            "serviceHosts": {
                "examApi": window.eLearningExamApiDomain,
                "resourceGateway": window.resourceServiceDomain ,
                "answerGateway": window.eLearningAnswerApiDomain ,
                "markApi": window.eLearningMarkApiDomain
            },
            "returnUrl": "",
            "staticUrl": "",
            "language": "",
            "macKey": TokenUtils.getMacKey(),
            "userId": TokenUtils.getUserId(),
            "element": "#exercise",
            "sessionId": "",
            "displayOptions": {
                'hideToolbar': true, // 可空，是否隐藏工具栏
                "hideNavigator": !(this.model.evaluatingInfo.rule_type === 'QUICK' || (this.model.evaluatingInfo.rule_type === 'CONTINUOUS' && that.model.isAnswerExp() === true)), // 可空，默认值 false。是否隐藏答题卡。
            },
            "MarkDataStrategy": {
                "RealTimeSync": true // 是否实时同步批改结果
            },
            "eventCallBack": {
                onAnswerSaved: function () {
                    // if (that.model.evaluatingInfo.rule_type === 'QUICK') {
                    //     that.answer.next();
                    // }
                    if (that.model.evaluatingInfo.rule_type === 'QUICK') {
                        that.model.quickStatObj(that.getQuestionStatistic());
                    }
                },
                "onRenderComplete": function (data) {
                    $.studying.loading.hide();
                    if (that.model.evaluatingInfo.rule_type === 'QUICK') {
                        that.model.quickStatObj(that.getQuestionStatistic());
                    }
                    /**
                     * TODD 在这里做当前题目是否回答正确的判断
                     * data.answerStatus 值对应的如下
                     * Undo = 0,
                     * Correct = 1,
                     * Wrong = 2,
                     * Subjective = 3,
                     * Done = 7,
                     * Invalid = 9
                     */
                    if(that.model.isAnswerExp() === true){
                        return;
                    }
                    if(that.model.evaluatingInfo.rule_type === 'CONTINUOUS'){
                        if (data.answerStatus === 1){
                            that.answer.next();
                            that.model.conRightCount(that.model.conRightCount() + 1);
                        }else if(data.answerStatus === 2){
                            that.model.isBackToState(false);
                            that.model.conRightCount(0);
                            that.onAnswerEnd(false);
                            that.model.popFailed(true);
                        }
                    }
                },
                "onTimerElapsed": function (data) {
                    that.model.timer(data.text);
                    if(window.isAnswering && data.text === '00:00:00'){
                        that.model.popTimeEnd(true);
                    }
                },
                "afterSubmitCallBack": function (data) {
                    window.isAnswering = false;
                    if(data && data.submitTime){
                        window.answerSubmitTime = data.latestAnswerTime || data.submitTime;
                    }
                    //连续答题模式下答错一题时候不返回状态页
                    if (that.model.popTimeEnd() === false && that.model.isBackToState() === true){
                        that.backToStatePage();
                    }
                    if(that.model.isBackToState() === false){
                        that.model.isBackToState(true);
                    }
                }
            }
        }, this.onAnswerInited.bind(this));
    }

    onAnswerInited() {
        $.studying.loading.show();
        if (this.model.isAnswerExp()) {
            //答案解析
            this.answer.start(this.model.currentSessionId(), this.model.ANSWER_TYPE[this.model.evaluatingInfo.rule_type]);
        } else {
            //答题
            window.isAnswering = true;
            this.model.state.hideLeft(true);
            this.model.state.hideRight(true);
            this.store.getUserExamSessions(this.model.evaluatingInfo.exam_id).done($.proxy(function (data) {
                this.model.sessionId(data.id);
                this.answer.start(data.id, this.model.ANSWER_TYPE[this.model.evaluatingInfo.rule_type]);
                $("#exercise").show();
            }, this)).error(function () {
                $.studying.loading.hide();
                this.model.popErrorEnd(true);
            }.bind(this));
        }
    }

    onAnswerPrev() {
        this.answer.prev();
    }

    onAnswerNext() {
        this.answer.next();
    }

    onAnswerEnd(showDialog) {
        this.answer.end(showDialog)
    }

    showAnswerExp() {
        this.hideFailedPop();
        if(userId){
            $.studying.loading.show();
            this.store.getActivities().done((res) => {
                if (res) {
                    this.model.currentSessionId(res.current_session_id);
                }
                setTimeout(function () {
                    this.model.isAnswerExp(true);
                    this.init();
                    $.studying.loading.hide();
                }.bind(this),2000);
            });
        }
    }

    reAnswer() {
        this.hideFailedPop();
        $.studying.loading.show();
        setTimeout(function () {
            this.onAnswerInited();
            $.studying.loading.hide();
        }.bind(this),3000);
    }

    popAnswerEnd() {
        this.hidePop();
        $.studying.loading.show();
        if(this.answer.bussiness){
            this.onAnswerEnd(false);
        }
        setTimeout(function () {
            $.studying.loading.hide();
            var event = {
                "type": "onExamExit",
                data: this.model.exitEventData()
            };
            EventDispatcher.dispatchEvent(event);
            this.model.state.hideLeft(false);
            this.model.state.hideRight(false);
        }.bind(this),2000);
    }

    showExitPop() {
        this.model.popOutAnswer(true);
    }

    hidePop() {
        this.model.popOutAnswer(false);
    }

    hideTimeEndPop() {
        this.model.popTimeEnd(false);
        this.backToStatePage();
    }

    hideErrorEndPop() {
        this.model.popErrorEnd(false);
        window.isAnswering = false;
        $.studying.loading.show();
        window.location.reload();
    }

    hideFailedPop() {
        this.model.popFailed(false);
    }

    backToStatePage() {
        if (!this.model.isAnswerExp()) {
            $.studying.loading.show();
        }
        setTimeout(function () {
            if (!this.model.isAnswerExp()) {
                $.studying.loading.hide();
            }
            $('ul.cplay__resource--list').find('.state-on').trigger('click');
            //展开侧边栏
            this.model.state.hideLeft(false);
            this.model.state.hideRight(false);
        }.bind(this),this.model.isAnswerExp() ? 0 :2000);
    }

    getQuestionStatistic() {
        return this.answer.getQuestionStatistic();
    }
}
ko.components.register('x-course-learn-player-answer', {
    viewModel: ViewModel,
    template: tpl
});