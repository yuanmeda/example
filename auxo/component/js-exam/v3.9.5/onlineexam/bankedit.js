;(function ($, window) {
    'use strict';
    var _ = ko.utils;
    var NDRCODEMAP = {
        'choice': '$RE0201',
        'multiplechoice': '$RE0202',
        'match': '$RE0205',
        'judge': '$RE0203',
        'order': '$RE0204',
        'handwrite': '$RE0210',
        'graphicgapmatch': '$RE0207',
        'vote': '$RE0225',
        'textentrymultiple': '$RE0209',
        'extendedtext': '$RE0206',
        'drawing': '$RE0211',
        'data': '$RE0208'
    };
    var APICODEMAP = {
        '10': 'choice',
        '15': 'multiplechoice',
        '40': 'match',
        '30': 'judge',
        '103': 'order',
        '136': 'order',
        '142': 'handwrite',
        '146': 'handwrite',
        '108': 'graphicgapmatch',
        '112': 'vote',
        '20': 'textentrymultiple',
        '25': 'extendedtext',
        '145': 'extendedtext',
        '109': 'drawing',
        '50': 'data'
    };
    var DES_KEY = '13465c85caab4dfd8b1cb5093131c6d0';
    var questionTypeData = {
        'all': {key: 'all', desc: '全部基础题型', count: 0},
        'choice': {key: 'choice', desc: '单选题', count: 0},
        'multiplechoice': {key: 'multiplechoice', desc: '多选题', count: 0},
        'match': {key: 'match', desc: '连线题', count: 0},
        'judge': {key: 'judge', desc: '判断题', count: 0},
        'order': {key: 'order', desc: '排序题', count: 0},
        'handwrite': {key: 'handwrite', desc: '手写题', count: 0},
        'graphicgapmatch': {key: 'graphicgapmatch', desc: '拼图题', count: 0},
        'vote': {key: 'vote', desc: '投票题', count: 0},
        'textentrymultiple': {key: 'textentrymultiple', desc: '填空题', count: 0},
        'extendedtext': {key: 'extendedtext', desc: '问答题', count: 0},
        'drawing': {key: 'drawing', desc: '作文题', count: 0},
        'data': {key: 'data', desc: '复合题', count: 0},
        'interactive': {key: 'interactive', desc: '互动题型', count: 0}
    };

    function BankEditModel(params) {
        var model = {
            bank: {
                id: params.bankId(),
                question_count: 0,
                nd_code: '',
                addCount: 0,
                allQuestions: []
            },
            filter: {
                page: 0,
                size: 2,
                coverage: 'App/f4bfd12b-e9bb-4665-8745-7e7dd42c8b66/OWNER',
                chapter_id: params.chapterId ? params.chapterId() : '',
                status: ['CREATED', 'ONLINE']
            },
            options: {
                path: ko.toJS(params.path) || '',
                code: [],
                mode: params.mode
            },
            questions: {
                items: [],
                total: 0
            },
            mode: params.mode, //lr左右，tb上下
            modalModule: params.modalModule,
            questionTypeList: [],
            questionType: '',
            module: 'list',
            editUrl: '',
            sending: false
        };
        this.model = ko.mapping.fromJS(model);
        this.model.filter.category = ko.computed(function () {
            var code = $.grep(this.model.options.code(), function (val) {
                return val;
            });
            return [this.model.options.path(), code.join(' and ')];
        }, this);
        this.model.quesitonOptions = {'staticUrl': params.staticUrl};
        this.model.actions = {
            'answer': {func: null, desc: '答案与解析', show: true},
            'add': {func: $.proxy(this.addQuestion, this), desc: '加入', show: this.model.mode() != 'lr'},
            'update': {func: $.proxy(this.updateQuestion, this), desc: '修改', show: this.model.mode() == 'lr'},
            'delete': {
                func: $.proxy(this.deleteQuestion, this),
                desc: this.model.mode() != 'lr' ? '取消加入' : '删除',
                show: true
            }
        };
        this.params = params;
        this.questionTypes = questionTypeData;

        //问题队列
        this.questionQueue = {
            data: {add: [], delete: []},
            setAll: function (questionArr, op) {
                this.data[op] = questionArr;
            },
            add: function (question, op) {
                if (!~this.index(question, op))this.getAll(op).push(question);
                return this;
            },
            remove: function (question, op) {
                var index = this.index(question, op);
                if (~index)this.getAll(op).splice(index, 1);
                return this;
            },
            index: function (question, op) {
                var data = this.getAll(op), len = data.length;
                for (var i = 0; i < len; ++i) {
                    if (question.identifier == data[i].identifier) {
                        return i;
                    }
                }
                return -1;
            },
            isEmpty: function (op) {
                return !this.getAll(op).length;
            },
            getAll: function (op) {
                if (!this.data[op])throw new Error('No data for this operation!');
                return this.data[op];
            }
        };

        this.store = {
            common: {},
            bank: {
                get: function (bankId) {
                    return $.ajax({
                        url: '/' + projectCode + '/v2/question_banks/' + bankId,
                        dataType: "json",
                        cache: false
                    })
                },
                addQuestion: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/questions/' + data.questionId,
                        type: 'POST',
                        dataType: "json"
                    })
                },
                addInteractiveQuestion: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/coursewareobjects/' + data.questionId,
                        type: 'POST',
                        dataType: "json"
                    })
                },
                deleteQuestion: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/questions/' + data.questionId,
                        type: 'DELETE',
                        dataType: "json"
                    })
                }
            },
            question: {
                query: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/papers/questions',
                        data: data,
                        dataType: "json",
                        cache: false
                    })
                },
                deleteCache: function (question_id) {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/papers/questions/' + question_id + '/cache',
                        dataType: "json",
                        type: 'DELETE'
                    })
                },
                create: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/courseware_objects/actions/from_template',
                        data: data,
                        dataType: "json",
                        cache: false
                    })
                },
                getEditorUrl: function () {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/courseware_objects/actions/get_editor_url',
                        dataType: "json",
                        cache: false
                    })
                }
            }
        };
        this.init();
    }

    BankEditModel.prototype.init = function () {
        this.model.filter.page(0);
        this.model.options.code([]);
        this.model.questionType('all');
        this._getBankDetail();
        this._initEventBindings();
    };

    BankEditModel.prototype._refreshCount = function () {
        var self = this, filter = this.model.filter, search = ko.mapping.toJS(filter), searchStr = this._getParamString(search);
        search.page = 0;
        search.size = 1;
        searchStr = this._getParamString(search);
        return this.store.question.query(searchStr);
    };

    BankEditModel.prototype._initEventBindings = function () {
        var self = this;
        $(window).off('message').on('message', function (event) {
            var data = event.originalEvent.data;
            if (typeof event.originalEvent.data == 'object') {
                data = event.originalEvent.data.data;
            }
            else {
                data = JSON.parse(event.originalEvent.data.replace('[PROJECT_NAME]_:_:', '') || 0);
            }

            if ((data.message == 'QuestionSaved' || data.message == 'QuestionAdd') && data.id) {
                if (self.model.module() == 'add') {
                    if (this.isOperating)return;
                    self.isOperating = true;
                    var def = typeof event.originalEvent.data == 'object' ? self.store.bank.addInteractiveQuestion({
                        bankId: self.model.bank.id(),
                        questionId: data.id
                    }) : self.store.bank.addQuestion({bankId: self.model.bank.id(), questionId: data.id})
                    def.done(function () {
                        $.fn.dialog2.helpers.alert('添加题目成功');
                        self._getBankDetail();
                        self.model.module('list');
                        self.isOperating = false;
                    });
                } else {
                    self.store.question.deleteCache(data.id).done(function () {
                        self._getBankDetail();
                        self.model.module('list');
                    });
                }
            }
        });
    };

    BankEditModel.prototype.addQuestion = function ($data) {
        if (this.isOperating)return;
        this.isOperating = true;
        var self = this, addCount = self.model.bank.addCount;
        this.store.bank.addQuestion({bankId: this.model.bank.id(), questionId: $data.identifier}).done(function () {
            self.questionQueue.remove($data, 'delete');
            self.questionQueue.add($data, 'add');
            addCount(addCount() + 1);
            $.fn.dialog2.helpers.alert('添加题目成功');
            self.isOperating = false;
            self._refreshCount().done(function () {
                self._getBankDetail();
            });
        });
    };

    BankEditModel.prototype.deleteQuestion = function ($data) {
        if (this.isOperating)return;
        this.isOperating = true;
        var self = this, addCount = self.model.bank.addCount;
        this.store.bank.deleteQuestion({bankId: this.model.bank.id(), questionId: $data.identifier}).done(function () {
            self.questionQueue.remove($data, 'add');
            self.questionQueue.add($data, 'delete');
            addCount(addCount() ? addCount() - 1 : 0);
            if (self.model.mode() == 'lr') self.model.filter.page(0);
            $.fn.dialog2.helpers.alert('删除题目成功');
            self.isOperating = false;
            self._refreshCount().done(function () {
                self._getBankDetail();
            });
        });
    };

    BankEditModel.prototype.createQuestion = function ($data) {
        var self = this;
        this.store.question.getEditorUrl().done(function (data) {
            var params = {
                "editorCode": "elearning_chuanguan",
                "token_info": window.CryptoJS.TripleDES.encrypt(JSON.stringify(data.token_info), DES_KEY).toString(),
                "coverage": data.coverage
            };
            self.model.module('add');
            self.model.editUrl(data.server_url + '/templates.html?' + self._getParamString(params));
        });
    };

    BankEditModel.prototype.updateQuestion = function ($data) {
        var self = this;
        this.store.question.getEditorUrl().done(function (data) {
            var params = {
                "id": $data.identifier,
                "editorCode": "elearning_chuanguan",
                "token_info": window.CryptoJS.TripleDES.encrypt(JSON.stringify(data.token_info), DES_KEY).toString()
            };
            self.model.module('edit');
            self.model.editUrl(data.server_url + '/?' + self._getParamString(params));
        });
    };

    BankEditModel.prototype._getBankDetail = function () {
        var self = this;
        this.model.sending(true);
        _.arrayForEach(this.sending || [], function (v) {
            v.abort();
        });
        this.sending = [];
        this.sending.push(this.store.bank.get(this.model.bank.id()));
        this.sending[0].done(function (data) {
            self._computeQuestionTypeList(self.model.mode() == 'lr' && data);
            self.model.bank.question_count(data.question_count || 0);
            self.model.bank.nd_code(data.nd_code);
            self.model.options.code([self.model.mode() == 'lr' && data.nd_code, self.model.options.code()[1]]);
            self._getQuestionList();
        });
    };

    BankEditModel.prototype.toggleQuestionType = function ($data) {
        var code = this.model.options.code;
        this.model.questionType($data.key);
        code([code()[0], NDRCODEMAP[$data.key]]);
        this.model.filter.page(0);
        this._getBankDetail();
    };
    BankEditModel.prototype._computeQuestionTypeList = function (bankDetail) {
        var questionTypes = this.questionTypes, computedQuestionTypeList = [];
        if (bankDetail && bankDetail.question_type_count_map) {
            questionTypes['all'].count = bankDetail.question_count || 0;
            computedQuestionTypeList.push(questionTypes['all']);
            var q_map = bankDetail.question_type_count_map;
            _.objectForEach(q_map, function (key, value) {
                if (APICODEMAP[key] && value > 0) {
                    var q_type = questionTypes[APICODEMAP[key]];
                    q_type.count = value;
                    computedQuestionTypeList.push(q_type);
                }
            });
        } else {
            if (this.model.mode() == 'lr') {
                questionTypes['all'].count = bankDetail.question_count || 0;
                computedQuestionTypeList.push(questionTypes['all']);
            } else {
                for (var key in questionTypes) {
                    computedQuestionTypeList.push(questionTypes[key]);
                }
            }
        }
        this.model.questionTypeList([]);
        this.model.questionTypeList(computedQuestionTypeList);
    };

    BankEditModel.prototype._getQuestionList = function () {
        var self = this, filter = this.model.filter, search = ko.mapping.toJS(filter), searchStr = this._getParamString(search);
        var dataReq = this.store.question.query(searchStr), nowPage = search.page, nowSize = search.size;
        search.page = 0;
        search.size = 9999;
        search.chapter_id = undefined;
        search.category = [this.model.bank.nd_code()];
        searchStr = this._getParamString(search);
        var checkReq = this.store.question.query(searchStr);
        this.sending.push(dataReq);
        this.sending.push(checkReq);
        $.when(dataReq, checkReq).then(function (data, check) {
            var result = _.arrayMap(data[0].items, function (dataItem) {
                var qObj = {};
                qObj.questionItem = dataItem;
                qObj.identifier = dataItem.identifier;
                qObj.isAdded = false;
                _.arrayForEach(check[0].items, function (checkItem) {
                    if (checkItem.identifier == qObj.identifier) {
                        qObj.isAdded = true;
                        return false;
                    }
                });
                return qObj;
            });

            //过滤题目的条件
            if (!self.questionQueue.isEmpty('add') || !self.questionQueue.isEmpty('delete')) {
                var newResult = [], queue = [];
                _.arrayForEach(result, function (v) {
                    if (self.model.mode() == 'lr') {
                        if (~self.questionQueue.index(v, 'delete')) {
                            queue.push(v);
                        } else {
                            newResult.push(v);
                        }
                    } else {
                        if (~self.questionQueue.index(v, 'add')) {
                            if (v.isAdded) {
                                self.questionQueue.remove(v, 'add');
                            } else {
                                v.isAdded = true;
                            }
                        }
                        if (~self.questionQueue.index(v, 'delete')) {
                            if (!v.isAdded) {
                                self.questionQueue.remove(v, 'delete');
                            } else {
                                v.isAdded = false;
                            }
                        }
                        newResult.push(v);
                    }
                });
                if (self.model.mode() == 'lr') {
                    self.questionQueue.setAll(queue, 'delete');
                }
                result = newResult;
            }

            self.model.questions.items([]);
            self.model.questions.items(result);
            self._pagination(data[0].count, nowSize, nowPage, function (pageNum) {
                filter.page(pageNum);
                self._getBankDetail();
            });
        }).always(function () {
            self.sending = [];
            self.model.sending(false);
        });
    };

    BankEditModel.prototype._getParamString = function (params) {
        var str = "";
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var value = params[key], trimVal = "";
                if ($.isArray(value)) {
                    var len = value.length;
                    for (var i = 0; i < len; i++) {
                        trimVal = $.trim(value[i]);
                        if (trimVal !== "")str += key + '=' + trimVal + "&";
                    }
                } else {
                    trimVal = $.trim(value);
                    if (trimVal !== "")str += key + '=' + trimVal + "&";
                }
            }
        }
        return str ? str.substring(0, str.length - 1) : str
    };

    BankEditModel.prototype.toggleModule = function (type, $data) {
        this.model.module(type);
        if (type == 'list')this._getBankDetail();
    };
    BankEditModel.prototype.toggleModalModule = function (type) {
        this.model.modalModule(type);
    };
    BankEditModel.prototype._pagination = function (totalCount, pageSize, currentPage, callback) {
        $('#bank_pagination').pagination(totalCount, {
            items_per_page: pageSize,
            num_display_entries: 5,
            current_page: currentPage,
            is_show_total: true,
            is_show_input: false,
            pageClass: 'pagination-box',
            prev_text: '<&nbsp;上一页',
            next_text: '下一页&nbsp;>',
            callback: function (pageNum) {
                if (pageNum != currentPage && callback) {
                    callback(pageNum);
                }
            }
        });
    };

    ko.components.register('x-bank-edit', {
        viewModel: BankEditModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
