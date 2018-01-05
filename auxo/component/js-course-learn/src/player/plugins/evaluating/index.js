import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        let {resource, initialData} = params.data;
        this.resource = resource;
        this.initialData = initialData;
        this.model = {
            RESOURCE_TYPE: { //资源类型
                VIDEO: 0, //视频
                DOC: 1, //文档
                EVALUATE: 10 // 评测
            },
            RESOURCE_STATUS: { //资源学习状态
                UNDO: 0, //未学习
                DOING: 1, //学习中
                DONE: 2 // 已学习
            },
            resourceId: this.resource.id,
            lessonId: params.resourceFilter.lesson_id,
            knowledge_id: params.resourceFilter.knowledge_id,
            isStartBtnDisabled: ko.observable(false),
            isShowAnswer: ko.observable(false),
            isAnswerExp: ko.observable(false),
            evaluatingInfo: ko.observable(null),
            activities: ko.observable(null),
            popTimeZero: ko.observable(false),
            resourceStatus: ko.observable(0).publishOn('RESOURCE_STATUS')
        };
        this.config = params.config;
        this.store = {
            getEvaluatingInfo: () => {
                var dataObj = {};
                if (this.model.lessonId) {
                    dataObj['lesson_id'] = this.model.lessonId;
                }
                if (this.model.knowledge_id) {
                    dataObj['knowledge_id'] = this.model.knowledge_id;
                }
                return $.ajax({
                    url: `/v1/business_courses/${this.config.courseId}/evaluates/${this.resource.id}`,
                    dataType: 'json',
                    data: dataObj,
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
                    var submitTimeStr = $.format.toBrowserTimeZone(Date.ajustTimeString(window.answerSubmitTime), 'yyyy/MM/dd HH:mm:ss');
                    timestamp = new Date(submitTimeStr).getTime();
                    if(timestamp > 0){
                        dataObj['timestamp'] = timestamp;
                    }
                    window.answerSubmitTime = '';
                }
                return $.ajax({
                    url: `/v1/business_courses/${this.config.courseId}/resources/${this.resource.id}/activities`,
                    dataType: 'json',
                    data: dataObj,
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        $('.exp-container').hide();
        if (courseStatusCode != 10) {
            $('.exp-container').show();
            $('.play-container').hide();
            return;
        }
        this.store.getEvaluatingInfo().done((res) => {
            this.model.evaluatingInfo(res);
            if(userId){
                this.store.getActivities().done((res) => {
                    if (res) {
                        this.model.activities(res);
                        //未到评测时间
                        if(this.model.activities().extra_data.last_pass===true && this.model.activities().extra_data.next_start_time && this.model.activities().extra_data.system_current_time && this.model.activities().extra_data.next_start_time > this.model.activities().extra_data.system_current_time){
                            this.model.isStartBtnDisabled(true);
                        }
                    } else {
                        var defaultActivities = {
                            status: 0
                        };
                        if(this.model.evaluatingInfo().rule_type === 'MEMORY'){
                            defaultActivities['extra_data'] = {
                                "pass_times": 0,//通过次数
                                "last_pass": false,//上次是否通过
                            }
                        }
                        this.model.activities(defaultActivities)
                    }
                    this.model.resourceStatus(this.model.activities().status);
                });
            }

        });
    }

    showAnswer(isAnswerExp) {
        if (this.model.evaluatingInfo().rule_type==='QUICK' && this.model.evaluatingInfo().rule_value.duration === 0) {
            this.model.popTimeZero(true);
            return;
        }
        //未到评测时间
        if (this.model.isStartBtnDisabled()===true) {
            return;
        }
        if (isAnswerExp){
            this.model.isAnswerExp(true);
        }
        this.model.isShowAnswer(true);
    }

    hideTimeZeroPop() {
        this.model.popTimeZero(false);
    }

    dateFormat(unixDate) {
        return $.format.toBrowserTimeZone(unixDate, 'yyyy/MM/dd HH:mm:ss');
    }
}
ko.components.register('x-course-learn-player-evaluating', {
    viewModel: ViewModel,
    template: tpl
});