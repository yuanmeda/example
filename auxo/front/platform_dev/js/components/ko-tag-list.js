;(function (window, $) {
    'use strict';
    var _ = ko.utils, _getKeyValue = i18nHelper.getKeyValue;
    var radioTower = new ko.subscribable();

    ko.subscribable.fn.pub = function (topic) {
        this.subscribe(function (newValue) {
            radioTower.notifySubscribers(newValue, topic);
        });
        return this;
    };
    ko.subscribable.fn.sub = function (topic, call, vm) {
        var target = vm || null;
        var cb = call || this; //如果没有call，那么直接捆绑原始数据
        radioTower.subscribe(cb, target, topic);

        return this;
    };
    function ViewModel(params) {
        var display = params.setting.display;
        var model = {
            init: false,
            list: {
                items: [],
                total: 0
            },
            searchFilter: {
                page_size: 20,
                page_no: 0,
                group_names: [],
                tag_ids: params.setting.data.tag_id ? [params.setting.data.tag_id] : [],
                status: 1,
                sort_type: display.is_sort_enabled ? display.order_type : 3,
                time_status: display.is_filter_enabled ? display.filter_type : 0
            },
            allGroupNames: [],
            clist: ko.observable({
                filter: null,
                flag: -1
            }).pub("clist"),
            filter: {
                catalogs: [],
                flag: -1
            },
            catalogs: []
        };
        this.model = ko.mapping.fromJS(model);
        this.state = {};
        this.model.setting = params.setting;
        this.filterObj = {};
        this.clist = ko.observable({});
        this.params = params;
        this.init();
    }

    ViewModel.prototype.store = {
        getCatalogs: function () {
            return $.ajax({
                url: "/v1/resources/tags",
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getResource: function (data) {
            return $.ajax({
                url: "/v1/resources/actions/search",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
    };
    ViewModel.prototype.init = function () {
        this.initTag();
        this.bindEvent();
    };
    ViewModel.prototype.hrefToResource = function ($data, typeKey) {
        var href = window.commonUtils.formatUrl(RESOURCE_CONFIG_MAP[$data[typeKey]].info_url, $data),
            mac = Nova.getMacToB64(href);
        if (!~href.indexOf('lecturer') && window.userInfo.user_id && mac) {
            href += (~href.indexOf("?") ? "&" : "?") + '__mac=' + mac;
        }
        var w = window.open(href);
    };
    ViewModel.prototype.formatType = function (type) {
        var allGroupNames = window.allGroupNames || [];
        for (var i = 0; i < allGroupNames.length; i++)
            if (allGroupNames[i].type == type)return _getKeyValue("platform_dev.groupName." + allGroupNames[i].type);
    };
    ViewModel.prototype.formatTime = function (time) {
        return time ? time.split('.')[0].replace('T', ' ') : '';
    };
    //标签
    ViewModel.prototype.initTag = function () {
        var _self = this;
        this._initBtn();
        //加载标签树
        this.store.getCatalogs().done(function (data) {
            if (data && data.children) {
                _self.initList(data);
            } else {
                _self.getParam();
            }
        });
    };
    ViewModel.prototype._initDomEvent = function () {
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
            var self = $(this), parent = self.parent();
            parent.toggleClass('on');
        });

        $(document).trigger('more_able');
    };
    ViewModel.prototype._resize = function () {
        setTimeout(function () {
            $(window).resize();
        }, 1000);
    };
    ViewModel.prototype.initList = function (data) {
        var self = this;

        function getChildren(array, target, tag_ids) {
            for (var i = 0; i < array.children.length; i++) {
                var root = $.extend(true, {}, array.children[i]);
                delete root.children;
                //默认子标签不选中
                root.addActive = false;
                //对传入的参数加active
                if (self.model.setting.data.tag_id && root.id.indexOf(self.model.setting.data.tag_id) === 0) {
                    root.addActive = true;
                    self.filterObj[root.parent_id] = root.id || null;
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
            if (self.model.setting.data.tag_id) {
                var allActive = tag_ids.join(',').indexOf(self.model.setting.data.tag_id) == -1;
                data.children[i].allActive = allActive;
            }
        }
        //拼凑二级标签
        ko.mapping.fromJS(data.children, {}, this.model.catalogs);
        this.getParam();
        this._initDomEvent();
    };
    //标签分类选择事件
    ViewModel.prototype.catalogOnClick = function (element) {
        if ($(element).hasClass('active')) {
            return;
        }
        $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
        $(element).addClass('active');
        if (this.model.filter.flag() === 0) {
            this.model.filter.flag(-1);
            var statusItems = $('.catalog-column').last();
            statusItems.find('.item-label').removeClass('active');
            statusItems.find('.item-label').eq(0).addClass('active');
        }
        var _this = $(element),
            _id = _this.data('id'),
            _type = _this.data('type');
        this.filterObj[_type] = _id || null;
        this.getParam();
    };

    ViewModel.prototype.selectFlag = function (flag, element) {
        if ($(element).hasClass('active')) {
            return;
        } else {
            if (flag === 0) {
                this.filterObj = {};
                $.each($(element).closest('.catalog-column').siblings(), function (i, e) {
                    $(e).find('.item-label').removeClass('active');
                    $(e).find('.item-label').eq(0).addClass('active');
                });
            }
            this.model.filter.flag(flag);
            $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
            $(element).addClass('active');
        }
        this.getParam();
    };
    ViewModel.prototype._initBtn = function () {
        var btnList = window.btnList || [];
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
    };
    ViewModel.prototype.getParam = function () {
        var temp = [], filterObj = this.filterObj;
        //过滤选中标签
        for (var key in filterObj) {
            if (!filterObj[key]) {
                continue;
            }
            temp.push(filterObj[key]);
        }
        this.model.filter.catalogs(temp);
        this.model.clist(this.model.filter);

    };
    //标签 end
    ViewModel.prototype.orderSearch = function (type) {
        this.model.searchFilter.sort_type(type);
        this.model.searchFilter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.getResourceGroup = function () {
        var self = this;
        this.model.allGroupNames(window.allGroupNames);
        this.model.searchFilter.group_names(self.model.setting.data.group_names);
        this.pageQuery();
        this.clist.sub("clist", function (val) {
            if (val.catalogs().toString() != self.model.searchFilter.tag_ids().toString()) {
                self.model.searchFilter.tag_ids(val.catalogs());
                self.model.searchFilter.page_no(0);
                self.pageQuery();
            }
        });
    };
    ViewModel.prototype.bindEvent = function () {
        var self = this;
        this.getResourceGroup();

        $(".show-more").on("click", function () {
            $(".filter-right").toggleClass("release");
        });
    };
    ViewModel.prototype.statusSearch = function (mode) {
        var filter = this.model.searchFilter;
        if (filter.time_status() == mode) return;
        filter.time_status(mode);
        filter.page_no(0);
        this.pageQuery();
    };
    ViewModel.prototype.pageQuery = function () {
        this.state.store && this.state.store.abort();
        var self = this, filter = ko.mapping.toJS(this.model.searchFilter);
        this.state.store = this.store.getResource(this.formatFilter(filter));
        this.state.store.done(function (data) {
            for (var i = 0, j = data.items.length; i < j; i++) {
                if (data.items[i].tags && data.items[i].tags.length > 3) {
                    data.items[i].tags.length = 3;
                }
            }
            self.model.list.items(data.items);
            self.model.list.total(data.total);
            self.model.init(true);
            self.page();
            $('.lazy-image:not(.loaded)').lazyload({
                placeholder: defaultImage,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
        }).always(function () {
            self.state.store = null;
        });
    };
    ViewModel.prototype.formatFilter = function (search) {
        var newFilter = {};
        $.each(search, function (k, v) {
            if ($.isArray(v)) {
                if (v.length) newFilter[k] = v;
            } else {
                if (v !== "" && v !== false) newFilter[k] = v;
            }
        });
        return newFilter;
    };
    ViewModel.prototype.triggerTagButton = function (data) {
        var selector = "[data-id=" + data.id + "]"; //获取标签dom元素
        $(selector).trigger("click");
    };
    ViewModel.prototype.page = function () {
        var self = this, searchFilter = this.model.searchFilter;
        $("#pagination").pagination(self.model.list.total(), {
            is_show_first_last: false,
            is_show_input: true,
            is_show_total: false,
            items_per_page: searchFilter.page_size(),
            num_display_entries: 5,
            current_page: searchFilter.page_no(),
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            callback: function (index) {
                if (index != searchFilter.page_no()) {
                    searchFilter.page_no(index);
                    self.pageQuery();
                }
            }
        })
    };
    ko.components.register('x-tag-list', {
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(window, jQuery);

