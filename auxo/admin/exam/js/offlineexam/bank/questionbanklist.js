(function ($) {
    var errorHandler = function (jqXHR) {
        if (jqXHR.readyState == 0 || jqXHR.status == 0 || jqXHR.responseText == "") {
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
    };

    var store = {
        getQuestionBankList: function (search) {
            var url = '/' + projectCode + '/v1/questionbanks';
            return $.ajax({
                url: url,
                cache: false,
                data: search,
                type: 'GET',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        createQuestionBank: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks';
            data.id = undefined;

            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'POST',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        updateQuestionBank: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/' + data.id;
            data.id = undefined;

            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'PUT',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        deleteQuestionBank: function (id) {
            var url = '/' + projectCode + '/v1/questionbanks/' + id;

            return $.ajax({
                url: url,
                cache: false,
                type: 'DELETE',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        }
    };

    var viewModel = {
        model: {
            items: [],
            enableSearch: true,
            filter: {
                title: '',
                type: 1,
                page: 0,
                size: 20
            },
            editQuestionBank: {
                id: '',
                customId: "",
                questionBankName: "",
                belongType: '',
                content: '',
                type: 1
            },
            modalTitle: '',
            types: {}
        },
        init: function () {
            $.extend(this, commonJS);
            ko.validation.init({
                insertMessages: false
            });
            this.model = ko.mapping.fromJS(this.model);
            this.validate();
            ko.applyBindings(this, document.getElementById('block'));
            this.getQuestionBankList();
        },
        validate: function () {
            var questionBank = this.model.editQuestionBank;
            ko.validation.registerExtenders();
            questionBank.questionBankName.extend({
                required: {params: true, message: "请填写题库名称"},
                maxLength: {params: 100, message: "不能超过100个字符"}
            });
            questionBank.content.extend({
                required: {params: true, message: "请填写题库介绍"},
                maxLength: {params: 200, message: "不能超过200个字符"}
            });
        },
        createQuestionBank: function () {
            this.model.modalTitle('创建题库');
            $('#editquestionBank').modal('show');

            this.model.editQuestionBank.id('');
            this.model.editQuestionBank.customId('');
            this.model.editQuestionBank.questionBankName('');
            this.model.editQuestionBank.belongType('');
            this.model.editQuestionBank.content('');

            ko.validation.group(this.model.editQuestionBank).showAllMessages(false);
        },
        editQuestionBank: function ($data) {
            this.model.modalTitle('编辑题库');
            $('#editquestionBank').modal('show');

            this.model.editQuestionBank.id($data.id);
            this.model.editQuestionBank.customId($data.customId);
            this.model.editQuestionBank.questionBankName($data.questionBankName);
            this.model.editQuestionBank.belongType($data.belongType);
            this.model.editQuestionBank.content($data.content);
        },
        saveQuestionBank: function () {
            var errors = ko.validation.group(this.model.editQuestionBank);
            if (errors().length) {
                errors.showAllMessages();
                return;
            }
            var questionBank = ko.mapping.toJS(this.model.editQuestionBank);
            if (questionBank.id === '') {
                store.createQuestionBank(questionBank).done($.proxy(function () {
                    $('#editquestionBank').modal('hide');
                    $.fn.dialog2.helpers.alert("创建题库成功");
                    this.search();
                }, this));
            } else {
                store.updateQuestionBank(questionBank).done($.proxy(function () {
                    $('#editquestionBank').modal('hide');
                    $.fn.dialog2.helpers.alert("更新题库成功");
                    this.search();
                }, this));
            }
        },
        getQuestionBankList: function () {
            var search = ko.mapping.toJS(this.model.filter);
            store.getQuestionBankList(search).done($.proxy(function (data) {
                this.model.items(data.items ? data.items : []);
                this.page(data.count, this.model.filter.page());
            }, this));
        },
        delQuestionBank: function ($data) {
            var self = this;
            $.fn.dialog2.helpers.confirm("您确认要删除题库吗？", {
                confirm: function () {
                    store.deleteQuestionBank($data.id).done(function () {
                        self.getQuestionBankList();
                        $.fn.dialog2.helpers.alert("删除题库成功");
                    });
                }
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.getQuestionBankList();
        },
        page: function (count, currentPage) {
            $('#pagination').pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                num_display_entries: 5,
                items_per_page: this.model.filter.size(),
                current_page: currentPage,
                prev_text: "上一页",
                next_text: "下一页",
                items_per: [20, 50, 100],
                callback: $.proxy(function (pageIndex) {
                    if (pageIndex != currentPage) {
                        this.model.filter.page(pageIndex);
                        this.getQuestionBankList();
                    }
                }, this),
                perCallback: $.proxy(function(size) {
                    this.model.filter.size(size);
                    this.search();
                }, this)
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);