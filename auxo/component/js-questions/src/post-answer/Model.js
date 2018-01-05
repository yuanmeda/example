import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';

/*
* params
* {
*   question,
*   is_publish_permit,
*   gw_host,
*   api_host,
*   on_submit_success
* }
*
* */
function Model(params){
  const vm = this;
  const question = params.question;
  const is_publish_permit = typeof params.is_publish_permit === 'undefined' ?  true : params.is_publish_permit;
  const on_submit_success = params.on_submit_success || function(){};
  const gw_host = params.gw_host;
  const api_host = params.api_host;
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  const content_max = 2000;
  const store = {
    submit(data){
      return ajax(`${api_host}/v1/answers`, {
        type: 'POST',
        data: JSON.stringify(data)
      })
    }
  };


  vm.show_images_upload = ko.observable(false);
  vm.images = ko.observableArray([]);
  vm.re_content = ko.observable('');
  vm.valid = ko.observable();
  vm.submitting = ko.observable(false);
  vm.content_max = content_max;
  vm.image_upload_params = {
    api_url: api_host,
    attach_pictures: vm.images,
    is_show: vm.show_images_upload
  };

  vm.re_content.subscribe(subscribe_re_content);

  vm.submit = submit;
  vm.toggle_images_upload = toggle_images_upload;

  function subscribe_re_content(content){
    vm.valid($.trim(content).length > 0);
    if(content.length > content_max){
      vm.re_content(content.slice(0, content_max));
    }
  }
  function submit(){
    if(vm.submitting() || !vm.valid()){return;}
    // 如果不允许发表

    if(!is_publish_permit){
      const msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.unregister');
      const title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
      $.fn.udialog.alert(msg, {title});
      return;
    }

    let data = {
      question_id:question.id,
      content: $.trim(vm.re_content()),
      attach_pictures:vm.images()
    };

    store.submit(data)
      .pipe(()=>{
        // 弹窗提示
        const msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.answer_success');
        const confirm_label = getI18nKeyValue('qas_cmp_questions.dlg_btn.confirm');
        const title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
        $.fn.udialog.confirm(msg, [{
          text: confirm_label,
          'class':'ui-btn-confirm',
          click:function(){
            $(this).udialog("hide");
          }
        }], {
          title
        });
      })
      .pipe(()=>{
        // 重置
        vm.re_content('');
        vm.images([]);
        vm.show_images_upload(false);
        on_submit_success();
      })
      .always(()=>{
        // 重置
        vm.submitting(false);
      });
  }

  function toggle_images_upload(){
    vm.show_images_upload(!vm.show_images_upload());
  }

}

export {Model};