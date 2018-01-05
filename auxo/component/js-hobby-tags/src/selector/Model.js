import ko from 'knockout';
import $ from 'jquery';
import {flatten_tags} from '../utils';

/*
* params
* {
*   *tag_srv_host,
*   *el_recommend_srv_host,
*   *user_id,
*   tags,
*   dlg_mode,
*   on_save_success
* }
*
* */
function Model(params){
  const vm = this;
  const user_id = params.user_id;
  const tag_srv_host = params.tag_srv_host;
  const el_recommend_srv_host = params.el_recommend_srv_host;
  const on_save_success = params.on_save_success || function(){}; // 保存成功的回调函数
  const tags_map = {};
  const custom_type = 'el-learning-unit';

  vm.dlg_mode = !!params.dlg_mode;
  vm.tags = ko.observableArray([]);
  vm.is_loading = ko.observable(true);
  vm.user_selected = ko.observableArray([]); // 数组
  vm.user_tags_labels = ko.pureComputed(function(){
    let labels = [];
    $.each(this.user_selected(), (i, selected)=>{
      labels.push(tags_map[selected].title);
    });
    return labels.join('、');
  }, vm);
  vm.is_fold = ko.observable(true);
  vm.user_tags_labels_display = ko.pureComputed(function(){
    let orig_str = vm.user_tags_labels();
    if(vm.is_fold()){
      let str = orig_str.slice(0, 200);
      return `${str}${str.length < orig_str.length ? '...' : ''}`;
    }
    return orig_str;
  }, vm);

  vm.toggle_tag = toggle_tag;
  vm.save_tags = save_tags;
  vm.toggle_fold = toggle_fold;

  get_all_tags()
    .pipe(res=>{
      if(!res){
        return $.Deferred().reject();
      }
      vm.tags(flatten_tags(res.children, tags_map));
      return get_user_tags()
    })
    .pipe(res=>{

      vm.user_selected(res.tag_ids);
      vm.is_loading(false);
    }, ()=>{
      vm.is_loading(false);
    });

  /*获取用户已选的标签*/
  function get_user_tags(){
    return $.get(`${el_recommend_srv_host}/v1/user_tags/${user_id}`, {type:0})
      .pipe(res=>{
        res = res || {};
        res.tag_ids = res.tag_ids || [];
        let tags = vm.tags();
        let list = [];
        $.each(res.tag_ids, (i, tag_id)=>{
          let found = find_tag(tags, tag_id);
          if(found){
            list.push(tag_id);
          }
        });
        res.tag_ids = list;
        return res;
      });
  }

  function find_tag(tags, id){
    let i = 0, ln = tags.length;
    for(;i<ln;i++){
      let lv1 = tags[i];
      let j = 0;
      for(;j<lv1.children.length;j++){
        let tag = lv1.children[j];
        if(tag.id === id){
          return tag;
        }
      }
    }
    return null;
  }

  /*保存已选标签*/
  function save_tags(){
    const tag_ids = vm.user_selected();
    $.ajax({
      url: `${el_recommend_srv_host}/v1/user_tags/${user_id}`,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify({
        tag_ids
      })
    })
      .then(res=>{
        if(!vm.dlg_mode){
          // 成功提示
          $.fn.udialog.alert(window.i18nHelper.getKeyValue('hobby_tags.save_success_tip_desc'), {
            title: window.i18nHelper.getKeyValue('hobby_tags.dlg_tip_title')
          });
        }else{
          on_save_success();
        }
      });
  }

  function get_all_tags(){
    if(params.tags){
      return $.Deferred().resolve(params.tags);
    }
    return $.get(`${tag_srv_host}/v2/tags/tree`, {custom_type})
  }

  /*切换标签选中状态*/
  function toggle_tag(data){
    let index =vm.user_selected().indexOf(data.id);
    if( index > -1){
      vm.user_selected.splice(index, 1);
    }else{
      vm.user_selected.push(data.id);
    }
  }

  function toggle_fold(is_fold){
    vm.is_fold(is_fold);
  }

}

export {Model};