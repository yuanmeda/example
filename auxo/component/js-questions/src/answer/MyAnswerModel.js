import ko from 'knockout';
import $ from 'jquery';
import {timeZoneTrans} from '../tz-trans';
import {ajax} from '../ajax';

/**
 *
 * @param params
 * {
 *   my_answer,
 *   options
 * }
 * ----
 *   options
 *   {
 *     gw_host,
 *     on_question_title_command
 *   }
 * @constructor
 */
function MyAnswerModel(params){
  const vm = this;
  const answer = params.my_answer;
  const options = params.options;
  const question = answer.question_vo;
  const gw_host = options.gw_host;
  let is_toggle_like_loading = false;
  const store = {
    like(id, is_like){
      return ajax(`${gw_host}/v1/answers/${id}/like`, {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };

  vm.user_icon = answer.display_user.icon+'&defaultImage=1';
  vm.answer_content = answer.content;
  vm.answer_create_time = timeZoneTrans(answer.create_time);
  vm.question_title = question.title;
  vm.question_user_name = question.display_user.display_name;
  vm.question_create_time = timeZoneTrans(question.create_time);
  vm.question_target_name = question.target_name;
  vm.like_count = ko.observable(answer.like_count || 0);
  vm.is_current_user_like = ko.observable(answer.is_current_user_like || false);

  vm.view_detail = view_detail;
  vm.toggle_like = toggle_like;

  function view_detail(){
    options.on_question_title_command(question);
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

export {MyAnswerModel};