/*
 题库管理
 */
(function ($) {
    //数据仓库
    var store = {
        //获取题库列表
        getQuestionbankList: function (search) {
            var url = '/' + projectCode + '/v1/questionbanks';
            return commonJS._ajaxHandler(url, search, 'GET');
        },
        createQuestionbank: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks';
            data.id = undefined;
            return commonJS._ajaxHandler(url, JSON.stringify(data), "POST");
        },
        updateQuestionBank: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/' + data.id;
            data.id = undefined;
            return commonJS._ajaxHandler(url, JSON.stringify(data), "PUT");
        },
        deleteQuestionbank: function (id) {
            var url = '/' + projectCode + '/v1/questionbanks/' + id;
            return commonJS._ajaxHandler(url, null, "DELETE");
        }
    };
    //数据模型
    var viewModel = {
        model: {
            items: [],
            enableSearch: true,
            filter: {
                title: '',
                type: 2,
                page: 0,
                size: 20
            },
            editQuestionbank: {
                id: '',
                custom_id: "",
                question_bank_name: "",
                belong_type: '',
                content: ''
            },
            modalTitle: '',
            types: {}
        },
        init: function () {
            var _self = this;
            $.extend(_self, commonJS);
            ko.validation.init({
                insertMessages: false
            });
            _self.model = ko.mapping.fromJS(_self.model);
            this.validate();
            ko.applyBindings(_self, document.getElementById('block'));
            this.getQuestionbankList();
        },
        validate: function () {
            var _self = this, _questionbank = this.model.editQuestionbank;
            ko.validation.registerExtenders();
            _questionbank.question_bank_name.extend({
                required: {params: true, message: "请填写题库名称"},
                maxLength: {params: 100, message: "不能超过100个字符"}
            });
            _questionbank.content.extend({
                required: {params: true, message: "请填写题库介绍"},
                maxLength: {params: 200, message: "不能超过200个字符"}
            });
        },
        createQuestionbank: function () {
            this.model.modalTitle('创建题库');
            $('#editquestionBank').modal('show');
            this.model.editQuestionbank.id('');
            this.model.editQuestionbank.custom_id('');
            this.model.editQuestionbank.question_bank_name('');
            //this.model.editQuestionbank.knowledge_system('');
            this.model.editQuestionbank.belong_type('');
            this.model.editQuestionbank.content('');
            ko.validation.group(this.model.editQuestionbank).showAllMessages(false);
        },
        editQuestionbank: function ($data) {
            this.model.modalTitle('编辑题库');
            $('#editquestionBank').modal('show');
            this.model.editQuestionbank.id($data.id);
            this.model.editQuestionbank.custom_id($data.custom_id);
            this.model.editQuestionbank.question_bank_name($data.question_bank_name);
            //this.model.editQuestionbank.knowledge_system($data.knowledge_system ? $data.knowledge_system.join(',') : '');
            this.model.editQuestionbank.belong_type($data.belong_type);
            this.model.editQuestionbank.content($data.content);
        },
        saveQuestionbank: function () {
            var _errors = ko.validation.group(this.model.editQuestionbank);
            if (_errors().length) {
                _errors.showAllMessages();
                return;
            }
            var _self = this, _questionbank = ko.mapping.toJS(this.model.editQuestionbank);
            //_questionbank.knowledge_system = _questionbank.knowledge_system.split(',');
            if (_questionbank.id === '') {
                store.createQuestionbank(_questionbank).done(function () {
                    $('#editquestionBank').modal('hide');
                    $.fn.dialog2.helpers.alert("创建题库成功");
                    _self.search();
                });
            } else {
                store.updateQuestionBank(_questionbank).done(function () {
                    $('#editquestionBank').modal('hide');
                    $.fn.dialog2.helpers.alert("更新题库成功");
                    _self.search();
                });
            }
        },
        getQuestionbankList: function () {
            var _self = this, _search = ko.mapping.toJS(this.model.filter);
            store.getQuestionbankList(_search).done(function (data) {
                _self.model.items(data.items ? data.items : []);
                _self.page(data.count, _self.model.filter.page());
            });
        },
        delQuestionbank: function ($data) {
            var _self = this;
            $.fn.dialog2.helpers.confirm("您确认要删除题库吗？", {
                confirm: function () {
                    store.deleteQuestionbank($data.id)
                        .done(function () {
                            _self.getQuestionbankList();
                            $.fn.dialog2.helpers.alert("删除题库成功");
                        });
                }
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.getQuestionbankList();
        },
        page: function (count, currentPage) {
            var _self = this;
            $('#pagination').pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                num_display_entries: 5,
                items_per_page: _self.model.filter.size(),
                current_page: currentPage,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (pageIndex) {
                    if (pageIndex != currentPage) {
                        _self.model.filter.page(pageIndex);
                        _self.getQuestionbankList();
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);