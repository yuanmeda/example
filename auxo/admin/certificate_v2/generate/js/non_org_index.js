(function(){
  var vm = {};
  var project_code = window.project_code;
  var certificate_srv_host = window.certificate_srv_host;
  var certificate_gw_host = window.certificate_gw_host;
  var cert_tree = window.tree;
  var page_size = 20;
  var curr_page = 0;
  var jPagination = $('#pagination');
  var store = {
    get_list: function(data){
      var url = certificate_srv_host + '/v1/user_certificates/stat';
      return $.ajax({
        url: url,
        data: data,
        type: 'GET'
      });
    }
  };

  vm.cert_name = ko.observable();
  vm.cert_type_title = ko.observable();
  vm.cert_type_id = ko.observable();
  vm.list = ko.observableArray([]);
  vm.is_loading = ko.observable();
  vm.on_search_click = on_search_click;
  vm.on_cert_name_keyup = on_cert_name_keyup;
  vm.select_type = select_type;

  init();

  function init(){
    cert_tree.show('-1', '#tree');
    get_list();
  }

  function get_list(){
    var query = {
      name: vm.cert_name(),
      type_id: vm.cert_type_id(),
      page: curr_page,
      size: page_size
    };
    vm.is_loading(true);
    store.get_list(query)
      .pipe(function(res){
        $.each(res.items, function(idx, item){
          var query = {
            certificate_id: item.id
          };
          var detail_url = certificate_gw_host + '/' + project_code + '/certificate/generate/detail?';
          var full_search = $.param(query);
          var gen_detail_search = $.param($.extend({generate_status: 1}, query));
          var no_gen_detail_search = $.param($.extend({generate_status: 0}, query));
          item.full_detail_url = detail_url + full_search;
          item.gen_detail_url = detail_url + gen_detail_search;
          item.no_gen_detail_url = detail_url + no_gen_detail_search;
        });
        vm.list(res.items);
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
      })
      .always(function(){
        vm.is_loading(false);
      });
  }

  function on_cert_name_keyup(o, e){
    if (e.which === 13) {
      curr_page = 0;
      get_list();
    }
  }

  function select_type(){
    var node = cert_tree.node()[0];
    if (!node || node.id === -1) {
      vm.cert_type_id('');
    } else {
      vm.cert_type_id(node.id);
    }
    vm.cert_type_title(node && node.title || '');
    $('#typeModal').modal('hide');
  }

  function on_search_click(){
    curr_page = 0;
    get_list();
  }


  ko.applyBindings(vm, document.getElementById('boot'));
})();