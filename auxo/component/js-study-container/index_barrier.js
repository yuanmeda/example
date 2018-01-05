import tpl from './template_barrier.html'
import ko from 'knockout'
import '../js-barrier-dyyj-study/index.js'

function ViewModel(params) {
    this.items = params.items;
    this.hosts = params.host;
    this.bxkType = params.bxkType;
    this.code = params.projectCode;
    this.openType = params.openType;
}

ViewModel.prototype = {
    _getComponent: function (type) {
        var name;
        switch (type) {
            case 'barrier':
                name = 'x-barrier';
                break;
            default:
                name = 'x-barrier';
                break;
        }
        return name;
    },
    _getHost: function (type) {
        var host;
        switch (type) {
            case 'barrier':
                // 不需要host
                break;
            default:
                break;
        }
        return host;
    }
};
ko.components.register('x-study', {
    viewModel: ViewModel,
    template: tpl
})