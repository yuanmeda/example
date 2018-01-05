import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;
function ViewModel(params) {
    this.model = {
        question: null,
        answer: null,
        filter: {
            page_no: 0,
            page_size: 5
        },
        answers: {
            items: [],
            total: 0
        },
        state: {
            showAnswerArea: false,
            showAcceptIcon: params.options.showAcceptIcon !== false,
            showAcceptBtn: params.options.showAcceptBtn !== false,
        },
        content: ''
    };
    this.model = ko.mapping.fromJS(this.model);
    this.model.question(params.question);
    this.model.answer(params.answer);
    this.display_user = params.answer.display_user;
    this.options = params.options;
    this.userId = params.userId;
    this.actions = this.options.actions || {
            'accept': void 0,
            'delete': void 0,
        };
    this.urls = this.options.urls || {
            'api': '',
            'gateway': ''
        };
    this.store = {
        acceptAnswer: (id, isAccepted) => {
            return $.ajax({
                url: this.urls.api + '/v1/answers/' + id + '/actions/accept/' + isAccepted,
                dataType: "json",
                type: 'PUT'
            })
        }
    };
    this.init();
}
ViewModel.prototype.init = function () {
};

ViewModel.prototype.formatTime = function (time) {
    return time && time.split('.')[0].replace('T', ' ');
};

ViewModel.prototype.accept = function () {
    this.store.acceptAnswer(this.model.answer().id, true).done((res) => {
        this.actions.accept && this.actions.accept(this.model.answer());
    });
};


ko.components.register('x-course-learn-question__answer-item', {
    viewModel: ViewModel,
    template: tpl
});