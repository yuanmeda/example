import ko from 'knockout';
import {ajax} from './ajax';

const template = `
<div class="u-ui-mask" style="z-index:999999">
    <div class="u-ui-pop pop-report adjustPopPosition">
        <h3 class="pop-tit" style="width:100%;"><span class="tit-left">提示</span><span class="pop-close" data-bind="click:onCancelCommand"></span></h3>
        <div class="pop-content u-layout-scroll">
            <p class="tip">确定举报此篇笔记吗？</p>
            <!--笔记内容-->
            <div class="content" data-bind="text:noteContent"></div>
        </div>
        <div class="pop-footer">
            <a class="u-ui-btn" data-bind="click:onConfirmCommand">确定</a>
            <a class="u-ui-btn ml10" data-bind="click:onCancelCommand">取消</a>
        </div>
    </div>
</div>
`;

function Model(params){
  const vm = this;
  const noteId = params.noteId;
  const onBlowed = params.onBlowed;
  const onCanceled = params.onCanceled;
  const apiHost = params.apiHost;

  const apiUrlBlowing = `${apiHost}/v1/note_reports/${noteId}`; // 举报接口

  // ---举报原因
  const reasons = [
    {name: '垃圾广告', value: 1},
    {name: '反动信息', value: 2},
    {name: '色情信息', value: 3},
    {name: '暴力信息', value: 4},
    {name: '其他原因', value: 5}
  ];
  vm.reasons = ko.observableArray(reasons);
  vm.selectedReason = ko.observable(reasons[0]);
  // --end 举报原因

  vm.noteContent = params.noteContent;
  vm.isSubmitting = ko.observable(false);
  vm.onConfirmCommand = onConfirmCommand;
  vm.onCancelCommand = onCancelCommand;


  function onConfirmCommand(){
    if(vm.isSubmitting()){return;}
    vm.isSubmitting(true);
    ajax(apiUrlBlowing, {type: 'POST'})
      .then((resp)=>{
        onBlowed(resp);
        vm.isSubmitting(false);
      }, err=>{
        vm.isSubmitting(false);
      });
  }

  function onCancelCommand(){
    onCanceled();
  }
}

ko.components.register("x-note-blowing", {
  viewModel: Model,
  template: template
});