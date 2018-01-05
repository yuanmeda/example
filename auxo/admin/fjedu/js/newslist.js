;(function ($, window) {
    var store = {
        //banner推荐列表
        newsList: function () {
            var url = '/fjedu/news_recommands?role_type=' + roleType;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        newsDel: function (news_id) {
            var url = '/fjedu/news_recommand/delete/' + news_id;
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
            ko.applyBindings(this, document.getElementById('newsList'));
        },

        list: function () {
            var _self = this;
            //获取banner列表
            store.newsList()
                .done(function (data) {
                    if (data) {
                        _self.model.items(data);
                    }
                });
        },
        newsDel: function (news_id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？!', {
                "confirm": function () {
                    store.newsDel(news_id).done(function () {
                        _self.list();
                    });
                },
                buttonLabelYes: '确认',
                buttonLabelNo: '取消'
            })
        },
        addRecommend: function () {
            location.href = '/system/newscreate';
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);