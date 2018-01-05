;(function ($, window) {
    var store = {
        //banner推荐列表
        bannerList: function () {
            var url = '/fjedu/banners?role_type=' + roleType;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        bannerDel: function (banner_id) {
            var url = '/fjedu/banner/delete/' + banner_id;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'DELETE'
            });
        }

    };
    var viewModel = {
        model: {
            items: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.list();
            ko.applyBindings(this, document.getElementById('bannerList'));
        },

        list: function () {
            var _self = this;
            //获取banner列表
            store.bannerList()
                .done(function (data) {
                    if (data) {
                        _self.model.items(data);
                    }
                });
        },
        bannerDel: function (banner_id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？!', {
                "confirm": function () {
                    store.bannerDel(banner_id).done(function () {
                        _self.list();
                    });
                },
                buttonLabelYes: '确认',
                buttonLabelNo: '取消'
            })
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);