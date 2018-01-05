import $ from 'jquery';
import {ajax} from '../ajax';
const QUESTION_TYPE_MAP = {
    "201": "单选题",
    "202": "多选题",
    "203": "判断题",
    "206": "问答题",
    "208": "复合题",
    "209": "填空题"
};
let treeIdIndex = 0;

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
            params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
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
        }, this))
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
        }, this))
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
        return data.title
    }, this);
    this.totalNumber = ko.observable(data.totalNumber);
    this.children = ko.observableArray();
    if (data.children.length) {
        $.each(data.children, $.proxy(function (index, item) {
            this.children.push(new KnowledgeObject(item));
        }, this))
    }
}
function Model(params) {
    const vm = this;
    const question_bank_ids = params.question_bank_ids;
    const question_bank_names = params.question_bank_names;
    let paper_part_strategies = ko.mapping.toJS(params.paper_part_strategies) ? ko.mapping.toJS(params.paper_part_strategies).concat() : [];
    const apiServiceDomain = params.apiServiceDomain;
    const elearningQBServiceDomain = params.elearningQBServiceDomain;
    const espServiceDomain = params.espServiceDomain;
    const isPopupWin = params.isPopupWin;
    vm.cancelEventCallBack = params.cancelEventCallBack;
    vm.saveEventCallBack = params.saveEventCallBack;
    vm.saveThenReturnCallBack = params.saveThenReturnCallBack;
    vm.lastStepCallBack = params.lastStepCallBack;
    vm.isPopupWin = isPopupWin;
    vm.model = params.model;
    const projectId = params.projectId;
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

    //保存相关操作
    vm.saveEvent = saveEvent;
    vm._doSave = _doSave;
    vm.cancelEvent = cancelEvent;
    vm.lastStepEvent = lastStepEvent;
    vm.saveThenReturnEvent = saveThenReturnEvent;

    vm.localStrategies = ko.observableArray();

    // vm.localStrategies.subscribe(function (value) {
    //     console.log(value);
    // });

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
            dragEnd: function (list) {
                let dragResult = [], sort_number = this.data("sort_number");
                let localStrategies = vm.localStrategies();
                $("#strategyList").find(".strategyItem").each(function (index, element) {
                    dragResult.push(localStrategies[+$(element).data("sort_number") - 1]);
                });
                vm.localStrategies([]);
                vm.localStrategies(dragResult);
            }
        });
        init();
        // getQuestionInfo();
    } else {
        $.fn.dialog2.helpers.alert("请先选择题库！");
    }

    ko.validation.rules["questionTypeRule"] = {
        validator: function (val) {
            if (val.length > 1) {
                let tempArray = [];
                $.each(val, function (index, item) {
                    tempArray.push(item.question_type());
                });
                let sortArray = tempArray.sort();
                let result = true;
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
            //处理通过题库Ids获得的knowledgeSystemIds，knowledgeSystemIds
            var knowledgeSystemIds = [];
            if (exercisesBanks && exercisesBanks.length) {
                $.each(exercisesBanks, function (index, item) {
                    if (knowledgeSystemIds.length) {
                        var flag = true;
                        $.each(knowledgeSystemIds, function (index1, id) {
                            if (id == item.knowledge_system_id)
                                flag = false;
                        });
                        if (flag) {
                            knowledgeSystemIds.push(item.knowledge_system_id);
                        }

                    } else {
                        knowledgeSystemIds.push(item.knowledge_system_id);
                    }

                });
                vm.knowledgeSystemIdList = knowledgeSystemIds
            }

            if (res && res.length) {
                var questions = ko.mapping.toJS(vm.questionTypeList);
                $.each(questions, function (index, question) {
                    $.each(res, function (index1, item) {
                        if (question.searchSQL == item.qql) {
                            // question.totalNumber = index1;
                            question.totalNumber = item.result.total;
                        }
                    })
                });
                ko.mapping.fromJS(questions, {}, vm.questionTypeList);

                if (paper_part_strategies && paper_part_strategies.length) {
                    //编辑状态 todo
                    console.log(paper_part_strategies);
                    $.each(paper_part_strategies, function (index, item) {
                        if (item.question_strategies && item.question_strategies.length) {
                            let old_question_strategies = item.question_strategies;
                            item.question_strategies = [];
                            $.each(old_question_strategies, function (index, questionStr) {
                                let questionStrObject = null;
                                questionStr.question_type = questionStr.question_type + "";
                                questionStr.totalNumber = vm.getTotalNumberByQuestionType.call(vm, questionStr.question_type);
                                if (questionStr.knowledge_strategies && questionStr.knowledge_strategies.length) {
                                    //有知识点
                                    questionStr.opened = true;
                                    let oldKnowledgeStrategies = questionStr.knowledge_strategies;
                                    delete questionStr.knowledge_strategies;
                                    questionStr.knowledge_strategies = [];
                                    questionStrObject = new QuestionObject(questionStr);
                                    // if (vm.knowledgeInfo[questionStr.question_type]) {
                                    //     //已经获取
                                    //     $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                    //         var oneTreeList = vm.knowledgeInfo[questionStr.question_type][knowledgeSystemId];
                                    //         var knowledgeObject = new KnowledgeObject(oneTreeList[0]);
                                    //         //遍历树，添加parent_node
                                    //         knowledgeObject.parent_node(questionStrObject);
                                    //         questionStrObject.knowledge_strategies.push(traverseTreeToAddParentNode(knowledgeObject, oldKnowledgeStrategies));
                                    //     });
                                    // } else {
                                    //需要获取
                                    vm.knowledgeInfo[questionStr.question_type] = {};
                                    if (vm.knowledgeSystemIdList && vm.knowledgeSystemIdList.length) {
                                        let deferredLength = vm.knowledgeSystemIdList.length;
                                        $.when.apply($, getKnowledgeDefList(vm.knowledgeSystemIdList)).then(function () {
                                            let knowledgeTreeList = [];
                                            if (deferredLength == 1) {
                                                knowledgeTreeList.push(arguments[0]);
                                            } else {
                                                $.each(arguments, function (index, item) {
                                                    knowledgeTreeList.push(item[0]);
                                                });
                                            }
                                            let tempKnowledgeInfo = {};
                                            let knowledgeSearchList = [];
                                            $.each(vm.knowledgeSystemIdList, function (index, item) {
                                                // vm.knowledgeInfo[questionStr.question_type][item] = [];
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
                                            getQuestionInfo(knowledgeSearchList)
                                                .then(res => {
                                                    if (res && res.length) {
                                                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                                            $.each(tempKnowledgeInfo[knowledgeSystemId], function (index1, knowledge) {
                                                                $.each(res, function (index2, data) {
                                                                    if (data.qql == knowledge.searchSQL) {
                                                                        knowledge.totalNumber = data.result.total;
                                                                    }
                                                                })
                                                            });
                                                        });
                                                        questionStrObject.question_number(0);
                                                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                                            var oneTreeList = tempKnowledgeInfo[knowledgeSystemId];
                                                            var treeData = buildTreeArrayFromFlatArray(oneTreeList, oldKnowledgeStrategies);
                                                            // var newTreeData = updateTotalNumber(treeData[0], oldKnowledgeStrategies);
                                                            var knowledgeObject = new KnowledgeObject(treeData[0]);
                                                            //遍历树，添加parent_node//这里设为0是为了下面的冒泡求父结点的已选择题目数
                                                            knowledgeObject.parent_node(questionStrObject);
                                                            var treeDataWithParentNode = traverseTreeToAddParentNode(knowledgeObject);
                                                            var finalTreeData = updateTotalNumber(treeDataWithParentNode, oldKnowledgeStrategies);
                                                            questionStrObject.knowledge_strategies.push(finalTreeData);
                                                        });
                                                    }

                                                })
                                        })
                                        // }
                                    }
                                } else {
                                    //无知识点
                                    questionStr.opened = false;
                                    questionStr.knowledge_strategies = [];
                                    questionStrObject = new QuestionObject(questionStr);
                                }
                                item.question_strategies.push(questionStrObject);
                            })
                        }
                        vm.localStrategies.push(new StrategyObject(item));
                    })
                } else {
                    let originalStrategy = {
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
                    // ko.mapping.fromJS(originalStrategy, {}, vm.localStrategies);
                    vm.localStrategies.push(new StrategyObject(originalStrategy));
                }
            }
        })
    }

    function getTotalNumberByQuestionType(data) {
        let self = this;
        let question_type = data;
        let questionTypeList = ko.mapping.toJS(self.questionTypeList);
        let result = 0;
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

    //通过question_bank_ids获取knowledgeIds
    function getKnowledgeSystemIdsByQBIds(searchSQLList) {
        return ajax(espServiceDomain + '/v1/bank/list_by_ids', {
            type: "POST",
            data: JSON.stringify(question_bank_ids())
        })
    }

    //通过knowledgeSystemId获取knowledgeTree data
    function getKnowledgeTreeDataByKnowledgeSystemId(knowledge_system_id) {
        return ajax(espServiceDomain + '/v1/knowledge/list?knowledge_system_id=' + knowledge_system_id, {
            type: "GET"
        })
    }

    function getKnowledgeDefList(knowledgeSystemIdList) {
        let result = [];
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

        $.each(children, function (index, item) {

            // var temp = "<tr data-tt-id="+item.identifier()+" data-tt-parent-id="+item.parent()+"><td><i class=" + (item.opened()? 'icon-minus':'icon-plus')+" data-bind=\"click: $parents[2].toggleChildOpen.bind($parents[2],$data,$element)\"></i> <span>"+item.title()+"</span></td><td><input class=\"span1\" type=\"text\" data-bind=\"value: question_number\"/>/10</td></tr>";
            // var node = $("#"+tableId).treetable("node", parentId);
            // $("#"+tableId).treetable("loadBranch", node, temp);
        });
    }

    //点击展开/收起知识点 data.opened()为true时为收起知识点，反之，为展开知识点
    function toggleOpen(data, flag) {
        if (flag) {
            var questionType = data.question_type();
            var status = data.opened();//true时为收起知识点，反之，为展开知识点
            if (status) {
                //收起知识
                var children = data.knowledge_strategies();
                if (children.length) {
                    $.each(children, function (index, item) {
                        item.isVisible(false);
                        item.opened(false);
                        item.question_number(0);
                    })
                }
            } else {
                //展开知识点  获取当前知识点
                if (vm.knowledgeInfo[questionType] && !($.isEmptyObject(vm.knowledgeInfo[questionType]))) {
                    //已经获取
                    if (data.knowledge_strategies && data.knowledge_strategies().length) {
                        var children = data.knowledge_strategies && data.knowledge_strategies() || [];
                        if (children.length) {
                            var totalNumber = 0;
                            $.each(children, function (index, item) {
                                item.isVisible(true);
                                item.opened(false);
                                totalNumber = totalNumber + (+item.question_number());
                                if ($.isArray(item.children()) && item.children().length) {
                                    setVisibleAndOpenedFalse(item.children());
                                }
                            });
                            data.question_number(totalNumber);
                        }
                    } else {
                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                            // var childNodes = getChildNodesByNodeId(vm.knowledgeInfo[questionType][knowledgeSystemId], null);
                            var oneTreeList = vm.knowledgeInfo[questionType][knowledgeSystemId];
                            // var treeData = buildTreeArrayFromFlatArray(oneTreeList.concat());
                            var knowledgeObject = new KnowledgeObject(oneTreeList[0]);
                            //遍历树，添加parent_node
                            knowledgeObject.parent_node(data);
                            data.knowledge_strategies.push(traverseTreeToAddParentNode(knowledgeObject));
                        });
                    }
                } else {
                    //需要获取
                    data.knowledge_strategies([]);
                    data.question_number(0);
                    vm.knowledgeInfo[questionType] = {};
                    if (vm.knowledgeSystemIdList && vm.knowledgeSystemIdList.length) {
                        let deferredLength = vm.knowledgeSystemIdList.length;
                        $.when.apply($, getKnowledgeDefList(vm.knowledgeSystemIdList)).then(function () {
                            let knowledgeTreeList = [];
                            if (deferredLength == 1) {
                                knowledgeTreeList.push(arguments[0]);
                            } else {
                                $.each(arguments, function (index, item) {
                                    knowledgeTreeList.push(item[0]);
                                });
                            }
                            let knowledgeSearchList = [];
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
                            getQuestionInfo(knowledgeSearchList)
                                .then(res => {
                                    if (res && res.length) {
                                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                            $.each(vm.knowledgeInfo[questionType][knowledgeSystemId], function (index1, knowledge) {
                                                $.each(res, function (index2, data) {
                                                    if (data.qql == knowledge.searchSQL) {
                                                        knowledge.totalNumber = data.result.total;
                                                        // knowledge.totalNumber = 1;
                                                    }
                                                })
                                            });
                                        });
                                        // var rasData = ko.mapping.toJS(data);
                                        $.each(vm.knowledgeSystemIdList, function (index, knowledgeSystemId) {
                                            // var childNodes = getChildNodesByNodeId(vm.knowledgeInfo[questionType][knowledgeSystemId], null);
                                            var oneTreeList = vm.knowledgeInfo[questionType][knowledgeSystemId];
                                            var treeData = buildTreeArrayFromFlatArray(oneTreeList);
                                            var knowledgeObject = new KnowledgeObject(treeData[0]);
                                            //遍历树，添加parent_node
                                            knowledgeObject.parent_node(data);
                                            data.knowledge_strategies.push(traverseTreeToAddParentNode(knowledgeObject));
                                        });
                                        // ko.mapping.fromJS(rasData, {}, data);
                                    }
                                })
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
        let question_strategies = data.question_strategies;
        let originalData = {
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
        // if (knowledgeArray) {
        //     $.each(knowledgeArray, function (index, ks) {
        //         if (ks.knowledge_id == parentNode.identifier()) {
        //             parentNode.isVisible(true);
        //             parentNode.opened(true);
        //             parentNode.question_number(ks.question_number);
        //         }
        //     });
        // }
        if (parentNode.children().length) {
            $.each(parentNode.children(), function (index, item) {
                // if (knowledgeArray) {
                //     $.each(knowledgeArray, function (index, ks) {
                //         if (ks.knowledge_id == item.identifier()) {
                //             item.isVisible(true);
                //             item.opened(true);
                //             item.question_number(ks.question_number);
                //         }
                //     });
                // }
                item.parent_node(parentNode);
                if (item.children().length) {
                    traverseTreeToAddParentNode(item);
                }
            })
        }
        return treeObject;
    }

    // function expandNode(element, data) {
    //     // let tr = '<tr data-bind="attr:{\'data-tt-id\': identifier(), \'data-tt-parent-id\':parent()}"><td><i class="icon-plus" data-bind="css:{\'icon-minus\':opened()}, click:toggleNodeOpen"></i><span data-bind="text:title"></span></td><td><input class="span1" type="text" data-bind="value:question_number"/>/<!--ko text: totalNumber--><!--/ko--></td></tr>';
    //     let tr = '<tr><td data-bind="text:title"></td></tr>'
    //     $(element.closest('tr')).after(tr);
    //     let etr = $(tr)[0];
    //     data.toggleNodeOpen = toggleNodeOpen;
    //     console.log(data.title());
    //
    //     let vm = {
    //         title: ko.dependentObservable(function () {
    //             return 'tt';
    //         }, vm)
    //     };
    //
    //     ko.applyBindings(vm, etr);
    //     if (data.children() && data.children().length) {
    //         $.each(data.children(), function (index, item) {
    //             expandNode(element, item);
    //         });
    //     }
    // }

    function toggleNodeOpen() {
        var self = this;
        if (self.children().length) {
            self.opened(!self.opened());
            let children = self.children();
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

    //给每种题目类型生成sql语句
    function getQuestionSQL(type) {
        var questionIds = question_bank_ids().toString();
        return "$filter={question.question_type eq " + type + "} and {question.question_bank in(" + questionIds + ")}&$range=project eq " + projectId + "&$result=count";
    }

    //给每种题目类型下的knowledge生成sql语句
    function getKnowledgeQuestionSQL(type, knowledgeSystemId) {
        var questionIds = question_bank_ids().toString();
        return "$filter={question.question_type eq " + type + "} and {question.question_bank in(" + questionIds + ")} and {question.knowledge eq " + knowledgeSystemId + "}&$range=project eq " + projectId + "&$result=count";
    }

    function getChildNodesByNodeId(array, nodeId) {
        var result = [];
        if (nodeId) {

        } else {
            //返回root Id
            result.push(array[0]);
        }
        return result;
    }

    function buildTreeArrayFromFlatArray(array) {
        var rootId = array[0].parent;
        var map = {}, node, roots = [];
        for (var i = 0; i < array.length; i += 1) {
            node = array[i];
            node.question_number = 0;
            // if (knowledgeArray) {
            //     $.each(knowledgeArray, function (index, item) {
            //         if (item.knowledge_id == array[i].identifier) {
            //             node.question_number = item.question_number;
            //         }
            //     });
            // }
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
        // var root = array[0];
        // var rootId = array[0].parent;
        // var node_list = {};
        // node_list[rootId] = root;
        // for (var i = 0; i < array.length; i++) {
        //     node_list[array[i].identifier] = array[i];
        //     node_list[array[i].parent].children.push(node_list[array[i].identifier]);
        // }
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
        //题型
        if (node.knowledge_strategies && node.knowledge_strategies().length) {
            let totalNumber = 0;
            let children = node.knowledge_strategies();
            $.each(children, function (index, item) {
                totalNumber = totalNumber + (+item.question_number());
            });
            node.question_number(totalNumber);
        }
        if (node && !node.knowledge_strategies) {
            var children = node.children && node.children() || [];
            if (children.length) {
                var totalNumber = 0;
                $.each(children, function (index, item) {
                    totalNumber = totalNumber + (+item.question_number());
                });
                node.question_number(totalNumber);
            }
            if (node.parent_node && node.parent_node()) {
                updateParentNumber(node.parent_node());
            }
        }
    }

    function getStrategyText(data) {
        let self = this;
        let totalQuestionNum = 0;
        let totalScore = 0;
        let question_strategies = data.question_strategies();
        let questionTypeList = ko.mapping.toJS(self.questionTypeList);
        let result = "";
        $.each(question_strategies, function (index, strategy) {
            totalQuestionNum = totalQuestionNum + +strategy.question_number();
            totalScore = totalScore + +strategy.score() * +strategy.question_number();
            let questionName = getQuestionNameByType(questionTypeList, strategy.question_type());
            result = (result ? (result + ",") : "") + questionName + strategy.question_number() + "题，每题" + strategy.score() + "分";
        });
        data.score(totalScore);
        result = "总题目数" + totalQuestionNum + "题，总共" + totalScore + "分，其中" + result;
        return result;
    }

    function getTotalStrategyInfo() {
        let self = this;
        let totalQuestionNum = 0;
        let totalScore = 0;
        let localStrategies = self.localStrategies();
        $.each(localStrategies, function (index, strategy) {
            let questionStrategies = ko.mapping.toJS(strategy.question_strategies);
            $.each(questionStrategies, function (index1, question) {
                totalQuestionNum = totalQuestionNum + +question.question_number;
            });
            totalScore = totalScore + +strategy.score();
        });
        return "试卷总题数" + totalQuestionNum + "题，总分" + totalScore + "分";
    }

    function getQuestionNameByType(questionTypeList, type) {
        let result = "";
        $.each(questionTypeList, function (index, questionType) {
            if (questionType.type == type) {
                result = questionType.name;
            }
        });
        return result;
    }

    function addOneStrategyItem() {
        let self = this;
        let originalStrategy = {
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
        let errors = ko.validation.group(this);
        if (errors().length) {
            $.fn.dialog2.helpers.alert(errors()[0]);
            return;
        }
        let localStrategy = ko.mapping.toJS(self.localStrategies);
        let questionTypeList = ko.mapping.toJS(self.questionTypeList);
        let canSave = true;
        let question_number = 0;
        let total_score = 0;
        $.each(questionTypeList, function (idnex, item) {
            let type = item.type, totalNumber = item.totalNumber;
            let selectedNumber = 0;
            $.each(localStrategy, function (index1, strategy) {
                if ($.isArray(strategy.question_strategies)) {
                    $.each(strategy.question_strategies, function (index2, questionStrategy) {
                        if (questionStrategy.question_type == type) {
                            selectedNumber = selectedNumber + (+questionStrategy.question_number);
                            question_number = question_number + (+questionStrategy.question_number);
                            total_score = total_score + (+questionStrategy.question_number * (+questionStrategy.score));
                        }
                    })
                }
            });
            if (selectedNumber > totalNumber) {
                $.fn.dialog2.helpers.alert(item.name + '的设置数目超过总题目数，请调整！');
                canSave = false;
            }
        });
        if (canSave) {
            var finalStrategy = [];
            let allStrategy = [];
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
                })
            }
            //跨大题限制知识点v5.7.1(2)
            if (canSave) {
                $.each(questionTypeList, function (index, questionType) {
                    let type = questionType.type, knowledgeInfo = self.knowledgeInfo, knowledgeSystemIdList = self.knowledgeSystemIdList;
                    if (knowledgeInfo[type]) {
                        $.each(knowledgeSystemIdList, function (index1, knowledgeSystemId) {
                            var knowledgeInfos = knowledgeInfo[type][knowledgeSystemId];
                            if ($.isArray(knowledgeInfos) && knowledgeInfos.length) {
                                $.each(knowledgeInfos, function (index2, knowledge) {
                                    if (knowledge.totalNumber > 0) {
                                        let knowledgeId = knowledge.identifier, currentNumber = 0;
                                        if ($.isArray(allStrategy) && allStrategy.length) {
                                            $.each(allStrategy, function (index, strategy) {
                                                if ($.isArray(strategy.question_strategies) && strategy.question_strategies.length) {
                                                    $.each(strategy.question_strategies, function (index1, questionStrategy) {
                                                        if (questionStrategy.question_type == type && $.isArray(questionStrategy.knowledge_strategies) && questionStrategy.knowledge_strategies.length) {
                                                            $.each(questionStrategy.knowledge_strategies, function (index2, ks) {
                                                                if (ks.knowledge_id == knowledgeId) {
                                                                    currentNumber = currentNumber + ks.question_number;
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        if (currentNumber > knowledge.totalNumber) {
                                            canSave = false;
                                            $.fn.dialog2.helpers.alert('设置的知识点“' + knowledge.title + '”下的' + QUESTION_TYPE_MAP[type] + '的题目数' + currentNumber + '超过总题目数' + knowledge.totalNumber);
                                        }
                                    }
                                })
                            }
                        })
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
                    let model = ko.mapping.toJS(this.model);
                    let pass_score = model.pass_score;
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
                })
            })
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
                })
            })
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
            })
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
                        })
                    }
                    if (knowledge.isVisible && knowledge.opened && (knowledge.children.length == 0)) {
                        result.push({
                            knowledge_id: knowledge.identifier,
                            question_number: +knowledge.question_number
                        })
                    }
                    if (knowledge.isVisible) {
                        // result.push({
                        //     knowledge_id: knowledge.identifier,
                        //     question_number: +knowledge.question_number
                        // });
                        if (knowledge.opened && knowledge.children.length) {
                            var tempArray = simpleKnowledgeStrategies(knowledge.children);
                            result = result.concat(tempArray);
                        }
                    }
                }
            })
        }
        return result;
    }

    function updateTotalNumber(treeData, knowledgeArray) {
        $.each(knowledgeArray, function (index, knowledgeInfo) {
            //knowledge_id,question_number
            var currentNode = getTreeNodeById([treeData], knowledgeInfo.knowledge_id);
            if (currentNode) {
                //冒泡更新父结点的个数
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
        })
    }

    function getTreeNodeById(treeObjectArray, kid) {
        let result = [];
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
                    if ($.isArray(treeOjbect.children()))
                        resultArray.concat(getTreeNodeArrayById(treeOjbect.children(), kid, resultArray));
                }
            })
        }
    }

    function questionStrategyMoveDown(parentObject, currentItem, currentIndex) {
        let parent = parentObject.question_strategies();
        if (currentIndex >= (parent.length - 1))
            return;
        let current = currentItem;
        let moveDownResult = [];
        for (let i = 0; i < parent.length; i++) {
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

//
// function getOneTreeId(id) {
//     treeIdIndex++;
//     return id + treeIdIndex;
// }
//
// function initTreeTable() {
//     console.log(arguments);
// }
}

export {Model};