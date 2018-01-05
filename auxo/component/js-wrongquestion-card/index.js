import tpl from './template.html'
import ko from 'knockout'

function ViewModel(params) {
    this.items = params.items;
    this.questionType = params.questionType;
    this.projectCode = params.projectCode;
    this.component = params.source;
    this.callBack = params.callBack;
    this.loading = params.loading;
}

ViewModel.prototype = {
    formatTime: function (t) {
        if (!t)
            return '';

        return $.format.date(t, 'yyyy-MM-dd HH:MM');
    },
    getQuestionTypeTitle: function (t) {
        return this.questionType[t];
    },
    onBtnClick: function (d, e) {
        this.callBack(d);
        e.stopPropagation();
    },
    gotoDetail: function (obj) {
        location.href = window.selfUrl + '/' + this.projectCode + '/wrong_question/detail?wrong_question_id=' + obj.wrong_question_id + '&component=' + this.component + '&index=' + obj._index + '&__return_url=' + obj.returnUrl;
    }
};

ko.components.register('x-wrongquestion-card', {
    viewModel: ViewModel,
    template: tpl
});