import ko from 'knockout';
import $ from 'jquery';
import template from './template.html';
import {ajax} from './ajax';

/***
 *
 * @param params
 * {
 *   note,
 *   options
 * }
 * params.options
 * {
 *   apiHost,
 *   courseUrl
 * }
 * apiHost
 * onSubmitSuccess(newNote)
 * onCancelCommand()
 * @constructor
 */
function Model(params){
  let note = params.note;
  let options = params.options;
  const apiHost = options.apiHost;
  const vm = this;
  const courseUrl = options.courseUrl;
  const apiUrlModifyNote = `${apiHost}/v1/notes/${note.id}`; // 修改笔记接口

  vm.content = ko.observable(note.content);
  vm.is_open = ko.observable(note.is_open);
  vm.isFromExcerpt = ko.observable(!!note.excerpt_note_id); // 是否来自摘录
  vm.max = 400;
  vm.report_count = note.report_count;
  vm.remain = ko.observable(vm.max - vm.content().length);
  vm.isSubmitting = ko.observable(false);
  vm.place_holder_msg = window.i18nHelper.getKeyValue('noteitemeditor.holder');

  vm.toggleOpen = toggleOpen;
  vm.submit = submit;
  vm.cancel = cancel;

  vm.content.subscribe((v)=>{
    vm.remain(vm.max - v.length);
    if(vm.remain() < 0){
      vm.content(v.substring(0, vm.max));
    }
  });

  function toggleOpen(){
    vm.is_open(!vm.is_open());
  }

  function submit(){
    let content = $.trim(vm.content());
    if(content.length === 0){
      window.alert('请填写笔记内容');
      return;
    }
    if(vm.isSubmitting()){return;}
    vm.isSubmitting(true);
    const data = {
      content: content,
      target_id: note.target_id,
      target_name: note.target_name,
      is_open: vm.is_open()
    };
    data.biz_url = `${courseUrl}/v1/business_courses/biz_data`;
    ajax(apiUrlModifyNote, {
      type: 'PUT',
      data: JSON.stringify(data)
    })
      .then((newNote)=>{
        newNote.biz_data = note.biz_data;
        options.onSubmitSuccess(newNote);
        vm.isSubmitting(false);
      }, ()=>{
        vm.isSubmitting(false);
      });
  }

  function cancel(){
    options.onCancelCommand();
  }

}

ko.components.register("x-note-editor", {
  viewModel: Model,
  template: template
});