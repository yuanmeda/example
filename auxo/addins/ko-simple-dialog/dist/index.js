(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.KS_Dialog = factory());
}(this, (function () { 'use strict';

function Button(config) {
  this.label = config.label || '';
  this.is_primary = !!config.is_primary;
  this._on_click = config.on_click || function () {};
}

Button.prototype = {
  click: function click() {
    this._on_click();
  }
};

function Model(params) {
  var vm = this;
  var buttons = [];

  $.each(params.buttons, function (idx, btn_conf) {
    buttons.push(new Button(btn_conf));
  });

  vm.title = params.title || 'Tip';
  vm.msg = params.msg || '';
  vm.msg_location = params.msg_location || 'center';
  vm.cancel_command = params.on_close;
  vm.buttons = ko.observableArray(buttons);
}

function SEvent() {
  this.events = {};
}
SEvent.prototype = {
  on: function on(name, handler) {
    this.events[name] = handler;
    return this;
  },
  emit: function emit(name) {
    var handler = this.events[name];
    handler && handler();
  }
};

var tpl = "<div class=\"ksd-header\">\r\n  <h1 data-bind=\"text:title\"></h1>\r\n  <span class=\"ksd-close\" data-bind=\"click:cancel_command\"></span>\r\n</div>\r\n<div class=\"ksd-body\">\r\n  <div class=\"ksd-msg-center\" data-bind=\"text:msg\"></div>\r\n</div>\r\n<div class=\"ksd-footer\">\r\n  <!--ko foreach:buttons-->\r\n  <span data-bind=\"css:{'ksd-btn-confirm': is_primary, 'ksd-btn-cancel': !is_primary},click:click,text:label\"></span>\r\n  <!--/ko-->\r\n</div>";

var KS_Dialog = {
  confirm: function confirm() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var evt = new SEvent();
    create_dialog({
      title: settings.title,
      on_confirm: function on_confirm() {
        evt.emit('confirm');
      },
      on_close: function on_close() {
        evt.emit('cancel');
      }
    });
    return evt;
  },
  alert: function alert() {}
};

function create_dialog() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var params = void 0;
  var dialog_elm = void 0;
  var body_elm = void 0;
  var mask_elm = void 0;

  params = {
    title: settings.title,
    msg: settings.msg,
    msg_location: 'center',
    on_close: function on_close() {
      mask_elm.remove();
      dialog_elm.remove();
      settings.on_close();
    },

    buttons: [{
      label: '确认',
      on_click: function on_click() {
        mask_elm.remove();
        dialog_elm.remove();
        settings.on_confirm();
      }
    }, {
      label: '取消',
      on_click: function on_click() {
        mask_elm.remove();
        dialog_elm.remove();
        settings.on_close();
      }
    }]
  };

  body_elm = $(document.body);
  mask_elm = $('<div class="ko-simple-dialog-mask"></div>');
  dialog_elm = $('<div class="ko-simple-dialog"><!--ko component:{name:"x-ko-simple-dialog", params:params}--><!--/ko--></div>');

  body_elm.append(mask_elm);
  body_elm.append(dialog_elm);

  ko.applyBindings({ params: params }, dialog_elm[0]);
}

ko.components.register('x-ko-simple-dialog', {
  viewModel: Model,
  template: tpl
});

return KS_Dialog;

})));
