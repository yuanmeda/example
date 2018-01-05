(function () {
    "use strict";
    var _ = ko.utils;
    var store = {
        getResources: function (data) {
            return $.ajax({
                url: "/v1/resources",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
    };
    var viewModel = {
        model: {
            resource: {
                items: [],
                total: 0,
            },
            selectedResources: [],
            selectedIds: [],
            ids: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectedIds = ko.pureComputed(function () {
                return _.arrayMap(this.model.selectedResources(), function (item) {
                    return item.unit_id;
                })
            }, this);
            ko.applyBindings(this, document.getElementById('mainContent'));
            this._initMessage();
        },
        checkSelected: function ($data) {
            return ~this.model.selectedIds().indexOf($data.unit_id);
        },
        toggleSelected: function ($data) {
            var selectedResources = this.model.selectedResources, found = false;
            for (var i = 0; i < selectedResources().length; i++) {
                if (selectedResources()[i].unit_id == $data.unit_id) {
                    selectedResources.remove(selectedResources()[i]);
                    found = true;
                    break;
                }
            }
            if (!found) selectedResources.push($data);
        },
        _list: function () {
            var self = this, ids = this.model.ids();
            store.getResources(ids).done(function (data) {
                self.model.resource.items(data.items);
                $('#js-content .lazy-image:not(.loaded)').lazyload({
                    placeholder: defaultImage,
                    load: function () {
                        $(this).addClass('loaded');
                    }
                }).trigger('scroll');
            })
        },

        submitSelectedResource: function ($data, $event) {
            $event && $event.stopPropagation();
            var ids = $data ? [$data.unit_id] : this.model.selectedIds();
            var msg = {
                'action': 'PLATFORM_SUBMIT_RESOURCE_REMOVE',
                'data': {
                    'ids': ids
                },
                'origin': location.host,
                'timestamp': +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        },
        _initMessage: function () {
            var callbackList = {
                "PLATFORM_FETCH_RESOURCE_CALLBACK": $.proxy(function (data) {
                    this.model.ids(data.ids);
                    this._list();
                }, this)
            };
            $(window).off('message').on('message', function (evt) {
                if (evt.originalEvent.data) {
                    var rawData = void 0;
                    try {
                        rawData = JSON.parse(evt.originalEvent.data)
                    } catch (e) {
                    }
                    if (rawData) callbackList[rawData.action](rawData.data);
                }
            })
            var msg = {
                "action": "PLATFORM_FETCH_RESOURCE",
                "data": {},
                "origin": location.host,
                "timestamp": +new Date()
            };
            if (window.parent !== window) window.parent.postMessage(JSON.stringify(msg), '*');
        },
        formatResourceType: function ($data) {
            var allGroupNames = window.allGroupNames || [];
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == $data.type)return allGroupNames[i].title;
        },
    };
    $(function () {
        viewModel.init();
    });
})();