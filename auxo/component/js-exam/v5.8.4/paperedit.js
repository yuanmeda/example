/**
 * @file 课程编辑  jQuery、knockoutjs、bootstrap部分样式等
 * @author gqz
 */
var QUESTION_TYPE_MAP = {
    10: '单选题',
    15: '多选题',
    18: '不定项选择题',
    20: '填空题',
    25: '主观题',
    30: '判断题',
    40: '连线题',
    50: '套题',
    103: '拖动排序题',
    108: '拼图题',
    109: '作文题',
    110: '分类表格题',
    111: '文本选择题',
    112: '投票题',
    113: '应用题',
    114: '证明题',
    115: '计算题',
    116: '解答题',
    117: '阅读题',
    119: '阅读题',
    120: '综合学习题',
    121: '应用题',
    122: '计算题',
    123: '证明题',
    124: '解答题',
    125: '阅读理解题',
    126: '实验与探究题',
    127: '推断题',
    128: '选词填空',
    129: '分类题型',
    130: '竖式计算题',
    131: '记忆卡片题',
    132: '猜词题',
    133: '分式加减',
    134: '文本选择',
    135: '魔方盒题型',
    136: '排序题',
    137: '字谜游戏题',
    138: '点排序',
    139: '标签题',
    140: '概率卡牌',
    141: '摸球工具',
    142: '手写题(旧)',
    143: '连连看',
    144: '比大小题',
    145: '主观题',
    146: '手写题',
    147: '表格题',
    148: '组词题',
    149: '英语篇章发音评测',
    150: '英语句子发音评测',
    151: '方块塔',
    152: '立体展开还原',
    153: '标点题',
    154: '区间题',
    155: '数轴题',
    //400以上的为互动题型
    421: '选词填空',
    415: '分类题型',
    408: '竖式计算题',
    407: '记忆卡片题',
    410: '猜词题',
    416: '分式加减',
    414: '文本选择',
    411: '魔方盒题型',
    402: '排序题',
    406: '字谜游戏题',
    418: '点排序',
    417: '标签题',
    424: '图片标签题',
    426: '概率卡牌',
    427: '摸球工具',
    210: '手写题(旧)',
    401: '连连看',
    409: '比大小题',
    232: '主观题',
    445: '手写题',
    403: '表格题',
    449: '组词题',
    443: '英语篇章发音评测',
    434: '英语句子发音评测',
    432: '方块塔',
    454: '立体展开还原',
    450: '标点题',
    452: '区间题',
    447: '数轴题',
    237: '选做题',
    216:'填空题',
    459:'英语口语单词',
    460:'英语口语句子',
    461:'英语口语段落',
    462:'英语口语对话',
    463:' 英语口语作文'
};
(function (w, $) {
    function Model(params) {
        //console.log(params)
        this.params = params;
        this.model = params.model;
        this.store = {
            errorCallback: function (jqXHR) {
                if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                    $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
                } else {
                    var txt = JSON.parse(jqXHR.responseText);
                    if (txt.cause) {
                        $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                    } else {
                        $.fn.dialog2.helpers.alert(txt.message);
                    }
                    // $('body').loading('hide');
                }
            },
            get: function (url, projectCode, examId) {
                var url = url ? url : '/' + projectCode + '/v1/exams/' + examId + '/strategy';
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    enableToggleCase: true,
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getQuestionBanks: function (url, projectCode) {
                var url = url ? url + '?page=0&size=10000&type=2' : '/' + projectCode + '/v1/questionbanks?page=0&size=1000&type=2';
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    enableToggleCase: true,
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getPapers: function (url, projectCode, search) {
                var url = url ? url : '/' + projectCode + '/v1/questionbanks/papers?type=2';
                return $.ajax({
                    url: url,
                    type: 'get',
                    data: search,
                    dataType: "json",
                    enableToggleCase: true,
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getNDRPapers: function (url, projectCode, filter) {
                var url = url ? url : '/' + projectCode + '/exam/v2/papers/pages';
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    data: filter,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getCustomerNDRPapers: function (url, projectCode, filter) {
                var url = url ? url : '/' + projectCode + '/v2/question_banks';
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    data: filter,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            addQuestion: function (url, projectCode, data) {
                var url = url ? url : '/' + projectCode + '/v2/question_banks/actions/create_with_prefix';
                return $.ajax({
                    url: url,
                    type: 'post',
                    data: JSON.stringify(data) || null,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getNDRQB: function (url, projectCode, id) {
                var url = url ? url : '/' + projectCode + '/v2/question_banks/' + id;
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getServerTime: function (url) {
                return $.ajax({
                    url: url,
                    type: 'GET',
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    async: false
                });
            }
        };
        this.allQuestionTypes = [10, 15, 18, 30, 20, 25, 40, 50, 103, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155];//顺序
        this.validatorRowCount = 0;
        this._init();
    };

    /**
     * 验证默认规则
     * @return {null} null
     */
    Model.prototype = {
        /**
         * 初始化
         */
        _init: function () {
            var _self = this;
            this.model.selectedAllPaper = ko.pureComputed({
                read: function () {
                    var _found = 0;
                    $.each(_self.model.papers.items(), function (i1, v1) {
                        $.each(_self.model.selectedPapers(), function (i2, v2) {
                            if (v1.paper_id == v2.paper_id) {
                                ++_found;
                                return false;
                            }
                        })
                    });
                    return _found === _self.model.papers.items().length;
                },
                write: function (value) {
                    if (value) {
                        _self.model.selectedPapers(_self.model.selectedPapers().concat(_self.model.papers.items.slice(0)));
                    } else {
                        _self.model.selectedPapers.removeAll(_self.model.papers.items());
                    }
                }
            });
            this.model.selectedAllNDRPaper = ko.pureComputed({
                read: function () {
                    var _found = 0;
                    $.each(_self.model.ndrPapers.items(), function (i1, v1) {
                        $.each(_self.model.selectedNDRPapers(), function (i2, v2) {
                            if (v1.identifier == v2.identifier) {
                                ++_found;
                                return false;
                            }
                        })
                    });
                    return _found === _self.model.ndrPapers.items().length;
                },
                write: function (value) {
                    if (value) {
                        _self.model.selectedNDRPapers(_self.model.selectedNDRPapers().concat(_self.model.ndrPapers.items.slice(0)));
                    } else {
                        _self.model.selectedNDRPapers.removeAll(_self.model.ndrPapers.items());
                    }
                }
            });
            this.model.showModalFoot = ko.computed(function () {
                return this.model.modalModule() == 'itemPool' || this.model.modalModule() == 'tagPool';
            }, this);
            this.model.bankId = ko.computed(function () {
                if (this.model.selectedCustomerNDRQB()) {
                    return this.model.selectedCustomerNDRQB().id;
                } else {
                    return "";
                }
            }, this);
            this.model.max_custom_question_count = ko.computed(function () {
                var result = 0;
                var paperList = ko.mapping.toJS(this.model.exam.paper_list);
                if (paperList.length > 0) {
                    $.each(paperList, function (index, paper) {
                        result = result + paper.question_count;
                    })
                } else if (this.model.selectedCustomerNDRQB()) {
                    result = this.model.selectedCustomerNDRQB().question_count+this.model.selectedCustomerNDRQB().courseware_object_count;
                }
                return result;
            }, this);

            this.model.exam.exam_strategy = ko.computed(function () {
                return this.model.strategyOne() == 0 ? 1 : (this.model.strategyTwo() == 1 ? 3 : 2);
                // return strategy;
            }, this);
            this._validator();
            this.store.getQuestionBanks(this.params.getQuestionBanksUrl, this.params.projectCode).done(function (data) {
                _self.model.questionbanks(data.items);
            });
            this.model.exam.paper_list.subscribe(function (val) {
                this.refreshBtnActive();
            }, this);
            this.model.exam.exam_strategy.subscribe(function (val) {
                this.refreshBtnActive();
            }, this);
            this.model.selectedCustomerNDRQB.subscribe(function (val) {
                this.refreshBtnActive();
                this.resetQuestionType();
            }, this);
            this.model.strategyTwo.subscribe($.proxy(function (newVal) {
                // 如果选择不限定出题数量，那么删除count为0的题目设置
                if (newVal) {
                    var questions = ko.mapping.toJS(this.model.exam.question_setting_list);
                    for (var i = questions.length - 1; i >= 0; i--) {
                        if (!questions[i].count) {
                            this.model.exam.question_setting_list.pop();
                        }
                    }
                }
            }, this));
            this.list(true);
        },
        refreshCustomerNDR: function () {
            var id = this.model.selectedCustomerNDRQB().id;
            this.store.getNDRQB(null, this.params.projectCode, id)
                .done(function (data) {
                    if (data) {
                        this.model.selectedCustomerNDRQB(data);
                    }
                }.bind(this));
        },
        _pagination: function (count, offset, limit) {
            var self = this;
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.paperFilter.page(index);
                        self.searchPapers();
                    }
                }
            });
        },
        searchPapersAction: function () {
            var self = this;
            self.model.paperFilter.page(0);
            self.searchPapers();
        },
        updatePaperInfo:function(){
            var self = this;
            self.searchPapers();
        },
        searchPapers: function () {
            var _self = this, _paperFilter = ko.mapping.toJS(this.model.paperFilter);
            this.store.getPapers(this.params.getPapersUrl, this.params.projectCode, _paperFilter).done(function (data) {
                _self.model.papers.items(data.items);
                _self.model.papers.count(data.count);
                _self.model.showPaperList(true);
                $.each(_self.model.papers.items(), function (i1, v1) {
                    $.each(_self.model.selectedPapers(), function (i2, v2) {
                        if (v1.paper_id == v2.paper_id) {
                            _self.model.selectedPapers.splice(i2, 1, v1);
                            return false;
                        }
                    })
                });
                _self._pagination(_self.model.papers.count(), _self.model.paperFilter.page(), _self.model.paperFilter.size());
            });
        },
        savePapers: function () {
            var selectedPapers = this.model.selectedPapers();
            var originalPaperList = ko.mapping.toJS(this.model.exam.paper_list);
            $.each(selectedPapers, function (index, newPaper) {
                var flag = true;
                $.each(originalPaperList, function (index2, originalPaper) {
                    if (newPaper.paper_id == originalPaper.id) {
                        flag = false;
                    }
                });
                if (flag) {
                    originalPaperList.push({
                        app_id: newPaper.app_id,
                        disabled: false,
                        id: newPaper.paper_id,
                        question_count: newPaper.question_count,
                        questions: newPaper.questions,
                        title: newPaper.title,
                        total_score: newPaper.total_score,
                        version: 0,
                        location: 1,
                        word_id: newPaper.word_id
                    })
                }
            });
            ko.mapping.fromJS(originalPaperList, {}, this.model.exam.paper_list);
            this.resetQuestionType(originalPaperList);
            $('#choosePaperModal').modal('hide');
        },
        delSelectedPapers: function ($data) {
            this.model.selectedPapers.remove($data);
        },
        page: function (count, currentPage) {
            var _self = this;
            $('#pagination').pagination(count, {
                items_per_page: _self.model.paperFilter.size(),
                current_page: currentPage,
                callback: function (pageIndex) {
                    if (pageIndex != currentPage) {
                        _self.model.paperFilter.page(pageIndex);
                        _self.searchPapers();
                    }
                }
            });
        },
        list: function (flag) {
            var self = this;
            this.store.get(this.params.getStragegyUrl, this.params.projectCode, this.params.examId)
                .done(function (data) {
                    if (flag) {

                        //from 3.9.5
                        if (data.exam_strategy != 1) {
                            if (data.ndr_question_bank_list && data.ndr_question_bank_list.length > 0) {
                                self.model.selectedCustomerNDRQB(data.ndr_question_bank_list[0]);
                            }
                        }
                        //end from 3.9.5
                        self.resetQuestionType(data.paper_list);
                        self.model.originalPapers = data.paper_list;
                        self.subType = data.sub_type + "";
                        data.exam_strategy = data.exam_strategy + '';
                        var exam_strategy = data.exam_strategy;
                        delete(data.exam_strategy);
                        ko.mapping.fromJS(data, {}, self.model.exam);

                        data.exam_strategy = exam_strategy;
                        self.model.strategyOne(data.exam_strategy == 1 ? '0' : '1');
                        self.model.strategyTwo(data.exam_strategy == 2 ? '0' : (data.exam_strategy == 3 ? '1' : '0'));


                        self.validatorRowCount = 0;
                        self.addValidatorRule(data.question_setting_list.length);
                        self.refreshAddPaperBtn();
                    } else {
                        self.resetQuestionType(data.paper_list);
                        var originalPaperList = ko.mapping.toJS(self.model.exam.paper_list);
                        var paperList = data.paper_list ? data.paper_list : [];
                        $.each(paperList, function (index, newPaper) {
                            var subFlag = true;
                            $.each(originalPaperList, function (index2, originalPaper) {
                                if (newPaper.id == originalPaper.id) {
                                    subFlag = false;
                                }
                            });
                            if (subFlag) {
                                originalPaperList.push({
                                    app_id: newPaper.app_id,
                                    disabled: newPaper.disabled,
                                    id: newPaper.id,
                                    question_count: newPaper.question_count,
                                    questions: newPaper.questions,
                                    title: newPaper.title,
                                    total_score: newPaper.total_score,
                                    version: newPaper.version
                                })
                            }
                        });
                        ko.mapping.fromJS(originalPaperList, {}, self.model.exam.paper_list);
                    }

                });
        },
        openPaperModal: function () {
            //var originalPaperList = ko.mapping.toJS(this.model.exam.paper_list);
            //ko.mapping.fromJS(originalPaperList, {}, this.model.exam.paper_list);
            ko.mapping.fromJS([], {}, this.model.selectedPapers);
            $('#choosePaperModal').modal('show');
            this.searchPapers();
        },
        refreshAddPaperBtn: function () {
            if (this.model.exam.enabled() || (this.model.exam.paper_list().length > 50)) {
                $('#btnUpload').hide();
                $('#btnAdd').hide();
                $('#ndrBtn').hide()
            } else {
                $('#btnUpload').show();
                $('#btnAdd').show();
                $('#ndrBtn').show();
            }
        },
        customerNDRQD: function (questionTypeCountMap) {
            var result = '';
            var questionTypeMap = {
                10: '单选题',
                15: '多选题',
                18: '不定项选择题',
                20: '填空题',
                25: '主观题',
                30: '判断题',
                40: '连线题',
                50: '套题',
                103: '拖动排序题',
                108: '拼图题',
                109: '作文题',
                110: '分类表格题',
                111: '文本选择题',
                112: '投票题',
                113: '应用题',
                114: '证明题',
                115: '计算题',
                116: '解答题',
                117: '阅读题',
                119: '阅读题',
                120: '综合学习题',
                121: '应用题',
                122: '计算题',
                123: '证明题',
                124: '解答题',
                125: '阅读理解题',
                126: '实验与探究题',
                127: '推断题',
                128: '选词填空',
                129: '分类题型',
                130: '竖式计算题',
                131: '记忆卡片题',
                132: '猜词题',
                133: '分式加减',
                134: '文本选择',
                135: '魔方盒题型',
                136: '排序题',
                137: '字谜游戏题',
                138: '点排序',
                139: '标签题',
                140: '概率卡牌',
                141: '摸球工具',
                142: '手写题(旧)',
                143: '连连看',
                144: '比大小题',
                145: '主观题',
                146: '手写题',
                147: '表格题',
                148: '组词题',
                149: '英语篇章发音评测',
                150: '英语句子发音评测',
                151: '方块塔',
                152: '立体展开还原',
                153: '标点题',
                154: '区间题',
                155: '数轴题',
                //400以上的为互动题型
                421: '选词填空',
                415: '分类题型',
                408: '竖式计算题',
                407: '记忆卡片题',
                410: '猜词题',
                416: '分式加减',
                414: '文本选择',
                411: '魔方盒题型',
                402: '排序题',
                406: '字谜游戏题',
                418: '点排序',
                417: '标签题',
                424: '图片标签题',
                426: '概率卡牌',
                427: '摸球工具',
                210: '手写题(旧)',
                401: '连连看',
                409: '比大小题',
                232: '主观题',
                445: '手写题',
                403: '表格题',
                449: '组词题',
                443: '英语篇章发音评测',
                434: '英语句子发音评测',
                432: '方块塔',
                454: '立体展开还原',
                450: '标点题',
                452: '区间题',
                447: '数轴题',
                237: '选做题',
                216: '填空题',
                459: '英语口语单词',
                460: '英语口语句子',
                461: '英语口语段落',
                462: '英语口语对话',
                463: ' 英语口语作文'
            };
            for (var key in questionTypeCountMap) {
                if (result.length < 1) {
                    result = result + QUESTION_TYPE_MAP[key] + questionTypeCountMap[key] + '题'
                } else {
                    result = result + ',' + QUESTION_TYPE_MAP[key] + questionTypeCountMap[key] + '题'
                }
            }
            return result;
        },
        formatQuestions: function (questions) {
            var _questionDict = {
                10: {desc: '单选题', count: 0, totalScore: 0},
                15: {desc: '多选题', count: 0, totalScore: 0},
                18: {desc: '不定项选择题', count: 0, totalScore: 0},
                20: {desc: '填空题', count: 0, totalScore: 0},
                25: {desc: '主观题', count: 0, totalScore: 0},
                30: {desc: '判断题', count: 0, totalScore: 0},
                40: {desc: '连线题', count: 0, totalScore: 0},
                50: {desc: '套题', count: 0, totalScore: 0},
                103: {desc: '拖动排序题', count: 0, totalScore: 0},
                108: {desc: '拼图题', count: 0, totalScore: 0},
                109: {desc: '作文题', count: 0, totalScore: 0},
                110: {desc: '分类表格题', count: 0, totalScore: 0},
                111: {desc: '文本选择题', count: 0, totalScore: 0},
                112: {desc: '投票题', count: 0, totalScore: 0},
                113: {desc: '应用题', count: 0, totalScore: 0},
                114: {desc: '证明题', count: 0, totalScore: 0},
                115: {desc: '计算题', count: 0, totalScore: 0},
                116: {desc: '解答题', count: 0, totalScore: 0},
                117: {desc: '阅读题', count: 0, totalScore: 0},
                119: {desc: '阅读题', count: 0, totalScore: 0},
                120: {desc: '综合学习题', count: 0, totalScore: 0},
                121: {desc: '应用题', count: 0, totalScore: 0},
                122: {desc: '计算题', count: 0, totalScore: 0},
                123: {desc: '证明题', count: 0, totalScore: 0},
                124: {desc: '解答题', count: 0, totalScore: 0},
                125: {desc: '阅读理解题', count: 0, totalScore: 0},
                126: {desc: '实验与探究题', count: 0, totalScore: 0},
                127: {desc: '推断题', count: 0, totalScore: 0},
                128: {desc: '选词填空', count: 0, totalScore: 0},
                129: {desc: '分类题型', count: 0, totalScore: 0},
                130: {desc: '竖式计算题', count: 0, totalScore: 0},
                131: {desc: '记忆卡片题', count: 0, totalScore: 0},
                132: {desc: '猜词题', count: 0, totalScore: 0},
                133: {desc: '分式加减', count: 0, totalScore: 0},
                134: {desc: '文本选择', count: 0, totalScore: 0},
                135: {desc: '魔方盒题型', count: 0, totalScore: 0},
                136: {desc: '排序题', count: 0, totalScore: 0},
                137: {desc: '字谜游戏题', count: 0, totalScore: 0},
                138: {desc: '点排序', count: 0, totalScore: 0},
                139: {desc: '标签题', count: 0, totalScore: 0},
                140: {desc: '概率卡牌', count: 0, totalScore: 0},
                141: {desc: '摸球工具', count: 0, totalScore: 0},
                142: {desc: '手写题(旧)', count: 0, totalScore: 0},
                143: {desc: '连连看', count: 0, totalScore: 0},
                144: {desc: '比大小题', count: 0, totalScore: 0},
                145: {desc: '主观题', count: 0, totalScore: 0},
                146: {desc: '手写题', count: 0, totalScore: 0},
                147: {desc: '表格题', count: 0, totalScore: 0},
                148: {desc: '组词题', count: 0, totalScore: 0},
                149: {desc: '英语篇章发音评测', count: 0, totalScore: 0},
                150: {desc: '英语句子发音评测', count: 0, totalScore: 0},
                151: {desc: '方块塔', count: 0, totalScore: 0},
                152: {desc: '立体展开还原', count: 0, totalScore: 0},
                153: {desc: '标点题', count: 0, totalScore: 0},
                154: {desc: '区间题', count: 0, totalScore: 0},
                155: {desc: '数轴题', count: 0, totalScore: 0},
                210: {desc:'手写题(旧)',count:0, totalScore:0},
                232: {desc:'主观题',count:0, totalScore:0},
                //400以上的为互动题型
                421: {desc:'选词填空',count:0, totalScore:0},
                415: {desc:'分类题型',count:0, totalScore:0},
                408: {desc:'竖式计算题',count:0, totalScore:0},
                407: {desc:'记忆卡片题',count:0, totalScore:0},
                410: {desc:'猜词题',count:0, totalScore:0},
                416: {desc:'分式加减',count:0, totalScore:0},
                414: {desc:'文本选择',count:0, totalScore:0},
                411: {desc:'魔方盒题型',count:0, totalScore:0},
                402: {desc:'排序题',count:0, totalScore:0},
                406: {desc:'字谜游戏题',count:0, totalScore:0},
                418: {desc:'点排序',count:0, totalScore:0},
                417: {desc:'标签题',count:0, totalScore:0},
                424: {desc:'图片标签题',count:0, totalScore:0},
                426: {desc:'概率卡牌',count:0, totalScore:0},
                427: {desc:'摸球工具',count:0, totalScore:0},
                401: {desc:'连连看',count:0, totalScore:0},
                409: {desc:'比大小题',count:0, totalScore:0},
                445: {desc:'手写题',count:0, totalScore:0},
                403: {desc:'表格题',count:0, totalScore:0},
                449: {desc:'组词题',count:0, totalScore:0},
                443: {desc:'英语篇章发音评测',count:0, totalScore:0},
                434: {desc:'英语句子发音评测',count:0, totalScore:0},
                432: {desc:'方块塔',count:0, totalScore:0},
                454: {desc:'立体展开还原',count:0, totalScore:0},
                450: {desc:'标点题',count:0, totalScore:0},
                452: {desc:'区间题',count:0, totalScore:0},
                447: {desc:'数轴题',count:0, totalScore:0},
                237: {desc:'选做题',count:0, totalScore:0},
                216: {desc:'填空题',count:0, totalScore:0},
                459: {desc:'英语口语单词',count:0, totalScore:0},
                460: {desc:'英语口语句子',count:0, totalScore:0},
                461: {desc:'英语口语段落',count:0, totalScore:0},
                462: {desc:'英语口语对话',count:0, totalScore:0},
                463: {desc:'英语口语作文',count:0, totalScore:0}
            };
            $.each(questions, function (i, v) {
                ++_questionDict[v.question_type].count;
                _questionDict[v.question_type].totalScore += v.total_score;
            });
            var _formattedStr = '';
            $.each(_questionDict, function (i, v) {
                if (v.count > 0) _formattedStr += v.desc + v.count + '题（' + v.totalScore + '分）';
            });
            return _formattedStr;
        },
        formatQuestionType: function (data) {
            var s = "";
            switch (data) {
                case 10:
                    s += "单选题";
                    break;
                case 15:
                    s += "多选题";
                    break;
                case 18:
                    s += "不定项选择题";
                    break;
                case 20:
                    s += "填空题";
                    break;
                case 25:
                    s += "主观题";
                    break;
                case 30:
                    s += "判断题";
                    break;
                case 40:
                    s += "连线题";
                    break;
                case 50:
                    s += "套题";
                    break;
                case 103:
                    s += '拖动排序题';
                    break;
                case 108:
                    s += '拼图题';
                    break;
                case 109:
                    s += '作文题';
                    break;
                case 110:
                    s += '分类表格题';
                    break;
                case 111:
                    s += '文本选择题';
                    break;
                case 112:
                    s += '投票题';
                    break;
                case 113:
                    s += '应用题';
                    break;
                case 114:
                    s += '证明题';
                    break;
                case 115:
                    s += '计算题';
                    break;
                case 116:
                    s += '解答题';
                    break;
                case 117:
                    s += '阅读题';
                    break;
                case 119:
                    s += '阅读题';
                    break;
                case 120:
                    s += '综合学习题';
                    break;
                case 121:
                    s += '应用题';
                    break;
                case 122:
                    s += '计算题';
                    break;
                case 123:
                    s += '证明题';
                    break;
                case 124:
                    s += '解答题';
                    break;
                case 125:
                    s += '阅读理解题';
                    break;
                case 126:
                    s += '实验与探究';
                    break;
                case 127:
                    s += '推断题';
                    break;
                case 128:
                    s += '选词填空';
                    break;
                case 129:
                    s += '分类题型';
                    break;
                case 130:
                    s += '竖式计算题';
                    break;
                case 131:
                    s += '记忆卡片题';
                    break;
                case 132:
                    s += '猜词题';
                    break;
                case 133:
                    s += '分式加减';
                    break;
                case 134:
                    s += '文本选择';
                    break;
                case 135:
                    s += '魔方盒题型';
                    break;
                case 136:
                    s += '排序题';
                    break;
                case 137:
                    s += '字谜游戏题';
                    break;
                case 138:
                    s += '点排序';
                    break;
                case 139:
                    s += '标签题';
                    break;
                case 140:
                    s += '概率卡牌';
                    break;
                case 141:
                    s += '摸球工具';
                    break;
                case 142:
                    s += '手写题(旧)';
                    break;
                case 143:
                    s += '连连看';
                    break;
                case 144:
                    s += '比大小题';
                    break;
                case 145:
                    s += '主观题';
                    break;
                case 146:
                    s += '手写题';
                    break;
                case 147:
                    s += '表格题';
                    break;
                case 148:
                    s += '组词题';
                    break;
                case 149:
                    s += '英语篇章发音测评';
                    break;
                case 150:
                    s += '英语句子发音测评';
                    break;
                case 151:
                    s += '方块塔';
                    break;
                case 152:
                    s += '立体展开还原';
                    break;
                case 153:
                    s += '标点题';
                    break;
                case 154:
                    s += '区间题';
                    break;
                case 155:
                    s += '数轴题';
                    break;
                case 237:
                    s += '选做题';
                    break;
                case 216:
                    s += '填空题';
                    break;
                case 459:
                    s += '英语口语单词';
                    break;
                case 460:
                    s += '英语口语句子';
                    break;
                case 461:
                    s += '英语口语段落';
                    break;
                case 462:
                    s += '英语口语对话';
                    break;
                case 463:
                    s += '英语口语作文';
                    break;
                default:
                    break;
            }
            return s;
        },
        formatQuestion: function (_data) {
            var questions = [];
            var questionCount = {};
            var questionScore = {};
            for (var i = 0; i < _data.questions().length; i++) {
                var question = _data.questions()[i];
                var questionType = question.question_type();
                var tatalScore = question.total_score();
                if (!questionCount[questionType]) {
                    questionCount[questionType] = 1;
                    questionScore[questionType] = tatalScore;
                } else {
                    questionCount[questionType]++;
                    questionScore[questionType] += tatalScore;
                }
            }
            for (var i = 0; i < this.allQuestionTypes.length; i++) {
                var questionType = this.allQuestionTypes[i];
                if (questionCount[questionType]) {
                    questions.push(this.formatQuestionType(questionType) + questionCount[questionType] + "题（" + questionScore[questionType] + "分）");
                }
            }
            return questions.join('，');
        },
        formatQuestionTypes: function (_data) {
            var questions = [];
            for (var i = 0; i < _data.length; i++) {
                var count = _data[i].count;
                questions.push(_data[i].name + "：" + count + "题");
            }
            return questions.join('，');
        },
        formatQuestionTypeCount: function (_data) {
            var questionType = _data();
            var list = ko.mapping.toJS(this.model.questionTypes);
            for (var i = 0; i < list.length; i++) {
                var element = list[i];
                if (element.type == questionType) {
                    return element.count;
                }
            }
            return 0;
        },
        formatTotalScore: function (_data) {
            var totalScore = 0;
            $.each(_data, function (index, element) {
                var count = parseFloat(element.count());
                var score = parseFloat(element.score());
                if (count && score) {
                    totalScore += count * score;
                }
            });
            return totalScore.toFixed(1);
        },
        formatTotalCount: function (_data) {
            var count = 0;
            $.each(_data, function (index, element) {
                if (element && element.count()) {
                    count += +element.count();
                }
            });
            return count;
        },
        checkClick: function () {
            var ids = this.model.selectedIds(),
                index = ids.indexOf(this.id);
            if (index >= 0)
                ids.splice(index, 1);
            else
                ids.push(this.id);
            this.model.selectedIds(ids);
        },
        clearSelect: function () {
            this.model.selectedIds([]);
        },
        updateDisabled: function (disabled) {
            var self = this;
            $.each(self.model.exam.paper_list(), function (index, element) {
                if (self.model.selectedIds().indexOf(element.id) > -1) {
                    element.disabled(disabled);
                }
            });
            self.clearSelect();
            self.resetQuestionType();
        },
        updateItemDisabled: function (_data, disabled) {
            _data.disabled(disabled);
            this.resetQuestionType();
        },
        _validator: function () {
            var self = this;
            $.validator.addMethod("papersRequired", function (val, element) {
                var count = 0;
                $.each(this.model.exam.paper_list(), function (index, element) {
                    if (!element.disabled()) {
                        count++;
                    }
                });
                return count > 0;
            }, "出卷范围不能为空");
            $.validator.addMethod("papersWithEqualScore", $.proxy(function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() == '1') {
                    return true;
                }
                var papers = ko.mapping.toJS(this.model.exam.paper_list);
                var tatalScore = -1;
                for (var i = 0; i < papers.length; i++) {
                    var paper = papers[i];
                    if (!paper.disabled) {
                        if (tatalScore == -1) {
                            tatalScore = paper.total_score;
                        } else if (tatalScore != paper.total_score) {
                            return false;
                        }
                    }
                }
                return true;
            }, this), "可用试卷的总分不相等");
            $.validator.addMethod("questionsRequired", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() == '1' && $('input:radio[name="examStrategyType"]:checked').val() == '0') {
                    return this.model.exam.question_setting_list().length > 0;
                } else {
                    return true;
                }
            }, "题目设置不能为空");
            $.validator.addMethod("titleRequired", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                return val.length > 0;
            }, "名称不能为空");
            $.validator.addMethod("titleLe20", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                return val.length <= 20;
            }, "名称的长度不能超过20");
            $.validator.addMethod("countRequired", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                return val.length > 0;
            }, "题目数量不能为空");
            $.validator.addMethod("countPattern", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                var re = /^[1-9]\d*$/;
                return this.optional(element) || (re.test(val));
            }, "题目数量格式有误");
            $.validator.addMethod("countLeTotal", function (value, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                var questionType = parseInt($(element).parent().prev().children().first().val());
                var maxCount = parseFloat(element.nextElementSibling.nextElementSibling.innerHTML);
                var total = 0;
                $.each(self.model.exam.question_setting_list(), function (index, element) {
                    if (element.question_type() == questionType) {
                        var count = parseInt(element.count());
                        if (count) {
                            total += count;
                        }
                    }
                });
                return total <= maxCount;
            }, "该题型的题目数量不能超过总题量");
            $.validator.addMethod("scoreRequired", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                return (val.length > 0) && (parseFloat(val) > 0);
            }, "分值不允许为空或0");
            $.validator.addMethod("scorePattern", function (val, element) {
                var re = /^\d+(\.\d)?$/;
                return this.optional(element) || (re.test(val));
            }, "分值格式有误");
            $.validator.addMethod("scoreLeMax", function (val, element) {
                if ($('input:radio[name="examStrategy"]:checked').val() != '1') {
                    return true;
                }
                return parseFloat(val) <= 10000;
            }, "分值设置过高");
            $("#edit").validate({
                rules: {
                    examStrategy: {
                        required: true
                    },
                    papersVal: {
                        papersRequired: "",
                        papersWithEqualScore: ""
                    },
                    questionsVal: {
                        questionsRequired: ""
                    },
                    customQuestionCount: {
                        required: true,
                        digits: true,
                        min: 1,
                        max: 999
                    }
                },
                messages: {
                    examStrategy: {
                        required: "试卷策略不能为空"
                    },
                    customQuestionCount: {
                        required: "不能为空",
                        digits: "必须为正整数",
                        min: "必须为正整数",
                        max: "最多3位数"
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'p',
                errorClass: 'help-inline',
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            });
        },
        addValidatorRule: function (count) {
            var initIdx = this.validatorRowCount;
            for (var i = 0; i < count; i++) {
                var idx = initIdx + i;
                $("#title_" + idx).rules("add", {
                    titleRequired: "",
                    titleLe20: ""
                });
                $("#count_" + idx).rules("add", {
                    countRequired: "",
                    countPattern: "",
                    countLeTotal: ""
                });
                $("#score_" + idx).rules("add", {
                    scoreRequired: "",
                    scorePattern: "",
                    scoreLeMax: ""
                });
            }
            this.validatorRowCount += count;
        },

        //根据paperlist计算总题量。
        resetQuestionType: function (list) {
            if (!list) {
                list = ko.mapping.toJS(this.model.exam.paper_list);
            }
            if (list && list.length > 0) {
                var questionCount = {};
                $.each(list, function (index, element) {
                    if (!element.disabled) {
                        for (var i = 0; i < element.questions.length; i++) {
                            var questionType = element.questions[i].question_type;
                            if (!questionCount[questionType]) {
                                questionCount[questionType] = 1;
                            } else {
                                questionCount[questionType]++;
                            }
                        }
                    }
                });
                var questionTypes = [];
                for (var i = 0; i < this.allQuestionTypes.length; i++) {
                    var questionType = this.allQuestionTypes[i];
                    if (questionCount[questionType]) {
                        questionTypes.push({
                            type: questionType,
                            name: this.formatQuestionType(questionType),
                            count: questionCount[questionType]
                        });
                    }
                }
                this.model.questionTypes(questionTypes);
            } else if (this.model.selectedCustomerNDRQB()) {
                var questionTypeCountMap = this.model.selectedCustomerNDRQB().question_type_count_map;
                var questionTypes = [];
                for (var key in questionTypeCountMap) {
                    questionTypes.push({
                        type: parseInt(key),
                        name: QUESTION_TYPE_MAP[key],
                        count: questionTypeCountMap[key]
                    })
                }
                this.model.questionTypes(questionTypes);
            } else {

                this.model.questionTypes([]);
            }

        },
        getLastQuestionSetting: function () {
            var list = ko.mapping.toJS(this.model.exam.question_setting_list);
            if (list.length) {
                return list[list.length - 1].question_type;
            }
            list = ko.mapping.toJS(this.model.questionTypes);
            if (list.length) {
                return list[0].type;
            }
            return "";
        },
        addQuestionSetting: function () {
            var item = {};
            item.question_type = this.getLastQuestionSetting();
            item.title = this.formatQuestionType(item.question_type);
            item.score = "";
            item.count = "";
            item = ko.mapping.fromJS(item);
            this.model.exam.question_setting_list.push(item);
            this.addValidatorRule(1);
        },
        delQuestionSettingList: function (item) {
            this.model.exam.question_setting_list.remove(item);
            this.validatorRowCount--;
        },
        uploadPaper: function () {
            var _self = this;
            _self.showMaskDivIncludeParent(function () {
                _self.list(false);
            }, this.params.cloudClientDownloadUrl, "", "", 0);
            window.location = this.params.protocalName + "/resource?resourcetype=2&accesstoken=" + this.params.accessToken + "&appId=" + this.params.appId;
        },
        editPaper: function (data) {
            if (data.word_id) {
                window.location = this.params.protocalName + "/resource/word?wordId=" + data.word_id + "&accesstoken=" + this.params.accessToken + "&appId=" + this.params.appId;
            } else {
                $.fn.dialog2.helpers.alert('wordId不存在，该试卷不可编辑');
            }
        },
        editPaperTwo: function (data) {
            if (data.word_id()) {
                window.location = this.params.protocalName + "/resource/word?wordId=" + data.word_id() + "&accesstoken=" + this.params.accessToken + "&appId=" + appId;
            } else {
                $.fn.dialog2.helpers.alert('wordId不存在，该试卷不可编辑');
            }
        },
        previewRandomPaper: function () {
            $("#btnPreview")[0].click();
        },
        online: function () {
            var _self = this;
            this.store.online(this.params.projectCode, this.params.examId)
                .done(function () {
                    $.fn.dialog2.helpers.alert('上线成功');
                    _self.cancel();
                });
        },
        // 创建遮罩层并附加到BODY元素下,然后显示遮罩层
        createMaskDiv: function (title, btnTitle, action) {
            this.alertMessage(title, btnTitle, "", action);
        },

        showAlertMessage: function (message) {
            var _this = this;
            this.alertMessage("系统提示", "关闭", message);

            this.$maskDialog.find(".close,#btn-close-dialog").on("click", function () {
                _this.$maskDiv.hide();
                _this.$maskDialog.remove();
            });
        },

        alertMessage: function (title, btnTitle, message, action) {
            var interTitle = "上传提示", interBtnTitle = "已完成上传";
            if (title != null && title != "")
                interTitle = title;
            if (btnTitle != null && btnTitle != "")
                interBtnTitle = btnTitle;

            var actionTitle = "",
                resourceTitle = "";
            switch (action) {
                case 0:
                    resourceTitle = "试卷";
                    actionTitle = "上传";
                    break;
                case 1:
                    resourceTitle = "试卷"
                    actionTitle = "编辑";
                    break;
                default:
                    resourceTitle = "文档";
                    actionTitle = "上传";
                    break;
            }


            var $body = $(document.body);
            //插入样式
            if ($body.find("#css-modalDialog").length <= 0) {
                var linkCss = "";
                linkCss += "<style id='css-modalDialog'>";
                linkCss += ".mask-dalog .close { float: right; font-size: 20px; font-weight: bold; line-height: 20px; color: #000000; text-shadow: 0 1px 0 #ffffff; opacity: 0.2; filter: alpha(opacity=20); text-decoration: none; }";
                linkCss += ".mask-dalog .close:hover, .mask-dalog .close:focus { color: #000000; text-decoration: none; cursor: pointer; opacity: 0.4; filter: alpha(opacity=40); }";
                linkCss += ".mask-dalog .modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1040; background-color: #000000; }";
                linkCss += ".mask-dalog .modal-backdrop.fade { opacity: 0; }";
                linkCss += ".mask-dalog .modal-backdrop, .modal-backdrop.fade.in { opacity: 0.2; filter: alpha(opacity=20); }";
                linkCss += ".mask-dalog.modal { position: fixed; _position: absolute; top: 20%; left: 50%; z-index: 1050; width: 560px; margin:0 0 0 -280px; background-color: #ffffff; border: 1px solid #999; border: 1px solid rgba(0,0,0,0.3); *border: 1px solid #999; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; outline: none; -webkit-box-shadow: 0 3px 7px rgba(0,0,0,0.3); -moz-box-shadow: 0 3px 7px rgba(0,0,0,0.3); box-shadow: 0 3px 7px rgba(0,0,0,0.3); -webkit-background-clip: padding-box; -moz-background-clip: padding-box; background-clip: padding-box; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 13px; line-height: 20px; color: #333333; background-color: #ffffff; }";
                linkCss += ".mask-dalog.modal.fade { top: -25%; -webkit-transition: opacity 0.3s linear,top 0.3s ease-out; -moz-transition: opacity 0.3s linear,top 0.3s ease-out; -o-transition: opacity 0.3s linear,top 0.3s ease-out; transition: opacity 0.3s linear,top 0.3s ease-out; }";
                linkCss += ".mask-dalog.modal.fade.in { top: 10%; }";
                linkCss += ".mask-dalog .modal-header { padding: 9px 15px; border-bottom: 1px solid #eee; }";
                linkCss += ".mask-dalog .modal-header .close { margin-top: 2px; }";
                linkCss += ".mask-dalog .modal-header h3 { margin: 0; line-height: 30px; }";
                linkCss += ".mask-dalog .modal-body { position: relative; max-height: 400px; padding: 15px; overflow-y: auto; }";
                linkCss += ".mask-dalog .modal-form { margin-bottom: 0; }";
                linkCss += ".mask-dalog .modal-footer { padding: 14px 15px 15px; margin-bottom: 0; text-align: right; background-color: #f5f5f5; border-top: 1px solid #ddd; -webkit-border-radius: 0 0 6px 6px; -moz-border-radius: 0 0 6px 6px; border-radius: 0 0 6px 6px; *zoom: 1; -webkit-box-shadow: inset 0 1px 0 #ffffff; -moz-box-shadow: inset 0 1px 0 #ffffff; box-shadow: inset 0 1px 0 #ffffff; }";
                linkCss += ".mask-dalog .modal-footer:before, .modal-footer:after { display: table; line-height: 0; content: ''; }";
                linkCss += ".mask-dalog .modal-footer:after { clear: both; }";
                linkCss += ".mask-dalog .modal-footer .btn + .btn { margin-bottom: 0; margin-left: 5px; }";
                linkCss += ".mask-dalog .modal-footer .btn-group .btn + .btn { margin-left: -1px; }";
                linkCss += ".mask-dalog .modal-footer .btn-block + .btn-block { margin-left: 0; }";
                linkCss += ".mask-dalog .btn { display: inline-block; *display: inline; padding: 4px 12px; margin-bottom: 0; *margin-left: .3em; font-size: 14px; line-height: 20px; color: #333333; text-align: center; text-shadow: 0 1px 1px rgba(255,255,255,0.75); vertical-align: middle; cursor: pointer; background-color: #f5f5f5; *background-color: #e6e6e6; background-image: -moz-linear-gradient(top,#ffffff,#e6e6e6); background-image: -webkit-gradient(linear,0 0,0 100%,from(#ffffff),to(#e6e6e6)); background-image: -webkit-linear-gradient(top,#ffffff,#e6e6e6); background-image: -o-linear-gradient(top,#ffffff,#e6e6e6); background-image: linear-gradient(to bottom,#ffffff,#e6e6e6); background-repeat: repeat-x; border: 1px solid #cccccc; *border: 0; border-color: #e6e6e6 #e6e6e6 #bfbfbf; border-color: rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25); border-bottom-color: #b3b3b3; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff',endColorstr='#ffe6e6e6',GradientType=0); filter: progid:DXImageTransform.Microsoft.gradient(enabled=false); *zoom: 1; -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); -moz-box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); }";
                linkCss += ".mask-dalog .btn:hover, .btn:focus, .btn:active, .btn.active, .btn.disabled, .btn[disabled] { color: #333333; background-color: #e6e6e6; *background-color: #d9d9d9; }";
                linkCss += ".mask-dalog .btn:first-child { *margin-left: 0; }";
                linkCss += ".mask-dalog .btn:hover, .btn:focus { color: #333333; text-decoration: none; background-position: 0 -15px; -webkit-transition: background-position 0.1s linear; -moz-transition: background-position 0.1s linear; -o-transition: background-position 0.1s linear; transition: background-position 0.1s linear; }";
                linkCss += ".mask-dalog .btn:focus { outline: thin dotted #333; outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }";
                linkCss += ".mask-dalog .btn.active, .btn:active {  background-color: #cccccc \9; background-image: none; outline: 0; -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); }";
                linkCss += ".mask-dalog .btn.disabled, .btn[disabled] { cursor: default; background-image: none; opacity: 0.65; filter: alpha(opacity=65); -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }";
                linkCss += ".mask-dalog .btn-large { padding: 11px 19px; font-size: 17.5px; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; }";
                linkCss += ".mask-dalog .btn-large [class^='icon-'], .btn-large [class*=' icon-'] { margin-top: 4px; }";
                linkCss += ".mask-dalog .btn-small { padding: 2px 10px; font-size: 11.9px; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }";
                linkCss += ".mask-dalog .btn-small [class^='icon-'], .btn-small [class*=' icon-'] { margin-top: 0; }";
                linkCss += ".mask-dalog .btn-mini [class^='icon-'], .btn-mini [class*=' icon-'] { margin-top: -1px; }";
                linkCss += ".mask-dalog .btn-mini { padding: 0 6px; font-size: 10.5px; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }";
                linkCss += ".mask-dalog .btn-block { display: block; width: 100%; padding-right: 0; padding-left: 0; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }";
                linkCss += ".mask-dalog .btn-block + .btn-block { margin-top: 5px; }";
                linkCss += ".mask-dalog input[type='submit'].btn-block, input[type='reset'].btn-block, input[type='button'].btn-block { width: 100%; }";
                linkCss += ".mask-dalog .btn-primary.active, .btn-warning.active, .btn-danger.active, .btn-success.active, .btn-info.active, .btn-inverse.active { color: rgba(255,255,255,0.75); }";
                linkCss += ".mask-dalog .btn-primary { color: #ffffff; text-shadow: 0 -1px 0 rgba(0,0,0,0.25); background-color: #006dcc; *background-color: #0044cc; background-image: -moz-linear-gradient(top,#0088cc,#0044cc); background-image: -webkit-gradient(linear,0 0,0 100%,from(#0088cc),to(#0044cc)); background-image: -webkit-linear-gradient(top,#0088cc,#0044cc); background-image: -o-linear-gradient(top,#0088cc,#0044cc); background-image: linear-gradient(to bottom,#0088cc,#0044cc); background-repeat: repeat-x; border-color: #0044cc #0044cc #002a80; border-color: rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff0088cc',endColorstr='#ff0044cc',GradientType=0); filter: progid:DXImageTransform.Microsoft.gradient(enabled=false); }";
                linkCss += ".mask-dalog .btn-primary:hover, .btn-primary:focus, .btn-primary:active, .btn-primary.active, .btn-primary.disabled, .btn-primary[disabled] { color: #ffffff; background-color: #0044cc; *background-color: #003bb3; }";
                linkCss += ".mask-dalog .btn-primary:active, .btn-primary.active { background-color: #003399; }";
                linkCss += ".mask-dalog #a-clienturl { color: #08C; }";
                linkCss += "</style>";
                $body.append(linkCss);
            }
            //插入遮罩
            if ($body.find("#maskDiv").length <= 0) {
                var modalStr = "";
                modalStr += "<div id='maskDiv' style='position: absolute; height: 100%; width:100%; top:0px; left:0px; z-Index: 10000; filter: alpha(opacity=20); opacity: 0.2; background-color: #000000;  display: none;'>";
                modalStr += "</div>"
                $body.append(modalStr);
            }
            this.$maskDiv = $body.find("#maskDiv").show();
            //有滚动条的页面需要设置明确的高度 不然盖不全
            this.$maskDiv.height($(document).height());
            var _this = this;
            $(window).on("resize", function () {
                _this.$maskDiv.height($(window.document).height());
            });

            //弹窗的内容变更较多 直接删除新曾比较好处理
            $body.find(".mask-dalog").remove();
            var dialogStr = "";
            if (message == undefined || message == null || message == "") {
                dialogStr += "   <div id='modal-form' class='modal mask-dalog' data-backdrop='static' style='z-Index: 10001;'>";
            }
            else {
                dialogStr += "   <div id='alert-form' class='modal mask-dalog' data-backdrop='static' style='z-Index: 10001;'>";
            }
            dialogStr += "       <div class='modal-header'>";
            dialogStr += "           <a href='#' class='close' data-dismiss='modal'>&times;</a>";
            dialogStr += "           <h3 style='font-size: 14px;'>";
            dialogStr += "              " + interTitle;
            dialogStr += "           </h3>";
            dialogStr += "       </div>";
            dialogStr += "       <div class='modal-body'>";
            dialogStr += "           <form class='form-inline'>";
            dialogStr += "               <div class='control-group'>";
            dialogStr += "                   <label class='control-label' style='cursor: default;'>";

            if (message == undefined || message == null || message == "") {
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += "请在打开的客户端中" + actionTitle + resourceTitle + "。如不能打开客户端请检查是否安装<a id='a-clienturl' href='javascript:void(0);'>客户端</a>。</span>";
                dialogStr += "                       <br/>";
                dialogStr += "                       <br/>";
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += actionTitle + "完" + resourceTitle + "后可关闭此窗口查看最新" + actionTitle + "的" + resourceTitle + "。</span>";
            }
            else {
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += "                          " + message;
                dialogStr += "                       </span>";
            }

            dialogStr += "                   </label>";
            dialogStr += "               </div>";
            dialogStr += "           </form>";
            dialogStr += "       </div>";

            if (message == undefined || message == null || message == "") {
                dialogStr += "       <div class='modal-footer'  style='text-align:center;'>";
                dialogStr += "           <a id='btn-sure-syncmessage' style='font-size: 13px;' class='btn-primary btn'>";
                dialogStr += "              " + interBtnTitle;
                dialogStr += "           </a>";
                dialogStr += "       </div>";
            }
            else {
                dialogStr += "       <div class='modal-footer'>";
                dialogStr += "           <a id='btn-close-dialog' style='font-size: 13px;' class='btn'>";
                dialogStr += "              " + interBtnTitle;
                dialogStr += "           </a>";
                dialogStr += "       </div>";
            }

            dialogStr += "   </div>";
            $body.append(dialogStr);
            this.$maskDialog = $body.find(".mask-dalog");
        },

        // 显示遮罩层
        showMaskDivIncludeParent: function (sureCallback, clientDownloadUrl, title, btnTitle, action) {
            //if (typeof (clientDownloadUrl) == undefined || clientDownloadUrl == null || clientDownloadUrl == "") {
            //    var clientDownloadUrl = "http://static.cloud.huayu.nd/taskandedit/ndtvedit.msi";
            //    if (window.location.href.indexOf("test.") >= 0) {
            //        clientDownloadUrl = "ftp://192.168.9.78/pub/TaskAndEdit/hyedittestsetup.msi";
            //    } else if (window.location.href.indexOf("dev.") >= 0 || window.location.href.indexOf("debug.") >= 0) {
            //        clientDownloadUrl = "ftp://192.168.9.78/pub/TaskAndEdit/hyeditdevsetup.msi";
            //    }
            //}
            var _this = this;
            this.createMaskDiv(title, btnTitle, action);

            this.$maskDialog.find("#a-clienturl").attr("href", clientDownloadUrl);
            this.$maskDialog.find(".close").off("click").on("click", function () {
                _this.$maskDiv.hide();
                _this.$maskDialog.hide();
                return false;
            });


            this.$maskDialog.find("#btn-sure-syncmessage").off("click").on("click", function () {
                _this.$maskDiv.hide();
                _this.$maskDialog.hide();
                // if (typeof (sureCallback) == "function") {
                // sureCallback();
                location = location;
                // }
                // return false;
            });
        },
        refreshBtnActive: function (paperList) {
            var paperList = ko.mapping.toJS(this.model.exam.paper_list);
            var selectedCustomerNDRQB = ko.mapping.toJS(this.model.selectedCustomerNDRQB);
            var exam_strategy = +this.model.exam.exam_strategy();
            this.model.addBtnActive(true);
            this.model.ndrBtnActive(true);
            if (paperList && paperList.length > 0) {
                if (paperList[0].location == 4) {
                    this.model.addBtnActive(false);
                } else {
                    this.model.ndrBtnActive(false);
                }
            } else {
                if (selectedCustomerNDRQB && exam_strategy != 1) {
                    this.model.addBtnActive(false);
                }
            }
        },

        openNDRPaperModal: function (type) {
            //type=1, 闯关模式下的选择已有自建题库 type=0， 标准考试下的选择NDR试卷。
            this.model.ndrPapers.items([]);
            this.model.ndrPapers.count(0);
            this._ndrPagination(0, 0, 20);
            this.model.ndrType(type);
            var title = type == 0 ? '添加NDR试卷' : '选择自建题库';
            this.model.ndrModalTitle(title);
            $('#ndrPaperModal').modal('show');
            if (type) {
                this.model.customerNDRFilter.page(0);
            } else {
                ko.mapping.fromJS([], {}, this.model.selectedNDRPapers);
                this.model.ndrFilter.page(0);
            }
            this.searchNDRPapers();
        },
        searchNDRPapers: function () {
            var ndrType = this.model.ndrType();
            if (ndrType) {
                var filter = ko.mapping.toJS(this.model.customerNDRFilter);
                this.store.getCustomerNDRPapers(this.params.getCustomerNDRPapersUrl, this.params.projectCode, filter)
                    .done(function (data) {
                        this.model.ndrPapers.items(data && data.items && data.items.length > 0 ? data.items : []);
                        this.model.ndrPapers.count(data && data.count ? data.count : 0);
                        this._ndrPagination(this.model.ndrPapers.count(), this.model.customerNDRFilter.page(), this.model.customerNDRFilter.size());
                    }.bind(this))
            } else {
                var filter = ko.mapping.toJS(this.model.ndrFilter);
                this.store.getNDRPapers(this.params.getNDRPapersUrl, this.params.projectCode, filter)
                    .done(function (data) {
                        this.model.ndrPapers.items(data && data.items && data.items.length > 0 ? data.items : []);
                        this.model.ndrPapers.count(data && data.count ? data.count : 0);
                        this._ndrPagination(this.model.ndrPapers.count(), this.model.ndrFilter.page(), this.model.ndrFilter.size());
                    }.bind(this))
            }

        },
        _ndrPagination: function (count, offset, limit) {
            var self = this;
            $("#ndrPagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        var ndrType = self.model.ndrType();
                        if (ndrType) {
                            self.model.customerNDRFilter.page(index);
                        } else {
                            self.model.ndrFilter.page(index);
                        }
                        self.searchNDRPapers();
                    }
                }
            });
        },
        openModal: function () {
            $("#ndrPaperUpload").modal('show');
            $("#download_url").attr("href", JSON.parse(decodeURIComponent(upload_param)).import_download_url);
        },
        dismissModal: function () {
            $("#ndrPaperUpload").modal('hide');
            this.searchNDRPapersAction();
        },
        pickExam: function () {
            this.openExam(JSON.parse(decodeURIComponent(upload_param)));
        },
        openExam: function (upload_param) {
            var macToken = auth.getMacToken(upload_param, "POST", "/");
            var base64token = this.StringToBase64(macToken);
            var url = upload_param.import_url + "&Coverage=" + ndr_coverage + "&Authorization=" + base64token + "&Exam_ParseTemp=试卷模板";
            window.location.href = url;
        },
        StringToBase64: function (str) {
            var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
            //StringToBin
            var bitString = "";
            for (var i = 0; i < str.length; i++) {
                var charCode = str.charCodeAt(i).toString(2);
                bitString += (new Array(9 - charCode.length).join("0") + charCode);
            }
            //BinToBase64
            var result = "";
            var tail = bitString.length % 6;
            var bitStringTemp1 = bitString.substr(0, bitString.length - tail);
            var bitStringTemp2 = bitString.substr(bitString.length - tail, tail);
            for (var i = 0; i < bitStringTemp1.length; i += 6) {
                var index = parseInt(bitStringTemp1.substr(i, 6), 2);
                result += code[index];
            }
            bitStringTemp2 += new Array(7 - tail).join("0");
            if (tail) {
                result += code[parseInt(bitStringTemp2, 2)];
                result += new Array((6 - tail) / 2 + 1).join("=");
            }
            return result;
        },
        getNDRQuestionCount: function (assessment) {
            var questionCount = 0;
            if (assessment && assessment.test_parts && assessment.test_parts.length > 0) {
                $.each(assessment.test_parts, $.proxy(function (index, part) {
                    var as = part.assessment_sections || null;
                    if (as && as.length > 0) {
                        $.each(as, $.proxy(function (i, section) {
                            var section_parts = section.section_parts;
                            if (section_parts && section_parts.length > 0) {
                                $.each(section_parts, $.proxy(function (i, part) {
                                    if (part.type == 'assessment_item_ref') {
                                        questionCount++;
                                    } else if (part.type == 'assessment_section') {
                                        questionCount = questionCount + this._getSectionPartsCount(part);
                                    }
                                }, this));
                            }
                        }, this));

                    }
                }, this));
            }
            return questionCount;
        },
        _getSectionPartsCount: function (as_item) {//as
            var result = 0;
            var section_parts = as_item.section_parts || null;
            if (section_parts && section_parts.length > 0) {
                $.each(section_parts, $.proxy(function (index, part) {
                    if (part.type == 'assessment_item_ref') {
                        result++;
                    } else if (part.type == 'assessment_section') {
                        result = result + this._getSectionPartsCount(part);
                    }
                }, this));
            }
            return result;
        },
        searchNDRPapersAction: function () {
            this.model.ndrFilter.page(0);
            this.searchNDRPapers();
        },
        saveNDRPapers: function () {
            var ndrType = this.model.ndrType();
            var self = this;
            if (ndrType) {
                var test = this.model.selectedCustomerNDRQB();
            } else {
                var selectedNDRPapers = this.model.selectedNDRPapers();
                var originalPaperList = ko.mapping.toJS(this.model.exam.paper_list);
                $.each(selectedNDRPapers, function (index, newNDRPaper) {
                    var flag = true;
                    $.each(originalPaperList, function (index, originalPaper) {
                        if (newNDRPaper.identifier == originalPaper.id) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        originalPaperList.push({
                            disabled: false,
                            id: newNDRPaper.identifier,
                            question_count: self.getNDRQuestionCount(newNDRPaper),
                            //questions: newNDRPaper.questions,
                            title: newNDRPaper.title,
                            total_score: newNDRPaper.score,
                            version: 0,
                            location: 4
                        })
                    }
                });
                ko.mapping.fromJS(originalPaperList, {}, this.model.exam.paper_list);
            }
            $('#ndrPaperModal').modal('hide');

        },
        addQuestion: function () {
            var self = this;
            var data = {
                custom_id: custom_id,
                custom_type: custom_type,
                title: self.model.exam.title() + '-题库',
                description: ''
            };
            this.store.addQuestion(this.params.addQuestionUrl, this.params.projectCode, data).done(function (returnData) {
                this.model.selectedCustomerNDRQB(returnData);
            }.bind(this))
        },
        openBankEdit: function () {
            this.toggleModalModule('');
            this.toggleModalModule('bankEdit');
            $('#bankModal').modal('show');
        },

        toggleModalModule: function (type, func) {
            if ($.isFunction(func))func();
            this.model.modalModule(type);
        }

    };
    ko.components.register('x-paperedit', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数 studentList：可选列表，selectStudentList：已选列表
         */
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        /**
         * 组件模板
         */
        template: '<div></div>'
    })
})(window, jQuery);