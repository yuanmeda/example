import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';
import {timeZoneTrans} from '../tz-trans';

/**
 *
 * @param params
 * {
 *   answer,
 *   options
 * }
 * -----
 *   options
 *   {
 *     is_publish_permit,
 *     question,
 *     api_host,
 *     gw_host,
 *     curr_user_id,
 *     on_del_command
 *   }
 * @constructor
 */
function Model(params){

  const vm = this;
  const answer = params.answer;
  const options = params.options;
  const question = options.question;
  const api_host = options.api_host;
  const gw_host = options.gw_host;
  const is_publish_permit = typeof options.is_publish_permit === 'undefined' ?  true : options.is_publish_permit;
  let is_toggle_like_loading = false;
  const store = {
    accept(is_accept){
      return ajax(`${api_host}/v1/answers/${answer.id}/actions/accept/${is_accept.toString()}`, {
        type: 'PUT'
      })
    },
    del(){
      return ajax(`${api_host}/v1/answers/${answer.id}`, {
        type:'DELETE'
      })
    },
    like(id, is_like){
      return ajax(`${gw_host}/v1/answers/${id}/like`, {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };

  vm.show_images = options.show_images || false;
  vm.user_icon = answer.display_user.icon+'&defaultImage=1';
  vm.like_count = ko.observable(answer.like_count || 0);
  vm.reply_count = ko.observable(answer.reply_count || 0);
  vm.is_current_user_like = ko.observable(answer.is_current_user_like || false);
  vm.pre_info = answer.display_user.display_name;
  vm.content = answer.content;
  vm.create_time = timeZoneTrans(answer.create_time);
  vm.has_accepted = ko.observable(!!answer.accepted);
  vm.show_pop_replies = ko.observable(false);
  vm.is_my_answer = options.curr_user_id == answer.display_user.user_id;
  vm.is_my_question = options.curr_user_id == ko.unwrap(question.display_user.user_id);
  vm.pop_replies_params = {
    is_publish_permit,
    answer,
    question,
    api_host,
    gw_host,
    is_my_answer: vm.is_my_answer,
    on_close_command(reply_add_count){
      vm.reply_count(vm.reply_count() + reply_add_count);
      vm.show_pop_replies(false);
    }
  };
  vm.image_preview_params = {
    images: answer.attach_pictures || []
  };

  vm.has_question_accepted = question.accepted_answer_id;
  vm.open_pop_replies = open_pop_replies;
  vm.accept_it = accept_it;
  vm.cancel_accept = cancel_accept;
  vm.del = del;
  vm.toggle_like = toggle_like;

  /*打开回复框*/
  function open_pop_replies(){
    vm.show_pop_replies(true);
  }

  /*采纳*/
  function accept_it(){
    store.accept(true)
      .then(()=>{
        vm.has_accepted(true);
        vm.has_question_accepted(answer.id);
      });
  }

  /*取消采纳*/
  function cancel_accept(){
    store.accept(false)
      .then(()=>{
        vm.has_accepted(false);
        vm.has_question_accepted(null);
      });
  }

  /*删除回答*/
  function del(){
    let title = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.alert_title');
    let confirm_label = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.confirm');
    let cancel_label = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.cancel');
    let msg = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_answer_confirm');
    if(vm.reply_count() > 0){
      msg = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.has_reply');
    }
    $.fn.udialog.confirm(msg, [{
      'class':'ui-btn-confirm',
      text: confirm_label,
      click(){
        store.del()
          .then(()=>{
            options.on_del_command(answer.id);
          });
        $(this).udialog("hide");
      }
    },{
      'class':'ui-btn-primary',
      text: cancel_label,
      click(){
        $(this).udialog("hide");
      }
    }], {
      title
    });
  }

  /*点赞*/
  function toggle_like(){
    if(is_toggle_like_loading){return;}
    is_toggle_like_loading = true;
    let target_like = !vm.is_current_user_like();
    store.like(answer.id, target_like)
      .then(()=>{
        let count;
        let curr_count = vm.like_count();
        vm.is_current_user_like(target_like);
        count = vm.is_current_user_like() ? curr_count + 1 : curr_count-1;
        vm.like_count(count);
      })
      .always(()=>{
        is_toggle_like_loading = false;
      });
  }
}

export {Model};