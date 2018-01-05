void function () {
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
        getItemTags: function () {
            var url = '/' + projectCode + '/exam/v2/categories/relations/all';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            bankId: '',
            itemPool: {
                tags: [],
                level0: [],
                level1: [],
                level2: [],
                level3: [],
                level4: [],
                selectedTags: {
                    0: "",
                    1: "",
                    2: "",
                    3: "",
                    4: ""
                },
                rootId: "",
                chapters: [],
                selectedItems: []
                //items:{}
            }
        },
        init: function () {
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.setTemplateEngine(new ko.nativeTemplateEngine());
            ko.applyBindings(this);
            store.getItemTags()
                .done($.proxy(function (data) {
                    if (data && data.items) {
                        this.model.itemPool.tags(data && data.items);
                    }
                }, this));
        },
        openItemPoolModal: function () {
            $('#itemPoolModal').modal('show');
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);