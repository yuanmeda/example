import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue,
    _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null),
            catalog: ko.observable(null),
            lesson_id: ko.observable(''),
            breadcrumb: ko.observableArray(),
            contextId: ko.observable(''),
            resourceFilter: ko.observable(null),
            ready: ko.observable(null),
            courseSelected: ko.observable(false)
        };
        this.config = params.config;
        this.callbacks = params.callbacks;

        this.store = {
            get: () => {
                return $.ajax({
                    url: `${this.config.businessCoursesGatewayUrl}/v1/business_courses/${this.config.courseId}/catalogs`,
                    dataType: 'json',
                    cache: false
                });
            },
            progresses: () => {
                return $.ajax({
                    url: `${this.config.businessCoursesGatewayUrl}/v1/business_courses/${this.config.courseId}/lesson/progresses`,
                    dataType: 'json',
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        $.when(this.store.get(), this.store.progresses()).done((res, progresses) => {
            res = res[0];
            progresses = progresses[0];

            this.model.catalog(this.formatCatalog(res, progresses));
            this.model.catalog().children[0]&&this.model.catalog().children[0].isOpen(true);//默认选中第一个根节点并展开
            this.model.ready({
                'key': 'catalog',
                'value': true
            });
        });
    }

    initWithData(initialData) {
        if (initialData) {
            if (initialData.cata_type == '0') {
                let cata_id = initialData.cata_id,
                    routes = this.routes;
                if (cata_id) {
                    for (let i = 0; i < routes.length; i++) {
                        let route = routes[i],
                            lessons = route[route.length - 1]['lessons'];
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
                let route = routes[0],
                    lesson = route[route.length - 1]['lessons'][0];
                this.getResources(lesson);
                for (let i = 0; i < route.length; i++) route[i].isOpen(true);
            }
        }
    }

    formatCatalog(catalog, progresses) {
        let walks = [],
            routes = [],
            progressesMap = [],
            evaluatingStatusMap = [];

        for (var i = 0; i < progresses.length; i++) {
            var item = progresses[i];
            progressesMap[item.id] = item.status;
            evaluatingStatusMap[item.id] = item.standard_status;
        }

        function uniqueRoute(rs) {
            let map = {},
                res = [];
            for (let i = 0; i < rs.length; i++) {
                let route = rs[i],
                    lastData = route[route.length - 1];
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
            if (data.lessons.length) {
                routes.push(walks.concat());
                $.each(data.lessons, (i, lesson) => {
                    lesson.parent_chapter_id = data.id
                    if (progressesMap[lesson.id]) {
                        lesson.status = progressesMap[lesson.id];
                        lesson.standard_status = evaluatingStatusMap[lesson.id];
                    }
                    else {
                        lesson.status = 0;
                        lesson.standard_status = -1;
                    }
                })
            }

            walks.length = walks.length - 1;
            return data;
        }

        catalog = exec(catalog);
        this.routes = uniqueRoute(routes);
        return catalog;
    }

    lessonStatus($data) {
        if($data.lessons && $data.lessons.length > 0) {
            return $data.lessons[0].status;
        }

        return -1;
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

    getChapters($data) {
        this.model.lesson_id($data.id);
        this.callbacks && $.isFunction(this.callbacks.chapter) && this.callbacks.chapter($data);
    }

    getSections($data) {
        this.model.lesson_id($data.id);
        if ($data.lessons.length == 1) return;
        this.callbacks && $.isFunction(this.callbacks.section) && this.callbacks.section($data);
    }

    getResources($data) {
        this.model.lesson_id($data.id);
        this.model.contextId(`${this.config.contextId}.lesson:${$data.id}`);
        this.model.resourceFilter({
            lesson_id: $data.id
        });
        this.formatBreadcrumb($data);
        this.model.courseSelected(false);

        this.callbacks && $.isFunction(this.callbacks.lesson) && this.callbacks.lesson($data);
    }

    formatBreadcrumb(data) {
        let res = [],
            rs = this.routes,
            lessonId = data.id;
        for (let i = 0; i < rs.length; i++) {
            let route = rs[i],
                lessons = route[route.length - 1]['lessons'],
                find = null;
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

    courseClick() {
        this.model.courseSelected(!this.model.courseSelected());
        if(this.model.courseSelected()) {
            this.callbacks.course(this.config.courseId);
        }
    }
}
ko.components.register('x-course-learn-catalog', {
    viewModel: ViewModel,
    template: tpl
});
