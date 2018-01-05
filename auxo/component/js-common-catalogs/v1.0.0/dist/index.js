(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

function Model(params) {
  var vm = this;
  var auxo_channel_api_host = params.auxo_channel_api_host;
  var auxo_tag_api_host = params.auxo_tag_api_host;
  var on_data_received = params.on_data_received || function () {};

  var store = {
    get_channels: function get_channels() {
      return $.ajax({
        url: auxo_channel_api_host + '/v1/channels/search'
      });
    },
    get_tags_tree: function get_tags_tree(custom_id) {
      return $.ajax({
        url: auxo_tag_api_host + '/v2/tags/tree',
        data: {
          custom_type: 'el-channel',
          custom_id: custom_id
        }
      });
    }
  };

  vm.channels = ko.observableArray([]);
  vm.tags_tree = ko.observable([]);
  vm.curr_channel = ko.observable(null);
  vm.selected_tags = ko.observableArray([]);
  vm.tag_rows = ko.observable({});

  vm.select_channel = select_channel;
  vm.select_tag = select_tag;
  vm.select_curr_all = select_curr_all;
  vm.select_all_channel = select_all_channel;

  store.get_channels().pipe(function (res) {
    vm.curr_channel(res.items[0]);
    vm.channels(res.items);
  }).pipe(function () {
    select_all_channel();
  });

  function select_channel(channel) {
    vm.curr_channel(channel);
    return get_tags_tree(channel);
  }

  function select_tag(parent, child) {
    var tag_rows = vm.tag_rows();
    tag_rows[parent.id] = child.id;
    var list = [];
    $.each(tag_rows, function (key, val) {
      list.push(val);
    });
    vm.tag_rows(tag_rows);
    vm.selected_tags(list);
    send_info();
  }

  function select_curr_all(parent) {
    var tag_rows = vm.tag_rows();
    delete tag_rows[parent.id];
    var list = [];
    $.each(tag_rows, function (key, val) {
      list.push(val);
    });
    vm.tag_rows(tag_rows);
    vm.selected_tags(list);
    send_info();
  }

  function get_tags_tree(channel) {
    return store.get_tags_tree(channel.id).then(function (res) {
      var tags_tree = get_flatten_tags(res.children);
      vm.tags_tree(tags_tree);

      reset_tags();
      send_info();
    });
  }

  function get_flatten_tags(tags) {
    var root = [];
    $.each(tags, function (i, tag) {
      root[i] = {
        id: tag.id,
        title: tag.title,
        children: []
      };
      flat_assist(root[i].children, tag);
    });
    return root;
  }

  function flat_assist(list, tag) {
    if (tag.children && tag.children.length > 0) {
      $.each(tag.children, function (i, child) {
        list.push({
          title: child.title,
          id: child.id
        });
        flat_assist(list, child);
      });
    }
  }

  function select_all_channel() {
    vm.curr_channel(null);
    vm.tags_tree([]);
    reset_tags();
    send_info();
  }

  function reset_tags() {
    vm.tag_rows({});
    vm.selected_tags([]);
  }

  function send_info() {
    on_data_received(vm.curr_channel(), vm.selected_tags());
  }
}

var template = "<div class=\"x-common-catalogs\">\r\n  <!--ko if:channels().length > 0-->\r\n  <div class=\"list-row channels\">\r\n    <span class=\"lead-title\">频道</span>\r\n    <ul class=\"column-list\">\r\n      <li class=\"tag-label\" data-bind=\"\r\n        css:{on:$component.curr_channel() === null},\r\n        click:$component.select_all_channel\r\n      \">全部</li>\r\n      <!--ko foreach:channels-->\r\n      <li class=\"tag-label\" data-bind=\"\r\n        css:{on:$component.curr_channel() && $component.curr_channel().id === id},\r\n        text:title,\r\n        click:$component.select_channel.bind($component, $data)\r\n     \"></li>\r\n      <!--/ko-->\r\n    </ul>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n\r\n  <!--ko foreach:{data:tags_tree, as:'parent'}-->\r\n  <div class=\"list-row x-catalogs\">\r\n    <span class=\"lead-title\" data-bind=\"text:parent.title\"></span>\r\n    <ul class=\"column-list\">\r\n      <li class=\"tag-label\" data-bind=\"\r\n        css:{on:!$component.tag_rows()[parent.id]},\r\n        click:$component.select_curr_all.bind($component, parent)\r\n      \">全部</li>\r\n      <!--ko foreach:{data:children, as:'child'}-->\r\n      <li class=\"tag-label\" data-bind=\"\r\n        css:{on:$component.tag_rows()[parent.id] === child.id},\r\n        click:$component.select_tag.bind($component, parent, child),\r\n        text:title\r\n      \"></li>\r\n      <!--/ko-->\r\n    </ul>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n\r\n  <!--ko if:curr_channel() !== null && tags_tree().length === 0-->\r\n  <div class=\"tag-empty\">此频道下没有标签</div>\r\n  <!--/ko-->\r\n</div>";

ko.components.register("x-common-catalogs", {
  viewModel: Model,
  template: template
});

}(ko,$));
