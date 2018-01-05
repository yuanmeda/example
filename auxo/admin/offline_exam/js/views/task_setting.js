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
        getPeriodicExam: function () {
            var url = serviceDomain + '/v1/periodic_exam_edits/' + periodicExamId;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        },
        updatePeriodicExam: function (data) {
            var url = serviceDomain + '/v1/periodic_exam_edits/' + periodicExamId;
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
            total_question_number: 0,
            question_number_check: 0,//0:按整份设置,1:按题型知识点设置
            question_number: '',
            answer_time_check: false,
            chance_check: false,
            exam: {
                periodic_exam_param: {
                    question_number: 0,
                    total_score: 0,
                    pass_model: 1,//1: ACCURACY 正确率, 2: ASSIGNMENT 交卷
                    pass_accuracy: '',//及格分正确率
                    answer_time: '',
                    chance: '',
                    retraining_strategy: {
                        type: 0//0: CHANGE 智能换题, 1: SAME_AGAIN 原题重练
                    },
                    exam_paper_strategy: {
                        paper_strategy: {
                            title: '习题',
                            paper_part_strategies: [
                                {
                                    question_strategies: []//通过此属性中的question_type是否为空来判断question_number_check的状态
                                }
                            ],
                            question_bank_ids: [],
                            question_types: [201, 202, 203, 206, 208, 209]
                        }
                    }
                }
            }
        },
        init: function () {
            var _self = this;
            ko.validation.init({
                insertMessages: false,//关闭自动插入错误信息
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
            //ko.applyBindings(this);
            this._getPeriodicExam();
            //this._bindingsExtend();//验证输入合法性
            this.model.answer_time_check.subscribe(function (val) {
                if (!val) {
                    _self.model.exam.periodic_exam_param.answer_time('');
                }
            });
            this.model.chance_check.subscribe(function (val) {
                if (!val) {
                    _self.model.exam.periodic_exam_param.chance('');
                }
            });
            /*当pass_model非1时清空pass_accuracy*/
            this.model.exam.periodic_exam_param.pass_model.subscribe(function (val) {
                if (val != 1) {
                    _self.model.exam.periodic_exam_param.pass_accuracy('');
                }
            });
            this.model.question_number_check.subscribe(function (val) {
                if (val != 0) {
                    _self.model.question_number('');
                } else {
                    _self.model.exam.periodic_exam_param.exam_paper_strategy.paper_strategy.paper_part_strategies([]);
                }
            });
        },
        showModal: function () {
            $('#paperStrategy').modal('show');
        },
        cancelModal: function () {
            $('#paperStrategy').modal('hide');
        },
        _getPeriodicExam: function () {
            var _self = this;
            if (!periodicExamId) {
                ko.applyBindings(_self);
                _self._bindingsExtend();
                return;
            }
            ;
            store.getPeriodicExam().done(function (resData) {
                if (resData) {
                    resData.periodic_exam.retraining_strategy = resData.periodic_exam.retraining_strategy ? resData.periodic_exam.retraining_strategy : {type: 0};
                    resData.periodic_exam.question_number = resData.periodic_exam.question_number ? resData.periodic_exam.question_number : 0;
                    resData.periodic_exam.total_score = resData.periodic_exam.total_score ? resData.periodic_exam.total_score : 0;
                    ko.mapping.fromJS(resData.periodic_exam, {}, _self.model.exam.periodic_exam_param)
                    var answerTime = _self.model.exam.periodic_exam_param.answer_time();
                    var chance = _self.model.exam.periodic_exam_param.chance();
                    if (answerTime && answerTime != -1) {
                        _self.model.answer_time_check(true);
                        _self.model.exam.periodic_exam_param.answer_time(answerTime / 60);
                    } else {
                        _self.model.exam.periodic_exam_param.answer_time('');
                    }
                    if (chance && chance != -1) {
                        _self.model.chance_check(true);
                    } else {
                        _self.model.exam.periodic_exam_param.chance('');
                    }
                    /*判断出卷方式：按整份设置or按题型知识点设置*/
                    var periodicParam = _self.model.exam.periodic_exam_param, examPaperStrategy = periodicParam.exam_paper_strategy, paperStrategy = examPaperStrategy.paper_strategy, paperPartStrategies = paperStrategy.paper_part_strategies();
                    if (periodicParam && examPaperStrategy && paperStrategy && paperPartStrategies && paperPartStrategies.length > 0) {
                        if (paperPartStrategies.length == 1 && paperPartStrategies[0].question_strategies() && !paperPartStrategies[0].question_strategies()[0].question_type()) {
                            _self.model.question_number_check(0);
                            _self.model.question_number(paperPartStrategies[0].question_strategies()[0].question_number());
                        } else {
                            _self.model.question_number_check(1);
                        }
                    } else {
                        _self.model.question_number(null);
                    }
                    /*判断question_banks是否存在*/
                    if (periodicParam && examPaperStrategy && paperStrategy && paperStrategy.question_banks()) {
                        var questionBanks = paperStrategy.question_banks();
                        if (questionBanks && questionBanks.length > 0) {
                            var totalQuestionsNumber = 0;
                            $.each(questionBanks, function (index, item) {
                                totalQuestionsNumber += parseInt(item.question_number());
                            });
                            _self.model.total_question_number(totalQuestionsNumber);
                        }
                    }
                }
                ko.applyBindings(_self);
                _self._bindingsExtend();
            })
        },
        _bindingsExtend: function () {
            var _self = this;
            var periodicParam = _self.model.exam.periodic_exam_param;
            this.model.question_number.extend({
                required: {
                    value: true,
                    message: '题目数不能为空!',
                    onlyIf: function () {
                        return _self.model.question_number_check() == 0;
                    }
                },
                number: {
                    params: true,
                    message: "必须是数字",
                    onlyIf: function () {
                        return _self.model.question_number_check() == 0;
                    }
                },
                min: {
                    params: 1,
                    message: '输入最小值不能小于1!',
                    onlyIf: function () {
                        return _self.model.question_number_check() == 0;
                    }
                },
                max: {
                    params: _self.model.total_question_number(),
                    message: '输入最大值不能大于{0}!',
                    onlyIf: function () {
                        return _self.model.question_number_check() == 0;
                    }
                },
                digit: {
                    required: true,
                    message: '请输入整数!',
                    onlyIf: function () {
                        return _self.model.question_number_check() == 0;
                    }
                }
            });
            periodicParam.pass_accuracy.extend({
                required: {
                    value: true,
                    message: '正确率不能为空!',
                    onlyIf: function () {
                        return periodicParam.pass_model() == 1;
                    }
                },
                number: {
                    params: true,
                    message: "必须是数字",
                    onlyIf: function () {
                        return periodicParam.pass_model() == 1;
                    }
                },
                min: {
                    params: 0,
                    message: '输入最小值不能小于{0}!',
                    onlyIf: function () {
                        return periodicParam.pass_model() == 1;
                    }
                },
                max: {
                    params: 100,
                    message: '输入最大值不能大于{0}!',
                    onlyIf: function () {
                        return periodicParam.pass_model() == 1;
                    }
                },
                digit: {
                    required: true,
                    message: '请输入整数!',
                    onlyIf: function () {
                        return periodicParam.pass_model() == 1;
                    }
                }
            });
            periodicParam.answer_time.extend({
                required: {
                    value: true,
                    message: '答题时长不能为空!',
                    onlyIf: function () {
                        return _self.model.answer_time_check() == true;
                    }
                },
                number: {
                    params: true,
                    message: "必须是数字",
                    onlyIf: function () {
                        return _self.model.answer_time_check() == true;
                    }
                },
                min: {
                    params: 1,
                    message: '输入最小值不能小于{0}!',
                    onlyIf: function () {
                        return _self.model.answer_time_check() == true;
                    }
                },
                max: {
                    params: 10000,
                    message: '输入最大值不能大于{0}!'
                },
                digit: {
                    required: true,
                    message: '请输入整数!',
                    onlyIf: function () {
                        return _self.model.answer_time_check() == true;
                    }
                }
            });
            periodicParam.chance.extend({
                required: {
                    value: true,
                    message: '答题机会不能为空!',
                    onlyIf: function () {
                        return _self.model.chance_check() == true;
                    }
                },
                number: {
                    params: true,
                    message: "必须是数字",
                    onlyIf: function () {
                        return _self.model.chance_check() == true;
                    }
                },
                min: {
                    params: 1,
                    message: '输入最小值不能小于{0}!',
                    onlyIf: function () {
                        return _self.model.chance_check() == true;
                    }
                },
                max: {
                    params: 10000,
                    message: '输入最大值不能大于{0}!'
                },
                digit: {
                    required: true,
                    message: '请输入整数!',
                    onlyIf: function () {
                        return _self.model.chance_check() == true;
                    }
                }
            });
        },
        next: function () {
            /*更新时判断model.question_number_check类型，如果为0，手动将question_number的值赋给对应字段
             * 答题时长和机会没有设置时，这里要手动赋值为-1传给服务端
             * */
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var data = ko.mapping.toJS(this.model);
            var periodicExamParam = data.exam.periodic_exam_param;
            /*当用户选择按题型知识点设置是，判断用户是否有设置试卷策略*/
            if (this.model.question_number_check() == 1 && !periodicExamParam.exam_paper_strategy.paper_strategy.paper_part_strategies) {
                $.fn.dialog2.helpers.alert('请设置试卷策略！');
                return;
            } else if (this.model.question_number_check() == 1 && periodicExamParam.exam_paper_strategy.paper_strategy.paper_part_strategies && !periodicExamParam.exam_paper_strategy.paper_strategy.paper_part_strategies.length) {
                $.fn.dialog2.helpers.alert('请设置试卷策略！');
                return;
            }
            if (data.question_number_check == 0) {
                periodicExamParam.question_number = +data.question_number;
                periodicExamParam.total_score = 0;//按整份设置时，暂时给此字段默认0，因为前端无法知道;
                periodicExamParam.exam_paper_strategy.paper_strategy.paper_part_strategies = [
                    {
                        title: '题目',
                        question_strategies: [
                            {
                                "question_type": '',
                                "question_number": +data.question_number,
                            }
                        ]
                    }
                ];
                periodicExamParam.exam_paper_strategy.paper_strategy.question_types = [201, 202, 203, 206, 208, 209];
            }
            if (data.answer_time_check == 0) {
                periodicExamParam.answer_time = null;
                //periodicExamParam.answer_time = parseInt(periodicExamParam.answer_time);
            } else {
                periodicExamParam.answer_time = parseInt(periodicExamParam.answer_time) * 60;
            }
            if (data.chance_check == 0) periodicExamParam.chance = -1;
            periodicExamParam.pass_accuracy = parseInt(periodicExamParam.pass_accuracy);
            periodicExamParam.pass_model = parseInt(periodicExamParam.pass_model);
            periodicExamParam.chance = parseInt(periodicExamParam.chance);
            /*if (this.model.question_number_check() == 1) */
            periodicExamParam.exam_paper_strategy.exam_paper_strategy_type = 1;
            periodicExamParam.analysis_strategy = {
                strategy: 1
            };
            periodicExamParam.exam_paper_strategy.paper_strategy.title = '习题';//试卷名称，默认写死

            if (periodicExamId) {
                store.updatePeriodicExam(data.exam).done(function (resData) {
                    console.log(resData);
                    var data = {
                        "event_type": "next",
                        "data": null
                    };
                    window.parent.postMessage(JSON.stringify(data), '*');
                });
            }
        },
        prev: function () {
            //通过postMessage方法通知接入方要进行怎样的操作
            var data = {
                "event_type": "prev",
                "data": null
            };
            window.parent.postMessage(JSON.stringify(data), '*');
            /*window.location.href = 'http://' + location.host + '/' + projectCode + '/task/taskbank?periodic_exam_id=' + periodicExamId;*/
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery));