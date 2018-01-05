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

    return this; //support chaining
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
            var url = '/' + projectCode + '/tags/tree';
            return $.ajax({
                url: url,
                cache: false,
                data: {
                    custom_type: custom_type
                },
                type: 'GET',
                async: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: function (jqXHR) {
                    var txt = JSON.parse(jqXHR.responseText);
                    if (txt.cause) {
                        $.fn.dialog2.helpers.alert(txt.cause.message);
                    } else {
                        $.fn.dialog2.helpers.alert(txt.message);
                    }
                },
                always: function () {
                    $('body').loading('hide');
                }
            });
        }
    };
    //数据模型
    var viewModel = {
        model: {
            clist: null,
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

            if (this.getInitBtn() != -1) {
                this.model.clist = ko.observable({
                    filter: null,
                    flag: this.getInitBtn()
                }).pub("clist");

                this.model.filter.flag = this.getInitBtn();
            }
            else {
                 this.model.clist = ko.observable({
                    filter: null,
                    flag: -1
                }).pub("clist");
            }

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
                    } else {
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
        },
        //标签分类选择事件
        catalogOnClick: function (element) {
            if ($(element).hasClass('active')) {
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

            if (this.getInitBtn() != -1) {
                tmpl = '\
                    <div class="catalog-column clearfix" style="display: none" data-bind="visible: model.catalogs().length ">\
                        <span class="column-title">状态</span>\
                        <span class="item-all item-label" data-bind="click:function(){$root.selectFlag(-1,$element)}">\
                        <a href="jalascript:;">全部</a></span>\
                    <ul class="column-list">';
            }

            $.each(btnList, $.proxy(function (index, btn) {
                if (this.getInitBtn() != -1 && index == window.currentBtn) {
                    tmpl += '<li class="item-label active" data-bind="click:function(){$root.selectFlag(' + index + ',$element);}"><a href="javascript:;">' + btn + '</a></li>';
                } else {
                    tmpl += '<li class="item-label" data-bind="click:function(){$root.selectFlag(' + index + ',$element);}"><a href="javascript:;">' + btn + '</a></li>';
                }
            }, this));
            tmpl += '</ul></div>';
            $("#catalogs").append(tmpl);
        },
        getInitBtn: function () {
            if (window.currentBtn) {
                return window.currentBtn;
            }

            return -1;
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
