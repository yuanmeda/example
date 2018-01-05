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
        'data': '$RE0208',
        'nd_fillblank': '$RE0421',
        'nd_classified': '$RE0415',
        'nd_arithmetic ': '$RE0408',
        'nd_memorycard ': '$RE0407',
        'nd_guessword ': '$RE0410',
        'nd_fraction ': '$RE0416',
        'nd_textselect ': '$RE0414',
        'nd_magicbox ': '$RE0411',
        'nd_order': '$RE0402',
        'nd_wordpuzzle': '$RE0406',
        'nd_pointsequencing': '$RE0418',
        'nd_lable': '$RE0417',
        'nd_imagemark': '$RE0424',
        'nd_probabilitycard': '$RE0426',
        'nd_catchball': '$RE0427',
        'nd_linkup_old': '$RE0401',
        'nd_compare_old': '$RE0409',
        'nd_handwritequestion': '$RE0445',
        'nd_table': '$RE0403',
        'nd_makeword': '$RE0449',
        'nd_section_evaluating': '$RE0443',
        'nd_sentence_evaluat': '$RE0434',
        'nd_lego': '$RE0432',
        'nd_openshapetool': '$RE0454',
        'nd_mark_point': '$RE0450',
        'nd_intervalproblem': '$RE0452',
        'nd_mathaxi': '$RE0447'
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
        '50': 'data',
        '421': 'nd_fillblank',
        '415': 'nd_classified',
        '408': 'nd_arithmetic',
        '407': 'nd_memorycard',
        '410': 'nd_guessword',
        '416': 'nd_fraction',
        '414': 'nd_textselect',
        '411': 'nd_magicbox',
        '402': 'nd_order',
        '406': 'nd_wordpuzzle',
        '418': 'nd_pointsequencing',
        '417': 'nd_lable',
        '424': 'nd_imagemark',
        '426': 'nd_probabilitycard',
        '427': 'nd_catchball',
        '401': 'nd_linkup_old',
        '409': 'nd_compare_old',
        '445': 'nd_handwritequestion',
        '403': 'nd_table',
        '449': 'nd_makeword',
        '443': 'nd_section_evaluating',
        '434': 'nd_sentence_evaluat',
        '432': 'nd_lego',
        '454': 'nd_openshapetool',
        '450': 'nd_mark_point',
        '452': 'nd_intervalproblem',
        '447': 'nd_mathaxis'
    };
    var DES_KEY = '13465c85caab4dfd8b1cb5093131c6d0';
    var questionTypeData = {
        'all': {key: 'all', desc: '全部基础题', count: 0},
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
        'data': {key: 'data', desc: '复合题', count: 0}
        //'interactive': {key: 'interactive', desc: '互动题型', count: 0}
    };

    var courseWareObjectsTypeData = {
        'all': {key: 'all', desc: '全部互动题', count: 0},
        'nd_fillblank': {key: 'nd_fillblank', desc: '选词填空', count: 0},
        'nd_classified': {key: 'nd_classified', desc: '分类题型', count: 0},
        'nd_arithmetic': {key: 'nd_arithmetic', desc: '竖式计算题', count: 0},
        'nd_memorycard': {key: 'nd_memorycard', desc: '记忆卡片题', count: 0},
        'nd_guessword': {key: 'nd_guessword', desc: '猜词题', count: 0},
        'nd_fraction': {key: 'nd_fraction', desc: '分式加减', count: 0},
        'nd_textselect': {key: 'nd_textselect', desc: '文本选择', count: 0},
        'nd_magicbox': {key: 'nd_magicbox', desc: '魔方盒题型', count: 0},
        'nd_order': {key: 'nd_order', desc: '排序题', count: 0},
        'nd_wordpuzzle': {key: 'nd_wordpuzzle', desc: '字谜游戏题', count: 0},
        'nd_pointsequencing': {key: 'nd_pointsequencing', desc: '点排序', count: 0},
        'nd_lable': {key: 'nd_lable', desc: '标签题', count: 0},
        'nd_imagemark': {key: 'nd_imagemark', desc: '图片标签题', count: 0},
        'nd_probabilitycard': {key: 'nd_probabilitycard', desc: '概率卡牌', count: 0},
        'nd_catchball': {key: 'nd_catchball', desc: '摸球工具', count: 0},
        'nd_linkup_old': {key: 'nd_linkup_old', desc: '连连看', count: 0},
        'nd_compare_old': {key: 'nd_compare_old', desc: '比大小题', count: 0},
        'nd_handwritequestion': {key: 'nd_handwritequestion', desc: '手写题', count: 0},
        'nd_table': {key: 'nd_table', desc: '表格题', count: 0},
        'nd_makeword': {key: 'nd_makeword', desc: '组词题', count: 0},
        'nd_section_evaluating': {key: 'nd_section_evaluating', desc: '英语篇章发音评测', count: 0},
        'nd_sentence_evaluat': {key: 'nd_sentence_evaluat', desc: '英语句子发音评测', count: 0},
        'nd_lego': {key: 'nd_lego', desc: '方块塔', count: 0},
        'nd_openshapetool': {key: 'nd_openshapetool', desc: '立体展开还原', count: 0},
        'nd_mark_point': {key: 'nd_mark_point', desc: '标点题', count: 0},
        'nd_intervalproblem': {key: 'nd_intervalproblem', desc: '区间题', count: 0},
        'nd_mathaxis': {key: 'nd_mathaxis', desc: '数轴题', count: 0}
    };


    function BankEditModel(params) {
        var model = {
            bank: {
                id: params.bankId(),
                question_count: 0,
                nd_code: '',
                addCount: 0,
                allQuestions: [],
                courseware_object_count: 0
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
            courseWareObjectsTypeList: [],
            questionType: '',
            courseWareObjectsType: '',
            module: 'list',
            editUrl: '',
            sending: false,
            isCourseWare: false
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
        this.courseWareObjectsTypes = courseWareObjectsTypeData;

        //问题队列
        this.questionQueue = {
            data: {add: [], delete: []},
            setAll: function (questionArr, op) {
                this.data[op] = questionArr;
            },
            add: function (question, op) {
                if (!~this.index(question, op)) this.getAll(op).push(question);
                return this;
            },
            remove: function (question, op) {
                var index = this.index(question, op);
                if (~index) this.getAll(op).splice(index, 1);
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
                addQuestion: function (data, isCourseWare) {
                    if (isCourseWare) {
                        return $.ajax({
                            url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/coursewareobjects/' + data.questionId,
                            type: 'POST',
                            dataType: "json"
                        })
                    } else {
                        return $.ajax({
                            url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/questions/' + data.questionId,
                            type: 'POST',
                            dataType: "json"
                        })
                    }

                },
                addInteractiveQuestion: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/coursewareobjects/' + data.questionId,
                        type: 'POST',
                        dataType: "json"
                    })
                },
                deleteQuestion: function (data, isCourseWare) {
                    if (isCourseWare) {
                        return $.ajax({
                            url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/coursewareobjects/' + data.questionId,
                            type: 'DELETE',
                            dataType: "json"
                        })
                    } else {
                        return $.ajax({
                            url: '/' + projectCode + '/v2/question_banks/' + data.bankId + '/questions/' + data.questionId,
                            type: 'DELETE',
                            dataType: "json"
                        })
                    }

                }
            },
            courseware: {
                query: function (data) {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/papers/coursewareobjects',
                        data: data,
                        dataType: "json",
                        cache: false
                    })
                },
                deleteCache: function (question_id) {
                    return $.ajax({
                        url: '/' + projectCode + '/exam/v2/papers/coursewareobjects/' + question_id + '/cache',
                        dataType: "json",
                        type: 'DELETE'
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
        this.model.isCourseWare(false);
        this.model.courseWareObjectsType('');
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
        var isCourseWare = "items" in $data.questionItem ? false : true;
        this.store.bank.addQuestion({
            bankId: this.model.bank.id(),
            questionId: $data.identifier
        }, isCourseWare).done(function () {
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
        var isCourseWare = "items" in $data.questionItem ? false : true;
        this.store.bank.deleteQuestion({
            bankId: this.model.bank.id(),
            questionId: $data.identifier
        }, isCourseWare).done(function () {
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
                "editorCode": window.customEditorCode || "elearning_chuanguan",
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
                "editorCode": window.customEditorCode || "elearning_chuanguan",
                "token_info": window.CryptoJS.TripleDES.encrypt(JSON.stringify(data.token_info), DES_KEY).toString()
            };
            self.model.module('edit');
            self.model.editUrl(data.server_url + '/?' + self._getParamString(params));
        });
    };

    BankEditModel.prototype._getBankDetail = function (flag) {
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
            self.model.bank.courseware_object_count(data.courseware_object_count || 0);
            self.model.bank.nd_code(data.nd_code);
            self.model.options.code([self.model.mode() == 'lr' && data.nd_code, self.model.options.code()[1]]);
            self._getQuestionList(self.model.isCourseWare());
        });
    };

    BankEditModel.prototype.toggleQuestionType = function ($data) {
        this.model.isCourseWare(false);
        var code = this.model.options.code;
        this.model.courseWareObjectsType('');
        this.model.questionType($data.key);
        code([code()[0], NDRCODEMAP[$data.key]]);
        this.model.filter.page(0);
        this._getBankDetail();
    };

    BankEditModel.prototype.toggleCourseWareQuestionType = function ($data) {
        this.model.isCourseWare(true);
        var code = this.model.options.code;
        this.model.questionType('');
        this.model.courseWareObjectsType($data.key);
        code([code()[0], NDRCODEMAP[$data.key]]);
        this.model.filter.page(0);
        this._getBankDetail(1);
    };

    BankEditModel.prototype._computeQuestionTypeList = function (bankDetail) {
        var questionTypes = this.questionTypes, computedQuestionTypeList = [];
        var courseWareObjectsTypes = this.courseWareObjectsTypes, computedcourseWareObjectsTypeList = [];
        if (bankDetail && bankDetail.question_type_count_map) {
            questionTypes['all'].count = bankDetail.question_count || 0;
            courseWareObjectsTypes['all'].count = bankDetail.courseware_object_count || 0;
            computedQuestionTypeList.push(questionTypes['all']);
            computedcourseWareObjectsTypeList.push(courseWareObjectsTypes['all']);
            var q_map = bankDetail.question_type_count_map;
            _.objectForEach(q_map, function (key, value) {
                if (APICODEMAP[key] && value > 0) {
                    if (+key < 400) {
                        var q_type = questionTypes[APICODEMAP[key]];
                        q_type.count = value;
                        computedQuestionTypeList.push(q_type);
                    } else {
                        var q_type = courseWareObjectsTypes[APICODEMAP[key]];
                        q_type.count = value;
                        computedcourseWareObjectsTypeList.push(q_type);
                    }

                }
            });
        } else {
            if (this.model.mode() == 'lr') {
                questionTypes['all'].count = bankDetail.question_count || 0;
                courseWareObjectsTypes['all'].count = bankDetail.courseware_object_count || 0;
                computedQuestionTypeList.push(questionTypes['all']);
                computedcourseWareObjectsTypeList.push(courseWareObjectsTypes['all']);
            } else {
                for (var key in questionTypes) {
                    computedQuestionTypeList.push(questionTypes[key]);
                }
                for (var key in courseWareObjectsTypes) {
                    computedcourseWareObjectsTypeList.push(courseWareObjectsTypes[key]);
                }
            }
        }
        this.model.questionTypeList([]);
        this.model.courseWareObjectsTypeList([]);
        this.model.questionTypeList(computedQuestionTypeList);
        this.model.courseWareObjectsTypeList(computedcourseWareObjectsTypeList);
    };

    BankEditModel.prototype._getQuestionList = function (flag) {
        var self = this, filter = this.model.filter, search = ko.mapping.toJS(filter), searchStr = this._getParamString(search);
        var dataReq = null;
        if (flag) {
            dataReq = this.store.courseware.query(searchStr);
        } else {
            dataReq = this.store.question.query(searchStr);
        }
        var nowPage = search.page, nowSize = search.size;
        search.page = 0;
        search.size = 9999;
        search.chapter_id = undefined;
        search.category = [this.model.bank.nd_code()];
        searchStr = this._getParamString(search);
        var checkReq = null;
        if (flag) {
            checkReq = this.store.courseware.query(searchStr);
        } else {
            checkReq = this.store.question.query(searchStr);
        }

        this.sending.push(dataReq);
        this.sending.push(checkReq);
        $.when(dataReq, checkReq).then(function (data, check) {
            var result = _.arrayMap(data[0].items, function (dataItem) {
                var qObj = {};
                qObj.questionItem = dataItem;
                qObj.identifier = dataItem.items == undefined ? dataItem.id : dataItem.identifier;
                qObj.isAdded = false;
                if(check && check.length && check[0].items){
                    _.arrayForEach(check[0].items, function (checkItem) {
                        if (checkItem.items != undefined) {
                            if (checkItem.identifier == qObj.identifier) {
                                qObj.isAdded = true;
                                return false;
                            }
                        } else if (checkItem.items == undefined && checkItem.id == qObj.identifier) {
                            qObj.isAdded = true;
                            return false;
                        }
                    });
                }

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
                        if (trimVal !== "") str += key + '=' + trimVal + "&";
                    }
                } else {
                    trimVal = $.trim(value);
                    if (trimVal !== "") str += key + '=' + trimVal + "&";
                }
            }
        }
        return str ? str.substring(0, str.length - 1) : str
    };

    BankEditModel.prototype.toggleModule = function (type, $data) {
        this.model.module(type);
        if (type == 'list') this._getBankDetail();
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
