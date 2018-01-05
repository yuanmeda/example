import ko from 'knockout';
import $ from 'jquery';

export default function Model(params){
  const vm = this;
  const opc2_gw_host = params.opc2_gw_host;
  const opc2_api_host = params.opc2_api_host;
  const page_size = 20;
  const init_status = window.status || 1;
  let get_upload_courses_xhr;
  let get_upload_courses_stat_xhr;
  const store = {
    // 上传课程数统计
    get_upload_courses_stat(){
      return get_upload_courses_stat_xhr = $.ajax({
        url: `${opc2_gw_host}/v1/m/open_courses/stat`
      });
    },
    // 收益统计
    get_income_stat(){
      return $.ajax({
        url: `${opc2_api_host}/v1/m/open_courses/income/stat`
      });
    },
    get_upload_courses(size, page, status){
      return get_upload_courses_xhr = $.ajax({
        url: `${opc2_gw_host}/v1/m/open_courses`,
        data:{
          page,
          size,
          status
        }
      });
    }
  };

  vm.opc2_api_host = params.opc2_api_host;
  vm.classifies = [
    {
      name: 'audit_pass',
      status: 1
    },
    {
      name: 'disabled',
      status: 2
    },
    {
      name: 'auditing',
      status: 3
    },
    {
      name: 'audit_reject',
      status: 4
    },
    {
      name: 'un_upload',
      status: 5
    },
    {
      name: 'upload', // 全部
      status: 0
    }
  ];
  vm.is_loading = ko.observable(true);
  vm.is_list_loading = ko.observable(false);
  vm.getClassifyByStatus = getClassifyByStatus;
  vm.curr_classify = ko.observable(vm.getClassifyByStatus(init_status));
  vm.list = ko.observableArray([]);
  vm.courses_stat = ko.observable({});
  vm.income_stat = ko.observable({});
  vm.total_pages = ko.observable(-1);
  vm.page_no = ko.observable(0);
  vm.card_options = {
    
  };
  
  vm.change_tab = change_tab;
  vm.load_more = load_more;
  vm.go_upload = go_upload;

  get_courses_stat()
    .pipe(get_income_stat)
    .pipe(()=>{
      if(vm.courses_stat().upload_courses_stat === 0){
        return;
      }
      return get_courses(0, init_status);
    })
    .always(()=>{
      vm.is_loading(false);
    });


  function postMsgToParent() {
      var msg = {
          "type": "$resize",
          "data": {
            "width": document.documentElement.scrollWidth + 'px',
            "height": document.documentElement.scrollHeight + 'px'
          },
          "origin": location.host,
          "timestamp": +new Date()
      };
      window.parent.postMessage(JSON.stringify(msg), '*');
  }
  
  function getClassifyByStatus(status) {
      for(var i=0;i<vm.classifies.length;i++){
        if(status == vm.classifies[i].status){
          return vm.classifies[i];
        }
      }
  }

  function change_tab(classify){
    vm.curr_classify(classify);
    vm.list([]);
    get_courses(0, classify.status, true);
  }

  /*获取累计收益*/
  function get_income_stat(){
    return store.get_income_stat()
      .pipe(res=>{
        vm.income_stat(res);
      });
  }

  /*获取课程统计*/
  function get_courses_stat(){
    return store.get_upload_courses_stat()
      .pipe(res=>{
        vm.courses_stat(res);
      });
  }

  /*获取课程*/
  function get_courses(page, status, is_refresh_stat){
    get_upload_courses_xhr && get_upload_courses_xhr.abort();
    get_upload_courses_stat_xhr && get_upload_courses_stat_xhr.abort();
    vm.is_list_loading(true);
    let list;
    // 获取列表
    return store.get_upload_courses(page_size, page, status)
      .pipe(res=>{
        if(page > 0){
          list = vm.list().concat(res.items);
        }else{
          list = res.items;
        }
        vm.page_no(page);
        const total_pages = Math.ceil(res.total / page_size)-1;
        vm.total_pages(total_pages);
      })
      .pipe(()=>{
        // 获取统计数据
        if(!is_refresh_stat){return;}
        return get_courses_stat();
      })
      .pipe(()=>{
        vm.card_options.classify = vm.curr_classify();
        vm.list(list);
        setTimeout(function () {
            postMsgToParent();
        },200);
      })
      .always(()=>{
        vm.is_list_loading(false);
      });
  }

  /*分页*/
  function load_more(){
    get_courses(vm.page_no()+1, vm.curr_classify().status, true);
  }

  /*去上传*/
  function go_upload() {
      window.top.location.href = window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/course_upload?__return_url=' + window.__return_url;
  }
}