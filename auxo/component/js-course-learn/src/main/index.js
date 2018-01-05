import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null).subscribeTo('INITIAL_DATA', this.initWithData, this),
            cata_type: ko.observable('').publishOn('CATA_TYPE'),
            rightTab: ko.observable('3'),
            breadcrumb: ko.observableArray().subscribeTo('BREADCRUMB'),
            course: ko.observable(null).publishOn('COURSE'),
            ready: ko.observable(null).publishOn('COMPONENT_READY'),
            resize: ko.observable(null).publishOn('PLAYER_RESIZE'),
            state: {
                hideLeft: ko.observable(false).subscribeTo('HIDELEFT'),
                hideRight: ko.observable(false).subscribeTo('HIDERIGHT')
            }
        };
        this.config = params.config;
        this.store = {
            get: () => {
                return $.ajax({
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}`,
                    dataType: 'json',
                    cache: false
                });
            }
        };
        this.init();
        let element = $('.cplay__wrap');
        this.config.supportTransition = (function (element) {
            let props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
            for (let i in props) if (element.style[props[i]] !== undefined) return true;
            return false;
        })(element[0]);
        if (this.config.supportTransition) {
            element.on('transitionend webkitTransitionEnd msTransitionEnd otransitionend oTransitionEnd', () => {
                this.model.resize({});
            });
        }
        EventDispatcher.addEventListener("onExamExit", function(evt) {
            if(evt.data.context === 'main') {
                this.goToDetail();
            }
        }.bind(this));
    }

    init() {
        this.store.get().done((res) => {
            this.model.course(res);
            this.config.contextId = `${res.context_id ? `${res.context_id}.` : '' }businesscourse_2:${this.config.courseId}`;
            this.model.ready({'key': 'main', 'value': true});
        });
    }

    initWithData(initialData) {
        this.model.cata_type(initialData.cata_type || '0');
    }

    switchLeftSide(type) {
        this.model.cata_type(type);
    }

    switchRightSide(type) {
        this.model.rightTab(type);
    }

    toggleLeft() {
        let fn = this.model.state.hideLeft;
        if (!this.config.supportTransition) {
            let side = $(".cplay__side-l"),
                wrap = $('.cplay__wrap');
            $.when(side.animate({
                'left': fn() ? '0' : '-286px'
            }, {duration: 500, queue: false}), wrap.animate({
                'padding-left': fn() ? '286px' : '0'
            }, {duration: 500, queue: false})).then(() => {
                fn(!fn());
                this.model.resize({});
            })
        } else {
            fn(!fn());
        }
    }

    toggleRight() {
        let fn = this.model.state.hideRight;
        if (!this.config.supportTransition) {
            let side = $(".cplay__side-r"),
                wrap = $('.cplay__wrap');
            $.when(side.animate({
                'right': fn() ? '0' : '-360px'
            }, {duration: 500, queue: false}), wrap.animate({
                'padding-right': fn() ? '360px' : '0'
            }, {duration: 500, queue: false})).then(() => {
                fn(!fn());
                this.model.resize({});
            })
        } else {
            fn(!fn());
        }
    }

    returnDetail() {
        if (window.isAnswering) {
            var event = {
                "type": "onLinkClick",
                data: {
                    context: "main",
                    info: ""
                }
            }
            EventDispatcher.dispatchEvent(event)
        }else{
            this.goToDetail();
        }
    }

    goToDetail() {
        location.href = this.config.selfUrl + '/'+this.config.projectCode+'/course/'+this.config.courseId;
    }

}
ko.components.register('x-course-learn', {
    viewModel: ViewModel,
    template: tpl
});