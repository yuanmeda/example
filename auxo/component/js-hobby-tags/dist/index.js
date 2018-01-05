(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

function flatten_tags(tags, tags_map) {
  tags_map = tags_map || {};
  $.each(tags, function (idx, tag) {
    var children = [];
    foobar(tag.children);
    tag.children = children;
    function foobar(nodes) {
      $.each(nodes, function (i, node) {
        children.push(node);
        tags_map[node.id] = node;
        if (node.children && node.children.length > 0) {
          foobar(node.children);
        }
      });
    }
  });
  clean(tags);
  return tags;
}

function clean(array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].children.length === 0) {
      array.splice(i, 1);
      i--;
    }
  }
}

function Model(params) {
  var vm = this;
  var user_id = params.user_id;
  var tag_srv_host = params.tag_srv_host;
  var el_recommend_srv_host = params.el_recommend_srv_host;
  var on_save_success = params.on_save_success || function () {};
  var tags_map = {};
  var custom_type = 'el-learning-unit';

  vm.dlg_mode = !!params.dlg_mode;
  vm.tags = ko.observableArray([]);
  vm.is_loading = ko.observable(true);
  vm.user_selected = ko.observableArray([]);
  vm.user_tags_labels = ko.pureComputed(function () {
    var labels = [];
    $.each(this.user_selected(), function (i, selected) {
      labels.push(tags_map[selected].title);
    });
    return labels.join('、');
  }, vm);
  vm.is_fold = ko.observable(true);
  vm.user_tags_labels_display = ko.pureComputed(function () {
    var orig_str = vm.user_tags_labels();
    if (vm.is_fold()) {
      var str = orig_str.slice(0, 200);
      return '' + str + (str.length < orig_str.length ? '...' : '');
    }
    return orig_str;
  }, vm);

  vm.toggle_tag = toggle_tag;
  vm.save_tags = save_tags;
  vm.toggle_fold = toggle_fold;

  get_all_tags().pipe(function (res) {
    if (!res) {
      return $.Deferred().reject();
    }
    vm.tags(flatten_tags(res.children, tags_map));
    return get_user_tags();
  }).pipe(function (res) {

    vm.user_selected(res.tag_ids);
    vm.is_loading(false);
  }, function () {
    vm.is_loading(false);
  });

  function get_user_tags() {
    return $.get(el_recommend_srv_host + '/v1/user_tags/' + user_id, { type: 0 }).pipe(function (res) {
      res = res || {};
      res.tag_ids = res.tag_ids || [];
      var tags = vm.tags();
      var list = [];
      $.each(res.tag_ids, function (i, tag_id) {
        var found = find_tag(tags, tag_id);
        if (found) {
          list.push(tag_id);
        }
      });
      res.tag_ids = list;
      return res;
    });
  }

  function find_tag(tags, id) {
    var i = 0,
        ln = tags.length;
    for (; i < ln; i++) {
      var lv1 = tags[i];
      var j = 0;
      for (; j < lv1.children.length; j++) {
        var tag = lv1.children[j];
        if (tag.id === id) {
          return tag;
        }
      }
    }
    return null;
  }

  function save_tags() {
    var tag_ids = vm.user_selected();
    $.ajax({
      url: el_recommend_srv_host + '/v1/user_tags/' + user_id,
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify({
        tag_ids: tag_ids
      })
    }).then(function (res) {
      if (!vm.dlg_mode) {
        $.fn.udialog.alert(window.i18nHelper.getKeyValue('hobby_tags.save_success_tip_desc'), {
          title: window.i18nHelper.getKeyValue('hobby_tags.dlg_tip_title')
        });
      } else {
        on_save_success();
      }
    });
  }

  function get_all_tags() {
    if (params.tags) {
      return $.Deferred().resolve(params.tags);
    }
    return $.get(tag_srv_host + '/v2/tags/tree', { custom_type: custom_type });
  }

  function toggle_tag(data) {
    var index = vm.user_selected().indexOf(data.id);
    if (index > -1) {
      vm.user_selected.splice(index, 1);
    } else {
      vm.user_selected.push(data.id);
    }
  }

  function toggle_fold(is_fold) {
    vm.is_fold(is_fold);
  }
}

var template = "<div class=\"hobby-tags-selector\" data-bind=\"css:{'hts-dlg-mode': dlg_mode}\">\r\n  <div class=\"hts-title\">\r\n    <h1 data-bind=\"translate:{key:'hobby_tags.main_title'}\"></h1><span data-bind=\"translate:{key: 'hobby_tags.sub_title'}\"></span>\r\n  </div>\r\n\r\n\r\n  <!--ko if:tags().length > 0-->\r\n  <div class=\"hts-list\">\r\n    <!--ko foreach:tags-->\r\n    <div class=\"hts-item\">\r\n      <div class=\"cate-title\" data-bind=\"text:title\"></div>\r\n      <ul>\r\n        <!--ko foreach:children-->\r\n        <li data-bind=\"\r\n          text:title,\r\n          click:$component.toggle_tag,\r\n          css:{selected:$component.user_selected().indexOf(id)>-1}\"></li>\r\n        <!--/ko-->\r\n      </ul>\r\n    </div>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:tags().length === 0-->\r\n  <div class=\"hts-empty\">\r\n    <i></i>\r\n    <span data-bind=\"translate:{key: 'hobby_tags.tags_empty'}\"></span>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:tags().length > 0-->\r\n  <div class=\"hts-footer\">\r\n    <p data-bind=\"event:{mouseover:toggle_fold.bind($component, false),mouseout:toggle_fold.bind($component, true)}\">\r\n      <span data-bind=\"translate:{key:'hobby_tags.lbl_has_selected'}\"></span>\r\n      <!--ko text:user_tags_labels_display--><!--/ko-->\r\n    </p>\r\n    <!--ko if:user_selected().length-->\r\n    <span class=\"hts-save\" data-bind=\"translate:{key: 'hobby_tags.act_save'},click:save_tags\"></span>\r\n    <!--/ko-->\r\n    <!--ko if:!user_selected().length-->\r\n    <span class=\"hts-save disabled\" data-bind=\"translate:{key: 'hobby_tags.act_save'}\"></span>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n</div>\r\n\r\n";

