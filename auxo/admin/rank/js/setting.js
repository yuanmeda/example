(function(){
  var assist_gw_host = window.auxo_assist_gw_host;
  var el_java_api_host = window.el_java_api_host;
  var hide_add_dimensions = window.hide_add_dimensions;
  var org_id = window.org_id;
  var project_domain = window.project_domain;
  var vm = {};
  var curr_level; // 当前选中的组织树层级（ztree定义的level，根为0）
  var configs_display_labels = {
    point: '学习积分',
    hour: '学习时长',
    score: '学习成绩',
    week: '周',
    month: '月',
    all: '总'
  };
  var store;
  var layer_page_size = 20;

  vm.dimensions = ko.observableArray([]);
  vm.org_layers = ko.observableArray([]); // 组织层级下拉菜单
  vm.selected_layer_level = ko.observable();
  vm.curr_org_layer_nodes = ko.observableArray([]);
  vm.org_layer_nodes_page_num = ko.observable(0);
  vm.has_more_layer_nodes = ko.observable(false);
  vm.hide_add_dimensions = hide_add_dimensions; // 是否隐藏“添加组织排行维度”
  vm.curr_dimension = ko.observable(); // 编辑器中的维度对象
  vm.rank_configs = ko.observable();
  vm.show_dimensions_dialog = ko.observable(false); // 是否打开维度编辑对话框
  vm.is_loading = ko.observable(true);
  vm.is_loading_org = ko.observable(false); // 是否正在加载组织树数据
  vm.configs_display_labels = configs_display_labels;
  vm.org_id = org_id;

  vm.create_new_dimension = create_new_dimension;
  vm.close_dimension_editor = close_dimension_editor;
  vm.submit_dimension = submit_dimension;
  vm.confirm_delete_dimension = confirm_delete_dimension;
  vm.load_more_layer_nodes = load_more_layer_nodes;
  vm.modify_dimension = modify_dimension;
  vm.move_up = move_up;
  vm.move_down = move_down;
  vm.on_config_change = on_config_change;
  vm.on_dimension_change = on_dimension_change;

  store = {
    get_dimensions: function get_dimensions(){
      return ajax(assist_gw_host + '/v1/configs')
        .then(function(res){
          res = res.sort(function(curr, next){
            return curr.sort_num - next.sort_num < 0;
          });
          res.forEach(function(item){
            item.enable = ko.observable(item.enable);
          });
          vm.dimensions(res);
        });
    },
    get_config: function get_config(){
      return ajax(assist_gw_host + '/v1/configs/displays');
    },
    /*创建新维度*/
    create_dimension: function create_dimension(data){
      return ajax(assist_gw_host + '/v1/configs', {
        type: 'POST',
        data: JSON.stringify(data)
      })
    },
    /*更新维度*/
    update_dimension: function update_dimension(data){
      return ajax(assist_gw_host + '/v1/configs/' + data.id, {
        type: 'PUT',
        data: JSON.stringify(data)
      })
    },
    submit_configs: function submit_configs(id, data){
      return ajax(assist_gw_host + '/v1/configs/displays/' + id, {
        type: 'PUT',
        data: JSON.stringify({
          all_rank_config: data.all_rank_config,
          single_rank_config: data.single_rank_config,
          date_dimension_config: data.date_dimension_config
        })
      })
    },
    toggle_dimension: function toggle_dimension(dimension){
      return ajax(assist_gw_host + '/v1/configs/' + dimension.id, {
        type: 'PUT',
        data: JSON.stringify({
          enable: dimension.enable()
        })
      });
    },
    /*获取层级总数*/
    get_org_layers: function(){
      return ajax_no_gaea(el_java_api_host + '/v1/mix_organizations/'+org_id+'/layer');
    },
    /*获取层级下的节点*/
    get_layer_nodes: function(level, page_num, page_size){
      return ajax_no_gaea(el_java_api_host + '/v1/mix_organizations/'+ org_id +'/mix_nodes/layer', {
        type: 'GET',
        data:{
          layer: level,
          page_no: page_num,
          page_size: page_size
        }
      })
        .pipe(function(res){
          var total_pages = Math.ceil(res.count/layer_page_size)-1;
          vm.has_more_layer_nodes(page_num < total_pages);
          vm.org_layer_nodes_page_num(page_num);
          var list = vm.curr_org_layer_nodes().concat(res.items);
          vm.curr_org_layer_nodes(list);
        });
    }
  };

  store.get_dimensions()
    // 获取组织层级
    .pipe(store.get_org_layers)
    .pipe(function(res){
      var i = 1;
      var ln = window.parseInt(res.layer, 10);
      if(ln > 9){ ln = 9; }
      for(;i<=ln;i++){
        vm.org_layers.push({
          level: i,
          name: i+'级组织'
        });
      }
    })
    .pipe(store.get_config)
    .pipe(patch_configs)
    .pipe(function(res){
      wrap_config(res.all_rank_config);
      wrap_config(res.date_dimension_config);
      wrap_config(res.single_rank_config);
      vm.rank_configs(res);
    })
    .always(function(){
      vm.is_loading(false);
    });

  vm.selected_layer_level.subscribe(function(level){
    vm.is_loading_org(true);
    vm.curr_org_layer_nodes([]);
    store.get_layer_nodes(level, 0, layer_page_size)
      .then(function(){
        vm.is_loading_org(false);
      });
  });

  /*修正配置*/
  function patch_configs(res){
    // 确保总榜和单榜配置中学习时长是勾选的
    res.all_rank_config.forEach(reset_enable);
    res.single_rank_config.forEach(reset_enable);
    function reset_enable(conf){
      conf.enable = conf.name === 'hour';
    }
    return store.submit_configs(res.id, res);
  }

  /*包装config的enable*/
  function wrap_config(confs){
    $.each(confs, function(idx, conf){
      conf.enable = ko.observable(conf.enable);
    });
  }

  /*拆装config的enable*/
  function unwrap_config(confs){
    $.each(confs, function(idx, conf){
      conf.enable = conf.enable();
    });
  }

  /*打开维度编辑对话框*/
  function open_dimension_editor(dimension_data){
    curr_level = null;
    vm.curr_dimension = ko.observable(dimension_populate(dimension_data));
    vm.selected_layer_level(dimension_data.level);
    vm.show_dimensions_dialog(true);
  }

  /*新建维度*/
  function create_new_dimension(){
    if (vm.dimensions().length >= 5) {
      alert('最多添加5个排行榜');
      return;
    }
    open_dimension_editor({
      name: '',
      nodes: [],
      enable: true,
      level: vm.org_layers()[0].level
    });
  }

  /*关闭维度编辑器*/
  function close_dimension_editor(){
    vm.show_dimensions_dialog(false);
  }

  /*点击提交维度*/
  function submit_dimension(){
    var is_valid;
    var name;
    var nodes;
    var selected_nodes;
    var data;
    var action;
    var is_repeated;
    var curr_dimension = vm.curr_dimension();
    is_valid = true;
    // 标题
    name = $.trim(curr_dimension.name());
    // 新建时不能重名
    if(!curr_dimension.id){
      is_repeated = false;
      $.each(vm.dimensions(), function(index, dim){
        if (dim.ranking_name === name) {
          is_repeated = true;
        }
      });
      if(is_repeated){
        curr_dimension.name_err('请勿重名');
        is_valid = false;
      }
    }
    // 长度
    if (name.length === 0) {
      curr_dimension.name_err('请填写');
      is_valid = false;
    } else if (name.length > 5) {
      curr_dimension.name_err('不超过5个字符');
      is_valid = false;
    } else {
      curr_dimension.name_err('');
    }
    // 节点
    selected_nodes = vm.curr_org_layer_nodes();
    if (selected_nodes.length === 0) {
      curr_dimension.nodes_err('无组织节点');
      is_valid = false;
    } else {
      curr_dimension.nodes_err('');
      nodes = [selected_nodes[0].node_id];
    }

    if (!is_valid) {
      return;
    }

    data = {
      ranking_name: name,
      enable: curr_dimension.enable,
      nodes: nodes
    };
    if (curr_dimension.id) {
      // 编辑
      data.id = curr_dimension.id;
    }

    // 动作，新建
    action = store.create_dimension;
    if (curr_dimension.id) {
      // 更新
      action = store.update_dimension;
    }
    vm.is_loading(true);
    return action(data)
      .then(function(){
        return store.get_dimensions();
      })
      .always(function(){
        // 重置
        vm.is_loading(false);
        vm.show_dimensions_dialog(false);
      });
  }

  /*点击删除维度*/
  function confirm_delete_dimension(dimension){
    // 确认是否删除的是唯一一个启用的维度
    var founds = vm.dimensions().filter(function(dim){
      return dim.enable() === true;
    });
    if (founds.length === 1 && founds[0].id === dimension.id) {
      alert('不能删除唯一启用的维度');
      return;
    }
    if (!window.confirm('确认删除此维度？')) {
      return;
    }
    vm.is_loading(true);
    return ajax(assist_gw_host + '/v1/configs/' + dimension.id, {
      type: 'DELETE'
    })
      .pipe(function(){
        vm.dimensions.remove(dimension);
      })
      .pipe(function(){
        vm.is_loading(false);
      }, function(){
        vm.is_loading(false);
      });
  }

  /*编辑维度*/
  function modify_dimension(dimension){
    open_dimension_editor({
      id: dimension.id,
      name: dimension.ranking_name,
      level: dimension.level,
      enable: dimension.enable()
    });
  }

  /*维度下移*/
  function move_down(dimension){
    var list = vm.dimensions();
    var curr_index = list.indexOf(dimension);
    var sibling = list[curr_index + 2] || {};
    move_dimension(dimension.id, sibling.id);
  }

  /*维度上移*/
  function move_up(dimension){
    var list = vm.dimensions();
    var curr_index = list.indexOf(dimension);
    var prev = list[curr_index - 1] || {};
    move_dimension(dimension.id, prev.id);
  }

  /*移动维度，接口*/
  function move_dimension(curr_id, next_id){
    var url = assist_gw_host + '/v1/configs/' + curr_id + '/actions/move';
    if (next_id) {
      url += '?next_config_id=' + next_id;
    }
    return ajax(url, {
      type: 'PUT'
    })
      .then(function(){
        return store.get_dimensions();
      });
  }

  /*配置项复选框改变时*/
  function on_config_change(p_key, curr_config){
    // 检查，保证至少有一项启用的配置
    var curr_configs = vm.rank_configs()[p_key];
    var count = 0;
    $.each(curr_configs, function(idx, config){
      if (config.enable() === true) {
        count++;
      }
    });
    if (count === 0) {
      alert('请至少保留一项配置');
      curr_config.enable(true);
      return;
    }
    var rank_configs = $.extend(true, {}, vm.rank_configs());
    unwrap_config(rank_configs.all_rank_config);
    unwrap_config(rank_configs.date_dimension_config);
    unwrap_config(rank_configs.single_rank_config);
    return store.submit_configs(vm.rank_configs().id, rank_configs);
  }

  /*新建/编辑维度时对维度对象修改*/
  function dimension_populate(dimension){
    return {
      id: dimension.id || null,
      name: ko.observable(dimension.name),
      name_err: ko.observable(''),
      level: dimension.level,
      nodes_err: ko.observable(''),
      enable: dimension.enable
    };
  }

  /*维度项复选框事件*/
  function on_dimension_change(dimension){
    // 限制，必须有一个
    var dimensions = vm.dimensions();
    var enables = dimensions.filter(function(item){
      return item.enable();
    });
    if (enables.length === 0) {
      window.alert('至少保留一个可用维度');
      dimension.enable(true);
      return;
    }
    store.toggle_dimension(dimension);
  }

  /*当前层级节点分页*/
  function load_more_layer_nodes(){
    var level = vm.selected_layer_level();
    var page_num = vm.org_layer_nodes_page_num() + 1;
    store.get_layer_nodes(level, page_num, layer_page_size);
  }

  /*通用ajax请求*/
  function ajax(path, options){
    options = options || {};
    options.dataType = 'json';
    options.contentType = 'application/json; charset=utf-8';
    options.url = path;
    return $.ajax(options);
  }

  /*请求头中不包含Gaea*/
  function ajax_no_gaea(path, options){
    options = options || {};
    options.headers = {
      'X-Gaea-Authorization': undefined
    };
    return ajax(path, options);
  }

  ko.applyBindings(vm, document.getElementById('rank-setting'));
})();