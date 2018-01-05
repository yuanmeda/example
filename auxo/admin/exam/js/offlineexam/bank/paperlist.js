(function ($) {
    var errorHandler = function (jqXHR) {
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
    };

    var store = {
        getPaperList: function (search) {
            var url = '/' + projectCode + '/v1/questionbanks/papers';

            return $.ajax({
                url: url,
                cache: false,
                data: window.toggleCase(search, 'snake'),
                type: 'GET',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        deletePaper: function (id) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + id;

            return $.ajax({
                url: url,
                cache: false,
                type: 'DELETE',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        createPaper: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/new';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(window.toggleCase(data, 'snake')),
                type: 'POST',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        updatePaper: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + data.id;
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(window.toggleCase(data, 'snake')),
                type: 'PUT',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        }
    };
    //数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                title: '',
                questionBankId: '',
                page: 0,
                size: 20,
                type: 1
            },
            paper: {
                id: '',
                title: '',
                summary: '',
                questionBankId: questionBankId
            }
        },
        init: function () {
            $.extend(this, commonJS);
            this.model.filter.questionBankId = window.questionBankId;
            this.model = ko.mapping.fromJS(this.model);
            this.validate();
            ko.applyBindings(this, document.getElementById('block'));
            this.getPaperList();
        },
        validate: function () {
            ko.validation.init({
                decorateElement: false,
                registerExtenders: true,
                messagesOnModified: true,
                insertMessages: true,
                parseInputAttributes: true,
                messageTemplate: null,
                errorClass : 'error-hint'
            });
            var paper = this.model.paper;
            ko.validation.registerExtenders();
            paper.title.extend({
                required: {params: true, message: "请填写试卷名称"},
                maxLength: {params: 100, message: "不能超过100个字符"}
            });
            paper.summary.extend({
                required: {params: true, message: "请填写试卷介绍"},
                maxLength: {params: 200, message: "不能超过200个字符"}
            });
        },
        getPaperList: function () {
            var search = ko.mapping.toJS(this.model.filter);

            store.getPaperList(search).done($.proxy(function (data) {
                this.model.items(data.items);
                this.page(data.count, this.model.filter.page());
            }, this));
        },
        delPaper: function ($data) {
            var self = this;
            $.fn.dialog2.helpers.confirm("您确认要删除试卷吗？", {
                confirm: function () {
                    store.deletePaper($data.id).done(function () {
                        self.search();
                        $.fn.dialog2.helpers.alert("删除试卷成功");
                    });
                }
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.getPaperList();
        },
        page: function (count, currentPage) {
            $('#pagination').pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                num_display_entries: 5,
                items_per_page: this.model.filter.size(),
                current_page: currentPage,
                items_per: [20, 50, 100],
                callback: $.proxy(function (pageIndex) {
                    if (pageIndex != currentPage) {
                        this.model.filter.page(pageIndex);
                        this.getPaperList();
                    }
                }, this),
                perCallback: $.proxy(function(size) {
                    this.model.filter.size(size);
                    this.search();
                }, this)
            });
        },
        createPaper: function () {
            var errors = ko.validation.group(this.model.paper);
            if (errors().length) {
                errors.showAllMessages(true);
                return;
            }

            var data = ko.mapping.toJS(this.model.paper);
            store.createPaper(data).done($.proxy(function() {
                $('#createpaper').modal('hide');
                $.fn.dialog2.helpers.alert("创建试卷成功");
                this.search();
            }, this));
        },
        updatePaper: function () {
            var errors = ko.validation.group(this.model.paper);
            if (errors().length) {
                errors.showAllMessages(true);
                return;
            }

            var data = ko.mapping.toJS(this.model.paper);
            store.updatePaper(data).done($.proxy(function() {
                $('#updatepaper').modal('hide');
                $.fn.dialog2.helpers.alert("更新试卷成功");
                this.search();
            }, this));
        },
        showCreateModal: function () {
            this.model.paper.title('');
            this.model.paper.summary('');
            ko.validation.group(this.model.paper).showAllMessages(false);

            $("#createpaper").modal();
        },
        showModifyModal: function(data) {
            this.model.paper.id(data.id);
            this.model.paper.title(data.title);
            this.model.paper.summary(data.summary);
            ko.validation.group(this.model.paper).showAllMessages(false);

            $("#updatepaper").modal();
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);