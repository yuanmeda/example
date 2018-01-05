import ko from 'knockout';
import {ajax} from '../ajax';
import {timeZoneTrans} from '../tz-trans';

function Model(params){
  const vm = this;
  const reply = params.reply;
  const options = params.options;
  const gw_host = options.gw_host;
  const reply_user = reply.reply_user_info;
  const reply_to_user = reply.reply_to_user_info;
  let is_toggle_like_loading = false;
  const store = {
    like(id, is_like){
      return ajax(`${gw_host}/v1/answers/${id}/like`, {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };
  const reply_label = window.i18nHelper.getKeyValue('qas_cmp_questions.acts.reply');

  vm.user_icon = reply.reply_user_info.icon+'&defaultImage=1';
  const reply_user_name = reply_user.display_name || reply_user.user_name || reply_user.nick_name || reply_user.nick_name_full || reply_user.nick_name_short;
  const reply_to_user_name = reply_to_user.display_name || reply_to_user.user_name || reply_to_user.nick_name || reply_to_user.nick_name_full || reply_to_user.nick_name_short;
  vm.pre_info = `${reply_user_name} ${reply_label}： ${reply_to_user_name}`;
  vm.content = reply.content;
  vm.update_time = timeZoneTrans(reply.update_time);
  vm.is_current_user_like = ko.observable(reply.is_current_user_like || false);
  vm.like_count = ko.observable(reply.like_count || 0);

  vm.toggle_like = toggle_like;

  function toggle_like(){
    if(is_toggle_like_loading){return;}
    is_toggle_like_loading = true;
    let target_like = !vm.is_current_user_like();
    store.like(reply.id, target_like)
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