;(function ($, window) {
    var store = {
        query: function () {
            return $.ajax({
                url: '/fjedu/recommands?role_type=' + roleType,
                dataType: 'json',
                cache: false
            });
        },
        del: function (id) {
            var url = '/fjedu/recommand/delete/' + id;
            return $.ajax({
                url: url,
                dataType: 'json',
                type: 'delete'
            });
        }

    };
    var viewModel = {
        model: {
            items: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('container'));
            this.query();
        },

        query: function () {
            var _self = this;
            store.query().done(function (data) {
                if (data) {
                    _self.model.items(data);
                }
            });
        },
        del: function ($data) {
            var self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？!', {
                "confirm": function () {
                    store.del($data.id).done(function () {
                        self.query();
                    });
                },
                buttonLabelYes: '确认',
                buttonLabelNo: '取消'
            })
        },
        addRecommend: function () {
            location.href = '/system/recommend/edit';
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);