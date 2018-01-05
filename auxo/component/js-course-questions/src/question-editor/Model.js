import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';

/**
 *
 * @param params
 * {
 *   question,
 *   is_open_course_1,
 *   course_id,
 *   context_id,
 *   target_id,
 *   target_name,
 *   api_host,
 *   course_host,
 *   business_course_host,
 *   on_back_command,
 *   on_post_success,
 *   check_question
 * }
 * @constructor
 */
function Model(params){
  const vm = this;
  const api_host = params.api_host;
  const gw_host = params.gw_host;
  const business_course_host = params.business_course_host;
  const course_host = params.course_host;
  const context_id = params.context_id;
  const course_id = params.course_id;
  let question = params.question || null;
  const is_open_course_1 = params.is_open_course_1;
  const is_modify = !!question;
  const on_post_success = params.on_post_success || function(){};
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  let watch_title;
  let get_match_xhr;
  let get_match_tmo; // 标题自动匹配请求的timeout
  let get_question_xhr;
  const store = {
    upsert(url, method, data){
      return ajax(url, {
        type: method,
        data: JSON.stringify(data)
      });
    },
    get_match_list(keyword){
      return ajax(`${gw_host}/v2/questions/search`, {
        type: 'GET',
        data:{
          content: keyword,
          custom_id:course_id,
          page_no:0,
          page_size:10,
          type:5,
        }
      })
    },
    get_question(id){
      get_question_xhr = ajax(`${gw_host}/v1/questions/${id}`);
      return get_question_xhr;
    }
  };

  vm.is_loading_question = ko.observable(false);
  vm.max_title = 50;
  vm.max_content = 2000;
  vm.title_err_msg = ko.observable();
  vm.title = ko.observable();
  vm.title_has_focus = ko.observable(false);
  vm.content = ko.observable('');
  vm.content_has_focus = ko.observable(false);
  vm.match_enable = ko.observable(false);
  vm.match_list = ko.observableArray([]);
  vm.images = ko.observableArray([]);
  vm.show_images_upload = ko.observable(false);
  vm.submitting = ko.observable(false);
  vm.title_placeholder = window.i18nHelper.getKeyValue('qas_course_question.title_placeholder');
  vm.content_placeholder = window.i18nHelper.getKeyValue('qas_course_question.content_placeholder');
  vm.target_name = ko.computed(()=>{
    return params.target_name();
  });
  vm.target_id = ko.computed(()=>{
    return params.target_id();
  });
  vm.image_upload_params = {
    api_url: api_host,
    attach_pictures: vm.images,
    is_show: vm.show_images_upload
  };
  if(is_modify){
    vm.target_name = ko.observable(question.target_name);
    vm.target_id = ko.observable(question.target_id);
  }

  vm.back = back;
  vm.submit = submit;
  vm.check_question = params.check_question;
  vm.toggle_images_upload = toggle_images_upload;
  vm.on_title_focus = on_title_focus;
  vm.stop_propagation = stop_propagation;
  vm.dispose = dispose;

  watch_title = vm.title.subscribe(subscribe_title);
  vm.content.subscribe(subscribe_content);

  get_question()
    .then(()=>{
      subscribe_title(vm.title());
    })
    .always(()=>{
      vm.is_loading_question(false);
    });

  function get_question(){
    if(!is_modify){
      return $.Deferred().resolve();
    }else{
      vm.is_loading_question(true);
      return store.get_question(question.id)
        .then(res=>{
          question = res;
          vm.title(res.title);
          vm.content(res.content);
          vm.images(res.attach_pictures);
        });
    }
  }

  function subscribe_title(v){
    if(typeof v === 'undefined'){return;}
    const length = v.length;
    const max = vm.max_title;
    let err_msg;
    // title校验
    if(length > 0){
      err_msg = '';
    }else{
      err_msg = getI18nKeyValue('qas_course_question.title_err.empty');
    }
    vm.title_err_msg(err_msg);
    if (length > max) {
      vm.title(v.substr(0, max));
    }

    // 自动匹配
    if(vm.title_has_focus()){
      try{get_match_xhr.abort();}catch(e){}
      if(v.length > 0){
        // 有输入内容才开始匹配
        clearTimeout(get_match_tmo);
        get_match_tmo = setTimeout(()=>{
          // FIX BUG: 发起请求前使用最新的关键字
          let kw = vm.title();
          if(kw){
            get_match_xhr = store.get_match_list(kw)
              .then(res=>{
                vm.match_list(res.items);
              });
          }else{
            vm.match_list([]);
          }
        }, 500);
      }else{
        // 无输入直接清除
        vm.match_list([]);
      }
    }
  }

  function subscribe_content(v){
    const length = v.length;
    const max = vm.max_content;
    if (length > max) {
      vm.content(v.substr(0, max));
    }
  }

  function back(options = {}){
    params.on_back_command(options);
  }

  function submit(){
    if (vm.submitting()) {
      return;
    }

    let title = $.trim(vm.title());
    if(title.length === 0){
      vm.title_err_msg(getI18nKeyValue('qas_course_question.title_err.empty'));
      return;
    }else{
      vm.title_err_msg('');
    }

    let api_post_question = `${api_host}/v1/questions`;
    let method = 'POST';
    let target_name = vm.target_name();
    let target_id = vm.target_id();
    let biz_url, biz_param, biz_view;
    if(is_modify){
      api_post_question = `${api_post_question}/${question.id}`;
      method = 'PUT';
      biz_url = question.biz_url;
      biz_param = question.biz_url;
      biz_view = question.biz_view;
    }else{
      if(target_id === course_id){
        // 章节不传biz_param和biz_url
        biz_param =  JSON.stringify({
          course_id,
          resource_id:null,
          resource_type:null,
          location:null
        });
        biz_url = is_open_course_1 ? `${course_host}/v1/business_courses/biz_data` : `${business_course_host}/v1/business_courses/biz_data`;
      }
      biz_view = is_open_course_1 ? 'course_biz_view' : 'course2_biz_view';
    }
    let post_data = {
      title,
      content: $.trim(vm.content()),
      context_id,
      custom_id:course_id,
      target_name,
      target_id,
      biz_url,
      biz_param,
      biz_view,
      attach_pictures: vm.images()
    };

    vm.submitting(true);
    store.upsert(api_post_question, method, post_data)
      .then(() =>{
        let msg = getI18nKeyValue('qas_course_question.dlg_msg.post_question_success');
        let title = getI18nKeyValue('qas_course_question.dlg_msg.dlg_title');
        let tmo;
        let page_name = is_modify ? null : 'MY_QUESTION';
        $.fn.udialog.alert(msg, {
          closeTimes: 2000,
          title
        }, ()=>{
          back({page_name});
          on_post_success();
          window.clearTimeout(tmo);
        });

        // 自动隐藏后跳转
        tmo = window.setTimeout(()=>{
          back({page_name});
          on_post_success();
        }, 2000);
        watch_title.dispose();
        vm.title('');
        vm.content('');
      })
      .always(() =>{
        vm.submitting(false);
      });
  }

  function toggle_images_upload(){
    vm.show_images_upload(!vm.show_images_upload());
  }

  function on_title_focus(){
    vm.match_enable(true);
    const doc = $(document);
    doc.on('click.match', ()=>{
      vm.match_enable(false);
      doc.off('click.match');
    });
  }

  function stop_propagation(data, event){
    event.stopPropagation();
  }

  function dispose(){
    get_question_xhr && get_question_xhr.abort();
  }

}

export {Model}