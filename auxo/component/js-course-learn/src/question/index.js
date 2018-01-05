import tpl from './template.html'
import ko from 'knockout'
import './question-item'
import './answer-item'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            ready: ko.observable(null).publishOn('COMPONENT_READY'),
            questions: {
                mine: {
                    items: ko.observableArray(),
                    total: ko.observable(0),
                },
                all: {
                    items: ko.observableArray(),
                    total: ko.observable(0),
                },
                search: {
                    items: ko.observableArray(),
                    total: ko.observable(0),
                },
            },
            filters: {
                mine: {
                    type: 2,
                    page_no: 0,
                    page_size: 10
                },
                all: {
                    type: 1,
                    page_no: 0,
                    page_size: 10
                },
                search: {
                    page_no: 0,
                    page_size: 10,
                    content: ko.observable('')
                },
                answer: {
                    page_no: 0,
                    page_size: 10
                }
            },
            keyword: ko.observable(''),
            filter: {
                type: 0,
                page_no: 0,
                page_size: 10,
                content: ''
            },
            state: {
                page: ko.observable('mine'),//mine我的问题,all全部问题,search搜索结果,detail详情页,edit编辑页
                tab: ko.observable(0)//0我的问题 1全部问题
            },
            store: {
                pageHistory: ['mine'],
            }
        };
        this.config = params.config;
        this.store = {
            /*获取问题列表*/
            getQuestions: (data) => {
                return $.ajax({
                    url: `${this.config.urls.assistGatewayUrl}/v1/questions/search`,
                    data: data,
                    cache: false,
                });
            },
            /*获取某个问题下的回答*/
            getAnswers: (data) => {
                return $.ajax({
                    url: `${this.config.urls.assistGatewayUrl}/v1/answers/search`,
                    type: "GET",
                    data: data,
                    cache: false
                });
            },
            /*新增问题*/
            createQuestion: (data) => {
                return $.ajax({
                    url: `${this.config.urls.assistGatewayUrl}/v1/questions`,
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: "json"
                });
            },
            /*新增回答*/
            createAnswer: (data) => {
                return $.ajax({
                    url: `${this.config.urls.assistGatewayUrl}/v1/answers`,
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: "json"
                });
            },
            /*查询单个问题*/
            getQuestion: (id) => {
                return $.ajax({
                    url: `${this.config.urls.assistGatewayUrl}/v1/questions/${id}`,
                    dataType: "json",
                    cache: false
                })
            }
        };
        this.init();
    }


    init() {
        this.getQuestions().done((res) => {
            this.model.ready({'key': 'question', 'value': true});
        });
    }

    initComputed() {
        this.model.state.page.subscribe((v) => {
            this.model.store.pageHistory.push(v);
        })
    }

    getQuestions() {
        let filter = ko.mapping.toJS(this.model.filters[this.model.state.page()]);
        return this.store.getQuestions(filter).done((res) => {
            this.model.questions[this.model.state.page()].items(res);
        });
    }

    /**
     * 跳转不同页面
     * @param page
     */
    go(page) {
        this.model.state.page(page);
        // viewModel.model.courseResourceInfo((window.currentChapterTitle ? window.currentChapterTitle : '') + ' ' + resourceTitle);
    }

    goBack() {
        let pageHistory = this.model.store.pageHistory;
        pageHistory.length = pageHistory.length - 1;
        this.model.state.page(pageHistory[pageHistory.length - 1]);
    }

    /**
     * 我要提问
     */
    ask() {
        this.go('edit');
    }

    /**
     * 搜索问题
     */
    searchQuestion() {
        if (!this.model.filters.search.content())return;
        this.go('search');
        this.getQuestions();
    }


}
ko.components.register('x-course-learn-question', {
    viewModel: ViewModel,
    template: tpl
});