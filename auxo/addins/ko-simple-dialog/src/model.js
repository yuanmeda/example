import {Button} from './Button';

function Model(params){
  const vm = this;
  const buttons = [];

  $.each(params.buttons, (idx, btn_conf)=>{
    buttons.push(new Button(btn_conf));
  });

  vm.title = params.title || 'Tip';
  vm.msg = params.msg || '';
  vm.msg_location = params.msg_location || 'center';
  vm.cancel_command = params.on_close;
  vm.buttons = ko.observableArray(buttons);


}

export {Model};