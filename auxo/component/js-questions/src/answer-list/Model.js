import {ajax} from '../ajax';
import $ from 'jquery';
import ko from 'knockout';

/**
 *
 * @param params
 * {
 *   is_publish_permit,
 *   show_images,
 *   gw_host,
 *   api_host,
 *   question,
 *   curr_user_id,
 *   on_answer_success,
 *   on_del_success
 * }
 * @constructor
 */
function Model(params){
  const vm = this;
  const page_size = 5;
  const gw_host = params.gw_host;
  const api_host = params.api_host;
  const question = params.question;
  const on_answer_success = params.on_answer_success || function(){};
  const on_del_success = params.on_del_success || function(){};
  const question_id = question.id;
  const is_mine = params.is_mine;
  const curr_user_id = params.curr_user_id;
  const content_max = 2000;
  const is_publish_permit = typeof params.is_publish_permit === 'undefined' ?  true : params.is_publish_permit;
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  const api_get_answers = `${gw_host}/v1/answers/search`;
  const api_post_answer = `${api_host}/v1/answers`;
  let get_answers_xhr;

  vm.is_mine = is_mine;
  vm.list = ko.observableArray();
  vm.total = ko.observable(0);
  vm.page_num = ko.observable(1);
  vm.showPagination = ko.observable(false);
  vm.pagination_params = ko.observable();
  vm.valid = ko.observable(false);
  vm.submitting = ko.observable(false);
  vm.re_content = ko.observable();
  vm.answer_options = {
    is_publish_permit,
    gw_host,
    api_host,
    question,
    curr_user_id,
    show_images: params.show_images || false,
    on_del_command(answer_id){
      get_answers_xhr = get_answers(vm.page_num())
        .then(()=>{
          on_del_success(answer_id);
        })
    }
  };
  vm.post_answer_params = {
    question,
    is_publish_permit,
    gw_host,
    api_host,
    on_submit_success
  };

  vm.re_content.subscribe(subscribe_re_content);
  vm.dispose = dispose;

  get_answers(vm.page_num());

  function on_submit_success(){
    vm.page_num(1);
    on_answer_success();
    return get_answers(vm.page_num());
  }

  function get_answers(page_num){
    return ajax(api_get_answers, {
      type: 'GET',
      data:{
        question_id,
        page_no: page_num-1,
        page_size
      }
    })
      .then(res=>{
        vm.list(res.items || []);
        vm.total(res.total || 0);
        vm.pagination_params({
          curr_page:page_num,
          page_size:page_size,
          total:vm.total(),
          on_page_command: on_page_command
        });
        vm.page_num(page_num);
        vm.showPagination(true);
      });
  }

  function on_page_command(page){
    get_answers(page);
  }

  function subscribe_re_content(v){
    let content = $.trim(v);
    vm.valid(content.length > 0);
    if(content.length > content_max){
      vm.re_content(content.slice(0, content_max));
    }
  }

  function dispose(){
    get_answers_xhr && get_answers_xhr.abort();
  }
}

export {Model};