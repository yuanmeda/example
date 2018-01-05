import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';

/**
 *
 * @param params
 * {
 *   is_publish_permit,
 *   question,
 *   curr_user_id,
 *   on_back_command,
 *   api_host,
 *   gw_host
 * }
 * @constructor
 */
function Model(params) {
  const vm = this;
  const curr_user_id = params.curr_user_id;
  const api_host = params.api_host;
  const gw_host = params.gw_host;
  const is_publish_permit = typeof params.is_publish_permit === 'undefined' ?  true : params.is_publish_permit;
  let get_question_xhr;
  const store = {
    get_question(){
      get_question_xhr = ajax(`${gw_host}/v1/questions/${params.question.id}`);
      return get_question_xhr;
    }
  };

  vm.is_loading = ko.observable(true);
  vm.question = ko.observable();
  vm.question_options = {
    gw_host,
    api_host,
    is_publish_permit,
    curr_user_id,
    on_del_command(id){},
    on_edit_command(question_id){},
    on_title_command(question_id){},
    on_answer_submit_success,
    display_answers:false,
    display_acts:false
  };
  vm.answers_params = ko.observable();

  vm.back = back;

  store.get_question()
    .pipe(res=>{
      vm.question(res);
      vm.answers_params({
        gw_host,
        api_host,
        question:res,
        curr_user_id,
        show_images:true
      })
    })
    .always(()=>{
      vm.is_loading(false);
    });

  function back(){
    get_question_xhr && get_question_xhr.abort();
    params.on_back_command();
  }

  function on_answer_submit_success(){
    vm.answers_params.valueHasMutated();
  }

}

export {Model}