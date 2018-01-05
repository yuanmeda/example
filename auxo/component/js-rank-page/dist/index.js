(function ($$1,ko$1) {
'use strict';

$$1 = 'default' in $$1 ? $$1['default'] : $$1;
ko$1 = 'default' in ko$1 ? ko$1['default'] : ko$1;

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $$1.ajax(options);
}

function Model(params) {
  var static_host = params.static_host;
  var assist_gw_host = params.assist_gw_host;
  var project_domain = params.project_domain;
  var custom_type = params.custom_type;
  var custom_id = params.custom_id;
  var rank_range = params.rank_range || 'all';
  var rank_display = params.rank_display || 'hour';
  var project_id = params.project_id;
  var exam_type = params.exam_type;
  var exam_id = params.exam_id;
  var vm = this;
  var max_viewable_dimensions = 5;
  var list_start = 1;
  var page_size = 10;

  vm.rank_range = rank_range;
  vm.rank_display = ko.observable(rank_display);
  vm.curr_rank_cate = ko.observable();
  vm.dimensions = ko.observableArray([]);
  vm.viewable_dimensions = ko.observableArray([]);
  vm.curr_dimension = ko.observable({});
  vm.date_dimension_config = ko.observableArray([]);
  vm.curr_date_dim_conf = ko.observable({});
  vm.list = ko.observableArray();
  vm.is_last_page = ko.observable();
  vm.my_rank = ko.observable('');
  vm.my_minute = ko.observable('');
  vm.my_exceed = ko.observable('');
  vm.my_score = ko.observable('');
  vm.my_cost_minutes = ko.observable('');
  vm.my_cost_seconds = ko.observable('');
  vm.is_admin_config_error = ko.observable(false);
  vm.is_loading = ko.observable(true);
  vm.list_blank_img = static_host + 'auxo/component/js-course-detail-pk/images/ico-nopk.png';
  vm.list_blank_message = ko.observable(i18nHelper.getKeyValue('rank_page.list_empty.no_data'));

  vm.change_dimension = change_dimension;
  vm.on_dimension_select = on_dimension_select;
  vm.change_date_dim_conf = change_date_dim_conf;
  vm.load_more = load_more;

  get_configs().pipe(get_dimensions).pipe(function () {
    var def = $$1.Deferred();
    if (vm.dimensions().length === 0 || vm.date_dimension_config().length === 0) {
      vm.list_blank_message(i18nHelper.getKeyValue('rank_page.list_empty.no_config'));
      vm.is_admin_config_error(true);
      def.reject();
    } else {
      def.resolve();
    }
    return def.promise();
  }).pipe(function () {
    return get_list(1);
  }).pipe(function () {
    vm.is_loading(false);
    on_page_scroll_height_changed();
  }, function () {
    vm.is_loading(false);
    on_page_scroll_height_changed();
  });

  function get_list(start) {
    var dimension = vm.curr_dimension();
    var rank_type = dimension.ranking_type;
    var date_config = vm.curr_date_dim_conf();
    var rank_id = vm.curr_rank_cate().id;
    var level = dimension.level;
    var tag = date_config.id;
    var data = void 0;

    switch (vm.curr_rank_cate().name) {
      case 'hour':
        data = {
          rank_id: rank_id,
          level: level,
          tag: tag,
          start: start
        };
        if (rank_range === 'single') {
          data.class_id = project_id + '-' + custom_type + '-' + custom_id;
        }
        break;
      case 'score':
        data = {
          rank_id: rank_id,
          level: level,
          tag: tag,
          start: start,
          exam_type: exam_type,
          exam_id: project_id + '-' + exam_id
        };
        break;
    }
    return ajax(assist_gw_host + '/' + project_domain + '/ranks/' + rank_type, {
      type: 'GET',
      data: data
    }).then(function (res) {
      list_start = start;
      var user_info = res.user_info;

      switch (vm.curr_rank_cate().name) {
        case 'hour':
          vm.my_rank(user_info.rank);
          vm.my_minute(parse_my_num(user_info.my_score).toFixed(0));
          vm.my_exceed(user_info.score_rate);
          break;
        case 'score':
          var cost_time = user_info.cost_time || 0;
          var cost_minutes = 0;
          var cost_seconds = 0;
          cost_minutes = window.parseInt(cost_time / 60);
          cost_seconds = window.parseInt(cost_time % 60);
          vm.my_score(parse_my_num(user_info.my_score).toFixed(2));
          vm.my_cost_minutes(cost_minutes);
          vm.my_cost_minutes(cost_seconds);
          vm.my_rank(user_info.rank);
          vm.my_exceed(user_info.score_rate);
          break;
      }
      vm.is_last_page(res.is_last_page);
      if (start > 1) {
        $$1.each(res.data, function (idx, data) {
          vm.list.push(data);
        });
      } else {
        vm.list(res.data);
      }
    });
  }

  function get_dimensions() {
    return ajax(assist_gw_host + '/v1/configs').then(function (res) {
      res = res.sort(function (curr, next) {
        return curr.sort_num - next.sort_num < 0;
      });
      var available_res = [];
      $$1.each(res, function (idx, dimension) {
        if (dimension.enable) {
          available_res.push(dimension);
        }
      });
      vm.curr_dimension(available_res[0]);
      vm.viewable_dimensions(available_res.slice(0, max_viewable_dimensions));
      vm.dimensions(available_res);
    });
  }

  function on_page_scroll_height_changed() {
    window.setTimeout(function () {
      var scroll_height = window.document.documentElement.scrollHeight;
      window.parent.postMessage(JSON.stringify({
        "type": '$resize',
        data: {
          "width": $$1('body').width() + 'px',
          "height": $$1('body').height() + 'px'
        }
      }), '*');
    }, 50);
  }

  function get_configs() {
    return ajax(assist_gw_host + '/v1/configs/displays').then(function (res) {
      var curr_rank_cate = void 0;

      if (rank_range === 'all') {
        if (vm.rank_display() === 'score') {
          vm.rank_display('hour');
        }
      }

      if (rank_range === 'all') {
        curr_rank_cate = find_config(res.all_rank_config, vm.rank_display());
      } else {
        curr_rank_cate = find_config(res.single_rank_config, vm.rank_display());
      }
      vm.curr_rank_cate(curr_rank_cate);

      var date_dim_confs = [];
      $$1.each(res.date_dimension_config, function (idx, conf) {
        if (!conf.enable) {
          return;
        }

        conf.label = i18nHelper.getKeyValue('rank_page.date_dim.' + conf.name);
        if (conf.name === 'week') {
          date_dim_confs.unshift(conf);
        } else {
          date_dim_confs.push(conf);
        }
      });
      vm.date_dimension_config(date_dim_confs);
      vm.curr_date_dim_conf(date_dim_confs[0] || null);
    });
  }

  function find_config(configs, c_name) {
    var i = 0,
        ln = configs.length;
    for (; i < ln; i++) {
      if (configs[i].name === c_name) {
        return configs[i];
      }
    }
    return null;
  }

  function change_dimension(dimension) {
    vm.curr_dimension(dimension);
    vm.is_loading(true);
    get_list(1).always(function () {
      vm.is_loading(false);
      on_page_scroll_height_changed();
    });
  }

  function change_date_dim_conf(date_conf) {
    vm.curr_date_dim_conf(date_conf);
    vm.is_loading(true);
    get_list(1).always(function () {
      vm.is_loading(false);
      on_page_scroll_height_changed();
    });
  }

  function on_dimension_select(data, event) {
    var target_id = event.target.value;
    var list = vm.dimensions();
    var dimension = void 0;
    for (var i = 0, ln = list.length; i < ln; i++) {
      dimension = list[i];
      if (dimension.id === target_id) {
        break;
      }
    }
    change_dimension(dimension);
  }

  function parse_my_num(res_str) {
    var num = window.parseFloat(res_str);
    if (window.isNaN(num)) {
      num = 0;
    }
    return num;
  }

  function load_more() {
    list_start += page_size;
    vm.is_loading(true);
    return get_list(list_start).always(function () {
      vm.is_loading(false);
      on_page_scroll_height_changed();
    });
  }
}

var tpl = "<div class=\"x-rank-page\">\r\n  <div class=\"rp-header\">\r\n    <h1 data-bind=\"translate:{key:'rank_page.leader_board'}\"></h1>\r\n    <!--ko if:curr_rank_cate()-->\r\n    <p data-bind=\"translate:{key:'rank_page.sub_title.'+curr_rank_cate().name + '.' + rank_range}\"></p>\r\n    <!--/ko-->\r\n  </div>\r\n\r\n\r\n  <!--ko if:!is_admin_config_error()-->\r\n\r\n  <!--排行维度切换-->\r\n  <!--ko if:viewable_dimensions().length > 0-->\r\n  <div class=\"rp-filter-dimensions\">\r\n    <ul>\r\n      <!--ko foreach:viewable_dimensions-->\r\n      <li data-bind=\"\r\n        css:{active: $component.curr_dimension().id == id},\r\n        text:ranking_name,\r\n        attr:{title:ranking_name},\r\n        click:$component.change_dimension\r\n      \"></li>\r\n      <!--/ko-->\r\n    </ul>\r\n\r\n    <!--ko if:viewable_dimensions().length < dimensions().length-->\r\n    <select data-bind=\"event:{change:on_dimension_select}\">\r\n      <!--ko foreach:dimensions-->\r\n      <option data-bind=\"attr:{value:id},text:ranking_name\"></option>\r\n      <!--/ko-->\r\n    </select>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko--><!--end if viewable_dimensions().length > 0-->\r\n\r\n  <!--排行摘要信息-->\r\n  <!--ko if:curr_rank_cate()-->\r\n  <!--ko if:curr_rank_cate().name === 'hour'-->\r\n  <div class=\"rp-summ\" data-bind=\"translate:{html:{key: 'rank_page.rank_summ_info.hour',properties:{my_rank:my_rank(), my_minute:my_minute(), my_exceed:my_exceed()}}}\"></div>\r\n  <!--/ko-->\r\n  <!--ko if:curr_rank_cate().name === 'score'-->\r\n  <div class=\"rp-summ\" data-bind=\"translate:{html:{key: 'rank_page.rank_summ_info.score',properties:{my_rank:my_rank(), my_score:my_score(), my_cost_minutes:my_cost_minutes(), my_cost_seconds:my_cost_seconds(), my_exceed:my_exceed()}}}\"></div>\r\n  <!--/ko-->\r\n  <!--/ko-->\r\n\r\n  <!--ko if:date_dimension_config().length>0-->\r\n  <!--排行维度时间配置切换-->\r\n  <div class=\"rp-filter-times\">\r\n    <!--ko foreach:date_dimension_config-->\r\n    <span data-bind=\"\r\n      css:{active:$component.curr_date_dim_conf().id == id},\r\n      text:label,\r\n      click:$component.change_date_dim_conf\r\n    \"></span>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--/ko--><!--end if:!is_admin_config_error()-->\r\n\r\n\r\n\r\n  <!--排行列表-->\r\n  <!--ko if:list().length > 0-->\r\n  <!--ko if:curr_rank_cate()-->\r\n  <!--ko if:curr_rank_cate().name === 'hour'-->\r\n  <!--学时排行榜-->\r\n  <div class=\"rp-rank-list\">\r\n    <table>\r\n      <thead>\r\n      <tr>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.rank'}\">排名</th>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.user'}\">用户</th>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.learn_time_used'}\">学习时长</th>\r\n      </tr>\r\n      </thead>\r\n      <tbody>\r\n      <!--ko foreach:list-->\r\n      <tr>\r\n        <td data-bind=\"text:rank\"></td>\r\n        <td>\r\n          <img class=\"avatar\" data-bind=\"attr:{src:user_icon + '?defaultImage=1'}\" width=\"40\" height=\"40\">\r\n          <!--ko text:nick_name--><!--/ko-->\r\n        </td>\r\n        <td data-bind=\"text:level\"></td>\r\n      </tr>\r\n      <!--/ko-->\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:curr_rank_cate().name === 'score'-->\r\n  <!--成绩排行榜-->\r\n  <div class=\"rp-rank-list\">\r\n    <table>\r\n      <thead>\r\n      <tr>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.rank'}\">排名</th>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.user'}\">用户</th>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.cost_time'}\">用时</th>\r\n        <th data-bind=\"translate:{key: 'rank_page.table_headers.score'}\">成绩</th>\r\n      </tr>\r\n      </thead>\r\n      <tbody>\r\n      <!--ko foreach:list-->\r\n      <tr>\r\n        <td data-bind=\"text:rank\"></td>\r\n        <td>\r\n          <img class=\"avatar\" data-bind=\"attr:{src:user_icon + '?defaultImage=1'}\" width=\"40\" height=\"40\">\r\n          <!--ko text:nick_name--><!--/ko-->\r\n        </td>\r\n        <td data-bind=\"\"></td>\r\n        <td data-bind=\"text:level\"></td>\r\n      </tr>\r\n      <!--/ko-->\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--/ko--><!--end if curr_rank_cate()-->\r\n\r\n  <!--ko if:!is_last_page()-->\r\n  <div class=\"rp-load-more\"><span data-bind=\"click:load_more,translate:{key: 'rank_page.load_more'}\"></span></div>\r\n  <!--/ko-->\r\n  <!--/ko--><!--end if list().length>0-->\r\n\r\n  <!--ko if:!is_loading() && list().length === 0-->\r\n  <div class=\"rp-list-empty\">\r\n    <img data-bind=\"attr:{src:list_blank_img}\">\r\n    <span data-bind=\"text:list_blank_message\"></span>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:is_loading()-->\r\n  <div class=\"rp-loading\">\r\n    <div class=\"rp-mask\"></div>\r\n    <span class=\"rp-mask-tip\" data-bind=\"translate:{key:'rank_page.loading'}\"></span>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n</div>";

ko$1.bindingHandlers.costTime = {
  init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var time = valueAccessor();
    var minutes = window.parseInt(time / 60);
    var seconds = window.parseInt(time % 60);
    $(element).text('' + minutes + i18nHelper.getKeyValue('rank_page.time.minutes') + seconds + i18nHelper.getKeyValue('rank_page.time.seconds'));
  }
};

ko$1.components.register('x-rank-page', {
  viewModel: Model,
  template: tpl
});

}($,ko));
