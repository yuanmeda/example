import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

function ViewModel(params) {
    this.model = params.data;
}

ViewModel.prototype.formatStatus = function (status) {
    if (status === 0) {
        return "singleCoin.notUse"
    } else {
        return "singleCoin.used"
    }
};
ViewModel.prototype.formatTime = function (time) {
    return time.split('T')[0];
};

ko.components.register('x-single-coin', {
    viewModel: ViewModel,
    template: tpl
});

