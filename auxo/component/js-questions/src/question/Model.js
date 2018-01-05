import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';
import {timeZoneTrans} from '../tz-trans';

/*
* params
* {
*   question,
*   options
* }
* -----
*   options
*   {
*     keyword,
*     is_publish_permit,
*     curr_user_id,
*     gw_host,
*     api_host,
*     on_del_command,
*     on_edit_command,
*     on_title_command,
*     on_answer_submit_success,
*     on_unfollowed,
*     display_answers,
*     display_acts,
*     no_border
*   }
*
* */
function Model(params){
  const vm = this;
  const question = params.question;
  const options = {};
  $.extend(options, {
    keyword: ko.observable(''),
    curr_user_id: null,
    api_host: null,
    gw_host: null,
    on_del_command(){},
    on_edit_command(){},
    on_title_command(){},
    on_answer_submit_success(){},
    display_answers: true,
    display_edit: true,
    display_acts:true,
    no_border:false
  }, params.options);
  const i18nHelper = window.i18nHelper;
  const curr_user_id = options.curr_user_id;
  const gw_host = options.gw_host;
  const api_host = options.api_host;
  const on_answer_submit_success = options.on_answer_submit_success;
  const is_publish_permit = typeof options.is_publish_permit === 'undefined' ?  true : options.is_publish_permit;
  const on_unfollowed = options.on_unfollowed || function(){};
  const confirm_label = i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.confirm');
  const cancel_label = i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.cancel');
  const confirm_dlg_title = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.alert_title');
  let is_follow_loading = false;
  const store = {
    del(){
      return ajax(`${gw_host}/v1/questions/${question.id}`, {
        type: 'DELETE'
      })
    },
    toggle_follow(is_add){
      let method = is_add ? 'POST' : 'DELETE';
      return ajax(`${gw_host}/v1/questions/${question.id}/follow`, {
        type: method
      });
    }
  };

  question.accepted_answer_id = ko.observable(question.accepted_answer_id);
  vm.id = question.id;
  vm.user_icon = question.display_user.icon+'&defaultImage=1';
  vm.title = question.title;
  vm.keyword = options.keyword;
  vm.content = question.content || '';
  vm.user_name = question.display_user.display_name;
  vm.create_time = timeZoneTrans(question.create_time);
  vm.target_name = question.target_name;
  vm.answer_count = ko.observable(question.answer_count || 0);
  vm.follow_count = ko.observable(question.follow_count || 0);
  vm.is_current_user_follow = ko.observable(question.is_current_user_follow);
  vm.is_mine = curr_user_id == question.display_user.user_id;
  vm.show_answers = ko.observable(false);
  vm.display_answers = options.display_answers; // 是否可以点击展开回答
  vm.display_edit = options.display_edit; // 是否可以编辑
  vm.display_acts = options.display_acts; // 是否显示操作栏
  vm.no_border = options.no_border; // 是否显示底部边框
  vm.answers_list_params = {
    gw_host,
    api_host,
    is_publish_permit: typeof is_publish_permit === 'undefined' ? true : is_publish_permit,
    question,
    curr_user_id,
    is_mine: vm.is_mine,
    on_answer_success(){
      // 回答成功，回答数加1
      vm.answer_count(vm.answer_count()+1);
    },
    on_del_success(){
      // 删除成功，回答数减1
      vm.answer_count(vm.answer_count()-1);
    }
  };
  vm.image_preview_params = {
    images: question.attach_pictures || []
  };
  vm.post_answer_params = {
    question,
    is_publish_permit,
    gw_host,
    api_host,
    on_submit_success:on_answer_submit_success
  };
  vm.follow_label = ko.pureComputed(function(){
    let key;
    key = this.is_current_user_follow() ? 'followed' : 'not_follow';
    return i18nHelper.getKeyValue(`qas_cmp_questions.${key}`);
  }, vm);

  vm.toggle_answers = toggle_answers;
  vm.del = del;
  vm.edit = edit;
  vm.view_detail = view_detail;
  vm.toggle_follow = toggle_follow;

  /*展开/收起回答列表*/
  function toggle_answers(){
    vm.show_answers(!vm.show_answers());
  }

  /*删除回答*/
  function del(){
    let msg;
    if(vm.answer_count() > 0){
      msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.has_answer');
    }else{
      msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.no_answer')
    }
    $.fn.udialog.confirm(msg, [{
      'class':'ui-btn-confirm',
      text: confirm_label,
      click(){
          store.del().then(()=>{
            options.on_del_command(question.id);
          });
        $(this).udialog("hide");
      }
    },{
      'class':'ui-btn-primary',
      text:cancel_label,
      click(){
        $(this).udialog("hide");
      }
    }], {
      title: confirm_dlg_title
    });
  }

  /*编辑*/
  function edit(){
    options.on_edit_command(question.id);
  }

  /*查看问题详情*/
  function view_detail(){
    options.on_title_command(question.id);
  }

  /*切换关注*/
  function toggle_follow(){
    if(is_follow_loading){return;}
    let is_followed = vm.is_current_user_follow();
    if(is_followed){
      // 如果当前已关注，则询问是否要取消
      let msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.unfollow_confirm');
      $.fn.udialog.confirm(msg, [{
        'class':'ui-btn-confirm',
        text: confirm_label,
        click(){
          $(this).udialog("hide");
          is_follow_loading = true;
          store.toggle_follow(false)
            .then(()=>{
              vm.is_current_user_follow(false);
              vm.follow_count(vm.follow_count()-1);
              on_unfollowed(question);
            })
            .always(()=>{
              is_follow_loading = false;
            });
        }
      },{
        'class':'ui-btn-primary',
        text:cancel_label,
        click(){
          $(this).udialog("hide");
        }
      }], {title: confirm_dlg_title});
    }else{
      // 如果当前未关注，直接关注
      is_follow_loading = true;
      store.toggle_follow(true)
        .then(()=>{
          vm.is_current_user_follow(true);
          vm.follow_count(vm.follow_count()+1);
        })
        .always(()=>{
          is_follow_loading = false;
        });
    }

  }
}

export {Model};