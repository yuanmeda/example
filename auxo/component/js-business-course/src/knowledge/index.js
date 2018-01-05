import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue,
    _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null),
            knowledge: ko.observable(null),
            knowledge_id: ko.observable(''),
            breadcrumb: ko.observableArray(),
            contextId: ko.observable(''),
            resourceFilter: ko.observable(null),
            ready: ko.observable(null),
            keyword: ko.observable(""),
            searchno: ko.observable(false)
        };
        this.config = params.config;
        this.callbacks = params.callbacks;
        this.store = {
            get: () => {
                return $.ajax({
                    url: `${this.config.businessCoursesGatewayUrl}/v1/business_courses/${this.config.courseId}/knowledges`,
                    dataType: 'json',
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        this.store.get().done((res) => {
            this.model.knowledge(this.formatKnowledge(res));
            this.model.ready({
                'key': 'knowledge',
                'value': true
            });
        })
    }

    initWithData(initialData) {
        if (initialData) {
            if (initialData.cata_type == '1') {
                let cata_id = initialData.cata_id,
                    {
                        idMap,
                        knowledgeIdMap
                    } = this.knowledgeMap;
                if (cata_id) {
                    let find = idMap[cata_id];

                    function openRoute(obj) {
                        obj.isOpen(true);
                        let arr = knowledgeIdMap[obj.parent_knowledge_id];
                        if (arr) {
                            for (let i = 0; i < arr.length; i++) {
                                if (arr[i].lesson_id == find.lesson_id) {
                                    openRoute(arr[i]);
                                    break;
                                }
                            }
                        }
                    }

                    if (find) {
                        openRoute(find);
                        this.getResources(find);
                    }
                }
                this.model.initialData(null);
            }
        }
    }

    formatKnowledge(knowledge) {
        function objectToArray(obj) {
            let arr = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    arr.push({
                        'lesson_id': key,
                        'knowledge': obj[key]
                    })
                }
            }
            return arr;
        }

        function findParent(data, set, idKey, pidKey) {
            for (let i = 0; i < set.length; i++) {
                if (data[pidKey] == set[i][idKey]) return set[i];
            }
            return null;
        }

        function arrayToTree(arr, idKey, pidKey) {
            let tree = [],
                mappedArr = {},
                arrElem, mappedElem;
            for (let i = 0, len = arr.length; i < len; i++) {
                arrElem = arr[i];
                mappedArr[arrElem[idKey]] = arrElem;
                mappedArr[arrElem[idKey]]['children'] = [];
                mappedArr[arrElem[idKey]]['isOpen'] = ko.observable(false);
            }
            for (let id in mappedArr) {
                if (mappedArr.hasOwnProperty(id)) {
                    mappedElem = mappedArr[id];
                    if (findParent(mappedElem, arr, idKey, pidKey)) {
                        mappedArr[mappedElem[pidKey]]['children'].push(mappedElem);
                    } else {
                        tree.push(mappedElem);
                    }
                }
            }
            return tree;
        }

        let idMap = {},
            knowledgeIdMap = {},
            lessonIdMap = {},
            fmtData = [];
        for (let i = 0; i < knowledge.length; i++) {
            idMap[knowledge[i].id] = knowledge[i];
            knowledgeIdMap[knowledge[i].knowledge_id] = knowledgeIdMap[knowledge[i].knowledge_id] || [];
            knowledgeIdMap[knowledge[i].knowledge_id].push(knowledge[i]);
            lessonIdMap[knowledge[i].lesson_id] = lessonIdMap[knowledge[i].lesson_id] || [];
            lessonIdMap[knowledge[i].lesson_id].push(knowledge[i]);
        }
        lessonIdMap = objectToArray(lessonIdMap);
        for (let i = 0; i < lessonIdMap.length; i++) {
            fmtData = fmtData.concat(arrayToTree(lessonIdMap[i]['knowledge'], 'knowledge_id', 'parent_knowledge_id'));
        }
        this.knowledgeMap = {
            idMap,
            knowledgeIdMap,
            lessonIdMap
        };
        return fmtData;
    }

    toggleTree($data) {
        $data.isOpen(!$data.isOpen());
    }

    select($data) {
        $data.isOpen(!$data.isOpen());
        this.model.knowledge_id($data.id);
    }

    search() {
        if (arguments[1].keyCode == 13) {
            this.model.knowledge_id("");
            this.model.searchno(true);

            for (var prop in this.knowledgeMap.idMap) {
                var item = this.knowledgeMap.idMap[prop];
                if ($.trim(item.title) == $.trim(this.model.keyword())) {
                    this.model.knowledge_id(item.id);
                    item.isOpen(true);
                    this.model.searchno(false);

                    break;
                }
            }
        }
    }

    getResources($data) {
        this.model.knowledge_id($data.id);
        this.model.contextId(`${this.config.contextId}.lesson:${$data.lesson_id}`);
        this.model.resourceFilter({
            lesson_id: $data.lesson_id,
            knowledge_id: $data.knowledge_id
        });
        this.formatBreadcrumb($data);
        this.callbacks && $.isFunction(this.callbacks.knowledge) && this.callbacks.knowledge($data);
    }

    formatBreadcrumb(data) {
        let res = [],
            knowledgeId = data.id,
            {
                idMap,
                knowledgeIdMap
            } = this.knowledgeMap;
        let find = idMap[knowledgeId];

        function exec(obj) {
            res.unshift(obj.title);
            let arr = knowledgeIdMap[obj.parent_knowledge_id];
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].lesson_id == find.lesson_id) {
                        exec(arr[i]);
                        break;
                    }
                }
            }
        }

        if (find) {
            exec(find);
        }
        this.model.breadcrumb(res);
    }

    resourceFilterModify(resourceFilter) {
        if (!resourceFilter.knowledge_id) this.model.knowledge_id('');
    }

    clean() {
        this.model.keyword("");
        this.model.searchno(false);
    }
}
ko.components.register('x-course-learn-knowledge', {
    viewModel: ViewModel,
    template: tpl
});
