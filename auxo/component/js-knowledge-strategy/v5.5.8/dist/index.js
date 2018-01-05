(function (ko$1,$) {
'use strict';

ko$1 = 'default' in ko$1 ? ko$1['default'] : ko$1;
$ = 'default' in $ ? $['default'] : $;

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

var QUESTION_TYPE_MAP = {
    "201": "单选题",
    "202": "多选题",
    "203": "判断题",
    "206": "问答题",
    "208": "复合题",
    "209": "填空题"
};
function StrategyObject(data) {
    this.title = ko.observable(data.title).extend({
        required: {
            value: true,
            message: '大题名称不可为空'
        },
        maxLength: {
            params: 50,
            message: '长度最多{0}'
        },
        pattern: {
            params: '^[a-zA-Z0-9 _\u4E00-\u9FA5().-]*$',
            message: '不可含有非法字符'
        }
    });
    this.score = ko.observable(data.score);
    this.question_strategies = ko.observableArray().extend({
        questionTypeRule: {}
    });

    if (data.question_strategies && data.question_strategies.length) {
        $.each(data.question_strategies, $.proxy(function (index, item) {
            this.question_strategies.push(item);
        }, this));
    }
}

function QuestionObject(data) {
    this.question_type = ko.observable(data.question_type);
    this.totalNumber = ko.observable(data.totalNumber);

    this.isVisible = ko.observable(true);

    this.question_number = ko.observable(data.question_number).extend({
        required: {
            value: true,
            message: '题型的题目数不可为空'
        },
        pattern: {
            params: "^([1-9][0-9]*)$",
            message: '题型的题目数必须为正整数！'
        },
        max: {
            params: this.totalNumber,
            message: '题型的题目数不能超过总数'
        }
    });
    this.score = ko.observable(data.score).extend({
        required: {
            value: true,
            message: '分数不能为空'
        },
        pattern: {
            params: "^([1-9][0-9]*)$",
            message: '分数必须为正整数！'
        },
        maxLength: {
            params: 5,
            message: '分数长度最多{0}'
        }
    });
    this.knowledge_strategies = ko.observableArray();
    this.opened = ko.observable(data.opened);
    if (data.knowledge_strategies && data.knowledge_strategies.length) {
        $.each(data.knowledge_strategies, $.proxy(function (index, item) {
            this.knowledge_strategies.push(new QuestionObject(item));
        }, this));
    }
}

function KnowledgeObject(data) {
    this.identifier = ko.observable(data.identifier);
    this.opened = ko.observable(data.opened);
    this.isVisible = ko.observable(data.isVisible);
    this.parent_node = ko.observable(data.parent_node);
    this.parent = ko.observable(data.parent);
    this.question_number = ko.observable(data.question_number).extend({
        pattern: {
            params: "^(0|[1-91][0-9]*)$",
            message: '输入格式有误'
        },
        max: {
            params: data.totalNumber,
            message: '不能超过总数'
        }
    });
    this.searchSQL = ko.observable(data.searchSQL);
    this.title = ko.pureComputed(function () {
        return data.title;
    }, this);
    this.totalNumber = ko.observable(data.totalNumber);
    this.children = ko.observableArray();
    if (data.children.length) {
        $.each(data.children, $.proxy(function (index, item) {
            this.children.push(new KnowledgeObject(item));
        }, this));
    }
}
function Model(params) {
    var vm = this;
    var question_bank_ids = params.question_bank_ids;
    var question_bank_names = params.question_bank_names;
    var paper_part_strategies = ko.mapping.toJS(params.paper_part_strategies) ? ko.mapping.toJS(params.paper_part_strategies).concat() : [];
    var apiServiceDomain = params.apiServiceDomain;
    var elearningQBServiceDomain = params.elearningQBServiceDomain;
    var espServiceDomain = params.espServiceDomain;
    var isPopupWin = params.isPopupWin;
    vm.cancelEventCallBack = params.cancelEventCallBack;
    vm.saveEventCallBack = params.saveEventCallBack;
    vm.saveThenReturnCallBack = params.saveThenReturnCallBack;
    vm.lastStepCallBack = params.lastStepCallBack;
    vm.isPopupWin = isPopupWin;
    vm.model = params.model;
    var projectId = params.projectId;
    vm.paper_part_strategies = params.paper_part_strategies;
    vm.total_score = params.total_score || 0;
    vm.question_number = params.question_number || 0;
    vm.getTotalNumberByQuestionType = getTotalNumberByQuestionType;
    vm.toggleOpen = toggleOpen;
    vm.toggleChildOpen = toggleChildOpen;
    vm.knowledgeInfo = {};
    vm.knowledgeSystemIdList = [];
    vm.toggleNodeOpen = toggleNodeOpen;
    vm.inputOnChangeEvent = inputOnChangeEvent;
    vm.selectOnChangeEvent = selectOnChangeEvent;
    vm.addOneQuestionType = addOneQuestionType;
    vm.getStrategyText = getStrategyText;
    vm.addOneStrategyItem = addOneStrategyItem;
    vm.getTotalStrategyInfo = getTotalStrategyInfo;

    vm.questionStrategyMoveDown = questionStrategyMoveDown;

    vm.saveEvent = saveEvent;
    vm._doSave = _doSave;
    vm.cancelEvent = cancelEvent;
    vm.lastStepEvent = lastStepEvent;
    vm.saveThenReturnEvent = saveThenReturnEvent;

    vm.localStrategies = ko.observableArray();

    if (question_bank_ids() && question_bank_ids().length) {
        vm.questionTypeList = ko.observableArray([{
            type: '201',
            name: "单选题",
            searchSQL: getQuestionSQL(201),
            totalNumber: 0
        }, {
            type: '202',
            name: "多选题",
            searchSQL: getQuestionSQL(202),
            totalNumber: 0
        }, {
            type: '203',
            name: "判断题",
            searchSQL: getQuestionSQL(203),
            totalNumber: 0
        }, {
            type: '206',
            name: "问答题",
            searchSQL: getQuestionSQL(206),
            totalNumber: 0
        }, {
            type: '208',
            name: "复合题",
            searchSQL: getQuestionSQL(208),
            totalNumber: 0
        }, {
            type: '209',
            name: "填空题",
            searchSQL: getQuestionSQL(209),
            totalNumber: 0
        }]);

        $("ul").dragsort({
            dragSelector: "li span.drag-item",
            dragSelectorExclude: "table, input",
            dragEnd: function dragEnd(list) {
                var dragResult = [],
                    sort_number = this.data("sort_number");
                var localStrategies = vm.localStrategies();
                $("#strategyList").find(".strategyItem").each(function (index, element) {
                    dragResult.push(localStrategies[+$(element).data("sort_number") - 1]);
                });
                vm.localStrategies([]);
                vm.localStrategies(dragResult);
            }
        });
        init();
    } else {
        $.fn.dialog2.helpers.alert("请先选择题库！");
    }

    ko.validation.rules["questionTypeRule"] = {
        validator: function validator(val) {
            if (val.length > 1) {
                var tempArray = [];
                $.each(val, function (index, item) {
                    tempArray.push(item.question_type());
                });
                var sortArray = tempArray.sort();
                var result = true;
                for (var i = 0; i < sortArray.length; i++) {
                    if (sortArray[i] == sortArray[i + 1]) {
                        result = false;
                    }
                }
                return result;
            } else {
                return true;
            }
        },
        message: '题目类型不能重复'
    };
    ko.validation.registerExtenders();

    function init() {
        $.when(getQuestionInfo(getQuestionSQLByQBIds()), getKnowledgeSystemIdsByQBIds()).done(function (responses, exerciseBankVos) {
            var res = responses[0];
            var exercisesBanks = exerciseBankVos[0];

            var knowledgeSystemIds = [];
            if (exercisesBanks && exercisesBanks.length) {
                $.each(exercisesBanks, function (index, item) {
                    if (knowledgeSystemIds.length) {
                        var flag = true;
                        $.each(knowledgeSystemIds, function (index1, id) {
                            if (id == item.knowledge_system_id) flag = false;
                        });
                        if (flag) {
                            knowledgeSystemIds.push(item.knowledge_system_id);
                        }
                    } else {
                        knowledgeSystemIds.push(item.knowledge_system_id);
                    }
                });
                vm.knowledgeSystemIdList = knowledgeSystemIds;
            }

            if (res && res.length) {
                var questions = ko.mapping.toJS(vm.questionTypeList);
                $.each(questions, function (index, question) {
                    $.each(res, function (index1, item) {
                        if (question.searchSQL == item.qql) {
                            question.totalNumber = item.result.total;
                        }
                    });
                });
                ko.mapping.fromJS(questions, {}, vm.questionTypeList);

                if (paper_part_strategies && paper_part_strategies.length) {
                    console.log(paper_part_strategies);
                    $.each(paper_part_strategies, function (index, item) {
                        if (item.question_strategies && item.question_strategies.length) {
                            var old_question_strategies = item.question_strategies;
                            item.question_strategies = [];
                            $.each(old_question_strategies, function (index, questionStr) {
                                var questionStrObject = null;
                                questionStr.question_type = questionStr.question_type + "";
                                questionStr.totalNumber = vm.getTotalNumberByQuestionType.call(vm, questionStr.question_type);
                                if (questionStr.knowledge_strategies && questionStr.knowledge_strategies.length) {
                                    questionStr.opened = true;
                                    var oldKnowledgeStrategies = questionStr.knowledge_strategies;
                                    delete questionStr.knowledge_strategies;
                                    questionStr.knowledge_strategies = [];
                                    questionStrObject = new QuestionObject(questionStr);

                                    vm.knowledgeInfo[questionStr.question_type] = {};
                                    if (vm.knowledgeSystemIdList && vm.knowledgeSystemIdList.length) {
                                        var deferredLength = vm.knowledgeSystemIdList.length;
                                        $.when.apply($, getKnowledgeDefList(vm.knowledgeSystemIdList)).then(function () {
                                            var knowledgeTreeList = [];
                                            if (deferredLength == 1) {
                                                knowledgeTreeList.push(arguments[0]);
                                            } else {
                                                $.each(arguments, function (index, item) {
                                                    knowledgeTreeList.push(item[0]);
                                                });
                                            }
                                            var tempKnowledgeInfo = {};
                                            var knowledgeSearchList = [];
                                            $.each(vm.knowledgeSystemIdList, function (index, item) {
                                                tempKnowledgeInfo[item] = [];
                                                if (knowledgeTreeList[index] && knowledgeTreeList[index].items) {
                                                    $.each(knowledgeTreeList[index].items, function (index1, knowledge) {
                                                        var searchSQl = getKnowledgeQuestionSQL(questionStr.question_type, knowledge.identifier);
                                                        knowledgeSearchList.push(searchSQl);
                                                        knowledge.searchSQL = searchSQl;
                                                        knowledge.totalNumber = 0;
                                                        knowledge.children = [];
                                                        tempKnowledgeInfo[item].push(knowledge);
                                                    });
                                                }
                                            });
                                            vm.knowledgeInfo[questionStr.question_type] = tempKnowledgeInfo;
                                            getQuestionInfo(knowledgeSearchList).then(function (res) {
                                                if (res && res.length) {
                                                    $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                                        $.each(tempKnowledgeInfo[knowledgeSystemId], function (index1, knowledge) {
                                                            $.each(res, function (index2, data) {
                                                                if (data.qql == knowledge.searchSQL) {
                                                                    knowledge.totalNumber = data.result.total;
                                                                }
                                                            });
                                                        });
                                                    });
                                                    questionStrObject.question_number(0);
                                                    $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                                        var oneTreeList = tempKnowledgeInfo[knowledgeSystemId];
                                                        var treeData = buildTreeArrayFromFlatArray(oneTreeList, oldKnowledgeStrategies);

                                                        var knowledgeObject = new KnowledgeObject(treeData[0]);

                                                        knowledgeObject.parent_node(questionStrObject);
                                                        var treeDataWithParentNode = traverseTreeToAddParentNode(knowledgeObject);
                                                        var finalTreeData = updateTotalNumber(treeDataWithParentNode, oldKnowledgeStrategies);
                                                        questionStrObject.knowledge_strategies.push(finalTreeData);
                                                    });
                                                }
                                            });
                                        });
                                    }
                                } else {
                                    questionStr.opened = false;
                                    questionStr.knowledge_strategies = [];
                                    questionStrObject = new QuestionObject(questionStr);
                                }
                                item.question_strategies.push(questionStrObject);
                            });
                        }
                        vm.localStrategies.push(new StrategyObject(item));
                    });
                } else {
                    var originalStrategy = {
                        title: "",
                        question_strategies: [new QuestionObject({
                            question_type: 201 + "",
                            question_number: 0,
                            totalNumber: vm.getTotalNumberByQuestionType.call(vm, 201 + ""),
                            score: 0,
                            knowledge_strategies: [],
                            opened: false
                        })],
                        score: 0
                    };

                    vm.localStrategies.push(new StrategyObject(originalStrategy));
                }
            }
        });
    }

    function getTotalNumberByQuestionType(data) {
        var self = this;
        var question_type = data;
        var questionTypeList = ko.mapping.toJS(self.questionTypeList);
        var result = 0;
        $.each(questionTypeList, function (index, item) {
            if (question_type == item.type) {
                result = item.totalNumber;
            }
        });

        return result;
    }

    function getQuestionInfo(searchSQLList) {
        return ajax(elearningQBServiceDomain + '/v2/questions/search', {
            type: "POST",
            data: JSON.stringify(searchSQLList)
        });
    }

    function getKnowledgeSystemIdsByQBIds(searchSQLList) {
        return ajax(espServiceDomain + '/v1/bank/list_by_ids', {
            type: "POST",
            data: JSON.stringify(question_bank_ids())
        });
    }

    function getKnowledgeTreeDataByKnowledgeSystemId(knowledge_system_id) {
        return ajax(espServiceDomain + '/v1/knowledge/list?knowledge_system_id=' + knowledge_system_id, {
            type: "GET"
        });
    }

    function getKnowledgeDefList(knowledgeSystemIdList) {
        var result = [];
        $.each(knowledgeSystemIdList, function (index, item) {
            result.push(getKnowledgeTreeDataByKnowledgeSystemId(item));
        });
        return result;
    }

    function toggleChildOpen(data, element) {
        var questionType = data.opened(!data.opened());
        var children = data.children();
        var parentId = data.identifier();
        var tableId = element.closest('table').id;

        $.each(children, function (index, item) {});
    }

    function toggleOpen(data, flag) {
        if (flag) {
            var questionType = data.question_type();
            var status = data.opened();
            if (status) {
                var children = data.knowledge_strategies();
                if (children.length) {
                    $.each(children, function (index, item) {
                        item.isVisible(false);
                        item.opened(false);
                        item.question_number(0);
                    });
                }
            } else {
                if (vm.knowledgeInfo[questionType] && !$.isEmptyObject(vm.knowledgeInfo[questionType])) {
                    if (data.knowledge_strategies && data.knowledge_strategies().length) {
                        var children = data.knowledge_strategies && data.knowledge_strategies() || [];
                        if (children.length) {
                            var totalNumber = 0;
                            $.each(children, function (index, item) {
                                item.isVisible(true);
                                item.opened(false);
                                totalNumber = totalNumber + +item.question_number();
                                if ($.isArray(item.children()) && item.children().length) {
                                    setVisibleAndOpenedFalse(item.children());
                                }
                            });
                            data.question_number(totalNumber);
                        }
                    } else {
                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                            var oneTreeList = vm.knowledgeInfo[questionType][knowledgeSystemId];

                            var knowledgeObject = new KnowledgeObject(oneTreeList[0]);

                            knowledgeObject.parent_node(data);
                            data.knowledge_strategies.push(traverseTreeToAddParentNode(knowledgeObject));
                        });
                    }
                } else {
                    data.knowledge_strategies([]);
                    data.question_number(0);
                    vm.knowledgeInfo[questionType] = {};
                    if (vm.knowledgeSystemIdList && vm.knowledgeSystemIdList.length) {
                        var deferredLength = vm.knowledgeSystemIdList.length;
                        $.when.apply($, getKnowledgeDefList(vm.knowledgeSystemIdList)).then(function () {
                            var knowledgeTreeList = [];
                            if (deferredLength == 1) {
                                knowledgeTreeList.push(arguments[0]);
                            } else {
                                $.each(arguments, function (index, item) {
                                    knowledgeTreeList.push(item[0]);
                                });
                            }
                            var knowledgeSearchList = [];
                            $.each(vm.knowledgeSystemIdList, function (index, item) {
                                vm.knowledgeInfo[questionType][item] = [];
                                if (knowledgeTreeList[index] && knowledgeTreeList[index].items) {
                                    $.each(knowledgeTreeList[index].items, function (index1, knowledge) {
                                        var searchSQl = getKnowledgeQuestionSQL(questionType, knowledge.identifier);
                                        knowledgeSearchList.push(searchSQl);
                                        knowledge.searchSQL = searchSQl;
                                        knowledge.totalNumber = 0;
                                        knowledge.children = [];
                                        vm.knowledgeInfo[questionType][item].push(knowledge);
                                    });
                                }
                            });
                            getQuestionInfo(knowledgeSearchList).then(function (res) {
                                if (res && res.length) {
                                    $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                        $.each(vm.knowledgeInfo[questionType][knowledgeSystemId], function (index1, knowledge) {
                                            $.each(res, function (index2, data) {
                                                if (data.qql == knowledge.searchSQL) {
                                                    knowledge.totalNumber = data.result.total;
                                                }
                                            });
                                        });
                                    });

                                    $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                        var oneTreeList = vm.knowledgeInfo[questionType][knowledgeSystemId];
                                        var treeData = buildTreeArrayFromFlatArray(oneTreeList);
                                        var knowledgeObject = new KnowledgeObject(treeData[0]);

                                        knowledgeObject.parent_node(data);
                                        data.knowledge_strategies.push(traverseTreeToAddParentNode(knowledgeObject));
                                    });
                                }
                            });
                        });
                    }
                }
            }

            data.opened(!data.opened());
        } else {
            data.knowledge_strategies([]);
            data.totalNumber(this.getTotalNumberByQuestionType(data.question_type()));
            data.question_number(0);
            data.opened(false);
        }
    }

    function addOneQuestionType(data) {
        var question_strategies = data.question_strategies;
        var originalData = {
            question_type: 201 + "",
            question_number: 0,
            score: 0,
            knowledge_strategies: [],
            opened: false,
            totalNumber: this.getTotalNumberByQuestionType(201 + "")
        };
        question_strategies.push(new QuestionObject(originalData));
    }

    function traverseTreeToAddParentNode(treeObject) {
        var parentNode = treeObject;

        if (parentNode.children().length) {
            $.each(parentNode.children(), function (index, item) {
                item.parent_node(parentNode);
                if (item.children().length) {
                    traverseTreeToAddParentNode(item);
                }
            });
        }
        return treeObject;
    }

    function toggleNodeOpen() {
        var self = this;
        if (self.children().length) {
            self.opened(!self.opened());
            var children = self.children();
            $.each(children, function (index, item) {
                item.isVisible(self.opened());
            });
        }
        if (self.opened()) {
            updateParentNumber(self);
        }
    }

    function getQuestionSQLByQBIds() {
        var questions = ko.mapping.toJS(vm.questionTypeList);
        var result = [];
        $.each(questions, function (index, question) {
            result.push(question.searchSQL);
        });
        return result;
    }

    function getQuestionSQL(type) {
        var questionIds = question_bank_ids().toString();
        return "$filter={question.question_type eq " + type + "} and {question.question_bank in(" + questionIds + ")}&$range=project eq " + projectId + "&$result=count";
    }

    function getKnowledgeQuestionSQL(type, knowledgeSystemId) {
        var questionIds = question_bank_ids().toString();
        return "$filter={question.question_type eq " + type + "} and {question.question_bank in(" + questionIds + ")} and {question.knowledge eq " + knowledgeSystemId + "}&$range=project eq " + projectId + "&$result=count";
    }

    function buildTreeArrayFromFlatArray(array) {
        var rootId = array[0].parent;
        var map = {},
            node,
            roots = [];
        for (var i = 0; i < array.length; i += 1) {
            node = array[i];
            node.question_number = 0;

            node.opened = false;
            node.isVisible = i == 0 ? true : false;
            node.parent_node = null;
            map[node.identifier] = i;
            if (node.parent !== rootId) {
                array[map[node.parent]].children.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    }

    function inputOnChangeEvent(data) {
        if (data.parent_node() && data.parent_node().opened()) {
            updateParentNumber(data.parent_node && data.parent_node() || null);
        }
    }

    function selectOnChangeEvent(data) {
        toggleOpen.call(this, data, false);
    }

    function updateParentNumber(node) {
        if (node.knowledge_strategies && node.knowledge_strategies().length) {
            var _totalNumber = 0;
            var _children = node.knowledge_strategies();
            $.each(_children, function (index, item) {
                _totalNumber = _totalNumber + +item.question_number();
            });
            node.question_number(_totalNumber);
        }
        if (node && !node.knowledge_strategies) {
            var children = node.children && node.children() || [];
            if (children.length) {
                var totalNumber = 0;
                $.each(children, function (index, item) {
                    totalNumber = totalNumber + +item.question_number();
                });
                node.question_number(totalNumber);
            }
            if (node.parent_node && node.parent_node()) {
                updateParentNumber(node.parent_node());
            }
        }
    }

    function getStrategyText(data) {
        var self = this;
        var totalQuestionNum = 0;
        var totalScore = 0;
        var question_strategies = data.question_strategies();
        var questionTypeList = ko.mapping.toJS(self.questionTypeList);
        var result = "";
        $.each(question_strategies, function (index, strategy) {
            totalQuestionNum = totalQuestionNum + +strategy.question_number();
            totalScore = totalScore + +strategy.score() * +strategy.question_number();
            var questionName = getQuestionNameByType(questionTypeList, strategy.question_type());
            result = (result ? result + "," : "") + questionName + strategy.question_number() + "题，每题" + strategy.score() + "分";
        });
        data.score(totalScore);
        result = "总题目数" + totalQuestionNum + "题，总共" + totalScore + "分，其中" + result;
        return result;
    }

    function getTotalStrategyInfo() {
        var self = this;
        var totalQuestionNum = 0;
        var totalScore = 0;
        var localStrategies = self.localStrategies();
        $.each(localStrategies, function (index, strategy) {
            var questionStrategies = ko.mapping.toJS(strategy.question_strategies);
            $.each(questionStrategies, function (index1, question) {
                totalQuestionNum = totalQuestionNum + +question.question_number;
            });
            totalScore = totalScore + +strategy.score();
        });
        return "试卷总题数" + totalQuestionNum + "题，总分" + totalScore + "分";
    }

    function getQuestionNameByType(questionTypeList, type) {
        var result = "";
        $.each(questionTypeList, function (index, questionType) {
            if (questionType.type == type) {
                result = questionType.name;
            }
        });
        return result;
    }

    function addOneStrategyItem() {
        var self = this;
        var originalStrategy = {
            title: "",
            question_strategies: [new QuestionObject({
                question_type: 201 + "",
                question_number: 0,
                totalNumber: vm.getTotalNumberByQuestionType.call(vm, 201 + ""),
                score: 0,
                knowledge_strategies: [],
                opened: false
            })],
            score: 0
        };
        self.localStrategies.push(new StrategyObject(originalStrategy));
    }

    function lastStepEvent() {
        if (this.lastStepCallBack) {
            this.lastStepCallBack();
        }
    }

    function cancelEvent() {
        if (this.cancelEventCallBack) {
            this.cancelEventCallBack();
        }
    }

    function saveEvent() {
        var self = this;
        this._doSave(function () {
            if (self.saveEventCallBack) {
                self.saveEventCallBack();
            }
        });
    }

    function _doSave(callback) {
        var self = this;
        var errors = ko.validation.group(this);
        if (errors().length) {
            $.fn.dialog2.helpers.alert(errors()[0]);
            return;
        }
        var localStrategy = ko.mapping.toJS(self.localStrategies);
        var questionTypeList = ko.mapping.toJS(self.questionTypeList);
        var canSave = true;
        var question_number = 0;
        var total_score = 0;
        $.each(questionTypeList, function (idnex, item) {
            var type = item.type,
                totalNumber = item.totalNumber;
            var selectedNumber = 0;
            $.each(localStrategy, function (index1, strategy) {
                if ($.isArray(strategy.question_strategies)) {
                    $.each(strategy.question_strategies, function (index2, questionStrategy) {
                        if (questionStrategy.question_type == type) {
                            selectedNumber = selectedNumber + +questionStrategy.question_number;
                            question_number = question_number + +questionStrategy.question_number;
                            total_score = total_score + +questionStrategy.question_number * +questionStrategy.score;
                        }
                    });
                }
            });
            if (selectedNumber > totalNumber) {
                $.fn.dialog2.helpers.alert(item.name + '的设置数目超过总题目数，请调整！');
                canSave = false;
            }
        });
        if (canSave) {
            var finalStrategy = [];
            var allStrategy = [];
            if (localStrategy.length) {
                $.each(localStrategy, function (index, strategy) {
                    if (strategy.question_strategies.length == 0) {
                        $.fn.dialog2.helpers.alert('大题下的题目类型不能为空！');
                        canSave = false;
                    }
                    finalStrategy.push({
                        title: strategy.title,
                        score: +strategy.score,
                        question_strategies: simpleQuestionStrategies(strategy.question_strategies)
                    });
                    allStrategy.push({
                        title: strategy.title,
                        score: +strategy.score,
                        question_strategies: simpleAllQuestionStrategies(strategy.question_strategies)
                    });
                });
            }

            if (canSave) {
                $.each(questionTypeList, function (index, questionType) {
                    var type = questionType.type,
                        knowledgeInfo = self.knowledgeInfo,
                        knowledgeSystemIdList = self.knowledgeSystemIdList;
                    if (knowledgeInfo[type]) {
                        $.each(knowledgeSystemIdList, function (index1, knowledgeSystemId) {
                            var knowledgeInfos = knowledgeInfo[type][knowledgeSystemId];
                            if ($.isArray(knowledgeInfos) && knowledgeInfos.length) {
                                $.each(knowledgeInfos, function (index2, knowledge) {
                                    if (knowledge.totalNumber > 0) {
                                        var knowledgeId = knowledge.identifier,
                                            currentNumber = 0;
                                        if ($.isArray(allStrategy) && allStrategy.length) {
                                            $.each(allStrategy, function (index, strategy) {
                                                if ($.isArray(strategy.question_strategies) && strategy.question_strategies.length) {
                                                    $.each(strategy.question_strategies, function (index1, questionStrategy) {
                                                        if (questionStrategy.question_type == type && $.isArray(questionStrategy.knowledge_strategies) && questionStrategy.knowledge_strategies.length) {
                                                            $.each(questionStrategy.knowledge_strategies, function (index2, ks) {
                                                                if (ks.knowledge_id == knowledgeId) {
                                                                    currentNumber = currentNumber + ks.question_number;
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        if (currentNumber > knowledge.totalNumber) {
                                            canSave = false;
                                            $.fn.dialog2.helpers.alert('设置的知识点“' + knowledge.title + '”下的' + QUESTION_TYPE_MAP[type] + '的题目数' + currentNumber + '超过总题目数' + knowledge.totalNumber);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
            if (canSave) {
                if (this.isPopupWin) {
                    this.paper_part_strategies(finalStrategy);
                    this.question_number(question_number);
                    this.total_score(total_score);
                    callback && $.isFunction(callback) && callback();
                } else {
                    var model = ko.mapping.toJS(this.model);
                    var pass_score = model.pass_score;
                    if (pass_score > total_score) {
                        $.fn.dialog2.helpers.alert('当前设置的及格分是' + pass_score + '分，当前设置的试卷总分是' + total_score + '分。及格分不能大于总分！');
                        return;
                    }
                    model.exam_paper_strategy.paper_strategy.paper_part_strategies = finalStrategy;
                    if (model.question_number != undefined) {
                        model.question_number = question_number;
                    }

                    model.total_score = total_score;
                    ko.mapping.fromJS(model, {}, this.model);
                    callback && $.isFunction(callback) && callback();
                }
            }
        }
    }

    function saveThenReturnEvent() {
        var self = this;
        this._doSave(function () {
            if (self.saveThenReturnCallBack) {
                self.saveThenReturnCallBack();
            }
        });
    }

    function simpleQuestionStrategies(questionStrategies) {
        var result = [];
        if (questionStrategies && questionStrategies.length) {
            $.each(questionStrategies, function (index, question) {
                result.push({
                    question_type: +question.question_type,
                    question_number: +question.question_number,
                    score: +question.score,
                    knowledge_strategies: simpleKnowledgeStrategies(question.knowledge_strategies)
                });
            });
        }
        return result;
    }

    function simpleAllQuestionStrategies(questionStrategies) {
        var result = [];
        if (questionStrategies && questionStrategies.length) {
            $.each(questionStrategies, function (index, question) {
                result.push({
                    question_type: +question.question_type,
                    question_number: +question.question_number,
                    score: +question.score,
                    knowledge_strategies: simpleAllKnowledgeStrategies(question.knowledge_strategies)
                });
            });
        }
        return result;
    }

    function simpleAllKnowledgeStrategies(knowledgeStrategies) {
        var result = [];
        if (knowledgeStrategies && knowledgeStrategies.length) {
            $.each(knowledgeStrategies, function (index, knowledge) {
                knowledge.question_number = +knowledge.question_number;
                if (knowledge.question_number > 0) {
                    if (knowledge.isVisible) {
                        result.push({
                            knowledge_id: knowledge.identifier,
                            question_number: +knowledge.question_number
                        });
                        if (knowledge.opened && knowledge.children.length) {
                            var tempArray = simpleAllKnowledgeStrategies(knowledge.children);
                            result = result.concat(tempArray);
                        }
                    }
                }
            });
        }
        return result;
    }

    function simpleKnowledgeStrategies(knowledgeStrategies) {
        var result = [];
        if (knowledgeStrategies && knowledgeStrategies.length) {
            $.each(knowledgeStrategies, function (index, knowledge) {
                knowledge.question_number = +knowledge.question_number;
                if (knowledge.question_number > 0) {
                    if (knowledge.isVisible && !knowledge.opened) {
                        result.push({
                            knowledge_id: knowledge.identifier,
                            question_number: +knowledge.question_number
                        });
                    }
                    if (knowledge.isVisible && knowledge.opened && knowledge.children.length == 0) {
                        result.push({
                            knowledge_id: knowledge.identifier,
                            question_number: +knowledge.question_number
                        });
                    }
                    if (knowledge.isVisible) {
                        if (knowledge.opened && knowledge.children.length) {
                            var tempArray = simpleKnowledgeStrategies(knowledge.children);
                            result = result.concat(tempArray);
                        }
                    }
                }
            });
        }
        return result;
    }

    function updateTotalNumber(treeData, knowledgeArray) {
        $.each(knowledgeArray, function (index, knowledgeInfo) {
            var currentNode = getTreeNodeById([treeData], knowledgeInfo.knowledge_id);
            if (currentNode) {
                updateTotalNumberFromCurrentNode(currentNode, knowledgeInfo.question_number);
            }
        });
        return treeData;
    }

    function updateTotalNumberFromCurrentNode(node, questionNum, flag) {
        node.question_number(node.question_number() + questionNum);
        node.isVisible(true);
        if (flag) {
            node.opened(true);
            if (node.children && $.isArray(node.children())) {
                setChildNodeOpened(node.children());
            }
        }
        if (node.parent_node && node.parent_node()) {
            updateTotalNumberFromCurrentNode(node.parent_node(), questionNum, true);
        }
    }

    function setChildNodeOpened(children) {
        $.each(children, function (index, child) {
            child.isVisible(true);
        });
    }

    function getTreeNodeById(treeObjectArray, kid) {
        var result = [];
        getTreeNodeArrayById(treeObjectArray, kid, result);
        if (result.length) {
            return result[0];
        }
        return null;
    }

    function getTreeNodeArrayById(treeObjectArray, kid, resultArray) {
        if ($.isArray(treeObjectArray)) {
            $.each(treeObjectArray, function (index, treeOjbect) {
                if (treeOjbect.identifier() == kid) {
                    resultArray.push(treeOjbect);
                } else {
                    if ($.isArray(treeOjbect.children())) resultArray.concat(getTreeNodeArrayById(treeOjbect.children(), kid, resultArray));
                }
            });
        }
    }

    function questionStrategyMoveDown(parentObject, currentItem, currentIndex) {
        var parent = parentObject.question_strategies();
        if (currentIndex >= parent.length - 1) return;
        var current = currentItem;
        var moveDownResult = [];
        for (var i = 0; i < parent.length; i++) {
            if (i < currentIndex || i > currentIndex + 1) {
                moveDownResult.push(parent[i]);
            }
            if (i == currentIndex) {
                moveDownResult.push(parent[i + 1]);
            }
            if (i == currentIndex + 1) {
                moveDownResult.push(current);
            }
        }
        parentObject.question_strategies(moveDownResult);
    }

    function setVisibleAndOpenedFalse(array) {
        $.each(array, function (index, item) {
            item.isVisible(false);
            item.opened(false);
            if ($.isArray(item.children()) && item.children().length) {
                setVisibleAndOpenedFalse(item.children());
            }
        });
    }
}

var tpl = "<script type=\"text/ko\" id=\"knowledgeTemplate\">\r\n<tr><td colspan=\"5\" data-bind=\"visible:isVisible()\">\r\n<table style=\"width:100%;\">\r\n<thead>\r\n<tr>\r\n<th>知识点</th>\r\n<th>题目数</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td><i class=\"icon-plus\" data-bind=\"css:{'icon-minus':opened() || children().length==0}, click: $component.toggleNodeOpen\"></i><span data-bind=\"text:title\"></span></td>\r\n<td><input class=\"span1\" type=\"text\" data-bind=\"value: question_number, disable: opened(), event:{change: $component.inputOnChangeEvent}, valueUpdate:'afterkeydown'\"/>/<!--ko text: totalNumber--><!--/ko--></td>\r\n</td>\r\n</tr>\r\n<!--ko if: children().length-->\r\n<!--ko foreach: children-->\r\n    <!--ko template:{name:'knowledgeTemplate', data:$data}--><!--/ko-->\r\n<!--/ko-->\r\n<!--/ko-->\r\n</tbody>\r\n</table>\r\n</td></tr>\r\n\r\n\r\n\r\n\r\n\r\n</script>\r\n\r\n<style>\r\n    .input-error {\r\n        border-color: red !important;\r\n    }\r\n\r\n    .error {\r\n        color: red;\r\n    }\r\n</style>\r\n\r\n<div class=\"container-fluid\">\r\n    <div class=\"row-fluid\">\r\n        <fieldset>\r\n            <legend>题目内容</legend>\r\n        </fieldset>\r\n        <ul id=\"strategyList\" class=\"inline\" data-bind=\"foreach:localStrategies\">\r\n            <li class=\"strategyItem\" style=\"margin:10px 0\" data-bind=\"attr:{'data-sort_number':$index()+1}\">\r\n                <div><span>大题名称<input type=\"text\" data-bind=\"value:title\">\r\n                    <!--ko text: $component.getStrategyText.call($component, $data)--><!--/ko--></span>\r\n                    <span class=\"btn drag-item\">点住拖拽</span>\r\n                    <span class=\"btn pull-right\" data-bind=\"click:function(){$component.localStrategies.remove($data);}\">删除</span></div>\r\n\r\n                <table class=\"table table-bordered\" style=\"margin-bottom: 10px\">\r\n                    <thead>\r\n                    <tr>\r\n                        <th>题型</th>\r\n                        <th>题目数</th>\r\n                        <th>分值</th>\r\n                        <th>总分</th>\r\n                        <th>操作</th>\r\n                    </tr>\r\n                    </thead>\r\n                    <!--ko foreach:question_strategies-->\r\n                    <tbody data-bind=\"attr:{class:question_type}\">\r\n                    <tr class=\"level0\">\r\n                        <td>\r\n                            <select class=\"span2\" data-bind=\"value: question_type, event:{change: $component.selectOnChangeEvent.bind($component, $data)}\">\r\n                                <option value=\"201\">单选题</option>\r\n                                <option value=\"202\">多选题</option>\r\n                                <option value=\"203\">判断题</option>\r\n                                <option value=\"206\">问答题</option>\r\n                                <option value=\"208\">复合题</option>\r\n                                <option value=\"209\">填空题</option>\r\n                            </select>\r\n                            <!--<select class=\"span2\"-->\r\n                            <!--data-bind=\"options: $component.questionTypeList, optionsText:'name',optionsValue:'type', selectedOptions: question_type, event:{change: $component.selectOnChangeEvent.bind($component, $data)}\">-->\r\n                            <!--</select>-->\r\n                            <a href=\"javascript:;\" data-bind=\"text: opened()? '收起知识点':'展开知识点', click: $component.toggleOpen.bind($component, $data, true)\"></a>\r\n                        </td>\r\n                        <td><input class=\"span1\" type=\"text\" data-bind=\"value:question_number, disable: opened()\">/<span data-bind=\"text:totalNumber\"></span>\r\n                        </td>\r\n                        <td><input class=\"span1\" type=\"text\" data-bind=\"value:score\"></td>\r\n                        <td><span data-bind=\"text: score()*question_number()\"></span></td>\r\n                        <td>\r\n                            <a href=\"javascript:;\" data-bind=\"click: $component.questionStrategyMoveDown.bind($component, $parent, $data, $index())\">下移</a>\r\n                            <a href=\"javascript:;\" data-bind=\"click: function(){$parent.question_strategies.remove($data);}\">删除</a>\r\n                        </td>\r\n                    </tr>\r\n                    <!--ko foreach:knowledge_strategies-->\r\n                    <!--<tr data-bind=\"visible: $parent.opened()\">-->\r\n                    <!--<td colspan=\"5\">-->\r\n                    <!--<table class=\"table table-bordered\"-->\r\n                    <!--data-bind=\"attr:{id:$parents[2].getOneTreeId.call($parents[2], identifier())}\">-->\r\n                    <!--<thead>-->\r\n                    <!--<tr>-->\r\n                    <!--<th>知识点</th>-->\r\n                    <!--<th>题目数</th>-->\r\n                    <!--</tr>-->\r\n                    <!--</thead>-->\r\n                    <!--<tbody>-->\r\n                    <!--<tr data-bind=\"attr:{'data-tt-id':identifier}\">-->\r\n                    <!--<td>-->\r\n                    <!--<i class=\"icon-plus\"-->\r\n                    <!--data-bind=\"css:{'icon-minus':opened()}, click: $parents[2].toggleChildOpen.bind($parents[2],$data,$element)\"></i>-->\r\n                    <!--<span data-bind=\"text:title\"></span>-->\r\n                    <!--</td>-->\r\n                    <!--<td><input class=\"span1\" type=\"text\" data-bind=\"value: question_number\"/>/-->\r\n                    <!--&lt;!&ndash;ko text: totalNumber&ndash;&gt;&lt;!&ndash;/ko&ndash;&gt;</td>-->\r\n                    <!--</tr>-->\r\n                    <!--ko template:{name:'knowledgeTemplate', data:$data}-->\r\n                    <!--/ko-->\r\n                    <!--</tbody>-->\r\n                    <!--</table>-->\r\n                    <!--</td>-->\r\n                    <!--</tr>-->\r\n                    <!--/ko-->\r\n                    </tbody>\r\n                    <!--/ko-->\r\n                </table>\r\n                <span class=\"btn btn-info\" data-bind=\"click: $component.addOneQuestionType.bind($component, $data)\">添加题型</span>\r\n                <span class=\"error\" data-bind=\"validationMessage:question_strategies\"></span>\r\n            </li>\r\n        </ul>\r\n        <p style=\"text-align: right\" data-bind=\"text:$component.getTotalStrategyInfo.call($component)\"></p>\r\n        <div style=\"text-align:center\">\r\n            <a class=\"btn btn-primary\" href=\"javascript:;\" data-bind=\"click:$component.addOneStrategyItem.bind($component)\">添加大题</a>\r\n        </div>\r\n    </div>\r\n    <div style=\"text-align: center; margin:35px 0\">\r\n        <a class=\"btn\" data-bind=\"visible:!isPopupWin, click:$component.lastStepEvent.bind($component)\">上一步</a>\r\n        <a class=\"btn\" data-bind=\"visible:isPopupWin, click:$component.cancelEvent.bind($component)\">取消</a>\r\n        <a class=\"btn\" data-bind=\"click:$component.saveEvent.bind($component)\">保存</a>\r\n        <a class=\"btn\" data-bind=\"visible:!isPopupWin, click:$component.saveThenReturnEvent.bind($component)\">保存并返回</a>\r\n    </div>\r\n</div>\r\n\r\n<!--&lt;!&ndash;ko if:is_loading()&ndash;&gt;-->\r\n<!--<div class=\"pk-choose-loading\">-->\r\n<!--<span></span>-->\r\n<!--</div>-->\r\n<!--&lt;!&ndash;/ko&ndash;&gt;-->";

ko$1.components.register("x-knowledge-strategy", {
  viewModel: Model,
  template: tpl
});

}(ko,$));
