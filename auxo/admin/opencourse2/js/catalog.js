/*
 标签树js
 */

//(function(ko){
var radioTower = new ko.subscribable();

ko.subscribable.fn.pub = function (topic) {
    this.subscribe(function (newValue) {
        radioTower.notifySubscribers(newValue, topic);
    });
    return this; //support chaining
};
ko.subscribable.fn.sub = function (topic, call, vm) {
    var target = vm || null;
    var cb = call || this; //如果没有call，那么直接捆绑原始数据
    radioTower.subscribe(cb, target, topic);

    return this;  //support chaining
};
//})(ko);


(function ($) {
    //数据仓库
    var store = {
        errorHandler: function (jqXHR) {
            var txt = JSON.parse(jqXHR.responseText);
            if (txt.cause) {
                $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
            } else {
                $.fn.dialog2.helpers.alert(txt.message);
            }
        },
        //公开课标签树
        getCatalogs: function () {
            var url = '/auxo/tag/v1/tags/tree';
            return commonJS._ajaxHandler(url, {custom_type: custom_type}, 'GET');
        }
    };
    //数据模型
    var viewModel = {
        model: {
//            catalogList: [],
            clist: ko.observable({
                filter: null,
                flag: -1
            }).pub("clist"),
            filter: {
                catalogs: [],
                flag: -1
            },
            catalogs: []
        },
        filterObj: {},
        init: function () {
            var _self = viewModel;
            $.extend(_self, commonJS);
            _self.model = ko.mapping.fromJS(_self.model);
            viewModel._initBtn();
            ko.applyBindings(_self, document.getElementById('catalogs'));
            //加载标签树
            store.getCatalogs()
                .done(function (data) {
                    _self.initList(data);
                });
        },
        _initDomEvent: function () {
            // 显隐事件
            $(document).on('more_able', function (e, a, b) {
                $(".column-list").each(function () {
                    var top = $(this).find("li:last").length ? $(this).find("li:last").position().top : 0;
                    var moreBtn = $(this).parent("div").find(".attr-more");
                    if (top > 0) {
                        moreBtn.show();
                    }
                    else {
                        moreBtn.hide();
                    }
                });
            });

            // 更多点击事件
            $('body').on('click', '.attr-more', function () {
                var self = $(this),
                    parent = self.parent(),
                    em = self.find('em');

                parent.toggleClass('on');
            });

            $(document).trigger('more_able');
        },
        _resize: function () {
            setTimeout(function () {
                $(window).resize();
            }, 1000);
        },
        initList: function (data) {
//            data = {
//                "id": 2842,
//                "title": "root",
//                "sort_number": 0,
//                "parent_id": 0,
//                "children": [
//                                {
//                                    "id": 2858,
//                                    "title": "动漫",
//                                    "sort_number": 1,
//                                    "parent_id": 2842,
//                                    "children": [
//                                        {
//                                            "id": 2894,
//                                            "title": "嗷嗷",
//                                            "sort_number": 3,
//                                            "parent_id": 2858,
//                                            "children": [
//                                                {"id": 2894, "title": "嗷嗷1", "sort_number": 3, "parent_id": 2800, "children": []},
//                                                {"id": 2893, "title": "嗷嗷2", "sort_number": 4, "parent_id": 2801, "children": []},
//                                                {"id": 2893, "title": "嗷嗷3", "sort_number": 4, "parent_id": 2804, "children": []}
//                                             ]
//                                        },
//                                        {"id": 2893, "title": "KK", "sort_number": 4, "parent_id": 2858, "children": []}
//                                     ]
//                                },
//                                {"id": 2857, "title": "电视剧", "sort_number": 2, "parent_id": 2842, "children": []},
//                                {"id": 2856, "title": "哈弗公开课", "sort_number": 3, "parent_id": 2842, "children": []},
//                                {"id": 2855, "title": "复旦公开课", "sort_number": 5, "parent_id": 2842, "children": []},
//                                {"id": 2844, "title": "测试公开课", "sort_number": 6, "parent_id": 2842, "children": [
//                                    {"id": 2894, "title": "test1", "sort_number": 3, "parent_id": 2802, "children": []},
//                                    {"id": 2893, "title": "test2", "sort_number": 4, "parent_id": 2803, "children": []}
//                                 ]}
//                 ]
//            };
            function getChildren(array, target) {
                for (var i = 0; i < array.children.length; i++) {
                    var root = $.extend(true, {}, array.children[i]);
                    delete root.children;
                    target.push(root);
                    if (array.children[i].children.length) {
                        getChildren(array.children[i], target);
                    }
                }
            }

            for (var i = 0; i < data.children.length; i++) {
                //初始化选择条件
                data.children[i].all = [];
                getChildren(data.children[i], data.children[i].all);
                data.children[i].children = data.children[i].all;
                delete data.children[i].all;
            }
            //拼凑二级标签
            viewModel.model.catalogs(data.children);
            viewModel.getParam();
            viewModel._initDomEvent();

//            console.log(view);
//            viewModel.model.filter.catalogs(tag_ids);
//            viewModel.model.clist(viewModel.model.filter);
        },
        //标签分类选择事件
        catalogOnClick: function (element) {
            if ($(element).hasClass('active')) {
//                if(type == 'admin'){
//                    $(element).removeClass('active');
//                    delete viewModel.filterObj[$(element).data('type')];
//                    viewModel.getParam();
//                }
                return;
            }
            $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
            $(element).addClass('active');
            if (viewModel.model.filter.flag() === 0) {
                viewModel.model.filter.flag(-1);
                var statusItems = $('.catalog-column').last();
                statusItems.find('.item-label').removeClass('active');
                statusItems.find('.item-label').eq(0).addClass('active');
            }
            var _this = $(element),
                _id = _this.data('id'),
                _type = _this.data('type');
            viewModel.filterObj[_type] = _id || null;
            viewModel.getParam();
        },
        //状态分类事件
        selectFlag: function (flag, element) {
            if ($(element).hasClass('active')) {
//                if (flag === 0) {
//                viewModel.model.filter.flag(-1);
//                }
//                $(element).removeClass('active');
//                viewModel.filterObj = {};
                return;
            } else {
                if (flag === 0) {
                    viewModel.filterObj = {};
                    $.each($(element).closest('.catalog-column').siblings(), function (i, e) {
                        $(e).find('.item-label').removeClass('active');
                        $(e).find('.item-label').eq(0).addClass('active');
                    });
                }
                viewModel.model.filter.flag(flag);
                $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
                $(element).addClass('active');
            }
            viewModel.getParam();
        },
        _initBtn: function () {
            if (btnList == undefined || btnList.length == 0)
                return;
            var tmpl = '\
             <div class="catalog-column clearfix" style="display: none" data-bind="visible: model.catalogs().length ">\
                <span class="column-title">状态</span>\
                <span class="item-all item-label active" data-bind="click:function(){$root.selectFlag(-1,$element)}">\
                <a href="jalascript:;">全部</a></span>\
            <ul class="column-list">';
            $.each(btnList, function (index, btn) {
                tmpl += '<li class="item-label" data-bind="click:function(){$root.selectFlag(' + index + ',$element);}"><a href="javascript:;">' + btn + '</a></li>';
            });
            tmpl += '</ul></div>';
            $("#catalogs").append(tmpl);
        },
        getParam: function () {
            var temp = [],
                filterObj = viewModel.filterObj;
            //过滤选中标签
            for (var key in filterObj) {
                if (!filterObj[key]) {
                    continue;
                }
                temp.push(filterObj[key]);
            }
            viewModel.model.filter.catalogs(temp);
            viewModel.model.clist(viewModel.model.filter);

        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery);