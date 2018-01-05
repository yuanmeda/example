import {Model} from './Model';
import {SEvent} from './SEvent';
import tpl from './tpl.html';

const KS_Dialog = {
  confirm(settings = {}){
    const evt = new SEvent();
    create_dialog({
      title: settings.title,
      on_confirm(){
        evt.emit('confirm');
      },
      on_close(){
        evt.emit('cancel');
      }
    });
    return evt;
  },
  alert(){}
};

function create_dialog(settings={}){
  let params;
  let dialog_elm;
  let body_elm;
  let mask_elm;

  params = {
    title: settings.title,
    msg: settings.msg,
    msg_location: 'center',
    on_close(){
      mask_elm.remove();
      dialog_elm.remove();
      settings.on_close();
    },
    buttons: [
      {
        label: '确认',
        on_click(){
          mask_elm.remove();
          dialog_elm.remove();
          settings.on_confirm();
        }
      },
      {
        label: '取消',
        on_click(){
          mask_elm.remove();
          dialog_elm.remove();
          settings.on_close();
        }
      }
    ]
  };

  body_elm = $(document.body);
  mask_elm = $('<div class="ko-simple-dialog-mask"></div>');
  dialog_elm = $('<div class="ko-simple-dialog"><!--ko component:{name:"x-ko-simple-dialog", params:params}--><!--/ko--></div>');

  body_elm.append(mask_elm);
  body_elm.append(dialog_elm);

  ko.applyBindings({params}, dialog_elm[0]);
}

ko.components.register('x-ko-simple-dialog', {
  viewModel: Model,
  template: tpl
});

export default KS_Dialog;