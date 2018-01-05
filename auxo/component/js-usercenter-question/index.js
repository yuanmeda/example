import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue;

function ViewModel(params) {
    var mode = 0,
        query_type = [{
            type: 2,
            title: _i18nValue('ucQa.all'),
            is_accepted: undefined
        }, {
            type: 2,
            title: _i18nValue('ucQa.unanswered'),
            is_accepted: false
        }, {
            type: 2,
            title: _i18nValue('ucQa.answered'),
            is_accepted: true
        }];

    this.model = {
        tab: ko.observable(mode), //0：我的提问 1：我的回答 2：全部问题 3：问题详情 4：编辑问题 5：搜索问题 6:我的关注
        select: {custom_id: ko.observable(''), name: ko.observable(_i18nValue('ucQa.all'))}, //课程搜索
        query_type: ko.observableArray(query_type), // 0：我的提问 1：我的回答 2：全部问题 3：我的关注 tab 下的过滤条件
        question: {
            title: ko.observable(''), // 新建、编辑问题
            content: ko.observable(''),
            attach_pictures: ko.observableArray([]),
            placeholder: _i18nValue('ucQa.ph4'),
            isEdit: ko.observable(false),
            isSearchRelateQ: ko.observable(false),
            info: {
                id: ko.observable(''),
                create_user: ko.observable(''),
                create_time: ko.observable(''),
                display_user: {
                    display_name: ko.observable(''),
                    icon: ko.observable('')
                },
                title: ko.observable(''),
                content: ko.observable(''),
                target_name: ko.observable(''),
                follow_count: ko.observable(0),
                attach_pictures: ko.observableArray([])
            }, //问题详情
            items: ko.observableArray([]),
            counts: ko.observable(0),
            relateQ: ko.observableArray([]),
            search: {
                page_no: ko.observable(0),
                page_size: ko.observable(10),
                custom_id: ko.observable(''),
                type: ko.observable(2),
                content: ko.observable(''),
                is_accepted: ko.observable('')
            }
        },
        course: {
            init: ko.observable(false),
            items: ko.observableArray([{custom_id: '', name: _i18nValue('ucQa.all')}]),
            counts: ko.observable(0),
            search: {page_size: 10, page_no: ko.observable(0)}
        },
        answer: {
            content: ko.observable(''), //回答
            attach_pictures: ko.observableArray([]),
            placeholder: _i18nValue('ucQa.ph3'),
            search: {
                question_id: ko.observable(''),
                page_size: 10,
                page_no: ko.observable(0)
            }
        },
        api: {
            mystudy: params.mystudy_gateway,
            qa_gateway: params.qa_gateway,
            qa_api: params.qa_api
        },
        user: {
            id: ko.observable(params.user_id),
            photo: params.user_photo
        },
        history: {
            tab: ko.observable(0)
        },
        init: ko.observable(false),
        showUpload: ko.observable(false)
    };
    this.init();
    this.bindEvent();
    this.validate();
    this.validInfo = ko.validatedObservable(this.model, {deep: true});
}

ViewModel.prototype.store = {
    getCourses: function (api_url, search) {
        return $.ajax({
            url: api_url + '/v1/mine/studies/business_courses',
            data: search,
            dataType: "json",
            cache: false
        })
    },
    getQuestions: function (api_url, search) {
        return $.ajax({
            url: api_url + '/v1/questions/search',
            data: search,
            dataType: "json",
            cache: false
        })
    },
    getAnswers: function (api_url, search) {
        return $.ajax({
            url: api_url + '/v1/answers/mine',
            data: search,
            dataType: "json",
            cache: false
        })
    },
    getAnswersById: function (api_url, search) {
        return $.ajax({
            url: api_url + '/v1/answers/search',
            data: search,
            dataType: "json",
            cache: false
        })
    },
    createQuestion: function (api_url, data) {
        return $.ajax({
            url: api_url + '/v1/questions',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data),
            type: 'POST',
            dataType: "json"
        });
    },
    createAnswer: function (api_url, data) {
        return $.ajax({
            url: api_url + '/v1/answers',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data),
            type: 'POST',
            dataType: "json"
        });
    },
    editQuestion: function (api_url, id, data) {
        return $.ajax({
            url: api_url + '/v1/questions/' + id,
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data),
            type: 'put',
            dataType: "json"
        });
    },
    getMyInterest: function (api_url, search) {
        return $.ajax({
            url: api_url + '/v1/questions/mine/follows',
            data: search,
            dataType: "json",
            cache: false
        })
    },
    getQuestionbyId: function (api_url, id) {
        return $.ajax({
            url: api_url + '/v1/questions/' + id,
            dataType: "json",
            cache: false
        })
    }
};

