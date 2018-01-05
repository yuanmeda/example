(function(){
  var vm = {};
  var project_code = window.project_code;
  var certificate_srv_host = window.certificate_srv_host;
  var el_srv_host = window.el_srv_host;
  var org_id = window.org_id;
  var root_id = null;
  var z_tree = null;
  var certificate_gw_host = window.certificate_gw_host;
  var cert_tree = window.tree;
  var page_size = 20;
  var curr_page = 0;
  var jPagination = $('#pagination');
  var store = {
    get_org_layer: function(node_id){
      return $.ajax(el_srv_host + '/v1/mix_organizations/'+org_id+'/mix_nodes/'+node_id+'/children',{
        type: 'GET',
        headers:{
          'X-Gaea-Authorization' : undefined,
          'Authorization':undefined
        }
      })
    },
    get_list: function(data){
      return $.ajax({
        url: certificate_srv_host + '/v1/user_certificates/stat',
        type: 'POST',
        data: JSON.stringify(data)
      });
    },
    generate_certificate: function(cert){
      return $.ajax({
        url: certificate_srv_host + '/v1/user_certificates/generate/by_org',
        type: 'POST',
        data: JSON.stringify({
          root_id: root_id,
          node_id: cert.node_id
        })
      });
    }
  };

  vm.cert_is_generate = ko.observable();
  vm.cert_type_title = ko.observable();
  vm.cert_type_id = ko.observable();
  vm.list = ko.observableArray([]);
  vm.is_loading = ko.observable();
  vm.node_id = ko.observable();
  vm.on_search_click = on_search_click;
  vm.select_type = select_type;
  vm.generate_cert = generate_cert;

  init();

  function init(){
    // 证书分类树
    cert_tree.show('-1', '#tree');
    // 混合组织树
    var settings = {
      data: {
        key: {
          name: 'node_name',
          title: 'node_name'
        },
        simpleData: {
          enable: true,
          idKey: "id",
          pIdKey: "parent_id",
          rootPId: '0'
        }
      },
      check:{
        enable: true,
        chkboxType: {
          "Y": "",
          "N": ""
        },
        chkStyle: 'radio',
        radioType: 'all'
      },
      callback: {
        onClick: on_ztree_click,
        onCheck: on_ztree_check,
        onExpand: on_ztree_expand
      }
    };
    return store.get_org_layer(0)
      .pipe(function(root_data){
        var node = root_data[0];
        root_id = node.root_id;
        vm.node_id(node.node_id);
        z_tree = $.fn.zTree.init($("#org_tree"), settings, transform_nodes(root_data));
      })
      .pipe(function(){
        return get_list();
      })
  }

  /*转换节点数据*/
  function transform_nodes(nodes){
    return $.map(nodes, function (item) {
      item.isParent = item.isParent || item.is_parent;
      delete item.children;
      return item;
    });
  }

  /*展开结点时*/
  function on_ztree_expand(event, tree_id, tree_node){
    store.get_org_layer(tree_node.node_id)
      .pipe(function(res){
        z_tree.addNodes(tree_node, transform_nodes(res));
      });
  }

  /*点击节点时*/
  function on_ztree_click(evt, tree_id, tree_node){
    z_tree.checkNode(tree_node, true, true, false);
    set_node_id(tree_node);
  }

  /*选中节点时*/
  function on_ztree_check(evt, tree_id, tree_node){
    set_node_id(tree_node);
  }

  function set_node_id(node){
    vm.node_id(node.checked ? node.node_id : undefined);
  }

  function get_list(){
    var query = {
      root_id: root_id,
      node_id: vm.node_id(),
      is_generate: (function(){
        var result;
        var is_generate = vm.cert_is_generate();
        if(is_generate === ''){
          result = undefined;
        }else{
          result = is_generate === '1';
        }
        return result;
      })(),
      certificate_type_id: vm.cert_type_id(),
      page: curr_page,
      size: page_size
    };
    vm.is_loading(true);
    return store.get_list(query)
      .pipe(function(res){
        $.each(res.items, function(idx, item){
          var query = {
            root_id: root_id,
            node_id: item.node_id,
            certificate_type_id: vm.cert_type_id()
          };
          // 详情
          var detail_search = $.param(query);
          var url = certificate_gw_host + '/' + project_code + '/certificate/generate/org/detail?';
          item.detail_url =  url + detail_search;
          // 已生成
          var generated_search = $.param($.extend(true, query, {generate_status:1}));
          item.generated_url = url + generated_search;
          // 未生成
          var un_generated_search = $.param($.extend(true, query, {generate_status:0}));
          item.un_generated_url = url + un_generated_search;
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
      });
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

  /*生成证书*/
  function generate_cert(cert){
    $.confirm({
      title: '生成证书',
      content: '是否确定发放<span style="color:red">'+escape_html(cert.node_name)+'</span>毕业证书？',
      buttons:{
        confirm: {
          text: '确认',
          btnClass: 'btn-primary',
          action: function(){
            store.generate_certificate(cert)
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

  ko.applyBindings(vm, document.getElementById('boot'));
})();