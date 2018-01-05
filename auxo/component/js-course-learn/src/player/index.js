import './plugins';
import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null).subscribeTo('INITIAL_DATA'),
            cata_type: ko.observable('0').subscribeTo('CATA_TYPE'),
            cata_id: ko.observable('').subscribeTo('CATA_ID'),
            contextId: ko.observable('').subscribeTo('CONTEXT_ID'),
            dataForPlayer: ko.observable(null).subscribeTo('RESOURCE', this.resourceModify, this),
            route: ko.observable('').publishOn('ROUTE'),
            ready: ko.observable(null).publishOn('COMPONENT_READY'),
            resourceFilter: ko.observable(null).subscribeTo('RESOURCE_FILTER'),
            course: ko.observable(null).subscribeTo('COURSE'),
        };
        this.config = params.config;
        this.model.ready({'key': 'player', 'value': true});
    }

    resourceModify(resource) {
        let contextId = this.model.contextId(), initialData = null;
        if (this.model.initialData()) {
            initialData = this.model.initialData();
            this.model.initialData(null);
        }
        if (resource) {
            this.model.dataForPlayer({resource, contextId, initialData});
            this.model.route(`#/cata_type/${this.model.cata_type()}/cata_id/${this.model.cata_id()}/resource_id/${resource.id}`)
        } else {
            this.model.dataForPlayer(null);
        }
    }
}
ko.components.register('x-course-learn-player', {
    viewModel: ViewModel,
    template: tpl
});