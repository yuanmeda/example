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
        /*根据Id批量获取题库(还未实现)*/
        getBanksById: function (data) {
            var url = espServiceDomain + '/v1/bank/list_by_ids';
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                error: this.errorCallback
            });
        },
        get: function () {
            var url = apiServiceDomain + '/v1/online_exams/' + online_exam_id;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
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
            exam: null,
            prevChosenBank: [],//原有题库
            chosenBank: [],
            bankItems: [],
            count: '',
            chosenBankIds: [],
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
            this._getExam();
            $('#titleSearch').on('keyup', function (evt) {
                if (evt.keyCode == 13) {
                    _self.searchAction();
                }
            });
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
        _getExam: function () {
            var _self = this;
            if (online_exam_id) {
                store.get().done(function (resData) {
                    _self.model.exam(resData);
                    if (resData && resData.exam_paper_strategy && resData.exam_paper_strategy.paper_strategy && resData.exam_paper_strategy.paper_strategy.question_banks) {
                        var questionBanks = resData.exam_paper_strategy.paper_strategy.question_banks;
                        var chosenBank = _self.model.chosenBank, chosenBankIds = _self.model.chosenBankIds;
                        $.each(questionBanks, function (index, item) {
                            chosenBankIds.push(item.question_bank_id);
                        });
                        _self._getBanksByIds(chosenBank, chosenBankIds());
                    }
                });
            }
        },
        /*通过题库Id去获取最新题库信息*/
        _getBanksByIds: function (chosenBank, bankIds) {
            var _self = this;
            store.getBanksById(bankIds).done(function (resData) {
                if (resData) {
                    $.each(resData, function (index, item) {
                        var bank = item.title + ':' + item.bank_id + ':' + item.question_number;
                        chosenBank.push(bank);
                        _self.model.prevChosenBank.push(bank);
                    });
                }
            })
        },
        _getBankItems: function () {
            var filter = ko.mapping.toJS(this.model.filter);
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
                this.model.chosenBank([]);
                this._getBanksByIds(this.model.chosenBank, this.model.chosenBankIds());
            }
            this._getBankItems();
        },
        saveQuestionBank: function (bankIds, questionBanks, bankFlag) {
            var params = viewModel.model.exam();

            if (params.exam_paper_strategy) {
                params.exam_paper_strategy.exam_paper_strategy_type = 1;
                if (params.exam_paper_strategy.paper_strategy && params.exam_paper_strategy.paper_strategy.question_bank_ids) {
                    params.exam_paper_strategy.paper_strategy.question_bank_ids = bankIds;
                }
                if (params.exam_paper_strategy.paper_strategy && params.exam_paper_strategy.paper_strategy.question_banks) {
                    params.exam_paper_strategy.paper_strategy.question_banks = questionBanks;
                }

            } else {
                params.exam_paper_strategy = {
                    exam_paper_strategy_type: 1,
                    paper_strategy: {
                        question_bank_ids: bankIds,
                        question_banks: questionBanks
                    }
                };
            }

            if (bankFlag) {
                params.exam_paper_strategy.paper_strategy.paper_part_strategies = [];
            }
            if (online_exam_id) {
                store.update(params).done(function () {
                    window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/online_exam/paperstrategy?online_exam_id=' + online_exam_id + "&source=" + source + "&return_url=" + encodeURIComponent(return_url);
                });
            }
        },
        save: function () {
            var _self = this;
            var banks = viewModel.model.chosenBank(), bankIds = [], questionBanks = [];
            $.each(banks, function (index, item) {
                var bankInfo = item.split(':');
                var bankItem = {
                    "question_bank_id": bankInfo[1],
                    "question_bank_name": bankInfo[0],
                    "question_number": +bankInfo[2]
                };
                questionBanks.push(bankItem);
                bankIds.push(bankInfo[1]);
            });
            if (banks.length > 0) {
                /*判断题库是否有修改，如果取消了某一个题库就提示*/
                var prevChosenBank = _self.model.prevChosenBank();
                var chosenBank = _self.model.chosenBank();
                var bankFlag = false;
                $.each(prevChosenBank, function (index, item) {
                    var flag = chosenBank.indexOf(item);
                    if (flag == -1) {
                        bankFlag = true;
                        $.fn.dialog2.helpers.confirm('确认要移除已选题库吗？\n如果移除已选题库，请确认题目策略已对应修改。', {
                            confirm: function () {
                                _self.saveQuestionBank(bankIds, questionBanks, bankFlag);
                            }
                        });
                        return false;
                    }
                });
                if (!bankFlag) _self.saveQuestionBank(bankIds, questionBanks, bankFlag);
            } else {
                $.fn.dialog2.helpers.alert('请选择题库！');
            }
        },
        cancel: function () {
            if (return_url) {
                window.location.href = return_url;
                return;
            }
            window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/online_exam/setting?online_exam_id=' + online_exam_id + "&source=" + source + "&return_url=" + encodeURIComponent(return_url);
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery));