ViewModel.prototype.init = function () {
    //__mode是解决初始化 我的答疑的具体某个模块(非默认的我的提问的模块)
    if (typeof __mode != 'undefined' && __mode != -1) {
        this.model.init(true);
        this.switchQTab(__mode);
        this.getCourses();
        $('.uc-qa-body-nav').remove();
    } else {
        this.getCourses();
        this.getList();
    }

    this.getR = this.throttle($.proxy(this.getRelatQ, this), 500);
    var t = this;
    this.model.question.title.subscribe(function (nv) {
        if ($.trim(nv) !== '' && t.model.question.isSearchRelateQ()) {
            t.getR();
        } else {
            t.model.question.relateQ.removeAll();
        }
    });
};
ViewModel.prototype.getRelatQ = function () {
    var q = this.model.question;
    q.search.content(q.title());
    q.search.type(5);
    if ($.trim(q.title()) == '') return;
    this.store.getQuestions(this.model.api.qa_gateway, ko.mapping.toJS(q.search)).done(function (res) {
        q.relateQ(res.items || []);
    });
};

ViewModel.prototype.getCourses = function () {
    var course = this.model.course;
    this.store.getCourses(this.model.api.mystudy, ko.mapping.toJS(course.search)).done(function (res) {
        Array.prototype.push.apply(course.items(), res.items);
        course.items.valueHasMutated();
        course.counts(res.count);
        course.init(true);
    });
};

ViewModel.prototype.selectCourse = function ($data) {
    var m = this.model;
    m.select.custom_id($data.custom_id);
    m.select.name($data.name);
    this.switchQTab(this.model.tab());
};
ViewModel.prototype.switchQTab = function (type, $data) {
    if (~$.inArray(this.model.tab(), [0, 1, 2, 6])) {
        if (!this.model.init()) return;
        this.model.history.tab(this.model.tab())
    }
    this.model.question.items([]);
    this.model.question.counts(0);
    this.formatParams(type, $data);
    this.model.question.search.page_no(0);
    this.model.tab(type);
    this.getList();

};
ViewModel.prototype.formatParams = function (type, $data) {
    var query_type = [];
    switch (type) {
        case 0:
            query_type = [{
                type: 2,
                title: _i18nValue('ucQa.all'),
                is_accepted: undefined
            }, {
                type: 2,
                title: _i18nValue('ucQa.unanswered'),
                is_accepted: false
            }, {
                type: 2,
                title: _i18nValue('ucQa.answered'),
                is_accepted: true
            }];
            this.model.question.search.content('');
            this.model.question.search.is_accepted(undefined);
            this.model.question.search.type(2);
            break;
        case 1:
            query_type = [{
                title: _i18nValue('ucQa.all'),
                is_accepted: undefined
            }, {
                title: _i18nValue('ucQa.accepted'),
                is_accepted: true
            }];
            this.model.question.search.content('');
            this.model.question.search.is_accepted(undefined);
            break;
        case 2:
            query_type = [{
                type: 5,
                title: _i18nValue('ucQa.hot')
            }, {
                type: 3,
                title: _i18nValue('ucQa.new')
            }];
            this.model.question.search.is_accepted(undefined);
            this.model.question.search.content('');
            this.model.question.search.type(5);
            break;
        case 3: // 问题详情
            this.model.answer.content('');
            this.model.answer.attach_pictures([]);
            this.model.question.info.id($data);
            this.validInfo.errors.showAllMessages(false);
            this.model.showUpload(false);
            break;
        case 4: //编辑问题
            this.model.question.isEdit($data ? true : false);
            this.model.question.info.id($data ? $data.id : '');
            this.model.question.relateQ([]);
            this.model.showUpload(false);
            this.model.question.isSearchRelateQ(false);
            break;
        case 5: //搜索问题
            this.model.question.search.type(1);
            break;
        case 6: //我的关注
            query_type = [{
                type: 2,
                title: _i18nValue('ucQa.all'),
                is_accepted: undefined
            }, {
                type: 2,
                title: _i18nValue('ucQa.unanswered'),
                is_accepted: false
            }, {
                type: 2,
                title: _i18nValue('ucQa.answered'),
                is_accepted: true
            }];
            this.model.question.search.is_accepted(undefined);
            this.model.question.search.content('');
    }
    this.model.query_type(query_type);
};

