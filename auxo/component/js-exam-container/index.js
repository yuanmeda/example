import tpl from './template.html'
import ko from 'knockout'
import '../js-exam-study/index.js'
import '../js-exam-mooc/index.js'
import '../js-course-offline-exam/index.js'

function ViewModel(params) {
    this.items = params.items;
    this.hosts = params.host;
    this.code = params.projectCode;
}

ViewModel.prototype = {
    _getComponent: function (type) {
        var name;
        switch (type) {
            case 'mooc-exam':
            case 'mooc-exercise':
                name = 'x-exam-mooc';
                break;
            case 'offline_exam':
                name = 'x-offline-examcard';
                break;
            default:
                name = 'x-examcard';
                break;
        }
        return name;
    },
    _getHost: function (type) {
        var host;
        switch (type) {
            case 'mooc-exam':
            case 'mooc-exercise':
                host = this.hosts.mystudy_mooc_exam_web_url;
                break;
            case 'online_exam':
            case 'offline_exam':
                host = this.hosts.online_exam_gateway_url + '/' + this.code;
                break;
            default:
                host = this.hosts.web_front_url + '/' + this.code;
                break;
        }
        return host;
    }
};
ko.components.register('x-exam', {
    viewModel: ViewModel,
    template: tpl
})