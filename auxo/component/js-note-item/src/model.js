import ko from 'knockout';
import $ from 'jquery';
import {ajax} from './ajax';

function Model(params){
  let vm = this;
  let note = params.note;
  let options = params.options;
  let noteId = note.id;
  let biz_data;
  let resourceMap = {
    0: 'n-icon-video', // 视频
    1: 'n-icon-chapter', // 文档
    2: 'n-icon-topic', // 练习
  };
  $.extend(vm, {
    apiHost: null,
    gatewayHost: null,
    isLogin: false,
    userId: '',
    showExcerpt: false,
    showBlowing: false,
    showEdit: false,
    showDel: false,
    onEditCommand: function(){},
    onDelCommand: function(){}
  }, options);

  const curr_user_id = window.userId;
  const apiHost = options.apiHost;
  const apiUrlPraise = `${apiHost}/v1/notes/${noteId}/praise`; // 点赞接口
  const apiUrlExcerpts = `${apiHost}/v1/note_excerpts/${noteId}`; // 摘录接口


  if(note.biz_data && typeof note.biz_data === 'string'){
    try{
      biz_data = $.parseJSON(note.biz_data);
    }catch(e){
      console.error('biz_data格式非法');
    }
  }

  vm.apiHost = apiHost;
  vm.noteId = note.id;
  vm.content = ko.observable(note.content);
  vm.create_time = `${note.create_time.substr(0, 10)} ${note.create_time.substr(11, 5)}`; // 创建时间
  vm.is_open = ko.observable(note.is_open); // 是否公开
  vm.biz_data = biz_data || null; // 业务数据
  vm.praise_count = ko.observable(note.praise_count); // 点赞数
  vm.has_excerpted = ko.observable(note.has_excerpted); // 是否已摘录
  vm.has_praised = ko.observable(note.has_praised); // 是否点赞
  vm.has_reported = ko.observable(note.has_reported); // 是否已举报
  vm.showLoginTipDlg = ko.observable(false);// 是否显示登录提示
  vm.isFromExcerpt = ko.observable(!!note.excerpt_note_id); // 是否来自摘录
  vm.showBlowingDlg = ko.observable(false); // 是否显示举报弹窗
  vm.showBlowSuccessDlg = ko.observable(false);
  vm.user_id = ko.observable(note.user_id);
  vm.is_mine = curr_user_id == note.user_id;

  if(biz_data){
    vm.resourceClassName = resourceMap[biz_data.resource_type] || resourceMap[0];
  }

  vm.togglePraise = togglePraise; // 点赞/取消点赞
  vm.excerpt = excerpt; // 摘录
  vm.whistleBlowing = whistleBlowing; // 举报
  vm.del = del; // 删除
  vm.edit = edit; // 编辑
  vm.confirmToLogin = confirmToLogin; // 确定登录
  vm.cancelToLogin = cancelToLogin; // 取消登录
  vm.onBlowed = onBlowed; // 成功举报回调
  vm.onBlowCancel = onBlowCancel; // 取消举报
  vm.closeBlowSuccess = closeBlowSuccess;

  function edit(){
    vm.onEditCommand(params.note);
  }

  /*摘录*/
  function excerpt(){
    if(!checkLogin()){return;}
    ajax(apiUrlExcerpts, {
      type: 'POST'
    })
      .then(()=>{
        vm.has_excerpted(true);
        if(!vm.has_praised()){
          // 如果未点赞，自动点赞
          vm.has_praised(true);
          vm.praise_count(vm.praise_count() + 1);
        }
      });
  }

  /*举报*/
  function whistleBlowing(){
    if(!checkLogin()){return;}
    vm.showBlowingDlg(true);
  }

  function onBlowed(){
    vm.showBlowingDlg(false);
    vm.showBlowSuccessDlg(true);
    vm.has_reported(true);
  }

  function onBlowCancel(){
    vm.showBlowingDlg(false);
  }

  function closeBlowSuccess(){
    vm.showBlowSuccessDlg(false);
  }

  /*删除*/
  function del(){
    vm.onDelCommand(noteId);
  }

  /*点赞与撤销*/
  function togglePraise(){
    if(!checkLogin()){return;}
    if(vm.has_praised()){
      // 已点赞，取消
      ajax(apiUrlPraise, {
        type: 'DELETE'
      })
        .then(()=>{
          vm.praise_count(vm.praise_count()-1);
          vm.has_praised(false);
        });
    }else{
      // 未点赞，点赞
      addPraise();
    }
  }

  /*点赞*/
  function addPraise(){
    ajax(apiUrlPraise, {
      type: 'POST'
    })
      .then(()=>{
        vm.praise_count(vm.praise_count()+1);
        vm.has_praised(true);
      });
  }

  /*确认登录*/
  function confirmToLogin(){
    window.location.href = `${window.portal_web_url}/${projectCode}/account/login?returnurl=${encodeURIComponent(window.location.href)}`;
  }

  /*取消登录*/
  function cancelToLogin(){
    vm.showLoginTipDlg(false);
  }

  /*判断是否有登录，未登录则弹出提示窗口，并返回false*/
  function checkLogin(){
    if(!vm.isLogin){
      vm.showLoginTipDlg(true);
      return false;
    }
    return true;
  }

}

export {Model};