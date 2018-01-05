define("index", ["require", "exports"], function (require, exports, player) {
    var postbox = new ko.subscribable();
    ko.subscribable.fn.publishOn = function (topic) {
        this.subscribe(function (newValue) {
            window.console && console.log(topic);
            window.console && console.log(newValue);
            postbox.notifySubscribers(newValue, topic);
        });
        return this;
    };
    ko.subscribable.fn.subscribeTo = function (topic, callback, context) {
        postbox.subscribe(callback || this, context || null, topic);
        return this;
    };
    var ViewModel = {
        model: {
            initialData: ko.observable(null).publishOn('INITIAL_DATA'),
            ready: ko.observable({}),
            route: ko.observable('').subscribeTo('ROUTE', route)
        },
        init: function (video, doc) {
            this.model.ready.subscribeTo('COMPONENT_READY', this.ready, this);
            this.config = {
                'selfUrl': window.selfUrl,
                'projectCode': window.projectCode,
                'courseId': window.courseId,
                'userId': window.userId,
                'urls': {
                    'staticUrl': window.staticUrl,
                    'businessCourseGatewayUrl': window.businessCourseGatewayUrl,
                    'businessCourseServiceUrl': window.businessCourseServiceUrl,
                    'learningProgressServiceUrl': window.learningProgressServiceUrl,
                    // 'learningProgressServiceUrl': 'http://192.168.249.37:50718',
                    'noteServiceUrl': window.noteServiceUrl,
                    'noteGatewayUrl': window.noteGatewayUrl,
                    'assistServiceUrl': window.assistServiceUrl,
                    'assistGatewayUrl': window.assistGatewayUrl
                },
                'player': {
                    '0': {'plugin': video, 'instance': null},
                    '1': {'plugin': doc, 'instance': null}
                },
                'mac': userId && this.getMacConfig()
            };
            ko.applyBindings(this, document.getElementById('container'));
        },
        getMacConfig: function () {
            var gmac = JSON.parse(base64_decode(window.G_CONFIG));

            function cookie(key) {
                var cookies = document.cookie ? document.cookie.split(';') : [],
                    result = void 0,
                    len = cookies.length;
                for (var i = 0; i < len; i++) {
                    var parts = cookies[i].split('='),
                        name = decodeURIComponent(parts.shift()).replace(/^\s*|\s*$/g, '');
                    if (key == name) {
                        result = decodeURIComponent(String(parts.join('')));
                        break;
                    }
                }
                return result;
            }

            var umac = cookie(gmac.cookie_mac_key);
            return JSON.parse(base64_decode(umac));
        },
        ready: function (data) {
            var ready = this.model.ready;
            ready()[data.key] = data.value;
            if (data.call == 'refresh') this.initialData = {
                cata_type: '0',
                cata_id: '',
                resource_id: '',
                pos: undefined
            };
            if (!this.initialized && ready().main && ready().resource && ready().player) {
                if (this.initialData.cata_type == '0') {
                    if (ready().catalog) {
                        this.model.initialData(this.initialData);
                        this.initialized = true;
                    }
                } else {
                    if (ready().knowledge) {
                        this.model.initialData(this.initialData);
                        this.initialized = true;
                    }
                }
            }
        },
        run: function (cata_type, cata_id, resource_id, pos) {
            this.initialData = {
                cata_type: cata_id ? (cata_type || '0') : '0',
                cata_id: cata_id,
                resource_id: resource_id,
                pos: pos || undefined,
            };
        }
    };
    var app, firstRun = true;

    function route(r) {
        app.setLocation(r);
    }

    exports.init = function (video, doc) {
        app = $.sammy(function () {
            this.get(/#(?:\/cata_type\/([01])\/cata_id\/([\w\-]+)(?:\/resource_id\/([\w\-]+)(?:\/pos\/(.+))?)?)?/, function () {
                if (firstRun) {
                    firstRun = false;
                    window.console && console.log(this.params['splat']);
                    var m = this.params['splat'], cata_type = m[0] || '0', cata_id = m[1], resource_id = m[2],
                        pos = m[3];
                    ViewModel.run(cata_type, cata_id, resource_id, pos);
                }
            });
        });
        ViewModel.init(video, doc);
        app.run("#/");
    };
});
