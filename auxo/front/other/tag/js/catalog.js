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
            var url = (window.selfUrl || '') + '/' + projectCode + '/tags/tree';
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
                    if (data && data.children) {
                        _self.initList(data);
                    } else {
                        viewModel.getParam();
                    }
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
                    parent = self.parent();
//                    self.toggleClass('on');
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
            function getChildren(array, target, tag_ids) {
                for (var i = 0; i < array.children.length; i++) {
                    var root = $.extend(true, {}, array.children[i]);
                    delete root.children;
                    //默认子标签不选中
                    root.addActive = false;
                    //对传入的参数加active
                    if (tag_id && root.id.indexOf(tag_id) === 0) {
                        root.addActive = true;
                        viewModel.filterObj[root.parent_id] = root.id || null;
                    }
                    //拼凑id数组，提供给下文判断哪个全部取消active样式
                    tag_ids.push(root.id);
                    target.push(root);
                    if (array.children[i].children.length) {
                        getChildren(array.children[i], target, tag_ids);
                    }
                }
            }

            for (var i = 0; i < data.children.length; i++) {
                var tag_ids = [];
                //初始化选择条件
                data.children[i].all = [];
                getChildren(data.children[i], data.children[i].all, tag_ids);
                //默认展示全部
                data.children[i].allActive = true;
                data.children[i].children = data.children[i].all;
                delete data.children[i].all;
                if (tag_id) {
                    var allActive = tag_ids.join(',').indexOf(tag_id) == -1;
                    data.children[i].allActive = allActive;
                }
            }
            //拼凑二级标签
//            viewModel.model.catalogs(data.children);
            ko.mapping.fromJS(data.children, {}, viewModel.model.catalogs);
            viewModel.getParam();
            viewModel._initDomEvent();
        },
        //标签分类选择事件
        catalogOnClick: function (element) {
            if ($(element).hasClass('active')) {
//                if(type == 'templates.admin'){
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