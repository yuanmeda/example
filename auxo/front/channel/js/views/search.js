(function ($, window) {
    var _getKeyValue = i18nHelper.getKeyValue;
    var store = {
        query: function (data) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + '/channels/resources/actions/find',
                type: 'POST',
                data: JSON.stringify(data)
            })
        }
    };

    var viewModel = {
        model: {
            search: {
                "name": keyword,//keyword
                "channel_id": 0,
                "page_no": 0,
                "page_size": 5,
                "name_query_type": 2
            },
            tabs: [],
            channels: [],
            stages: {
                '$PRIMARY': '小学',
                '$MIDDLE': '初中',
                '$HIGH': '高中'
            },
            sendingAjax: false
        },
        init: function () {
            document.title = _getKeyValue('channel.search.result');
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('searchPage'));
            window.model = this.model;
            this.model.sendingAjax(true);
            store.query(ko.mapping.toJS(t.model.search)).done(function (data) {
                t.format(data);
                t.formatData(data);
                t.model.channels(data);
            }).always(function () {
                t.model.sendingAjax(false);
                t.lazyloader();
            });
        },
        focus: function ($data, event) {
            $(event.delegateTarget).prev().focus();
        },
        lazyloader: function () {
            $('.lazy-image:not(.loaded)').lazyload({
                placeholder: defaultImage,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
        },
        list: function () {
            var t = this;
            this.model.sendingAjax(true);
            store.query(ko.mapping.toJS(t.model.search)).done(function (data) {
                t.format(data);
                t.model.channels(data);
                if (t.model.search.channel_id())
                    t._page(data[0].page.total, t.model.search.page_no());
                else {
                    t.formatData(data);
                }
            }).always(function () {
                t.model.sendingAjax(false);
                t.lazyloader();
            });
        },
        format: function (data) {
            for (var i = 0; i < data.length; i++) {
                var channel = data[i];
                for (var j = 0; j < channel.page.items.length; j++) {
                    var item = channel.page.items[j];
                    item.title = this.highlightKey(item.title);
                    item.description = this.highlightKey(item.description);
                    item.cover_url = item.cover_url ? item.cover_url + (~item.cover.indexOf('CLOUD') ? '!m300x200.jpg' : '') : defaultImage;
                }
            }
        },
        formatData: function (data) {
            if (!this.model.search.channel_id()) {
                var tabs = [];
                var firstTab = {
                    "channel_id": 0,
                    "channel_name": "全部",
                    "count": 0
                };
                for (var i = 0; i < data.length; i++) {
                    var channel = data[i];
                    tabs.push({
                        "channel_id": channel.channel_id,
                        "channel_name": channel.channel_name,
                        "count": channel.page.total
                    });
                    firstTab.count += channel.page.total;
                }
                tabs.unshift(firstTab);
                this.model.tabs(tabs);
            }
        },
        search: function (cid) {
            this.model.search.channel_id(cid);
            this.model.search.page_no(0);
            if (cid)
                this.model.search.page_size(10);
            else
                this.model.search.page_size(5);

            this.list();
        },
        _page: function (totalCount, currentPage) {
            var _this = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: _this.model.search.page_size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        _this.model.search.page_no(page_id);
                        _this.list();
                    }
                }
            });
        },
        highlightKey: function (text) {
            if (!text) return '';
            var reg = /^[\u4e00-\u9fa5A-Za-z\d]{1,}$/g;
            var key = this.model.search.name();
            if (reg.test(key)) {
                var exp = new RegExp(key, 'g');
                for (var i = 0, len = text.length; i < len; i++) {
                    return this.htmlEscape(text).replace(exp, '<i>' + key + '</i>');
                }
            } else {
                return this.htmlEscape(text);
            }
        },
        htmlEscape: function (text) {
            return text.replace(/[<>"'&]/g, function (match, pos, originalText) {
                switch (match) {
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    case "&":
                        return "&amp;";
                    case "\"":
                    case "\'":
                        return "&quot;";
                }
            });
        },
        periodFormat: function (txt) {
            return txt != 0 ? (+txt).toFixed(2) : 0;
        },
        jump: function () {
            var href = window.commonUtils.formatUrl(RESOURCE_CONFIG_MAP[this.type].info_url, this),
                mac = Nova.getMacToB64(href);
            if (href) {
                if (!~href.indexOf('lecturer') && window.userInfo.user_id && mac) {
                    href += (~href.indexOf("?") ? "&" : "?") + '__mac=' + mac;
                }
                var w = window.open(href);
            }
        },
        getCount: function () {
            var channels = this.model.channels(), length = channels.length;

            if (length <= 0)
                return true;

            var count = 0;
            for (var i = 0; i < length; i++) {
                count += channels[i].page.total;
            }

            return count > 0 ? false : true;
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);