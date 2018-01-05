(function(){
  var vm = {};
  var certificate_business_host = window.certificate_business_host;
  var certificate_srv_host = window.certificate_srv_host;
  var certificate_gw_host = window.certificate_gw_host;
  var certificate_id = window.certificate_id;
  var certificate_type_id = window.certificate_type_id;
  var generate_status = window.generate_status;
  var project_code = window.project_code;
  var root_id = window.root_id;
  var node_id = window.node_id;
  var print_frame = document.getElementById('PrintCert');
  var jPagination = $('#pagination');
  var is_by_org = window.is_by_org;
  var page_size = 20;
  var curr_page = 0;
  var curr_user_certificate;
  var store = {
    get_list: function(query){
      var search;
      if(is_by_org){
        // 有组织
        return $.ajax({
          url: certificate_srv_host + '/v1/user_certificates/search',
          data: JSON.stringify(query),
          type: 'POST'
        })
      }else{
        // 无组织
        search = $.param(query, true);
        return $.ajax({
          url: certificate_srv_host + '/v1/user_certificates',
          data: search,
          type: 'GET'
        });
      }
    },
    generate_certs: function(certs){
      var ids = [];
      $.each(certs, function(idx, cert){
        ids.push({
          id:cert.id
        });
      });
      return $.ajax({
        url: certificate_srv_host + '/v1/user_certificates/generate',
        data: JSON.stringify(ids),
        type: 'POST'
      });
    },
    reject_cert: function(user_certificate_id, reason){
      return $.ajax({
        url: certificate_srv_host + '/v1/user_certificates/'+user_certificate_id+'/rejected',
        type: 'PUT',
        data: JSON.stringify({
          rejected_reason: reason
        })
      })
    },
    update_remark: function(remark, id){
      return $.ajax({
        url: certificate_srv_host + '/v1/user_certificates/remark',
        data: JSON.stringify({
          remark: remark,
          id: id
        }),
        type: 'POST'
      })
    },
    get_cert_view: function(user_id, certificate_id){
      return $.ajax({
        url: certificate_business_host + '/v1/user_certificates/view?' + $.param({
          user_id: user_id,
          certificate_id: certificate_id
        }),
        type: 'POST'
      })
    }
  };

  vm.is_by_org = is_by_org;
  vm.user_real_name = ko.observable();
  vm.user_id_card = ko.observable();
  vm.generate_status = ko.observable(generate_status);
  vm.begin_generate_time = ko.observable();
  vm.end_generate_time = ko.observable();
  vm.checked_list = ko.observableArray();
  vm.cert_number = ko.observable();
  vm.is_loading = ko.observable();
  vm.list = ko.observableArray();
  vm.total_count = ko.observable(0);
  vm.reject_reason = ko.observable();
  vm.reject_error = ko.observable();
  vm.remark = ko.observable();
  vm.remark_error = ko.observable();
  vm.remark_max = 50;
  vm.is_checked_all = ko.observable(false);
  vm.is_show_export_all = ko.observable();
  vm.has_un_generated = ko.observable();
  vm.un_generated_count = ko.observable();

  vm.on_search_click = on_search_click;
  vm.export_certificate = export_certificate;
  vm.generate_certificate = generate_certificate;
  vm.on_toggle_all = on_toggle_all;
  vm.reject_certificate = reject_certificate;
  vm.show_reject_modal = show_reject_modal;
  vm.on_toggle_item = on_toggle_item;
  vm.export_single_cert = export_single_cert;
  vm.print_single_cert = print_single_cert;
  vm.show_remark_modal = show_remark_modal;
  vm.submit_remark = submit_remark;

  init();

  function init(){
    print_frame.onload = function on_load(e){
      print_frame.contentWindow.print();
    };

    // 初始化datepicker
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
    $('#beginTime').on('changeDate', function (e) {
      $('#endTime').datetimepicker('setStartDate', e.date);
    });
    $('#endTime').on('changeDate', function (e) {
      $('#beginTime').datetimepicker('setEndDate', e.date);
    });

    get_list();
  }

  /*获取列表*/
  function get_list(){
    var query;
    query = get_query();
    return store.get_list(query)
      .pipe(function(res){
        var show_export_count = 0;
        var has_ungenerate_count = 0;
        // 数据处理
        $.each(res.items, function(idx, item){
          item.receive_time = item.receive_time && timeZoneTrans(item.receive_time) || '';
          item.generate_time = item.generate_time && timeZoneTrans(item.generate_time) || '';
          item.user_real_name = item.user_real_name || item.real_name;
          item.user_id_card = item.user_id_card || item.id_card;
          item.certificate_id = is_by_org ? item.certificate_id : certificate_id;
          item.remark = ko.observable(item.remark);
          var search = $.param({
            certificate_id: item.certificate_id,
            user_id: item.user_id
          });
          item.view_cert_info_url = certificate_gw_host + '/' + project_code + '/certificate/info?' + search;
          item.is_selected = ko.observable(false);
          // 是否可以导出
          if(item.generate_status === 1 || item.generate_status === 3){show_export_count++;}
          // 是否有未生成的
          if(item.generate_status === 0){ has_ungenerate_count++; }
        });
        vm.un_generated_count(has_ungenerate_count);
        vm.is_show_export_all(show_export_count>0);
        vm.has_un_generated(has_ungenerate_count>0);
        vm.list(res.items);
        vm.total_count(res.count);
        vm.is_checked_all(false);
        vm.checked_list([]);
        // 分页
        jPagination.pagination(res.count, {
          items_per_page: page_size,
          num_display_entries: 5,
          current_page: curr_page,
          is_show_total: true,
          is_show_input: true,
          pageClass: 'pagination-box',
          prev_text: '上一页',
          next_text: '下一页',
          callback: function(pageNum){
            if (pageNum !== curr_page) {
              curr_page = pageNum;
              get_list();
            }
          }
        });
      });
  }

  /*点击查询按扭*/
  function on_search_click(){
    curr_page = 0;
    get_list();
  }

  /*获取查询条件*/
  function get_query(){
    var query, end_time, begin_time, cert_number;
    var user_name = $.trim(vm.user_real_name()) || undefined;
    var id_card = $.trim(vm.user_id_card()) || undefined;
    var generate_status = vm.generate_status();
    begin_time = vm.begin_generate_time();
    end_time = vm.end_generate_time();
    cert_number = $.trim(vm.cert_number()) || undefined;
    if(typeof begin_time === 'string' && begin_time.length > 0){
      begin_time += 'T00:00:00';
    }
    if(typeof end_time === 'string' && end_time.length > 0){
      end_time += 'T23:59:00';
    }
    query = {
      size: page_size,
      page: curr_page
    };

    generate_status.length > 0 && (query.generate_statuses = [generate_status]);
    begin_time && (query.begin_generate_time = begin_time);
    end_time && (query.end_generate_time = end_time);
    if(!is_by_org){
      // 无组织
      cert_number && (query.certificate_number_fuzzy = cert_number);
      $.extend(query, {
        certificate_id: certificate_id,
        user_real_name_fuzzy: user_name,
        user_id_card_fuzzy: id_card
      });
    }else{
      // 有组织
      cert_number && (query.certificate_number = cert_number);
      $.extend(query, {
        certificate_type_id: certificate_type_id,
        root_id: root_id,
        node_id: node_id,
        user_name: user_name,
        id_card: id_card
      });
    }
    return query;
  }

  /*批量导出证书*/
  function export_certificate(){
    var query = get_query();
    // fix bug
    if(query.begin_generate_time){
      query.begin_generate_time = query.begin_generate_time.replace('T', ' ');
    }
    if(query.end_generate_time){
      query.end_generate_time = query.end_generate_time.replace('T', ' ');
    }
    var search = $.param(query, true);
    var path = is_by_org ?
      '/'+project_code+'/user_certificates/export/pdf/by_org' :
      '/'+project_code+'/user_certificates/export/pdf';
    window.open(certificate_gw_host + path + '?' + search);
  }

  /*生成证书*/
  function generate_certificate(cert){
    var message, certs;
    if(!$.isArray(cert)){
      // 单个生成
      certs = [cert];
      message = '确认生成为[<span style="color: red;">' + escape_html(cert.user_real_name) + '</span>]生成证书';
    }else{
      // 批量生成
      certs = cert;
      message = '确认生成共' + certs.length + '份证书';
    }
    $.confirm({
      title: '生成证书',
      content: message,
      buttons:{
        confirm: {
          text: '确认',
          btnClass: 'btn-primary',
          action: function(){
            store.generate_certs(certs)
              .pipe(function(){
                return get_list();
              })
              .pipe(function(){
                $.alert('成功生成证书');
              });
          }
        },
        cancel:{
          text: '取消',
          action: $.noop
        }
      }
    });
  }

  function escape_html(str){
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /*切换勾选所有*/
  function on_toggle_all(data, event){
    var checked = event.target.checked;
    vm.is_checked_all(checked);
    var list = [];
    $.each(vm.list(), function(idx, cert){
      if(cert.generate_status === 0){
        cert.is_selected(checked);
        if(checked){
          list.push(cert);
        }
      }
    });
    vm.checked_list(list);
  }

  /*切换勾选单个*/
  function on_toggle_item(cert, event){
    var checked = event.target.checked;
    if(checked){
      vm.checked_list.push($.extend(true, {}, cert));
    }else{
      vm.checked_list.splice(vm.checked_list.indexOf(cert), 1);
    }
    var checked_ln = vm.checked_list().length;
    cert.is_selected(checked);
    vm.is_checked_all(checked_ln === vm.un_generated_count());
  }

  /*驳回*/
  function reject_certificate(){
    var reason = $.trim(vm.reject_reason());
    var is_valid = true;
    if(reason.length === 0){
      is_valid = false;
      vm.reject_error('请填写驳回理由');
    }
    if(!is_valid){return;}
    store.reject_cert(curr_user_certificate.id, reason)
      .pipe(function(){
        return get_list();
      })
      .pipe(function () {
        vm.reject_error('');
        vm.reject_reason('');
        $('#rejectModal').modal('hide');
        $.alert('驳回成功');
      });
  }

  /*弹出驳回窗口*/
  function show_reject_modal(user_certificate){
    curr_user_certificate = user_certificate;
    vm.reject_reason('');
    vm.reject_error('');
    $('#rejectModal').modal('show');
  }

  /*导出单个证书*/
  function export_single_cert(){
    var cert = this;
    var path = '/'+project_code+'/user_certificates/'+cert.certificate_id+'/users/'+cert.user_id+'/export/pdf';
    window.open(certificate_gw_host + path);
  }

  /*打印单个证书*/
  function print_single_cert(){
    var cert = this;
    var content_window = print_frame.contentWindow;
    var content_doc = content_window.document;
    store.get_cert_view(cert.user_id, cert.certificate_id)
      .then(function(res){
        print_frame.src = 'javascript:void('+Date.now()+');';
        content_doc.open();
        content_doc.write(res.content);
        content_doc.close();
      });
  }

  /*弹出备注窗口*/
  function show_remark_modal(){
    curr_user_certificate = this;
    vm.remark_error('');
    vm.remark(curr_user_certificate.remark());
    $('#remarkModal').modal('show');
  }

  /*提交备注*/
  function submit_remark(){
    var remark = vm.remark() || '';
    if(remark.length > vm.remark_max){
      vm.remark_error('备注不能超过'+vm.remark_max+'个字符');
      return;
    }
    remark = $.trim(remark);
    store.update_remark(remark, curr_user_certificate.id)
      .pipe(function(){
        curr_user_certificate.remark(remark);
        $.alert('成功编辑备注');
        $('#remarkModal').modal('hide');
      })
  }




  ko.applyBindings(vm, document.getElementById('boot'));
})();