import tpl from './template.html'
import ko from 'knockout'
import dialogHelper from '../dialogHelper'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

function ViewModel(params) {
    this.model = {
        question: null,
        filter: {
            page_no: 0,
            page_size: 5
        },
        answers: {
            items: [],
            total: 0
        },
        state: {
            showAnswerArea: false,
            showMoreContent: false
        },
        content: '',
        highlight: params.highlight || '' //高亮的文本
    };
    this.model = ko.mapping.fromJS(this.model);
    var question = $.extend(true, {}, params.question)
    question.answer_count = ko.observable(question.answer_count);
    question.accepted_answer_id = ko.observable(question.accepted_answer_id);
    
    // 处理需要高亮的逻辑（标题和文本）
    var highlight = ko.unwrap(this.model.highlight);
    if(highlight) {
        var content = question.content;
        var title = question.title;
        question.content = content.split(highlight).join(`<span style="color: red">${highlight}</span>`);
        question.title = title.split(highlight).join(`<span style="color: red">${highlight}</span>`)
    }

    this.model.question(question);
    this.display_user = params.question.display_user;
    this.options = $.extend(true, {}, params.options); // 这个的深拷贝很重要，不然可能造成引用污染
    this.optionsForAnswer = {
        'urls': params.options.urls,
        'actions': {
            'delete': $.proxy(this.getAnswer, this),
        },
        'state': {
            'showAcceptIcon': false,
            'showAcceptBtn': false,
        }
    };
    this.options.showAcceptIcon = false;
    this.options.showAcceptBtn = false;
    this.userId = params.userId;
    this.actions = this.options.actions || {
            'detail': void 0,
            'delete': void 0,
            'edit': void 0
        };
    this.urls = this.options.urls || {
            'api': '',
            'gateway': ''
        };
    this.store = {
        getQuestion: (id) => {
            return $.ajax({
                url: this.urls.gateway + '/v1/questions/' + id,
                dataType: "json",
                cache: false
            })
        },
        deleteQuestion: (id) => {
            return $.ajax({
                url: this.urls.gateway + '/v1/questions/' + id,
                dataType: "json",
                type: 'DELETE'
            })
        },
        createAnswer: (data) => {
            return $.ajax({
                url: this.urls.gateway + '/v1/answers',
                data: JSON.stringify(data),
                dataType: "json",
                type: 'POST'
            })
        },
        getAnswer: (data) => {
            return $.ajax({
                url: this.urls.gateway + '/v1/answers/search',
                data: data,
                dataType: "json",
                cache: false
            })
        },
        toggleFollowQuestion: (id, isFollow) => {
            return $.ajax({
                url: this.urls.gateway + '/v1/questions/' + id + '/follow',
                type: isFollow ? 'POST' : 'DELETE'
            })
        }
    };
    this.init();
}
ViewModel.prototype.init = function () {
    var self = this;
    this.dot();
    this.options.actions.accept = function(){
        self.getQuestion();
    };
};

ViewModel.prototype.formatTime = function (time) {
    return time && time.split('.')[0].replace('T', ' ');
};
ViewModel.prototype.getQuestion = function () {
    var self = this;
    return this.store.getQuestion(this.model.question().id).done((res) => {
        res.display_user = self.display_user;
        self.model.question().accepted_answer_id(res.accepted_answer_id);
        self.model.question().answer_count(res.answer_count);
        self.dot();
        self.getAnswer();
    })
};
ViewModel.prototype.getAnswer = function () {
    var filter = this.model.filter,
        search = ko.toJS(this.model.filter), question = this.model.question;
    search.question_id = question().id;
    this.store.getAnswer(search).done((res) => {
        this.model.answers.items(res.items || []);
        this.model.answers.total(res.total || 0);
        question().answer_count(res.total || 0);
        $(`#pagination_${this.model.question().id}`).pagination(res.total, {
            items_per_page: filter.page_size(),
            num_display_entries: 5,
            current_page: filter.page_no(),
            is_show_total: false,
            prev_text: 'courseComponent.front.courseDetail.prev',
            next_text: 'courseComponent.front.courseDetail.next',
            callback: (page) => {
                if (page != filter.page_no()) {
                    filter.page_no(page);
                    this.getAnswer();
                }
            }
        });
    })
};
ViewModel.prototype.searchAnswer = function () {
    this.model.filter.page_no(0);
    this.getAnswer();
};
ViewModel.prototype.toggleAnswerArea = function () {
    var fn = this.model.state.showAnswerArea;
    fn(!fn());
    if (fn()) this.searchAnswer();
};

ViewModel.prototype.questionDetail = function () {
    this.actions.detail && this.actions.detail(this.model.question());
};
ViewModel.prototype.deleteQuestion = function () {
    dialogHelper.confirm(_i18nValue('courseLearnQuestion.confirmDelete'), () => {
        this.store.deleteQuestion(this.model.question().id).done((res) => {
            this.actions.delete && this.actions.delete(this.model.question());
        })
    });

};
ViewModel.prototype.editQuestion = function(question) {
    this.actions.edit && this.actions.edit(question);
}

ViewModel.prototype.toggleFollow = function() {
    var self = this;
    const question = ko.unwrap(this.model.question)
    const id = question.id;
    const followed = question.is_current_user_follow;

    this.store.toggleFollowQuestion(id, !followed)
    .done(function(){
        question.is_current_user_follow = !followed;
        self.model.question(question)
    })
}

ViewModel.prototype.answer = function () {
    if (!this.model.content())return;
    if (this.model.content().length > 2000) {
        dialogHelper.alert(_i18nValue('courseLearnQuestion.maxLength'));
        return;
    }
    var postData = {
        question_id: this.model.question().id,
        title: '',
        content: this.model.content(),
    };
    this.store.createAnswer(postData).done((res) => {
        this.model.content('');
        this.getAnswer();
    })
};

ViewModel.prototype.toggleMoreContent = function (flag) {
    this.model.state.showMoreContent(flag);
    if (flag) {
        $(`#question_${this.model.question().id} .qa-item-cont`).trigger('destroy');
    } else {
        $(`#question_${this.model.question().id} .qa-item-cont`).dotdotdot({
            height: 42,
            after: '.toggle'
        }).removeClass('expand');
    }
};
ViewModel.prototype.dot = function (selector, height) {
    ko.tasks.schedule(() => {
        function dotContent($dot) {
            $dot.dotdotdot({
                height: 42,
                after: '.toggle'
            }).removeClass('init').removeClass('expand');
            var $i = $dot.find('i.icon.xclq-icon-down-arrow');
            if ($i.css('display') === 'inline') {
                $i.css('display', 'inline-block');
            }
        }

        function destroyContent($dot) {
            $dot.addClass('init expand').trigger('destroy');
        }

        var $cont = $(`#question_${this.model.question().id} .qa-item-cont`);
        $cont.on('click', '.xclq-icon-down-arrow', function () {
            destroyContent($(this).parents('.qa-item-cont'));
        }).on('click', '.xclq-icon-up-arrow', function () {
            dotContent($(this).parents('.qa-item-cont'));
        });
        dotContent($cont);
    });
};


ko.components.register('x-course-learn-question', {
    viewModel: ViewModel,
    template: tpl
});