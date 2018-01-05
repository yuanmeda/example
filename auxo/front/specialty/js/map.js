(function () {
    'use strict';
    var store = {
        getMap: function (term_id) {
            return $.ajax({
                url:(window.selfUrl || '') + '/' + projectCode + '/specialty/plan/' + term_id + '/map_info',
                dataType: 'json',
                cache: false
            })
        },
        getLine: function (term_id) {
            return $.ajax({
                url:(window.selfUrl || '') + '/' + projectCode + '/specialty/plan/terms/' + term_id + '/learning_units_relation',
                dataType: 'json',
                cache: false
            })
        }
    };
    var _ = ko.utils;
    var ViewModel = {
        model: {
            map: {
                id: '',
                name: '',
                map_image_url: '',
                children: []
            },
            current: '',
            has_map: false,
            init: false,
            is_mobile: window.is_mobile || false,
            post_message: {
                key: 'specialty_course_map',
                data: {
                    width: 0,
                    height: 0
                }
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.getMapAndLineByTermId();
            ko.applyBindings(this, document.getElementById('js_special_map'));
        },
        getMapAndLineByTermId: function () {
            var t = this;
            $.when(store.getMap(window.term_id), store.getLine(window.term_id)).done(function (map, line) {
                var _map = map[0];
                _map.children = _map.children || [];
                if (_map.map_image_url) {
                    ko.mapping.fromJS(_map, {}, t.model.map);
                    t.lazy();
                } else {
                    var post = t.model.post_message;
                    post.data.width('850px');
                    post.data.height('450px');
                    t.postMsg(JSON.stringify(ko.mapping.toJS(post)));
                }
                t.model.init(true);
                t.model.has_map(!!_map.map_image_url);
                ko.tasks.schedule(function () {
                    t.linkLines(line[0] || []);
                });
            });
        },
        linkLines: function (connections) {
            jsPlumb.ready(function () {
                var instance = jsPlumb.getInstance({
                    Endpoint: ["Rectangle", {
                        cssClass: 'circle-endpoint'
                    }],
                    //HoverPaintStyle: {lineWidth: 2, strokeStyle: "#f28d18", fillStyle: '#f28d18', fill: '#f28d18'},
                    PaintStyle: {lineWidth: 2, strokeStyle: "#fff", outlineWidth: 4, outlineColor: "transparent"},
                    Connector: ["Flowchart", {
                        stub: [1, 16],
                        gap: 5,
                        cornerRadius: 8,
                        alwaysRespectStubs: true
                    }],
                    ConnectionOverlays: [
                        ["Arrow", {
                            location: 1,
                            id: "arrow",
                            length: 11,
                            foldback: 0.8,
                            width: 11
                        }]
                    ],
                    Container: "js_map"
                });

                instance.batch(function () {
                    $.each(connections, function (i, v) {
                        instance.connect({
                            source: v.source,
                            target: v.target,
                            anchor: ['Top', 'Right', 'Bottom', 'Left']
                        })
                    });
                });
                jsPlumb.fire("jsPlumbDemoLoaded", instance);
            });
        },
        load: function ($data, event) {
            var target = $(event.target), post_message = this.model.post_message.data;
            post_message.width(target.width() + 'px');
            post_message.height(target.height() + 'px');
            this.postMsg(JSON.stringify(ko.mapping.toJS(this.model.post_message)));
        },
        goToDetail: function ($data, event) {
            var data = ko.mapping.toJS($data);
            if (this.model.is_mobile()) {
                if (window.coursemap.jumpCmp) {
                    window.coursemap.jumpCmp(JSON.stringify(data));
                }
            } else {
                event.stopPropagation();
                if (!data.is_lock) {
                    this.postMsg(JSON.stringify({
                        key: 'specialty_course_map_click',
                        data: data
                    }));
                }
            }
        },
        postMsg: function (msg) {
            if (window.parent) {
                window.parent.postMessage(msg, '*')
            }
        },
        lazy: function () {
            $('.lazy-image:not(.loaded)').lazyload({
                placeholder: defaultImage,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
        },
        togglePopup: function (unit_id) {
            if (!this.model.is_mobile()) {
                this.model.current(unit_id);
            }
        }
    };
    $(function () {
        ViewModel.init();
    });
})();
