(function ($, window) {
    var _ = ko.utils;
    var store = {
        getTemplateList: function (search) {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_templates/search',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(search)
            });
        },
        deleteTemplateList: function (enroll_form_template_id) {
            return $.ajax({
                url: service_domain + '/v1/enroll_form_templates/' + enroll_form_template_id,
                type: 'delete',
                dataType: 'json'
            });
        }
    };
    var viewModel = {
        model: {
            search: {
                page_no: 0,
                page_size: 10
            },
            templateList: {
                items: [],
                total: 0
            },
            formForPreview: {
                id: '',
                title: '',
                settings: []
            },
            type: 'edit',
            showPreview: false,
            verifyText: "点击获取验证码",
            vsSuccess: false,
            ifVerify: false,
            virfycheckSuccess: null
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.getTemplateList();
            ko.applyBindings(this);
        },
        getTemplateList: function () {
            var self = this;
            var search = ko.mapping.toJS(this.model.search);
            store.getTemplateList(search).done(function (data) {
                self.model.templateList.items(data.items);
                self.model.templateList.total(data.total);
                self.page(data.total, self.model.search.page_no());
            });
        },
        addCode: function (settings) {
            return _.arrayMap(settings, function (item) {
                if(item.name=="手机号"){
                    viewModel.model.ifVerify = item.extra.sms_valid;
                }
                item.code = "";
                item.answer = ko.observable("");
                if (~_.arrayIndexOf(["picture", "attachment", 'checkbox'], item.input_type)) {
                    item.answer = ko.observableArray([]);
                }
                return item;
            });
        },
        previewTemplate: function ($data) {
            this.model.formForPreview.id($data.id);
            this.model.formForPreview.title($data.title);
            this.model.formForPreview.settings(this.addCode($data.settings));
            this.model.showPreview(false);
            this.model.showPreview(true);
            $('#previewModal').modal('show');
        },
        selectTemplate: function ($data) {
            $.fn.dialog2.helpers.confirm("使用该模板后您已添加的字段将被清除，确认要使用吗？", {
                "confirm": function () {
                    window.location.href = '/' + project_code + '/admin/enroll/form?unit_id=' + unit_id + '&enroll_form_template_id=' + $data.id + ( __return_url ? '&__return_url=' + encodeURIComponent(__return_url) : '');
                },
                title: "使用模板"
            });
        },
        deleteTemplate: function ($data) {
            var self = this;
            $.fn.dialog2.helpers.confirm("确认要删除“" + $data.title + "”吗？", {
                "confirm": function () {
                    store.deleteTemplateList($data.id).done(function () {
                        $.fn.dialog2.helpers.alert("模板删除成功！", {id: 'systemModal'});
                        setTimeout(function () {
                            $('#systemModal').closest('.modal').find('.close').click();
                        }, 3000)
                    }).fail(function () {
                        $.fn.dialog2.helpers.alert("模板删除失败！", {id: 'systemModal'});
                        setTimeout(function () {
                            $('#systemModal').closest('.modal').find('.close').click();
                        }, 3000)
                    }).always(function () {
                        self.model.search.page_no(0);
                        self.getTemplateList();
                    });
                },
                title: "确认删除"
            });

        },
        page: function (totalCount, currentPage) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.page_size(),
                num_display_entries: 5,
                current_page: currentPage,
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageIndex) {
                    if (pageIndex != currentPage) {
                        self.model.search.page_no(pageIndex);
                        self.getTemplateList();
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
