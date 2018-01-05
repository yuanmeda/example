import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null).subscribeTo('INITIAL_DATA'),
            resourceFilter: ko.observable('').subscribeTo('RESOURCE_FILTER', this.resourceFilterModify, this),
            resources: ko.observableArray(),
            resource: ko.observable('').publishOn('RESOURCE'),
            ready: ko.observable(null).publishOn('COMPONENT_READY'),
            resourceStatus: ko.observable(0).subscribeTo('RESOURCE_STATUS'),
            ICON_CLASS_MAP : {
                '0': 'icon-res-empty',
                '1': 'icon-res-half',
                '2': 'icon-res-finish',
            }
        };
        this.config = params.config;
        this.store = {
            get: (lesson_id, data) => {
                return $.ajax({
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/lessons/${lesson_id}/resources`,
                    data: data,
                    dataType: 'json',
                    cache: false
                });
            }
        };
        this.STATUS_CLASS_MAP = {
            '0': 'xcl-icon-video',
            '1': 'xcl-icon-document',
            '10': 'xcl-icon-exam'
        };
        this.model.ready({'key': 'resource', 'value': true});
        EventDispatcher.addEventListener("onExamExit", function(evt) {
            if(evt.data.context === 'resource'){
                this.changeResource(evt.data.info);
            }
        }.bind(this));
    }

    resourceFilterModify(filter) {
        this.store.get(filter.lesson_id, filter.knowledge_id && {knowledge_id: filter.knowledge_id}).done((res) => {
            for (let i = 0; i < res.length; i++) {
                res[i]['iconClass'] = this.STATUS_CLASS_MAP[res[i].type];
                res[i]['displayData'] = this.formatDisplayData(res[i]);
            }
            this.model.resources(res);
            let initialData = this.model.initialData();
            if (res.length) {
                let find = null;
                if (initialData) {
                    let resource_id = initialData.resource_id;
                    if (resource_id) {
                        for (let i = 0; i < res.length; i++) {
                            if (res[i].id == resource_id) {
                                find = res[i];
                                this.selectResource(res[i]);
                                this.scrollToResource(i);
                                break;
                            }
                        }
                    }
                    this.model.initialData(null);
                }
                if (!find) {
                    this.selectResource(res[0]);
                    this.scrollToResource(0);
                }
            } else {
                this.selectResource(null)
            }
        })
    }

    formatDisplayData(data) {
        //显示当前评测的总题目数
        // var questionsCount = 0;
        // if (data.resource_data.rule_type && data.resource_data.rule_value){
        //     switch (data.resource_data.rule_type){
        //         case 'MEMORY':
        //             questionsCount = data.resource_data.rule_value.question_count;
        //             break;
        //         case 'CONTINUOUS':
        //             questionsCount = data.resource_data.rule_value.continuous_right_count;
        //             break;
        //         case 'QUICK':
        //             questionsCount = data.resource_data.rule_value.question_count;
        //             break;
        //     }
        // }
        switch (data.type) {
            case 0:
                return this.formatDuration(data.resource_data.duration);
            case 1:
                return data.resource_data.page_count + ' ' + _i18nValue('courseLearn.resource.page')
            case 10:
                // return questionsCount ? (questionsCount + ' ' + _i18nValue('courseLearn.resource.questions')) : ''
                return '' //暂不显示题数
        }
    }

    formatDuration(time) {
        if (!time && time !== 0) return time;
        let hour = ~~(time / 60 / 60 );
        let minite = ~~((time - hour * 60 * 60 ) / 60 );
        let second = ~~((time - hour * 60 * 60 - minite * 60 ));
        return (hour > 0 ? (hour < 10 ? '0' + hour : hour) + ':' : '') + (minite < 10 ? '0' + minite : minite) + ':' + (second < 10 ? '0' + second : second);
    }

    startScroll(dir) {
        let scroller = $('.cplay__resource--scroller'), left = scroller.scrollLeft(), speed = dir == 'left' ? -10 : 10;
        window.clearInterval(this.scroller);
        this.scroller = setInterval(() => {
            this.scrolling = true;
            scroller.scrollLeft(scroller.scrollLeft() + speed);
        }, 10);
        scroller.scrollLeft(scroller.scrollLeft());
    }

    endScroll() {
        this.scrolling = false;
        window.clearInterval(this.scroller);
    }

    scrollToResource(index) {
        $('.cplay__resource--scroller').scrollLeft(index * 220)
    }

    selectResource($data) {
        if (window.isAnswering) {
            var event = {
                "type": "onLinkClick",
                data: {
                    context: "resource",
                    info: $data
                }
            }
            EventDispatcher.dispatchEvent(event)
        }else{
            this.changeResource($data);
        }
    }

    changeResource($data){
        if ($data) {
            this.model.resourceStatus($data.status);
        }
        this.model.resource($data);
    }

}
ko.components.register('x-course-learn-resource', {
    viewModel: ViewModel,
    template: tpl
});