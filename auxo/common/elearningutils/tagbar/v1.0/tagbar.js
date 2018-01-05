/**
 * 通用搜索条插件
 * Created by Lin Tao on 2016/1/19.
 */

(function ($) {
    var tmpl = '\
        <div class="proFilter">\
            <!-- ko foreach: catalogList -->\
                <div class="pro-attr on cf">\
                    <div class="attr-label fl" data-bind="text: title"></div>\
                    <div class="attr-values">\
                        <a href="javascript:;" class="active" data-bind="click: function(item, evt) { $root.allItemClick(item, evt); }, attr: { \'data-id\': id, \'data-index\': $index }, text: $root.i18n.allText()"></a>\
                        <!-- ko foreach: children -->\
                            <a href="javascript:;" data-bind="click: function (item, evt) { $root.subItemClick(item, $parent, evt); }, text: title, attr: { \'data-id\': id, \'title\': title }"></a>\
                        <!--/ko-->\
                    </div>\
                    <a class="attr-more" href="javascript:;" data-bind="attr: { \'data-down\': $root.i18n.moreText(), \'data-up\': $root.i18n.hideText() },click:$root._resize">\
                        <i class="icon-darrow"></i>\
                    </a>\
                </div>\
            <!-- /ko -->\
        </div>\
        ';

    $.widget('elearning.tagbar', {
        options: {
            catalogIds: [],
            catalogList: [],
            className: '',
            i18n: {
                allText: '全部',
                moreText: '更多',
                hideText: '收起'
            },
            itemClickHandler: function (evt, arg) {
            }
        },
        _init: function () {
            var _this = this;

            if (this.options.catalogList && this.options.catalogList.length <= 0)
                return;

            $(this.element).addClass(this.options.className);

            this._inner = $(this.element).html(tmpl);
            this._vm = ko.mapping.fromJS(this.options);

            this._vm.filterIds = ko.observableArray(this._initSelectedCatalogs(this.options.catalogList));
            this._vm.allItemClick = function (item, evt) {
                var element = $(evt.target), index = parseInt(element.data('index'));
                if (element.hasClass('active'))
                    return;
                element.addClass('active').siblings().removeClass('active');

                for (var i = 0; i < this.filterIds().length; i++) {
                    if (ko.utils.unwrapObservable(item.id) === ko.utils.unwrapObservable(this.filterIds()[i].parentId)) {
                        this.filterIds.splice(i, 1, {
                            parentId: ko.utils.unwrapObservable(item.id),
                            selectedId: undefined
                        });
                        break;
                    }
                }
            };
            this._vm.subItemClick = function (item, parent, evt) {
                var element = $(evt.target);
                if (element.hasClass('active'))
                    return;
                element.addClass('active').siblings().removeClass('active');

                for (var i = 0; i < this.filterIds().length; i++) {
                    if (ko.utils.unwrapObservable(this.filterIds()[i].parentId) === ko.utils.unwrapObservable(parent.id)) {
                        this.filterIds.splice(i, 1, {
                            parentId: ko.utils.unwrapObservable(parent.id),
                            selectedId: ko.utils.unwrapObservable(item.id)
                        });
                        break;
                    }
                }
            };
            this._vm._resize = function () {
                setTimeout(function () { $(window).resize(); }, 1000)
            };
            ko.cleanNode(this._inner[0]);
            ko.applyBindings(this._vm, this._inner[0]);
            this._vm.filterIds.subscribe($.proxy(this._onItemClickHandler, this));

            this._initDomEvent();
            this._initSelected();
        },
        _initSelectedCatalogs: function (catalogList) {
            var selectedArray = [];
            var childrenSelectedArray = this._nestedLoop(catalogList, 0);

            for (var i = 0; i < catalogList.length; i++) {
                selectedArray.push({
                    parentId: catalogList[i].id,
                    selectedId: undefined
                });
            }

            if (childrenSelectedArray && childrenSelectedArray.length > 0) {
                for (var j = 0; j < childrenSelectedArray.length; j++) {
                    if (childrenSelectedArray[j].selectedId && childrenSelectedArray[j].selectedId > 0) {
                        for (var k = 0; k < selectedArray.length; k++) {
                            if (selectedArray[k].parentId === childrenSelectedArray[j].parentId) {
                                selectedArray[k].selectedId = childrenSelectedArray[j].selectedId;
                            }
                        }
                    }
                }
            }

            return selectedArray;
        },
        _nestedLoop: function (array, parentId) {
            var selectedArray = [];

            if (array) {
                for (var i = 0; i < array.length; i++) {
                    if (window.toolUtils.arrayExtend.contains(this.options.catalogIds, array[i].id)) {
                        selectedArray.push({
                            parentId: parentId,
                            selectedId: array[i].id
                        });

                        this.needDoMoreLinkClick = true;
                    }

                    if (array[i].children && array[i].children.length > 0) {
                        selectedArray = selectedArray.concat(this._nestedLoop(array[i].children, array[i].id));
                    }
                }
            }

            return selectedArray;
        },
        // 设置初始化时选中哪些标签
        _initSelected: function () {
            for (var i = 0; i < this._vm.filterIds().length; i++) {
                $("a[data-id='" + ko.utils.unwrapObservable(this._vm.filterIds()[i].selectedId) + "']").addClass('active').siblings().removeClass('active');
            }

            // 数据绑定完成后引发一次点击事件
            if(this.options.catalogIds && this.options.catalogIds.length > 0)
                this._onItemClickHandler.call(this);

            if (this.needDoMoreLinkClick)
                $('.attr-more').click();
        },
        _initDomEvent: function () {
            // 显隐事件
            $(document).on('more_able', function (e, a, b) {
                $(".attr-values").each(function () {
                    var top = $(this).find("a:last").position().top;
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
        _onItemClickHandler: function () {
            this._trigger('itemClickHandler', null, this._ui());
        },
        _ui: function () {
            var result = [], array = this._vm.filterIds();
            for (var i = 0; i < array.length; i++) {
                var selectedId = ko.utils.unwrapObservable(array[i].selectedId);
                selectedId && result.push(selectedId);
            }

            return {ids: result};
        }
    });
})(jQuery);
