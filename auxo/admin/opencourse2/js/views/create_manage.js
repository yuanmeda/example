;(function ($, window) {
    var viewModel = {
        model: {
            iframeUrl: ko.observable(''),
            resourceSource: ko.observable(window.resourceSource || 'new'),
            init: ko.observable(false),
        },
        init: function () {
            this.initMessage();
            this.formatIframeUrl();
            ko.applyBindings(this, document.getElementById('content'));
            this.model.init(!window.hasCreated);
        },
        switchTab: function (source) {
            this.model.resourceSource(source);
            this.formatIframeUrl();
        },
        hrefBack: function () {
            location.href = window.return_url;
        },
        initMessage: function () {
            var callbackList = {
                "RESOURCE_SAVE": $.proxy(function (data) {
                    this.saveSelect(data.items);
                }, this),
                "RESOURCE_CANCEL": $.proxy(function (data) {
                    this.goBack();
                }, this)
            };
            $(window).on('message', function (evt) {
                var rawData = void 0;
                try {
                    rawData = JSON.parse(evt.originalEvent.data)
                } catch (e) {
                }
                if (rawData) callbackList[rawData.action](rawData.data);
            });
        },
        saveSelect: function (items) {
            if (!items || !items.length) {
                location.href = return_url;
                return;
            }
            var ids = items.length ? '&id=' + ($.map(items, function (v) {
                return v.resource_id;
            }).join(',')) : '';
            location.href = return_url + ids;
        },
        goBack: function () {
            location.href = return_url;
        },
        formatIframeUrl: function () {
            var resourceSource = this.model.resourceSource();
            if (resourceSource == 'new') {
                var href = '/' + projectCode + '/admin/open_course/create_for_channel';
                if (href) {
                    href += (~href.indexOf("?") ? "&" : "?") + "context_id=" + window.contextId +'&business_type='+this.getQuery('business_type')+'&source=channel'+ "&return_url=" + encodeURIComponent(location.href.replace(/#(?!.+)/, '') + '#action=create');
                    this.model.iframeUrl(href);
                }
            } else if (resourceSource == 'resource-pool') {
                this.model.iframeUrl(window.portalWebpage + '/' + projectCode + '/resource/manage?mode=select&unit_type=opencourse_2');
            } else if (resourceSource == 'unit-course') {
                this.model.iframeUrl('/' + projectCode + '/admin/open_course/unit_course_manage?context_id=' + window.contextId);
            }
        },
        getQuery: function (key) {
            var query = {};
            if (location.search) {
                $.each(location.search.substring(1).split('&'), function (i, v) {
                    var key = v.split('=')[0], value = v.split('=')[1];
                    if (key in query) {
                        query[key] = [value].concat(query[key]);
                    } else {
                        query[key] = value;
                    }
                })
            }
            return query[key];
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);