ViewModel.prototype.getList = function (onlyList) {
    var m = this.model, t = this, q = m.question, api_url = m.api.qa_gateway;
    m.init(false);
    q.search.custom_id(m.select.custom_id());
    q.search.content($.trim(q.search.content()));
    q.items([]);
    q.counts(0);
    switch (m.tab()) {
        case 0:
        case 2:
        case 5:
            this.store.getQuestions(api_url, ko.mapping.toJS(q.search)).done(function (res) {
                t.handleData(res);
            });
            break;
        case 1:
            var s = ko.mapping.toJS(q.search);
            s.type = undefined;
            this.store.getAnswers(api_url, s).done(function (res) {
                t.handleData(res);
                $(".uc-qa-body-content-answer-ques p").dotdotdot({
                    height: 50
                });
            });
            break;
        case 3:
            m.answer.search.question_id(q.info.id());
            $.extend(m.answer.search, m.question.search);
            if (!onlyList) {
                this.store.getQuestionbyId(api_url, q.info.id()).done(function (res) {
                    ko.mapping.fromJS(res, {}, q.info);
                });
            }
            this.store.getAnswersById(api_url, ko.mapping.toJS(m.answer.search)).done(function (res) {
                t.handleData(res);
            });
            break;
        case 4:
            if (q.isEdit()) {
                this.store.getQuestionbyId(api_url, q.info.id()).done(function (res) {
                    q.title(res.title);
                    q.content(res.content);
                    q.attach_pictures(res.attach_pictures || []);
                });
            } else {
                q.title('');
                q.content('');
                q.attach_pictures([]);
                this.validInfo.errors.showAllMessages(false);
            }
            break;
        case 6:
            this.store.getMyInterest(api_url, ko.mapping.toJS(q.search)).done(function (res) {
                t.handleData(res);
            })
    }
};

ViewModel.prototype.handleData = function (res) {
    var m = this.model, course = this.model.course;
    m.init(true);
    m.question.items(res.items || []);
    m.question.counts(res.total || 0);
    this._page(m.question.counts(), m.question.search.page_no(), m.question.search.page_size());
};

ViewModel.prototype.bindEvent = function () {
    $(document).unbind('click');
    $(document).on('click', function (e) {
        if ($(e.target).hasClass('uc-qa-header-select-item') || $(e.target).parent('.uc-qa-header-select-item').length) $('#js_qa_slist').toggle();
        else {
            $('#js_qa_slist').hide();
        }
        $('#js_relateq_list').hide();
    });
};

ViewModel.prototype.queryByType = function ($data, event) {
    $(event.target).addClass('on').siblings().removeClass('on');
    this.model.question.search.type($data.type);
    this.model.question.search.is_accepted($data.is_accepted);
    this.getList();
};

ViewModel.prototype.goBack = function () {
    this.model.question.search.content('');
    this.switchQTab(this.model.history.tab());
};

ViewModel.prototype.createQuestion = function () {
    if (!this.validInfo.isValid()) {
        this.validInfo.errors.showAllMessages();
        return;
    }
    var t = this,
        title = $.trim(this.model.question.title()),
        content = $.trim(this.model.question.content()),
        api_url = this.model.api.qa_gateway;
    if (!this.model.question.isEdit()) {
        this.store.createQuestion(api_url, {
            title: title,
            content: content,
            attach_pictures: this.model.question.attach_pictures()
        }).done(function (res) {
            t.success()
        });
    } else {
        this.store.editQuestion(api_url, this.model.question.info.id(), {
            title: title,
            content: content,
            attach_pictures: this.model.question.attach_pictures()
        }).done(function () {
            t.success()
        });
    }
};

