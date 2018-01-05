import $ from 'jquery';
import ko from 'knockout';
import {flatten_tags} from '../utils';

/**
 *
 * @param params
 * {
 *   tag_srv_host,
 *   el_recommend_srv_host,
 *   my_study_host,
 *   project_domain,
 *   user_id
 * }
 * @constructor
 */
function Model(params){
  const vm = this;
  const tag_srv_host = params.tag_srv_host;
  const el_recommend_srv_host = params.el_recommend_srv_host;
  const user_id = params.user_id;
  const custom_type = 'el-learning-unit';
  const project_domain = params.project_domain;

  vm.my_study_url = `${params.my_study_host}/${project_domain}/mystudy/user_center#my-hobby`;
  vm.is_loading = ko.observable(true);
  vm.has_tags = ko.observable();
  vm.show_selector = ko.observable(true);
  vm.show_success_dlg = ko.observable(false);
  vm.params = {
    tag_srv_host,
    user_id,
    el_recommend_srv_host,
    dlg_mode:true,
    on_save_success
  };

  vm.close_selector = close_selector;
  vm.close_success_dlg = close_success_dlg;

  get_all_tags()
    .then(res=>{
       vm.params.tags = res;
       vm.has_tags(has_tags(res));
       vm.is_loading(false);
    });

  function get_all_tags(){
    return $.get(`${tag_srv_host}/v2/tags/tree`, {custom_type})
  }

  /*直接关闭选择窗口，需要更新状态*/
  function close_selector(){
    vm.show_selector(false);
    update_guidance();
  }

  function close_success_dlg(){
    vm.show_success_dlg(false);
  }

  /*保存成功，需要更新状态*/
  function on_save_success(){
    vm.show_selector(false);
    vm.show_success_dlg(true);
    update_guidance();
  }

  /*更新状态*/
  function update_guidance(){
    return $.ajax({
      url: `${el_recommend_srv_host}/v1/user_guidances/${user_id}`,
      type: 'PUT',
      data: JSON.stringify({
        item_key: 'new_user',
        item_value: false
      })
    }).then(res=>{
      if(!window.localStorage){return;}
      window.localStorage.setItem(`IS_NEW_USER_${project_domain}_${user_id}`, JSON.stringify(false));
    });
  }

  function has_tags(res){
    if(!res){return false}
    if(!res.children){return false}
    if(res.children && !res.children.length){return false}
    // 防止重复添加元素
    let flatten = flatten_tags($.extend(true, [], res.children));
    let i = 0, ln = flatten.length;
    for(;i<ln;i++){
      let node = flatten[i];
      if(node.children && node.children.length){return true;}
    }
    return false;
  }


}

export {Model};