ko.components.register('x-hobby-tags-selector', {
  viewModel: Model,
  template: template
});

function Model$1(params) {
  var vm = this;
  var tag_srv_host = params.tag_srv_host;
  var el_recommend_srv_host = params.el_recommend_srv_host;
  var user_id = params.user_id;
  var custom_type = 'el-learning-unit';
  var project_domain = params.project_domain;

  vm.my_study_url = params.my_study_host + '/' + project_domain + '/mystudy/user_center#my-hobby';
  vm.is_loading = ko.observable(true);
  vm.has_tags = ko.observable();
  vm.show_selector = ko.observable(true);
  vm.show_success_dlg = ko.observable(false);
  vm.params = {
    tag_srv_host: tag_srv_host,
    user_id: user_id,
    el_recommend_srv_host: el_recommend_srv_host,
    dlg_mode: true,
    on_save_success: on_save_success
  };

  vm.close_selector = close_selector;
  vm.close_success_dlg = close_success_dlg;

  get_all_tags().then(function (res) {
    vm.params.tags = res;
    vm.has_tags(has_tags(res));
    vm.is_loading(false);
  });

  function get_all_tags() {
    return $.get(tag_srv_host + '/v2/tags/tree', { custom_type: custom_type });
  }

  function close_selector() {
    vm.show_selector(false);
    update_guidance();
  }

  function close_success_dlg() {
    vm.show_success_dlg(false);
  }

  function on_save_success() {
    vm.show_selector(false);
    vm.show_success_dlg(true);
    update_guidance();
  }

  function update_guidance() {
    return $.ajax({
      url: el_recommend_srv_host + '/v1/user_guidances/' + user_id,
      type: 'PUT',
      data: JSON.stringify({
        item_key: 'new_user',
        item_value: false
      })
    }).then(function (res) {
      if (!window.localStorage) {
        return;
      }
      window.localStorage.setItem('IS_NEW_USER_' + project_domain + '_' + user_id, JSON.stringify(false));
    });
  }

  function has_tags(res) {
    if (!res) {
      return false;
    }
    if (!res.children) {
      return false;
    }
    if (res.children && !res.children.length) {
      return false;
    }

    var flatten = flatten_tags($.extend(true, [], res.children));
    var i = 0,
        ln = flatten.length;
    for (; i < ln; i++) {
      var node = flatten[i];
      if (node.children && node.children.length) {
        return true;
      }
    }
    return false;
  }
}

var template$1 = "<!--ko if:!is_loading()-->\r\n<!--ko if:has_tags() && show_selector()-->\r\n<div class=\"hobby-tags-selector-pop-up\">\r\n  <span class=\"hts-close\" data-bind=\"click:close_selector\"></span>\r\n  <!--ko component:{name:'x-hobby-tags-selector', params:params}--><!--/ko-->\r\n</div>\r\n<div class=\"hobby-tags-mask\"></div>\r\n<!--/ko-->\r\n\r\n<!--ko if:show_success_dlg()-->\r\n<div class=\"hobby-tags-success-dlg\">\r\n  <div class=\"hts-dlg-header\">\r\n    <h1 data-bind=\"translate:{key: 'hobby_tags.success_dlg_title'}\"></h1>\r\n    <span class=\"hts-close\" data-bind=\"click:close_success_dlg\"></span>\r\n  </div>\r\n  <div class=\"hts-dlg-body\">\r\n    <p data-bind=\"translate:{key: 'hobby_tags.success_dlg_desc'}\"></p>\r\n    <div class=\"dc\"><a data-bind=\"translate:{key: 'hobby_tags.my_hobby_label'},attr:{href:my_study_url}\"></a></div>\r\n  </div>\r\n  <div class=\"hts-dlg-footer\">\r\n    <a data-bind=\"translate:{key: 'hobby_tags.go_to_see'},attr:{href:my_study_url}\"></a>\r\n  </div>\r\n</div>\r\n<div class=\"hobby-tags-mask\"></div>\r\n<!--/ko-->\r\n<!--/ko--><!--end if:!is_loading()-->";

ko.components.register('x-hobby-pop-up', {
  viewModel: Model$1,
  template: template$1
});

function Model$2(params) {
  var vm = this;
  var tag_srv_host = params.tag_srv_host;
  var el_recommend_srv_host = params.el_recommend_srv_host;
  var user_id = params.user_id;

  vm.params = {
    tag_srv_host: tag_srv_host,
    user_id: user_id,
    el_recommend_srv_host: el_recommend_srv_host
  };
}

var template$2 = "<!--ko component:{name:'x-hobby-tags-selector', params:params}--><!--/ko-->";

ko.components.register('x-hobby-page-my-study', {
  viewModel: Model$2,
  template: template$2
});

}(ko,$));
