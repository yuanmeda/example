(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

var template = "<div class=\"u-ui-mask\">\r\n  <div class=\"u-ui-pop pop-edit adjustPopPosition\">\r\n    <h3 class=\"pop-tit\"><span class=\"tit-left\" data-bind=\"translate:{key:'noteitemeditor.title'}\"></span>\r\n      <span class=\"pop-close\" data-bind=\"click:cancel\"></span></h3>\r\n    <div class=\"pop-content\">\r\n      <div class=\"u-ui-txta\" style=\"width:100%\">\r\n        <textarea class=\"txta u-layout-scroll\" style=\"width:100%;padding:0\" tabindex=\"5002\" data-bind=\"\r\n                   value:content, valueUpdate:'input',\r\n                   attr:{placeholder:place_holder_msg}\"></textarea>\r\n        <span class=\"words\" data-bind=\"text:remain() + '/' + max\" style=\"width: 100%;padding:0\"></span>\r\n      </div>\r\n    </div>\r\n    <div class=\"pop-footer\" style=\"bottom:30px\">\r\n\r\n\r\n      <!--ko if:report_count < 3-->\r\n      <!--ko if:!isFromExcerpt()-->\r\n      <label class=\"u-ui-check select\" data-bind=\"css:{select: is_open()}, click:toggleOpen\">\r\n        <input class=\"radio\" type=\"radio\"><!--ko translate:{key:'noteitemeditor.open'}--><!--/ko-->\r\n      </label>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:isFromExcerpt()-->\r\n      <span style=\"position: absolute;left: 25px;top: 29px\"><!--ko translate:{key:'noteitemeditor.from_excerpt'}--><!--/ko--></span>\r\n      <!--/ko-->\r\n      <!--/ko-->\r\n\r\n      <!--ko if:report_count > 3-->\r\n      <span style=\"position: absolute;left: 25px;top: 29px\"><!--ko translate:{key:'noteitemeditor.be_reported'}--><!--/ko--></span>\r\n      <!--/ko-->\r\n\r\n      <a class=\"u-ui-btn\" data-bind=\"click:submit,translate:{key:'noteitemeditor.confirm'}\">确定</a>\r\n      <a class=\"u-ui-btn ml10\" data-bind=\"click:cancel,translate:{key:'noteitemeditor.cancel'}\">取消</a>\r\n    </div>\r\n  </div>\r\n</div>";

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

function Model(params) {
  var note = params.note;
  var options = params.options;
  var apiHost = options.apiHost;
  var vm = this;
  var courseUrl = options.courseUrl;
  var apiUrlModifyNote = apiHost + '/v1/notes/' + note.id;

  vm.content = ko.observable(note.content);
  vm.is_open = ko.observable(note.is_open);
  vm.isFromExcerpt = ko.observable(!!note.excerpt_note_id);
  vm.max = 400;
  vm.report_count = note.report_count;
  vm.remain = ko.observable(vm.max - vm.content().length);
  vm.isSubmitting = ko.observable(false);
  vm.place_holder_msg = window.i18nHelper.getKeyValue('noteitemeditor.holder');

  vm.toggleOpen = toggleOpen;
  vm.submit = submit;
  vm.cancel = cancel;

  vm.content.subscribe(function (v) {
    vm.remain(vm.max - v.length);
    if (vm.remain() < 0) {
      vm.content(v.substring(0, vm.max));
    }
  });

  function toggleOpen() {
    vm.is_open(!vm.is_open());
  }

  function submit() {
    var content = $.trim(vm.content());
    if (content.length === 0) {
      window.alert('请填写笔记内容');
      return;
    }
    if (vm.isSubmitting()) {
      return;
    }
    vm.isSubmitting(true);
    var data = {
      content: content,
      target_id: note.target_id,
      target_name: note.target_name,
      is_open: vm.is_open()
    };
    data.biz_url = courseUrl + '/v1/business_courses/biz_data';
    ajax(apiUrlModifyNote, {
      type: 'PUT',
      data: JSON.stringify(data)
    }).then(function (newNote) {
      newNote.biz_data = note.biz_data;
      options.onSubmitSuccess(newNote);
      vm.isSubmitting(false);
    }, function () {
      vm.isSubmitting(false);
    });
  }

  function cancel() {
    options.onCancelCommand();
  }
}

ko.components.register("x-note-editor", {
  viewModel: Model,
  template: template
});

}(ko,$));
