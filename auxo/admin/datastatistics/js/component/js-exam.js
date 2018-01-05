(function(window, $) {

    var modalTpl = '<div class="modal fade" id="js_exam_modal" tabindex="-1" role="dialog" aria-labelledby="js_exam_modal" aria-hidden="true">\
                      <div class="modal-dialog modal-lg" style="width:1045px;height:700px;">\
                        <div class="modal-content">\
                          <div class="modal-header">\
                            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
                            <h4 class="modal-title" id="js_exam_modal">选择测评</h4>\
                          </div>\
                          <div class="modal-body" style="padding:0">\
                            <iframe id="exam_iframe_js" width="1045px" height="700" style="border:0;"></iframe>\
                          </div>\
                          <div class="modal-footer">\
                            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>\
                            <button type="button" class="btn btn-primary modal_confirm_js">确定</button>\
                          </div>\
                        </div>\
                      </div>\
                    </div>';
    var store = {
        query: function(uri) {
            return $.ajax({
                url: uri
            });
        }
    };

    function ViewModel(params) {
        var _uriStr='/'+projectCode+'/exam_center/exam?options=true&cors=true';
        var _webPageUrl=$.trim(webPageUrl);
        this.__mac = Nova.getMacToB64(_webPageUrl+_uriStr);
        this.uri = _webPageUrl+_uriStr;
        this._initial = ko.observable(false);
        this.ids = params.ids;
        this.clear = params.clear;
        this.items = ko.observableArray([]);
        this.$$modal = null;
        this.$$exam = null;

        this.items.subscribe(function(items) {
            this.ids(items.map(function(item) {
                return item.id;
            }));
        }, this);
        this.clear.subscribe(function(flag) {
            if (flag) {
                this.items([]);
                this.clear(!flag);
            }
        }, this);
        this.itemsName = ko.computed(function() {
            return this.items().map(function(item) {
                return item.title;
            }).join(',');
        }, this);
        this._init();
    }
    ViewModel.prototype = {
        _init: function() {
            this._initEvent();
        },
        _initEvent: function() {
            $(window).off('message').on('message', this._receiveMessage.bind(this));
        },
        _receiveMessage: function(evt) {
            var data = null;
            try {
                var originalEvent = evt.originalEvent;
                data = JSON.parse(originalEvent.data);
                this['_' + data.type](data.data);
            } catch (e) {
                console.log(e.message);
            }
        },
        _setItems: function(data) {
            this.items(data.data.items);
            this.$$modal.modal('hide');
        },
        _getItems: function() {
            var msg = {
                "type": "setItems",
                "data": {
                    "event_type": "set_items",
                    "context_id": "",
                    "data": {
                        items: this.items()
                    }
                },
                "origin": location.host,
                "timestamp": +new Date()
            };
            this.$$exam[0].contentWindow.postMessage(JSON.stringify(msg), '*');
        },
        _openModal: function() {
            var vm = this;
            if (!this._initial()) {
                $(document.body).append($(modalTpl));
                $(document.body).on('click', '.modal_confirm_js', function() {
                    var msg = {
                        "type": "getItems",
                        "data": {
                            "event_type": "get_items",
                            "context_id": "",
                            "data": {}
                        },
                        "origin": location.host,
                        "timestamp": +new Date()
                    };
                    vm.$$exam[0].contentWindow.postMessage(JSON.stringify(msg), '*');
                });
                this.$$modal = $('#js_exam_modal');
                this.$$exam = $('#exam_iframe_js');
                this._initial(true);
                this.$$exam.attr('src', this.uri + '&__mac=' + this.__mac);
            } else {
                this.$$exam.attr('src', this.uri);
            }
            this.$$modal.modal('show');
        }
    };
    ko.components.register('x-statistics-exam', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                return new ViewModel(params);
            }
        },
        template: '<div class="form-group ml10">\
                        <label sr-only>选择测评</label>\
                        <input type="text" class="form-control" placeholder="选择测评 >" readonly data-bind="click:_openModal,value:itemsName"/>\
                    </div>'
    })
})(window, jQuery);
