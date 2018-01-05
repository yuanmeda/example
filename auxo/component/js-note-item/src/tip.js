import ko from 'knockout';

const template = `
<div class="u-ui-mask">
  <div class="u-ui-pop adjustPopPosition">
    <h3 class="pop-tit" style="width:100%;">
      <span class="tit-left">提示</span>
      <span class="pop-close" data-bind="click:cancel"></span>
    </h3>
    <div class="pop-content">
      <p class="tip" data-bind="text:message"></p>
    </div>
    <div class="pop-footer">
      <!--ko if:showConfirm-->
      <a class="u-ui-btn on" data-bind="click:confirm">确定</a>
      <!--/ko-->
      <!--ko if:showCancel-->
      <a class="u-ui-btn ml10" data-bind="click:cancel">取消</a>
      <!--/ko-->
    </div>
  </div>
</div>
`;

function Model(params){
  let buttons = params.buttons || ['confirm', 'cancel'];
  const vm = this;
  const onConfirmCommand = params.onConfirmCommand;
  const onCancelCommand = params.onCancelCommand;

  vm.message = params.message;
  vm.confirm = confirm;
  vm.cancel = cancel;
  vm.showConfirm = buttons.indexOf('confirm') > -1;
  vm.showCancel = buttons.indexOf('cancel') > -1;

  function confirm(){
    onConfirmCommand();
  }

  function cancel(){
    onCancelCommand();
  }
}

ko.components.register("x-note-tip", {
  viewModel: Model,
  template: template
});