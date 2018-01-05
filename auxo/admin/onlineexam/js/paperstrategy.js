(function ($) {
    var store = {
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
                $('body').loading('hide');
            }
        },
        get: function () {
            var url = apiServiceDomain + '/v1/online_exams/' + online_exam_id;
            return $.ajax({
                url: url,
                type: 'get',
                error: this.errorCallback
            });
        },
        update: function (data) {
            var url = apiServiceDomain + '/v1/online_exams/' + online_exam_id;
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                error: this.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            id: online_exam_id,
            exam_paper_strategy: {
                exam_paper_strategy_type: 1,
                paper_strategy: {
                    hard_percentages: [],
                    paper_ids: [],
                    paper_part_strategies: [],
                    question_bank_ids: [],
                    question_banks: [],
                    title: ""
                },
                paper_ids: []
            },
            question_number: 0,
            pass_score: 0
        },
        returnUrl: returnUrl || "",
        init: function () {
            var _self = this;
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            if (online_exam_id) {
                store.get().done($.proxy(function (data) {
                    data.pass_score = data.pass_score || 0;
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_ids) {
                        this.model.exam_paper_strategy.paper_ids(data.exam_paper_strategy.paper_ids);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.paper_part_strategies) {
                        this.model.exam_paper_strategy.paper_strategy.paper_part_strategies(data.exam_paper_strategy.paper_strategy.paper_part_strategies);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.question_bank_ids) {
                        this.model.exam_paper_strategy.paper_strategy.question_bank_ids(data.exam_paper_strategy.paper_strategy.question_bank_ids);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.question_banks) {
                        this.model.exam_paper_strategy.paper_strategy.question_banks(data.exam_paper_strategy.paper_strategy.question_banks);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.hard_percentages) {
                        this.model.exam_paper_strategy.paper_strategy.hard_percentages(data.exam_paper_strategy.paper_strategy.hard_percentages);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.paper_ids) {
                        this.model.exam_paper_strategy.paper_strategy.paper_ids(data.exam_paper_strategy.paper_strategy.paper_ids);
                    }
                    if (data.exam_paper_strategy && data.exam_paper_strategy.paper_strategy && data.exam_paper_strategy.paper_strategy.title) {
                        this.model.exam_paper_strategy.paper_strategy.title(data.exam_paper_strategy.paper_strategy.title);
                    }
                    ko.mapping.fromJS(data, {}, _self.model);
                    ko.applyBindings(this, document.getElementById('onlineexam-paper-strategy'));
                }, this));
            } else {
                //todo
            }
        },
        saveEvent: function () {
            var model = ko.mapping.toJS(this.model);
            store.update(model)
                .done(function () {
                    $.fn.dialog2.helpers.alert('保存成功');
                })
        },
        saveThenReturnEvent: function () {
            var model = ko.mapping.toJS(this.model);
            store.update(model)
                .done(function () {
                    if (return_url) {
                        window.location.href = return_url;
                    } else {
                        window.location.href = '/' + projectCode + '/admin/online_exam/list';
                    }
                })
        },
        lastStepEvent: function () {
            window.location.href = '/' + projectCode + '/admin/online_exam/bank?online_exam_id=' + online_exam_id + "&source=" + source + "&return_url=" + encodeURIComponent(return_url);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));


var QUESTION_TYPE_MAP = [
    {
        type: 10,
        name: "基础平台单选题"
    }, {
        type: 15,
        name: "基础平台多选题"
    }, {
        type: 18,
        name: "基础平台不定项选择题"
    }, {
        type: 20,
        name: "基础平台填空题"
    }, {
        type: 25,
        name: "基础平台主观题"
    }, {
        type: 30,
        name: "基础平台判断题"
    }, {
        type: 40,
        name: "基础平台连线题"
    }, {
        type: 50,
        name: "基础平台套题"
    }, {
        type: 201,
        name: "单选题"
    }, {
        type: 202,
        name: "多选题"
    }, {
        type: 203,
        name: "判断题"
    }, {
        type: 204,
        name: "排序题"
    }, {
        type: 205,
        name: "连线题"
    }, {
        type: 206,
        name: "问答题"
    }, {
        type: 207,
        name: "拼图题"
    }, {
        type: 208,
        name: "复合题"
    }, {
        type: 209,
        name: "填空题"
    }, {
        type: 210,
        name: "手写题"
    }, {
        type: 211,
        name: "作文题"
    }, {
        type: 212,
        name: "所见即所得填空题"
    }, {
        type: 213,
        name: "阅读题"
    }, {
        type: 214,
        name: "实验与探究题"
    }, {
        type: 215,
        name: "分类表格题"
    }, {
        type: 216,
        name: "多空填空题"
    }, {
        type: 217,
        name: "文本选择题"
    }, {
        type: 218,
        name: "综合学习题"
    }, {
        type: 219,
        name: "应用题"
    }, {
        type: 220,
        name: "计算题"
    }, {
        type: 221,
        name: "解答题"
    }, {
        type: 222,
        name: "阅读理解"
    }, {
        type: 223,
        name: "证明题"
    }, {
        type: 224,
        name: "推断题"
    }, {
        type: 225,
        name: "投票题"
    }, {
        type: 226,
        name: "基础应用题"
    }, {
        type: 227,
        name: "基础证明题"
    }, {
        type: 228,
        name: "基础计算题"
    }, {
        type: 229,
        name: "基础解答题"
    }, {
        type: 230,
        name: "基础阅读题"
    }, {
        type: 231,
        name: "基础阅读与理解题"
    }, {
        type: 232,
        name: "主观基础题"
    }, {
        type: 233,
        name: "主观指令题型"
    }, {
        type: 234,
        name: "NewCompositeQuestion"
    }, {
        type: 401,
        name: "连连看"
    }, {
        type: 402,
        name: " 排序题"
    }, {
        type: 403,
        name: "表格题"
    }, {
        type: 404,
        name: "H5游戏"
    }, {
        type: 405,
        name: "Native游戏"
    }, {
        type: 406,
        name: "字谜游戏题"
    }, {
        type: 407,
        name: "记忆卡片题"
    }, {
        type: 408,
        name: "竖式计算题"
    }, {
        type: 409,
        name: "比大小题"
    }, {
        type: 410,
        name: "猜词题"
    }, {
        type: 411,
        name: "魔方盒题型"
    }, {
        type: 412,
        name: "有理数乘法法则"
    }, {
        type: 413,
        name: "书写化学反应方程式"
    }, {
        type: 414,
        name: "文本选择"
    }, {
        type: 415,
        name: "分类题型"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 417,
        name: "标签题型"
    }, {
        type: 418,
        name: "点连线"
    }, {
        type: 419,
        name: "逻辑题型"
    }, {
        type: 420,
        name: "游戏"
    }, {
        type: 421,
        name: "选词填空"
    }, {
        type: 422,
        name: "数独"
    }, {
        type: 423,
        name: "连环填空题"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }];