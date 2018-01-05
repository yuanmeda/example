(function(){
  function Model(){
    var vm = this;
    var auxo_channel_api_host = window.auxo_channel_api_host;
    var auxo_pay_gw_host = window.auxo_pay_gw_host;
    var project_code = window.project_code;
    var page_size = 10;
    var store = {
      get_resources:function(query){
        return $.ajax({
          url: auxo_channel_api_host + '/v2/resources/actions/query',
          type: 'POST',
          data: JSON.stringify(query)
        });
      },
      get_income_stat:function(query){
        return $.ajax({
          url: auxo_channel_api_host + '/v2/resources/income/stat',
          type: 'POST',
          data: JSON.stringify(query)
        });
      }
    };

    vm.resource_name = ko.observable();
    vm.resource = ko.observable();
    vm.tag_ids = ko.observableArray();
    vm.channel = ko.observable();
    vm.list = ko.observableArray();
    vm.page_num = ko.observable(0);
    vm.total_income_stat = ko.observable({});
    vm.sources = [{
      value: '',
      title: '全部'
    }, {
      value: 'UGC',
      title: '用户上传'
    }];
    vm.export_url = ko.observable('javascript:;');
    vm.on_catalogs_received = on_catalogs_received;
    vm.search_resources = search_resources;
    vm.view_detail = view_detail;

    function on_catalogs_received(channel, tags){
      vm.channel(channel);
      vm.tag_ids(tags);
      search_resources(0);
    }

    function search_resources(page_no){
      var resource_name = $.trim(vm.resource_name());
      var resource = vm.resource();
      var tag_ids = vm.tag_ids();
      var channel = vm.channel();
      var query = {
        has_income: true,
        name: resource_name,
        name_query_type: 1,
        source: resource,
        page_size: page_size,
        page_no: page_no || 0,
        group_names:["channel_opencourse_2"]
      };
      if(channel){
        query.channel_id = channel.id;
      }
      if(tag_ids.length > 0){
        query.channel_tag_ids = tag_ids;
      }

      store.get_resources(query)
        .pipe(function(res){
          // 导出的URL
          set_exports_url(query);
          vm.page_num(page_no);
          // 添加序号
          $.each(res.items, function(i, item){
            item.seq_num = page_size * vm.page_num()-1 + i + 2;
          });
          vm.list(res.items);
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
                search_resources(page_id);
              }
            }
          });
        })
        .pipe(function(){
          var query = {
            name: resource_name,
            source: resource,
            has_income: true
          };
          if(channel){
            query.channel_id = channel.id;
          }
          if(tag_ids.length>0){
            query.channel_tag_ids = tag_ids;
          }
          return store.get_income_stat(query)
            .pipe(function(res){
              vm.total_income_stat(res);
            });
        });
    }

    function view_detail(resource){
      window.location.href = auxo_pay_gw_host + '/' + project_code + '/pay/units/' + resource.unit_id + '/orders'
    }

    function set_exports_url(query){
      var clone_query = $.extend(true, query, {
        project_code: project_code
      });
      var search = $.param(clone_query, true);
      console.log(search);
      vm.export_url(auxo_channel_api_host + '/v2/admin/resources/audits/export?' + search);
    }
  }

  ko.applyBindings(new Model(), document.body);
})();