;(function ($, window) {
    var store = {
        //banner推荐列表
        bannerList: function (search) {
            var url = '/' + projectCode + '/recommends/banners';
            return commonJS._ajaxHandler(url,search);
        },

        bannerMove: function (banner_id, sort_number) {
            var url = '/' + projectCode + '/v1/recommends/banners/' + banner_id + '/move?sort_number=' + sort_number;
            return commonJS._ajaxHandler(url, null, 'PUT');
        },
        //更新推荐状态
        bannerStatusUpdate: function (banner_id, data) {
            var url = '/' + projectCode + '/v1/recommends/banners/' + banner_id;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        },
        bannerDel: function (banner_id) {
            var url = '/' + projectCode + '/v1/recommends/banners/' + banner_id;
            return commonJS._ajaxHandler(url, null, 'DELETE');
        }

    };
    var viewModel = {
        model: {
            visibleFlag: false,
            items: [],
            init: false
        },
        init: function () {
            $.extend(this, commonJS);
            this.model = ko.mapping.fromJS(this.model);
            this.list();
            ko.applyBindings(this, document.getElementById('bannerList'));
        },

        //拖拉组件初始化
        drag: function () {
            var _self = this;
            $("#drag").dragsort({
                dragSelector: "tr",
                dragBetween: true,
                scrollContainer: '#content',
                dragEnd: function () {
                    var banner_id = this.attr("id");
                    var sort_number = this.attr("sort_number");
                    $("#drag").find("tr").each(function (index, element) {
                        if (element.id == banner_id) {
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
                        banner_id: banner_id,
                        sort_number: parseInt(sort_number)
                    };
                    $("#drag").dragsort("destroy");
                    store.bannerMove(banner_id, param.sort_number).done(function (data) {
                        _self.list();
                    });
                }

            });
        },

        list: function () {
            var _self = this;
            //获取banner列表
            $("#drag").dragsort("destroy");
            store.bannerList({page:0, size: 1000})
                .done(function (data) {
                    _self.model.items(data.items);
                    _self.model.visibleFlag(true);
                    _self.model.init(true);
                    _self.drag();
                });
        },
        //更新状态
        updateStatus: function ($data) {
            var _self = this;
            $data.status = $data.status ? 0 : 1;
            store.bannerStatusUpdate($data.id, $data)
                .done(function () {
                if ($data.status) { //若是推荐则变成取消推荐
                    $.fn.dialog2.helpers.alert('推荐成功');
                } else {//反之
                    $.fn.dialog2.helpers.alert('取消推荐成功');
                }
                _self.list();
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
        },
        formatType: function(type){
            var txt = '';
            switch(type){
                case 'auxo-exam-center':
                    txt = '测评中心';
                    break;
                case 'auxo-open-course':
                    txt = '公开课';
                    break;
                case 'url-address':
                    txt = 'url地址';
                    break;
                case 'auxo-train':
                    txt = '培训认证';
                    break;
            }
            return txt;
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);