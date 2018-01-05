import ko from 'knockout'
import tpl from './template.html'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            bannerUrl: bannerPicId ? csUrl + '/v0.1/download?dentryId=' + bannerPicId : '',
            filter: {
                page: ko.observable(0),
                limit: 20
            },
            sku: {
                items: ko.observableArray(),
                total: ko.observable(0)
            },
        };
        this.model.filter.offset = ko.pureComputed(() => {
            return this.model.filter.limit * this.model.filter.page();
        });
        this.store = {
            getSkuList: (data) => {
                return $.ajax({
                    url: `/v1/sales/${salesId}/sku/actions/page_query`,
                    dataType: 'json',
                    data: data,
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        this.pageQuery();
    }

    pageQuery() {
        var filter = ko.mapping.toJS(this.model.filter);
        filter.page = undefined;
        this.store.getSkuList(filter).done((res) => {
            this.model.sku.items(res.items);
            this.model.sku.total(res.total);
            $('.lazy-image:not(.loaded)').lazyload({
                placeholder: defaultResourceCover,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
            this.page();
        });
    }

    page() {
        var filter = this.model.filter;
        $("#pagination").pagination(this.model.sku.total(), {
            is_show_first_last: false,
            is_show_input: true,
            is_show_total: false,
            items_per_page: filter.limit,
            num_display_entries: 5,
            current_page: filter.page(),
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            callback: (index) => {
                if (index != filter.page()) {
                    filter.page(index);
                    this.pageQuery();
                }
            }
        })
    }

}

ko.components.register('x-sales-main', {
    viewModel: ViewModel,
    template: tpl
});