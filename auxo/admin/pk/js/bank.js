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
        getPkExam: function () {
            var url = service_domain + '/v1/pks/' + pk_id;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        },
        updatePkExam: function (data) {
            var url = service_domain + '/v1/pks/' + pk_id;
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                error: this.errorCallback
            });
        }
    };

    var viewModel = {
        prevChosenBank: [],//保存改变前的题库
        model: {
            pkExam: null,
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
            this._getPkExam();
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
        _getPkExam: function () {
            var _self = this;
            if (pk_id) {
                store.getPkExam().done(function (resData) {
                    _self.model.pkExam(resData);
                    if (resData && resData.exam_paper_strategy && resData.exam_paper_strategy.paper_strategy && resData.exam_paper_strategy.paper_strategy.question_bank_ids) {
                        var bankIds = resData.exam_paper_strategy.paper_strategy.question_bank_ids;
                        $.each(bankIds, function (index,item) {
                            _self.prevChosenBank.push(item);
                        })
                        _self.model.chosenBank(resData.exam_paper_strategy.paper_strategy.question_bank_ids);
                        ko.mapping.fromJS(resData, {}, _self.model.pkExam);
                    }
                });
            }
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
            this._getBankItems();
        },
        saveQuestionBank: function (banks,bankFlag) {
            var params = ko.mapping.toJS(viewModel.model.pkExam);
            if (params.exam_paper_strategy && params.exam_paper_strategy.paper_strategy && params.exam_paper_strategy.paper_strategy.question_bank_ids) {
                params.exam_paper_strategy.paper_strategy.question_bank_ids = banks;
            } else {
                params.exam_paper_strategy = {
                    paper_strategy: {
                        question_bank_ids: banks
                    }
                };
            }

            if (bankFlag) {
                params.exam_paper_strategy.paper_strategy.paper_part_strategies = [];
            }

            if (pk_id) {
                store.updatePkExam(params).done(function () {
                    window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/pk/paperstrategy?pk_id=' + pk_id + '&return_url=' + encodeURIComponent(return_url);
                });
            }
        },
        save: function () {
            var _self = this;
            var banks = viewModel.model.chosenBank();
            if (banks.length > 0) {
                /*判断题库是否有修改，如果取消了某一个题库就提示*/
                var prevChosenBank = _self.prevChosenBank;
                var chosenBank = _self.model.chosenBank();
                var bankFlag = false;
                $.each(prevChosenBank, function (index, item) {
                    var flag = chosenBank.indexOf(item);
                    if (flag == -1) {
                        bankFlag = true;
                        $.fn.dialog2.helpers.confirm('确认要移除已选题库吗？\r\n如果移除已选题库，请确认题目策略已对应修改。', {
                            confirm: function () {
                                _self.saveQuestionBank(banks, bankFlag);
                            }
                        });
                        return false;
                    }
                });
                if (!bankFlag) _self.saveQuestionBank(banks, bankFlag);
            } else {
                $.fn.dialog2.helpers.alert('请选择至少一个题库！');
            }
        },
        cancel: function () {
            // if (return_url) {
            //     window.location.href = return_url;
            //     return;
            // }
            window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/pk/setting?pk_id=' + pk_id + '&return_url=' + encodeURIComponent(return_url);
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery));


