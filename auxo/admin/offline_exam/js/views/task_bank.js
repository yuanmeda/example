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
        getBankList: function (data) {
            var url = espServiceDomain + '/v1/bank/list?order_by=' + data.order_by + '&page_size=' + data.page_size + '&page_num=' + data.page_num + '&title=' + encodeURIComponent(data.title);
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        },
        /*根据Id批量获取题库*/
        getBanksById: function (data) {
            var url = espServiceDomain + '/v1/bank/list_by_ids';
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                error: this.errorCallback
            });
        },
        createPeriodicExam: function (data) {
            var url = serviceDomain + '/v1/periodic_exam_edits';
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
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
        },
        getPeriodicExam: function () {
            var url = serviceDomain + '/v1/periodic_exam_edits/' + periodicExamId;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            prevBankInfo: [],//原有题库
            bankInfo: [],//题目数量:题库id
            chosenBankIds: [],
            exam: {
                periodic_exam_param: {
                    exam_paper_strategy: {
                        paper_strategy: {
                            question_bank_ids: [],
                            question_banks: []
                        }
                    }
                }
            },
            bankItems: [],
            count: '',
            filter: {
                title: '',
                order_by: 'create_time',//传create_time|modify_time,默认create_time
                page_size: 10,
                page_num: 1
            }
        },
        init: function () {
            var _self = this;
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this);
            this._getBankItems();
            $('#titleSearch').on('keyup', function (evt) {
                if (evt.keyCode == 13) {
                    _self.searchAction();
                }
            });

            if (periodicExamId) {
                var _self = this;
                store.getPeriodicExam().done(function (resData) {
                    if (resData && resData.periodic_exam) {
                        var examPaperStrategy = resData.periodic_exam.exam_paper_strategy;
                        if (examPaperStrategy && examPaperStrategy.paper_strategy && examPaperStrategy.paper_strategy.question_banks) {
                            var questionBanks = examPaperStrategy.paper_strategy.question_banks, chosenBankIds = _self.model.chosenBankIds;
                            $.each(questionBanks, function (index, item) {
                                chosenBankIds.push(item.question_bank_id);
                            });
                            _self._getBanksById(chosenBankIds());
                        }
                        ko.mapping.fromJS(resData.periodic_exam, {}, _self.model.exam.periodic_exam_param);
                    }
                });
            }
        },
        /*通过题库Id去获取最新题库信息*/
        _getBanksById: function (bankIds) {
            var _self = this;
            store.getBanksById(bankIds).done(function (resData) {
                if (resData) {
                    $.each(resData, function (index, item) {
                        var bank = item.title + ':' + item.bank_id + ':' + item.question_number;
                        _self.model.bankInfo.push(bank);
                        /*保存原有题库*/
                        _self.model.prevBankInfo.push(bank);
                    });
                }
            })
        },
        _pagination: function (count, offset, limit) {
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.filter.page_num(index + 1);
                        this._getBankItems();
                    }
                }, this)
            });
        },
        _getBankItems: function () {
            var filter = ko.mapping.toJS(this.model.filter)
            store.getBankList(filter).done($.proxy(function (resData) {
                this.model.bankItems(resData && resData.items && resData.items.length > 0 ? resData.items : []);
                this.model.count(resData && resData.items ? resData.total : 0);
                this._pagination(this.model.count(), this.model.filter.page_num() - 1, this.model.filter.page_size());
            }, this));
        },
        searchAction: function () {
            var pattern = new RegExp("[~'!@#$%^&*()-+_=:]");
            viewModel.model.filter.page_num(1);
            var title = viewModel.model.filter.title();
            var trimTitle = $.trim(title);
            if (pattern.test(trimTitle)) {
                $.fn.dialog2.helpers.alert('搜索关键字不能包含特殊字符！');
                return;
            }
            viewModel.model.filter.title(trimTitle);
            /*当已有题库被选中时，需实时从题库中获取信息*/
            if (this.model.chosenBankIds().length > 0) {
                this.model.bankInfo([]);
                this._getBanksById(this.model.chosenBankIds());
            }
            viewModel._getBankItems();
        },
        saveQuestionBank: function () {
            var _self = this;
            var params = ko.mapping.toJS(_self.model.exam);
            params.periodic_exam_param.exam_paper_strategy.exam_paper_strategy_type = 1;
            var data = {
                "event_type": "next",
                "data": {
                    "items": [{
                        "id": periodicExamId,
                        "name": '',
                        "web_link": serviceDomain + '/' + projectCode + '/periodic_exam/detail?periodic_exam_id=' + periodicExamId,
                        "cmp_link": 'cmp://com.nd.sdp.component.elearning-exam-player/exam_prepare?periodic_exam_id=' + periodicExamId
                    }]
                }
            };
            if (periodicExamId) {
                store.updatePeriodicExam(params).done(function (resData) {
                    console.log('更新成功');
                    window.parent.postMessage(JSON.stringify(data), '*');
                    /*调试用，正式发布需删除*/
                    //window.location.href = 'http://' + location.host + '/' + projectCode + '/task/tasksetting?periodic_exam_id=' + periodicExamId;
                })
            } else {
                store.createPeriodicExam(params).done(function (resData) {
                    console.log('创建成功');
                    periodicExamId = resData.periodic_exam.id;
                    data.data.items[0].id = periodicExamId;
                    data.data.items[0].web_link = data.data.items[0].web_link + periodicExamId;
                    data.data.items[0].cmp_link = data.data.items[0].cmp_link + periodicExamId;
                    window.parent.postMessage(JSON.stringify(data), '*');
                    /*调试用，正式发布需删除*/
                    //window.location.href = 'http://' + location.host + '/' + projectCode + '/task/tasksetting?periodic_exam_id=' + periodicExamId;
                });
            }
        },
        save: function () {
            var _self = this;
            var questionBankIds = [];
            var questionBanks = [];

            $.each(this.model.bankInfo(), function (index, item) {
                var single = item.split(':');
                var bankItem = {
                    "question_bank_id": single[1],
                    "question_bank_name": single[0],
                    "question_number": +single[2]
                };
                questionBanks.push(bankItem);
                questionBankIds.push(single[1]);
            });
            viewModel.model.exam.periodic_exam_param.exam_paper_strategy.paper_strategy.question_bank_ids(questionBankIds);
            viewModel.model.exam.periodic_exam_param.exam_paper_strategy.paper_strategy.question_banks(questionBanks);

            var bankIds = viewModel.model.exam.periodic_exam_param.exam_paper_strategy.paper_strategy.question_bank_ids();
            if (bankIds.length > 0) {
                /*判断题库是否有修改，如果取消了某一个题库就提示*/
                var prevBankInfo = _self.model.prevBankInfo();
                var bankInfo = _self.model.bankInfo();
                var bankFlag = false;
                $.each(prevBankInfo, function (index, item) {
                    var flag = bankInfo.indexOf(item);
                    if (flag == -1) {
                        bankFlag = true;
                        $.fn.dialog2.helpers.confirm('确认要移除已选题库吗？\n如果移除已选题库，请确认题目策略已对应修改。', {
                            confirm: function () {
                                _self.saveQuestionBank();
                            }
                        });
                        return false;
                    }
                });
                if (!bankFlag) _self.saveQuestionBank();
            } else {
                $.fn.dialog2.helpers.alert('请选择题库！');
            }
        },
        cancel: function () {
            var data = {
                "event_type": "cancel",
                "data": null
            };
            window.parent.postMessage(JSON.stringify(data), '*');
            /*window.location.href = 'http://' + location.host + '/' + projectCode + '/periodic_exam/setting?periodic_exam_id=' + periodicExamId;*/
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery));


