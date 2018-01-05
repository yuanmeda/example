import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';

/*
* params
* {
*   question,
*   answer,
*   is_my_answer,
*   is_publish_permit,
*   question_id,
*   answer_to_id,
*   gw_host,
*   api_host,
*   on_close_command
* }
* */
function Model(params){
  const vm = this;
  const answer = params.answer;
  const question_id = params.question.id;
  const answer_to_id = answer.id;
  const gw_host = params.gw_host;
  const api_host = params.api_host;
  const is_publish_permit = typeof params.is_publish_permit === 'undefined' ?  true : params.is_publish_permit;
  const on_close_command = params.on_close_command;
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  const content_max = 500;
  const page_size = 5;
  const store = {
    get_replies(page_num){
      ajax(`${gw_host}/v1/replies/search`, {
        type: 'GET',
        data: {
          answer_to_id,
          page_no: page_num - 1,
          page_size
        }
      })
        .then(res =>{
          res.total = res.total || 0;
          vm.total_items(res.total);
          vm.total_pages(Math.ceil(res.total / page_size));
          if (page_num === 1) {
            vm.replies(res.items);
          } else {
            $.each(res.items, (idx, item) =>{
              vm.replies.push(item);
            });
          }
          vm.page_num(page_num);
        });
    },
    submit(data){
      return ajax(`${api_host}/v1/replies`, {
        type: 'POST',
        data
      })
    }
  };
  let reply_add_count = 0;

  vm.is_my_answer = params.is_my_answer;
  vm.replies = ko.observableArray([]);
  vm.total_items = ko.observable(0);
  vm.total_pages = ko.observable(0);
  vm.page_num = ko.observable(1);
  vm.valid = ko.observable(false);
  vm.re_content = ko.observable('');
  vm.content_max = content_max;
  vm.submitting = ko.observable(false);
  vm.place_holder = getI18nKeyValue('qas_cmp_questions.reply_placeholder');
  vm.reply_options = {
    api_host,
    gw_host
  };

  vm.submit = submit;
  vm.load_more = load_more;
  vm.close = close;

  vm.re_content.subscribe(subscribe_re_content);

  store.get_replies(vm.page_num());

  function submit(){
    if (!vm.valid() || vm.submitting()) {
      return;
    }
    // 如果不允许发表
    if(!is_publish_permit){
      let msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.unregister');
      let title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
      $.fn.udialog.alert(msg, {title});
      return;
    }
    vm.submitting(true);
    let data = JSON.stringify({
      content: $.trim(vm.re_content()),
      question_id,
      answer_to_id
    });
    store.submit(data)
      .pipe((res) =>{
        // 重新获取列表
        return store.get_replies(1);
      })
      .pipe(() =>{
        reply_add_count++;
        vm.re_content('');
      })
      .always(()=>{
        vm.submitting(false);
      });
  }


  function subscribe_re_content(content){
    vm.valid($.trim(content).length > 0);
    if (content.length > content_max) {
      vm.re_content(content.slice(0, content_max));
    }
  }

  function load_more(){
    vm.page_num(vm.page_num() + 1);
    store.get_replies(vm.page_num());
  }

  function close(){
    on_close_command(reply_add_count);
  }

}

export {Model};