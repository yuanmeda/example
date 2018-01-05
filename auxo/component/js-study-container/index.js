import tpl from './template.html'
import ko from 'knockout'
import '../js-course-study/index.js'
import '../js-opencourse-study/index.js'
import '../js-train-study/index.js'
import '../js-specialty-study/index.js'
import '../js-plan-study/index.js'
import '../js-ndu-study/index.js'
import '../js-mooc-study/index.js'
import '../js-barrier-study/index.js'
import '../js-collection-exam-container/index.js'
import '../js-course-offline-study/index.js'

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
            case 'open-course':
                name = 'x-opencoursecard';
                break;
            case 'opencourse_2':
                name = 'x-opencoursecard';
                break;
            case 'business_course':
                name = 'x-coursecard';
                break;
            case 'businesscourse_2':
                name = 'x-coursecard';
                break;
            case 'auxo-train':
                name = 'x-traincard';
                break;
            case 'auxo-specialty':
                name = 'x-specialty';
                break;
            case 'plan':
                name = 'x-plan';
                break;
            case 'mooc-gradecourse':
                name = 'x-mooc';
                break;
            case 'ndu':
                name = 'x-ndu';
                break;
            case 'barrier':
                name = 'x-barrier';
                break;
            case 'offline_course':
                name = 'x-offline-coursecard';
                break;
            case 'exam':
                break;
            default:
                name = 'x-collection-exam-container';
                break;
        }
        return name;
    },
    _getHost: function (type) {
        var host;
        switch (type) {
            case 'opencourse_2':
            case 'businesscourse_2':
                host = (this.hosts.business_course_gateway_url ? this.hosts.business_course_gateway_url : this.hosts.web_front_url) + '/' + this.code;
                break;
            case 'open-course':
            case 'business_course':
                host = (this.hosts.front_course_url ? this.hosts.front_course_url : this.hosts.web_front_url) + '/' + this.code;
                break;
            case 'auxo-train':
                host = (this.hosts.front_train_url ? this.hosts.front_train_url : this.hosts.web_front_url) + '/' + this.code;
                break;
            case 'plan':
            case 'auxo-specialty':
                host = (this.hosts.front_specialtycourse_url ? this.hosts.front_specialtycourse_url : this.hosts.web_front_url) + '/' + this.code;
                break;
            case 'mooc-gradecourse':
                host = this.hosts.mystudy_mooc_web_url;
                break;
            case 'offline_course':
                host = this.hosts.business_course_gateway_url + '/' + this.code;
                break;
            case 'ndu':
                // 不需要host
                break;
            case 'barrier':
                // 不需要host
                break;
            case 'exam':
            default:
                host = {
                    hosts: this.hosts,
                    code: this.code
                }
                break;
        }
        return host;
    }
};
ko.components.register('x-study', {
    viewModel: ViewModel,
    template: tpl
})