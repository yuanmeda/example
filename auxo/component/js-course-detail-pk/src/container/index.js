import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            course: ko.observable(params.course),
            pkId: ko.observable(params.course.catalog[0].extra && params.course.catalog[0].extra.pk_id),
        };
        this.options = params.options;
        this.projectCode = params.options.projectCode;
        this.urls = this.options.urls || {
                'api': '',
                'gateway': '',
                'static': ''
            };
    }

    switchChapter($data) {
        this.model.pkId('');
        this.model.pkId($data.extra && $data.extra.pk_id);
    }
}
ko.components.register('x-course-detail-pk-container', {
    viewModel: ViewModel,
    template: tpl
});