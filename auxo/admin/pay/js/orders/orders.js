(function(){
  function Model(){
    var vm = this;
    var pay_gw_host = window.pay_gw_host;
    var project_code = window.projectCode;
    var org_id = window.org_id;
    var ucs_ava_path = window.ucs_ava_path;
    var oc2_gw_host = window.oc2_gw_host;
    var page_size = 10;
    var store = {
      get_orders: function(query){
        return $.ajax({
          url: pay_gw_host + '/v1/orders/search',
          data: query
        });
      }
    };


    vm.selected_users = ko.observableArray([]);
    vm.uTreeOpts = {
      readonly:false,
      orgId: org_id,
      selectedList: vm.selected_users,
      config: {
        projectCode: project_code,
        host: oc2_gw_host,
        userHost: '',
        version: 'v1',
        userVersion: 'v0.93',
        initData: null,
        avatarPath: ucs_ava_path,
        isRadio: true
      }
    };
    vm.start_pay_time = ko.observable();
    vm.end_pay_time = ko.observable();
    vm.order_id = ko.observable();
    vm.page_num = ko.observable(1);
    vm.list = ko.observableArray([]);
    vm.income_stats = ko.observableArray([]);
    vm.export_url = ko.observable('javascript:;');

    vm.remove_user = remove_user;
    vm.show_users_tree = show_users_tree;
    vm.get_orders = get_orders;

    init_date_picker();
    get_orders(0);

    function get_orders(page_no){
      var query = get_query(page_no);
      store.get_orders(query)
        .pipe(function(res){
          // 导出URL
          set_export_url(query);
          vm.page_num(page_no);

          $.each(res.items, function(i, item){
            item.seq_num = page_size * vm.page_num()-1 + i + 2;
            item.pay_time = item.pay_time ? timeZoneTrans(item.pay_time) : '';
          });

          vm.list(res.items);
          vm.income_stats(res.amount_type_sums);

          // 分页
          $('#pagination').pagination(res.total, {
            items_per_page: page_size,
            num_display_entries: 5,
            current_page: vm.page_num(),
            is_show_total: true,
            is_show_input: true,
            pageClass: 'pagination-box',
            prev_text: '上一页',
            next_text: '下一页',
            callback: function(page_id) {
              if (page_id !== vm.page_num()) {
                get_orders(page_id);
              }
            }
          });

        });
    }

    function set_export_url(query){
      var clone = $.extend(true, query, {
        project_code: project_code
      });
      var search = $.param(clone, true);
      vm.export_url(pay_gw_host + '/v1/admin/orders/search/export?' + search);
    }

    function get_query(page_no){
      var start_pay_time = vm.start_pay_time();
      var end_pay_time = vm.end_pay_time();
      var order_id = vm.order_id();
      var user = vm.selected_users()[0];
      var query = {
        user_id: user ? user.user_id : undefined,
        order_no: order_id || undefined,
        start_pay_time: start_pay_time,
        page: page_no,
        size: page_size,
        status: 1
      };

      if(end_pay_time){
        end_pay_time += ' 23:59:59';
      }
      query.end_pay_time = end_pay_time;
      return query;
    }

    function init_date_picker(){
      var el_start = $('#start_pay_time');
      var el_end = $('#end_pay_time');

      $('.datepicker_js').datetimepicker({
        autoclose: true,
        clearBtn: true,
        format: 'yyyy-mm-dd',
        minView: 2,
        todayHighlight: 1,
        language: 'zh-CN',
        minuteStep: 10
      });
      // 搜索时间规则
      el_start.on('changeDate', function (e) {
        el_start.datetimepicker('setStartDate', e.date);
      });
      el_end.on('changeDate', function (e) {
        el_end.datetimepicker('setEndDate', e.date);
      });
    }

    function show_users_tree(){
      $('#js-userTreeModal').modal('show');
    }

    function remove_user(){
      vm.selected_users([]);
    }

  }


  ko.applyBindings(new Model(), document.body);
})();