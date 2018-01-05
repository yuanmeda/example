import koTpl from './ko-templates.html'
import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            initialData: ko.observable(null).subscribeTo('INITIAL_DATA', this.initWithData, this),
            knowledge: ko.observableArray(),
            selectKnowledge: ko.observable(null),
            cata_id: ko.observable('').publishOn('CATA_ID'),
            knowledge_id: ko.observable(''),
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
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/knowledges`,
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
            this.model.knowledge(this.formatKnowledge(res));
            this.model.ready({'key': 'knowledge', 'value': true});
        })
        EventDispatcher.addEventListener("onExamExit", function(evt) {
            if(evt.data.context === 'knowledge'){
                this.changeResources(evt.data.info);
            }
        }.bind(this));
    }

    initWithData(initialData) {
        if (initialData) {
            if (initialData.cata_type == '1') {
                let cata_id = initialData.cata_id, {idMap, knowledgeIdMap} = this.knowledgeMap,
                    knowledge = this.model.knowledge();
                if (knowledge && knowledge.length) {
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
                } else {
                    this.model.route('#/');
                    this.model.ready({'key': 'knowledge', 'value': true, 'call': 'refresh'});
                }
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
            let tree = [], mappedArr = {}, arrElem, mappedElem;
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

        let idMap = {}, knowledgeIdMap = {}, lessonIdMap = {}, fmtData = [];
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
        this.knowledgeMap = {idMap, knowledgeIdMap, lessonIdMap};
        return fmtData;
    }

    toggleTree($data) {
        $data.isOpen(!$data.isOpen());
    }

    getResources($data) {
        if (window.isAnswering) {
            var event = {
                "type": "onLinkClick",
                data: {
                    context: "knowledge",
                    info: $data
                }
            }
            EventDispatcher.dispatchEvent(event)
        }else{
            this.changeResources($data);
        }
    }

    changeResources($data) {
        this.model.knowledge_id($data.id);
        this.model.cata_id($data.id);
        this.model.selectKnowledge($data);
        this.model.contextId(`${this.config.contextId}.lesson:${$data.lesson_id}`);
        this.model.resourceFilter({lesson_id: $data.lesson_id, knowledge_id: $data.knowledge_id});
        this.formatBreadcrumb($data);
    }

    formatBreadcrumb(data) {
        let res = [], knowledgeId = data.id, {idMap, knowledgeIdMap} = this.knowledgeMap;
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
}
ko.components.register('x-course-learn-knowledge', {
    viewModel: ViewModel,
    template: tpl
});