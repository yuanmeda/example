import tpl from './template.html'
import ko from 'knockout'
import '../js-collection-exam-study/index.js'
import '../js-collection-exam-mooc/index.js'

function ViewModel(params) {
    this.item = params.model;
    this.hosts = params.host.hosts;
    this.code = params.host.code;
    this.openType = params.openType || '_self';
}
ViewModel.prototype = {
    _getComponent: function () {
        var name;
        var type = this.item.unit_type;
        switch (type) {
            case 'mooc-exam':
            case 'mooc-exercise':
                name = 'x-collection-examcard';
                break;
            default:
                name = 'x-collection-examcard';
                break;
        }
        return name;
    },
    _getHost: function () {
        var host;
        var type = this.item.unit_type;
        switch (type) {
            case 'mooc-exam':
            case 'mooc-exercise':
                host = this.hosts.mystudy_mooc_exam_web_url;
                break;
            default:
                host = this.hosts.web_front_url + '/' + this.code;
                break;
        }
        return host;
    }
};
ko.components.register('x-collection-exam-container', {
    viewModel: ViewModel,
    template: tpl
})