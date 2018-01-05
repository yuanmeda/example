import ko from 'knockout';
import $ from 'jquery';
import default_cover from './default_cover.png';

/*
* params
* {
*   course,
*   options
*   {
*     classify
*   },
*   opc2_api_host
* }
* 
* */
export default function Model(params){
  const vm = this;
  const opc2_api_host = params.opc2_api_host;
  const course = params.course;
  const enabled = course.enabled;
  const audit_status = window.parseInt(course.life_cycle.audit_status, 10);
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  const classify = params.options.classify;
  const store = {
      // 删除公开课
      delete_course(){
          return $.ajax({
              url: `${opc2_api_host}/v1/opencourses/${course.unit_id}`,
              type: 'DELETE',
              cache: false
          });
      }
  };

  vm.title = course.title;
  vm.cover_url = (()=>{
    let cover_url = course.cover_url;
    // if(cover_url && course.cover.indexOf('CS') > -1){
    //   cover_url += '!m270x180.jpg';
    // }
    return cover_url ? cover_url : default_cover;
  })();
    vm.status = (()=>{
        let status;
        if(audit_status === 2 && enabled === true){
            // 审核通过：审核通过且课程发布
            status = 'audit_pass';
        }else if(audit_status === 2 && enabled === false){
            // 已下架：审核通过且课程禁用
            status = 'disabled';
        }else if(audit_status === 1){
            // 审核中：待审核
            status = 'auditing';
        }else if(audit_status === 3){
            // 审核不通过：审核驳回
            status = 'audit_reject';
        }else if(audit_status === 0){
            // 未上传：未提交审核
            status = 'un_upload';
        }
        return status;
    })();
  vm.operations = (()=>{
    //暂不支持删除功能
    // 操作对应：0 删除，1 编辑，2 上传
    // switch(vm.status){
    //   case 'disabled':
    //     return [0];
    //   case 'auditing':
    //     return [1];
    //   case 'audit_reject':
    //     return [1,0];
    //   case 'un_upload':
    //     return [1,0,2];
    // }
    switch(vm.status){
      case 'auditing':
          return [1];
      case 'audit_reject':
          return [1];
      case 'un_upload':
          return [1];
    }
    return [];
  })();
  function getPrice() {
      if(!course.commodity.is_free && course.commodity.price){
          for (var key in course.commodity.price) {
              return course.commodity.price[key];
          }
      }
      return 0;
  }
  vm.operation_names = [
    getI18nKeyValue('my_dcu.card.operation.del'), // 删除
    getI18nKeyValue('my_dcu.card.operation.edit'), // 编辑
    getI18nKeyValue('my_dcu.card.operation.upload') // 上传
  ];
  vm.show_stat_label = classify.name === 'upload';
  vm.extra = course.extra;
  vm.user_count = course.user_count;
  vm.is_free = course.commodity.is_free;
  vm.price = getPrice();
  vm.opinion = course.opinion || '';
  vm.operate = operate;
  vm.del = del;
  vm.hidePopDel = hidePopDel;
  vm.popDel = ko.observable(false);
  vm.linkToCourseDetail = linkToCourseDetail;
  
  function linkToCourseDetail($data) {
      var detailUrl = window.courseWebpage + '/' + window.projectCode + '/course/' + course.unit_id;
      var editUrl = window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/edit_course?course_id=' + course.unit_id + '&__return_url=' + window.__return_url;
      var nextPageUrl = detailUrl;
      switch($data.status){
          case 'audit_pass':
              nextPageUrl = detailUrl;
              break;
          case 'disabled':
              nextPageUrl = detailUrl;
              break;
          case 'auditing':
              nextPageUrl = editUrl;
              break;
          case 'audit_reject':
              nextPageUrl = editUrl;
              break;
          case 'un_upload':
              nextPageUrl = editUrl;
              break;
      }
      window.top.location.href = nextPageUrl;
  }

  function operate(type){
    // 操作对应：0 删除，1 编辑，2 上传
    switch(type){
      case 0:
        return popDel();
      case 1:
        return edit();
      case 2:
        return upload();
    }
  }


  function edit(){
      window.top.location.href = window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/edit_course?course_id=' + course.unit_id + '&__return_url=' + window.__return_url;
  }

  function popDel() {
      vm.popDel(true);
  }

  function hidePopDel() {
      vm.popDel(false);
  }

  function del(){
    store.delete_course()
      .pipe(res=>{
        vm.popDel(false);
    });
  }

  function upload(){
      window.top.location.href =  window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/course_upload?__return_url=' + window.__return_url;
  }
}