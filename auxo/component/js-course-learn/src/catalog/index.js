import koTpl from './ko-templates.html'
import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null).subscribeTo('INITIAL_DATA', this.initWithData, this),
            catalog: ko.observable(null),
            course: ko.observable(null).subscribeTo('COURSE'),
            cata_id: ko.observable('').publishOn('CATA_ID'),
            lesson_id: ko.observable(''),
            breadcrumb: ko.observableArray().publishOn('BREADCRUMB'),
            contextId: ko.observable('').publishOn('CONTEXT_ID'),
            resourceFilter: ko.observable(null).publishOn('RESOURCE_FILTER').subscribeTo('RESOURCE_FILTER', this.resourceFilterModify, this),
            route: ko.observable('').publishOn('ROUTE'),
            ready: ko.observable(null).publishOn('COMPONENT_READY')
        };
        this.config = params.config;
        this.store = {
            get: () => {
                return $.ajax({
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/catalogs`,
                    dataType: 'json',
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        $('body').append(koTpl);
        this.store.get().done((res) => {
            this.model.catalog(this.formatCatalog(res));
            this.model.ready({'key': 'catalog', 'value': true});
        })
        EventDispatcher.addEventListener("onExamExit", function(evt) {
            if(evt.data.context === 'catalog'){
                this.changeResources(evt.data.info);
            }
        }.bind(this));
    }

    initWithData(initialData) {
        if (initialData) {
            if (initialData.cata_type == '0') {
                let cata_id = initialData.cata_id, routes = this.routes;
                if (routes && routes.length) {
                    if (cata_id) {
                        for (let i = 0; i < routes.length; i++) {
                            let route = routes[i], lessons = route[route.length - 1]['lessons'];
                            for (let j = 0; j < lessons.length; j++) {
                                let lesson = lessons[j];
                                if (lesson && lesson.id == cata_id) {
                                    this.getResources(lesson);
                                    for (let k = 0; k < route.length; k++) route[k].isOpen(true);
                                    return;
                                }
                            }
                        }
                    }
                    let route = routes[0], lesson = route[route.length - 1]['lessons'][0];
                    this.getResources(lesson);
                    for (let i = 0; i < route.length; i++)route[i].isOpen(true);
                } else {
                    this.model.route('#/');
                }
            }
        }
    }

    formatCatalog(catalog) {
        let walks = [], routes = [];

        function uniqueRoute(rs) {
            let map = {}, res = [];
            for (let i = 0; i < rs.length; i++) {
                let route = rs[i], lastData = route[route.length - 1];
                if (!map[lastData.id]) {
                    map[lastData.id] = route;
                    res.push(route);
                }
            }
            return res;
        }

        function exec(data) {
            data.isOpen = ko.observable(false);
            walks.push(data);
            if (data.children) {
                for (let i = 0; i < data.children.length; i++) {
                    data.children[i] = exec(data.children[i]);
                }
            }
            if (data.lessons.length) routes.push(walks.concat());
            walks.length = walks.length - 1;
            return data;
        }

        catalog = exec(catalog);
        this.routes = uniqueRoute(routes);
        return catalog;
    }

    toggleTree($data) {
        $data.isOpen(!$data.isOpen());
    }

    getResourcesByCatalog($data) {
        if ($data.lessons && $data.lessons.length == 1) {
            this.getResources($data.lessons[0]);
        } else {
            this.toggleTree($data);
        }
    }

    getResources($data) {
        if (window.isAnswering) {
            var event = {
                "type": "onLinkClick",
                data: {
                    context: "catalog",
                    info: $data
                }
            }
            EventDispatcher.dispatchEvent(event)
        }else{
            this.changeResources($data);
        }
    }

    changeResources($data) {
        this.model.cata_id($data.id);
        this.model.lesson_id($data.id);
        this.model.contextId(`${this.config.contextId}.lesson:${$data.id}`);
        this.model.resourceFilter({lesson_id: $data.id});
        this.formatBreadcrumb($data);
    }

    formatBreadcrumb(data) {
        let res = [], rs = this.routes, lessonId = data.id;
        for (let i = 0; i < rs.length; i++) {
            let route = rs[i], lessons = route[route.length - 1]['lessons'], find = null;
            for (let j = 0; j < lessons.length; j++) {
                let lesson = lessons[j];
                if (lesson.id == lessonId) {
                    res.push(lesson.name);
                    find = route;
                    break;
                }
            }
            if (find) {
                res = _.arrayMap(route, (v) => {
                    return v.name;
                }).concat(res);
                res.shift();
                break;
            }
        }
        this.model.breadcrumb(res);
    }

    resourceFilterModify(resourceFilter) {
        if (resourceFilter.knowledge_id) this.model.lesson_id('');
    }
}
ko.components.register('x-course-learn-catalog', {
    viewModel: ViewModel,
    template: tpl
});