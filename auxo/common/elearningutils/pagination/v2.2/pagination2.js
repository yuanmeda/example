/**
 * Created by Lin Tao on 2016/1/15.
 */
(function ($) {
    var tmpl = '\
    <div class="pagination">\
        <div class="pagination-info" data-bind="visible: isShowTotal() || isShowMiniTotal(), css: { \'pull-left\': isShowTotal() || isShowMiniTotal() }">\
            <i data-bind="visible: isShowTotal(), text: $root.getFullTotalInfo()"></i>\
            <i data-bind="visible: isShowMiniTotal(), text: $root.getMiniTotalInfo()"></i>\
        </div>\
        <div class="pagination" data-bind="css: { \'pull-right\': isShowTotal() || isShowMiniTotal() }">\
            <!-- ko if: $root.currentPage() > 1 -->\
                <a data-bind="visible: isShowFirstLast() && $root.currentPage() > 1, text: i18n.firstPage(), click: $root.onFirstPageClick" class="first" href="javascript:void(0)"></a>\
                <a class="prev" data-bind="text: i18n.prevText(), click: $root.onPrevPageClick"></a>\
            <!-- /ko -->\
            <!-- ko if: $root.prevShowAlways() && $root.currentPage() <= 1 -->\
                <span class="prev" data-bind="text: i18n.prevText()"></span>\
            <!-- /ko -->\
            \
            <div data-bind="html: $root.getPageButtons()" style="display: inline;"></div>\
            \
            <!-- ko if: $root.currentPage() < $root.numPages() -->\
                <a href="javascript:void(0)" class="next" data-bind="text: i18n.nextText(), click: $root.onNextPageClick"></a>\
            <!-- /ko -->\
            <!-- ko if: $root.nextShowAlways() && ($root.currentPage() >= $root.numPages()) -->\
                <span class="next" data-bind="text: i18n.nextText()"></span>\
            <!-- /ko -->\
            \
            <!--ko if: $root.currentPage() < $root.numPages() -->\
                <a data-bind="visible: isShowFirstLast(), text: i18n.lastPage(), click: $root.onLastPageClick" class="last" href="javascript:void(0)"></a>\
            <!-- /ko -->\
            <div class="page-selector" data-bind="if: isShowInput() && itemsPer().length > 0">\
                <i data-bind="text: i18n.eachPageText()"></i>\
                <select data-bind="options: itemsPer"></select>\
                <i data-bind="text: i18n.itemText()"></i>\
            </div>\
            <div class="page-input" data-bind="visible: isShowInput()">\
                <i data-bind="text: i18n.navigateText()"></i>\
                <input type="text" maxlength="10" class="page-text">\
                <i data-bind="text: i18n.pageText() + \' \'"></i>\
                <input class="btn select-page-btn" type="button" data-bind="value: i18n.goText()">\
            </div>\
        </div>\
    </div>';

    $.widget("elearning.pagination", {
        options: {
            totalCount: 0,
            pageSize: 10,
            numDisplayEntries: 11,
            currentPage: 1,
            numEdgeEntries: 0,
            linkTo: "javascript:void(0)",
            prevShowAlways: true,
            nextShowAlways: true,
            renderer: "defaultRenderer",
            pageClass: "",
            showIfSinglePage: false,
            loadFirstPage: true,
            isShowFirstLast:false,
            isShowInput: false,
            isShowTotal: true,
            isShowMiniTotal: false, //迷你介绍 与is_show_total参数互斥
            itemsPer:[],
            i18n: {
                prevText: "上一页",
                nextText: "下一页",
                ellipseText: "...",
                fullInfo: '当前第 {{currentPage}} 页/共 {{totalPage}} 页，共有 {{totalCount}} 条记录',
                miniInfo: '第 {{currentPage}} / {{totalPage}} 页，共 {{totalCount}} 条',
                firstPage: '首页',
                lastPage: '尾页',
                itemText: '条',
                eachPageText: '每页',
                navigateText: '到第',
                goText: '跳转',
                pageText: '页'
            },
            preChangedHandler: function() {},
            pageChangedHander: function () {}
        },
        _init: function() {
            $(this.element).addClass(this.options.pageClass);
            this.options.currentPage = this.options.currentPage <= 1 ? 1 : this.options.currentPage;
            this._inner  = $(this.element).html(tmpl);

            this._vm = ko.mapping.fromJS(this.options);
            this._vm.numPages = function () {
                return Math.ceil((this.totalCount() == 0 ? 1 : this.totalCount()) / this.pageSize());
            };
            this._vm.getFullTotalInfo = function () {
                return window.toolUtils.stringExtend.stringFormat(this.i18n.fullInfo(), { currentPage: this.currentPage(), totalPage: this.numPages(), totalCount: this.totalCount() });
            };
            this._vm.getMiniTotalInfo = function () {
                return window.toolUtils.stringExtend.stringFormat(this.i18n.miniInfo(), { currentPage: this.currentPage(), totalPage: this.numPages(), totalCount: this.totalCount() });
            };
            this._vm.getPageArray = function () {
                var result = [];
                for(var i = 1; i <= this.numPages(); i++) {
                    result.push(i);
                }
                return result;
            };
            this._vm.getPageButtons = ko.computed(function () {
                var html = '';
                for(var i = 1; i <= this.numPages(); i++) {
                    if(i == this.currentPage())
                        html = html + '<span class="current">' + i + '</span>';
                    else
                        html = html + '<a href="javascript:void(0)">' + i + '</a>'
                }

                return html;
            }, this._vm);
            this._vm.onLastPageClick = function () {
                this.currentPage(this.numPages());
            };
            this._vm.onFirstPageClick = function () {
                this.currentPage(1);
            };
            this._vm.onPrevPageClick = function () {
                this.currentPage(this.currentPage() - 1);
            };
            this._vm.onNextPageClick = function () {
                this.currentPage(this.currentPage() + 1);
            };

            ko.applyBindings(this._vm, this._inner[0]);

            // 下拉框改变是自动设置pageSize
            $('select').change($.proxy(this._onPreChanged, this));
            this._vm.pageSize.subscribe($.proxy(this._onPageChanged, this));
            this._vm.currentPage.subscribe($.proxy(this._onPageChanged, this));
        },
        _onPreChanged: function () {
            var select = $('select'), selectValue = select.val();
            this._vm.pageSize(selectValue);

            this._trigger("preChangedHandler");
            this._onPageChanged();
        },
        _onPageChanged: function () {
            this._trigger("pageChangedHander", null, { currentPage: this._vm.currentPage() });
        }
    });
})(jQuery);
