$(function(){
  var vm = {};
  var e_sales_srv_host = window.e_sales_srv_host;
  var e_sales_gw_host = window.e_sales_gw_host;
  var project_code = window.project_code;
  var page_size = 10;
  var page_num = 0;
  var store = {
    get_list: function(query){
      return $.ajax({
        url: e_sales_gw_host + '/v1/sales/actions/search',
        data: JSON.stringify(query),
        type: 'POST'
      });
    },
    online: function(sales_id){
      return $.ajax({
        url: e_sales_srv_host + '/v1/sales/'+sales_id+'/actions/online',
        type: 'PUT'
      });
    },
    offline: function(sales_id){
      return $.ajax({
        url: e_sales_srv_host + '/v1/sales/'+sales_id+'/actions/offline',
        type: 'PUT'
      });
    }
  };

  vm.list = ko.observableArray();
  vm.begin_time = ko.observable();
  vm.end_time = ko.observable();
  vm.keyword = ko.observable();
  vm.status = ko.observable();
  vm.create_url = e_sales_gw_host + '/' + project_code + '/admin/promotion/detail/editor';
  vm.on_search_click = on_search_click;
  vm.edit = edit;
  vm.publish = publish;
  vm.offline = offline;
  vm.on_keyword_enter = on_keyword_enter;

  vm.keyword.subscribe(function(v){
    if(typeof v === 'undefined'){return}
    if(v.length > 20){
      vm.keyword(v.slice(0,20));
    }
  });
  vm.status.subscribe(function(v){
    if(typeof v === 'undefined'){return}
    get_list();
  });

  init();

  function init(){
    // 复制
    var clipboard = new Clipboard('.copy');
    clipboard.on('success', function(e) {
      $.alert('已成功复制促销活动地址');
    });
    // 初始化datepicker
    var j_begin_time = $('#beginTime');
    var j_end_time = $('#endTime');
    $('.datetime').datetimepicker({
      autoclose: true,
      clearBtn: true,
      format: 'yyyy-mm-dd',
      minView: 2,
      todayHighlight: 1,
      language: 'zh-CN',
      minuteStep: 10
    });
    // 领用时间规则
    j_begin_time.on('changeDate', function (e) {
      j_end_time.datetimepicker('setStartDate', e.date);
    });
    j_end_time.on('changeDate', function (e) {
      j_begin_time.datetimepicker('setEndDate', e.date);
    });
    // 搜索列表
    get_list();
  }

  function get_list(){
    return store.get_list(get_query())
      .pipe(function(res){

        $.each(res.items, function(index, item){
          set_time_format(item, 'create_time');
          set_time_format(item, 'start_time');
          set_time_format(item, 'end_time');
          item.status_text = item.status ? '上线' : '下线';
          item.detail_view_url = e_sales_gw_host + '/' + project_code + '/admin/promotion/detail/view/' + item.sales_id;
          item.detail_edit_url = e_sales_gw_host + '/' + project_code + '/admin/promotion/detail/editor?sales_id=' + item.sales_id;
          item.event_url = e_sales_gw_host + '/' + project_code + '/sales/'+item.sales_id;
        });
        vm.list(res.items);
        // 分页
        $('#pagination').pagination(res.total, {
          items_per_page: page_size,
          num_display_entries: 5,
          current_page: page_num,
          is_show_total: true,
          is_show_input: true,
          pageClass: 'pagination-box',
          prev_text: '上一页',
          next_text: '下一页',
          callback: function(curr_page){
            if (page_num !== curr_page) {
              page_num = curr_page;
              get_list();
            }
          }
        });
      });

  }

  /*设置时间格式*/
  function set_time_format(data, field_name){
    data[field_name] = data[field_name] && timeZoneTrans(data[field_name]) || '';
  }

  /*获取查询条件*/
  function get_query(){
    var keyword = $.trim(vm.keyword());
    var status = vm.status();
    var begin_time = vm.begin_time();
    var end_time = vm.end_time();
    end_time && (end_time += 'T23:59:59');
    return {
      keyword: keyword || undefined,
      status: status || undefined,
      start: begin_time || undefined,
      end: end_time || undefined,
      offset: page_num*page_size,
      limit: page_size
    };
  }

  /*点击搜索*/
  function on_search_click(){
    page_num = 0;
    get_list();
  }

  /*编辑*/
  function edit(){
    window.location.assign(this.detail_edit_url);
  }

  /*上线*/
  function publish(){
    store.online(this.sales_id)
      .pipe(function(){
        return get_list();
      })
      .pipe(function(){
        $.alert('发布成功');
      });
  }

  /*下线*/
  function offline(){
    store.offline(this.sales_id)
      .pipe(function(){
        return get_list();
      })
      .pipe(function(){
        $.alert('下线成功');
      });
  }

  /*输入框按下回车*/
  function on_keyword_enter($data, e){
    if(e.which === 13){
      get_list();
    }
  }


  ko.applyBindings(vm, document.getElementById('boot'));
});