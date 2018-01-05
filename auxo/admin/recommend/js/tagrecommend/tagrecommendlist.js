;(function ($, window) {
    var store = {
        //获取推荐
        getRecommends: function (filter) {
            var url = '/' + projectCode + '/recommends/tags';
            return commonJS._ajaxHandler(url,filter);
        },
        //移动推荐
        moveRecommend: function (id, sort_number) {
            var url = '/' + projectCode + '/v1/recommends/tags/' + id + '/move?sort_number=' + sort_number;
            return commonJS._ajaxHandler(url, null, 'PUT');
        },
        //更新推荐
        updateRecommend: function (id, data) {
            var url = '/' + projectCode + '/v1/recommends/tags/' + id;
            return commonJS._ajaxHandler(url, JSON.stringify(data), "PUT");
        },
        //删除推荐
        deleteRecommend: function (id) {
            var url = '/' + projectCode + '/v1/recommends/tags/' + id;
            return commonJS._ajaxHandler(url, null, "DELETE");
        }
    };
    var viewModel = {
        model: {
            visibleFlag: false,
            items: [],
            search:{
                page: 0,
                size: 1000,
                status: ''
            }
        },
        init: function () {
            $.extend(this, commonJS);
            this.model = ko.mapping.fromJS(this.model);

            this.model.search.status.subscribe(this.list, this);
            this.list();

            ko.applyBindings(this, document.getElementById('tagList'));
        },
        //拖拉组件初始化
        drag: function () {
            var _self = this;
            $("#drag").dragsort({
                dragSelector: "tr",
                dragBetween: true,
                scrollContainer: '#content',
                dragEnd: function () {
                    var id = this.attr("id");
                    var sort_number = this.attr("sort_number");
                    $("#drag").find("tr").each(function (index, element) {
                        if (element.id == id) {
                            var target_element = $(element).next();
                            if (target_element.length !== 0) {
                                var target_sort_number = target_element.attr("sort_number");
                                if (parseInt(sort_number) > parseInt(target_sort_number)) {
                                    sort_number = $(element).prev().attr("sort_number");
                                } else {
                                    sort_number = $(element).next().attr("sort_number");
                                }
                            } else {
                                sort_number = $(element).prev().attr("sort_number");
                            }
                        }
                    });
                    var param = {
                        id: id,
                        sort_number: parseInt(sort_number)
                    };
                    $("#drag").dragsort("destroy");
                    store.moveRecommend(id, param.sort_number).done(function (data) {
                        _self.list();
                    });
                }

            });
        },
        list: function () {
            var _self = this, search = ko.mapping.toJS(this.model.search);
            $("#drag").dragsort("destroy");
            store.getRecommends(search)
                .done(function (data) {
                    _self.model.items(data.items);
                    _self.model.visibleFlag(true);
                    _self.drag();
                });
        },
        //更新状态
        updateStatus: function ($data, event) {
            var _self = this;
            $data.status = $data.status ? 0 : 1;

            store.updateRecommend($data.id, $data).done(function (data) {
                if ($data.status) { //若是推荐则变成取消推荐
                    $.fn.dialog2.helpers.alert('上线成功');
                } else {//反之
                    $.fn.dialog2.helpers.alert('下线成功');
                }
                _self.list();
            });
        },
        //删除推荐
        deleteRecommend: function ($data) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？!', {
                'confirm': function () {
                    store.deleteRecommend($data.id)
                        .done(function () {
                            _self.list();
                        });
                },
                buttonLabelYes: '确定',
                buttonLabelNo: '取消'
            });

        },
        formatCustomType: function (type) {
            switch (type) {
                case 'auxo-train':
                    return '培训认证';
                case 'auxo-open-course':
                    return '公开课';
                case 'auxo-exam-center':
                    return '测评中心';
                default:
                    return '';
            }
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);