ViewModel.prototype.success = function () {
    var t = this;
    $.fn.udialog.alert(_i18nValue('ucQa.success'), {
        buttons: [{
            text: _i18nValue('ucQa.ok'),
            click: function () {
                $(this).udialog("hide");
            },
            'class': 'default-btn'
        }]
    });
    setTimeout(function () {
        $('.ui-dialog').remove();
        t.switchQTab(0);
    }, 1500);
};

ViewModel.prototype.createAnswer = function () {
    if (!this.validInfo.isValid()) {
        this.validInfo.errors.showAllMessages();
        return;
    }
    var data = {
        question_id: this.model.question.info.id(),
        attach_pictures: this.model.answer.attach_pictures(),
        content: $.trim(this.model.answer.content())
    }, t = this;
    this.store.createAnswer(this.model.api.qa_gateway, data).done(function () {
        t.model.answer.content('');
        t.model.showUpload(false);
        t.model.answer.attach_pictures([]);
        t.validInfo.errors.showAllMessages(false);
        t.model.question.search.page_no(0);
        t.model.question.items([]);
        t.model.question.counts(0);
        t.getList();
    });
};

ViewModel.prototype.searchRelateQ = function ($data, event) {
    this.model.question.isSearchRelateQ(true);
    this.toggleActive($data, event);
    return true;
};

ViewModel.prototype.scroll = function () {
    var c = this.model.course;
    if (c.init() && c.counts() > 10 && c.items().length - 1 < c.counts() && $('#js_qa_slist').children('li').eq(-5).offset().top < 350) {
        c.init(false);
        c.search.page_no(c.search.page_no() + 1);
        this.getCourses();
    }
};


ViewModel.prototype.validate = function () {
    var t = this;
    this.model.question.title.extend({
        required: {
            params: true,
            message: _i18nValue('ucQa.required'),
            onlyIf: function () {
                return t.model.tab() === 4;
            }
        }
    });

    this.model.question.content.extend({
        maxLength: {
            params: 2000,
            message: _i18nValue('ucQa.max1'),
            onlyIf: function () {
                return t.model.tab() === 4;
            }
        }
    });

    this.model.answer.content.extend({
        required: {
            params: true,
            message: _i18nValue('ucQa.required'),
            onlyIf: function () {
                return t.model.tab() === 3;
            }
        },
        maxLength: {
            params: 2000,
            message: _i18nValue('ucQa.max1'),
            onlyIf: function () {
                return t.model.tab() === 3;
            }
        }
    })
};
ViewModel.prototype.focus = function ($data, event) {
    $(event.target).siblings('input,textarea').focus();
};

ViewModel.prototype.toggleActive = function ($data, event) {
    $(event.target).parent().toggleClass('active');
    return true;
};

ViewModel.prototype.throttle = function (fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args)
        }, delay)
    }
};
ViewModel.prototype.formatDate = function (date) {
    if (!date) return '';
    date = date.replace('T', ' ');
    date = date.replace(/-/g, '/');
    date = date.substring(0, date.indexOf('.')) + ' ' + date.substring(date.indexOf('.') + 4);
    return date;
};

ViewModel.prototype.showUpload = function () {
    this.model.showUpload(!this.model.showUpload());
}
ViewModel.prototype._page = function (total, page, size) {
    var search = this.model.question.search,
        t = this;
    $('#js_qa_pagination').pagination(total, {
        items_per_page: size,
        num_display_entries: 5,
        current_page: page,
        is_show_total: false,
        is_show_input: true,
        pageClass: 'pagination-box',
        prev_text: "common.addins.pagination.prev",
        next_text: "common.addins.pagination.next",
        callback: function (pageNum) {
            if (pageNum != page) {
                search.page_no(pageNum);
                t.getList(true);
            }
        }
    });
};


ko.components.register('x-usercenter-qa', {
    viewModel: ViewModel,
    template: tpl
});

