(function (ko$1,$) {
'use strict';

ko$1 = 'default' in ko$1 ? ko$1['default'] : ko$1;
$ = 'default' in $ ? $['default'] : $;

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

function Model(params) {
  var vm = this;
  var api_host = params.api_host;
  var gw_host = params.gw_host;
  var pk_id = params.pk_id;
  var curr_user_id = params.curr_user_id;
  var project_domain = params.project_domain;

  var rival_id = '';

  vm.curr_user_name = ko.observable();
  vm.curr_user_icon = ko.observable();
  vm.curr_user_from = ko.observable();
  vm.curr_user_win_rate = ko.observable();
  vm.curr_user_ranking = ko.observable();
  vm.curr_user_score = ko.observable();
  vm.matched_list = ko.observableArray();
  vm.is_loading = ko.observable(true);

  vm.change_another_group = change_another_group;
  vm.start_pk = start_pk;
  vm.play_alone = play_alone;

  random_match().then(function () {
    get_user_pk_info().then(function (res) {
      var user_info = res.uc_user_display_facade;
      vm.curr_user_name(user_info.display_name);
      vm.curr_user_icon(user_info.icon + '&defaultImage=1');
      vm.curr_user_from(user_info.org_exinfo && user_info.org_exinfo.node_name);
      if (vm.matched_list().length === 0) {
        vm.curr_user_win_rate('--');
        vm.curr_user_ranking('--');
        vm.curr_user_score('--');
      } else {
        vm.curr_user_win_rate(Math.round(res.win_rate * 100) + '%');
        var rank = res.user_rank && res.user_rank.rank;
        vm.curr_user_ranking(rank > 0 ? rank : '--');
        vm.curr_user_score(res.pk_point < 0 ? 0 : res.pk_point);
      }
    }).always(function () {
      vm.is_loading(false);
    });
  }, function () {
    vm.is_loading(false);
  });

  function get_user_pk_info() {
    return ajax(gw_host + '/v1/pk_users', {
      type: 'GET',
      data: {
        pk_id: pk_id,
        user_id: curr_user_id
      }
    });
  }

  function random_match() {
    return ajax(gw_host + '/v2/pk_users/actions/random_match', {
      data: {
        pk_id: pk_id,
        user_number: 5
      }
    }).then(function (res) {
      $.each(res, function (index, item) {
        var pk_user_info = item.pk_user_vo;
        var total = pk_user_info.win_times + pk_user_info.lose_times + pk_user_info.draw_times;
        if (total > 0) {
          pk_user_info.win_rate = Math.round(pk_user_info.win_times / total * 100) + '%';
        } else {
          pk_user_info.win_rate = '0%';
        }

        var pk_prediction = item.pk_prediction;
        if (pk_prediction) {
          pk_prediction.win_pk_point = num2str(pk_prediction.win_pk_point);
          pk_prediction.drawn_pk_point = num2str(pk_prediction.drawn_pk_point);
          pk_prediction.lose_pk_point = num2str(pk_prediction.lose_pk_point);
        } else {
          item.pk_prediction = {
            win_pk_point: '0',
            drawn_pk_point: '0',
            lose_pk_point: '0'
          };
        }
      });
      vm.matched_list(res);
    });
  }

  function num2str(num) {
    num = window.parseInt(num, 10);
    if (num > 0) {
      return '+' + num;
    }
    if (num <= 0) {
      return num.toString();
    }
  }

  function change_another_group() {
    vm.is_loading(true);
    random_match().always(function () {
      vm.is_loading(false);
    });
  }

  function start_pk(data) {
    window.location.href = window.self_host + ('/' + project_domain + '/pk/' + pk_id + '/answer?rival_id=' + data.pk_user_vo.user_id);
  }

  function play_alone() {
    window.location.href = window.self_host + ('/' + project_domain + '/pk/' + pk_id + '/answer');
  }
}

var tpl = "<div class=\"pk-wrap wrapper\">\r\n  <div class=\"pk-choose-wrap\">\r\n    <div class=\"tit-part\">\r\n      <h3 data-bind=\"translate:{key: 'pk_choose.main_title'}\"></h3>\r\n      <!--<span class=\"ico-oprate ico-rank\">本关排行榜</span>-->\r\n    </div>\r\n    <div class=\"pk-master-list\" data-bind=\"css:{'no-one-pk': matched_list().length == 0}\">\r\n      <dl class=\"pk-person-item clearfix\">\r\n        <!--当前用户头像-->\r\n        <dt><a><img data-bind=\"attr:{src:curr_user_icon}\"></a></dt>\r\n        <dd class=\"info\">\r\n          <div class=\"info-wrap\">\r\n            <!--当前用户名-->\r\n            <h4><a data-bind=\"text:curr_user_name\"></a></h4>\r\n            <!--当前用户来自-->\r\n            <p class=\"from\" data-bind=\"text:curr_user_from\"></p>\r\n          </div>\r\n        </dd>\r\n        <dd class=\"pk-situ\">\r\n          <div class=\"situ-wrap\">\r\n            <div class=\"situ-top\">\r\n\r\n              <!--ko if:matched_list().length>0-->\r\n              <!--当前用户胜率-->\r\n              <span><!--ko translate:{key: 'pk_choose.winning_percentage'}--><!--/ko-->：<em data-bind=\"text:curr_user_win_rate\"></em></span>\r\n              <!--当前用户排名-->\r\n              <span><!--ko translate:{key: 'pk_choose.ranking'}--><!--/ko-->：<em data-bind=\"text:curr_user_ranking\"></em><!--ko translate:{key: 'pk_choose.ranking_quantifier'}--><!--/ko--></span>\r\n              <!--当前用户PK分数-->\r\n              <span><!--ko translate:{key: 'pk_choose.score'}--><!--/ko-->：<em data-bind=\"text:curr_user_score\"></em><!--ko translate:{key: 'pk_choose.score_quantifier'}--><!--/ko--></span>\r\n              <!--/ko-->\r\n\r\n              <!--ko if:matched_list().length == 0-->\r\n              <span><!--ko translate:{key: 'pk_choose.winning_percentage'}--><!--/ko-->：<em data-bind=\"text:curr_user_win_rate\"></em></span>\r\n              <span><!--ko translate:{key: 'pk_choose.ranking'}--><!--/ko-->：<em data-bind=\"text:curr_user_ranking\"></em></span>\r\n              <span><!--ko translate:{key: 'pk_choose.score'}--><!--/ko-->：<em data-bind=\"text:curr_user_score\"></em></span>\r\n              <!--/ko-->\r\n\r\n            </div>\r\n          </div>\r\n        </dd>\r\n      </dl>\r\n    </div>\r\n    <div class=\"pk-chooser-wrap\">\r\n      <div class=\"tit-center\">\r\n        <h3></h3>\r\n        <div class=\"btn-wrap\">\r\n          <!--换一组-->\r\n          <!--ko if:matched_list().length>0-->\r\n          <a class=\"btn-change\" href=\"javascript:void(0);\" data-bind=\"click:change_another_group,translate:{key: 'pk_choose.change_group'}\"></a>\r\n          <!--/ko-->\r\n        </div>\r\n      </div>\r\n      <div class=\"pk-chooser-list\">\r\n        <!--ko if:!is_loading()-->\r\n\r\n        <!-- 有PK对手时 -->\r\n        <!--ko if:matched_list().length > 0-->\r\n        <!--ko foreach:matched_list-->\r\n        <div class=\"pk-rival-item\">\r\n          <!--对手基本信息-->\r\n          <div class=\"rival-info\">\r\n            <img data-bind=\"attr:{src:uc_user_display_facade.icon+'&defaultImage=1'}\" width=\"60\" height=\"60\">\r\n            <div class=\"rival-meta\">\r\n              <p class=\"rival-name\" data-bind=\"text:uc_user_display_facade.display_name\"></p>\r\n              <p class=\"rival-from\" data-bind=\"text:uc_user_display_facade.org_exinfo && uc_user_display_facade.org_exinfo.node_name\"></p>\r\n            </div>\r\n          </div>\r\n          <!--对手PK信息-->\r\n          <div class=\"rival-pk-data\">\r\n            <p class=\"lino\">\r\n              <span><!--ko translate:{key: 'pk_choose.winning_percentage'}--><!--/ko-->：<em data-bind=\"text:pk_user_vo.win_rate\"></em></span>\r\n              <!--排名-->\r\n              <span><!--translate:{key: 'pk_choose.ranking'}--><!--/--><em></em><!--translate:{key: 'pk_choose.ranking_quantifier'}--><!--/--></span>\r\n              <!--分数-->\r\n              <span><!--translate:{key: 'pk_choose.score'}--><!--/--><em></em><!--translate:{key: 'pk_choose.score_quantifier'}--><!--/--></span>\r\n            </p>\r\n            <!--ko if:pk_prediction-->\r\n            <p class=\"ein\">\r\n              <!--胜 +积分-->\r\n              <span data-bind=\"translate:{html:{key:'pk_choose.point_win',properties:{point:pk_prediction.win_pk_point}}}\"></span>\r\n              <!--平 +积分-->\r\n              <span data-bind=\"translate:{html:{key:'pk_choose.point_draw',properties:{point:pk_prediction.drawn_pk_point}}}\"></span>\r\n              <!--负 -积分-->\r\n              <span data-bind=\"translate:{html:{key:'pk_choose.point_lose',properties:{point:pk_prediction.lose_pk_point}}}\"></span>\r\n            </p>\r\n            <!--/ko-->\r\n          </div>\r\n          <a class=\"start-pk-btn\" href=\"javascript:void(0);\" data-bind=\"click:$component.start_pk\">PK</a>\r\n        </div>\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!-- 无PK对手时 -->\r\n        <!--ko if:matched_list().length == 0-->\r\n        <div class=\"no-pk-wrap\">\r\n          <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAACKCAYAAABB/hN4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjExNzhCMDU1Mzk2OTExRTc5QzhBOTEwNkJCMTM3NDI2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjExNzhCMDU2Mzk2OTExRTc5QzhBOTEwNkJCMTM3NDI2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTE3OEIwNTMzOTY5MTFFNzlDOEE5MTA2QkIxMzc0MjYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTE3OEIwNTQzOTY5MTFFNzlDOEE5MTA2QkIxMzc0MjYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz44UWyFAAABc0lEQVR42uzdQQ6CMBBAUWq8/1F7BQxrNJEwJe3MewdgQX5m0BRtvfetsH0jxMstQEgICSHBydstOGluwfUPKSYSVhtCQkggJISEkBASCAkhISSEBEJCSAgJhISQEBJCAiExjsP/Mf59Y7cFXy9CyMsOJhJWG1ZbNm3y6wlpsQCsNhASQkJIICSEhJDI6vgeyS+7Pift91YmEkJCSAgJvj9sl3oofFCpDzEmEkMnErWm2e0NZCJhtWG1MXjVmEhYbQgJhISQEBIICSEhJIQEQkJICAkhwTWOkczJCUmsNrDaknFCEqsNhISQEBIICSEhJIQEQkJICAkhgZAQEkJCSCAkhEQOzmzPYfm/mzCREBJCQkjgYXtWy/8/nomEkBASQgIhISSEhJBASAgJISEkEBJCQkggJISEkBASCAkhISSEBEJCSAgJIYGQEBJCAiEhJISEkEBICAkhISQQEkJCSJT165f/d7cGEwkhISSEBPd8BBgAlbgN+wxiwjoAAAAASUVORK5CYII=\" alt=\"\">\r\n          <p data-bind=\"translate:{key:'pk_choose.not_found_msg'}\"></p>\r\n          <!--自己玩-->\r\n          <a href=\"javascript:void(0);\" class=\"btn-border-blue\" data-bind=\"click:play_alone,translate:{key:'pk_choose.play_alone'}\"></a>\r\n        </div>\r\n        <!--/ko-->\r\n\r\n        <!--/ko--><!--/end is_loading-->\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<!--ko if:is_loading()-->\r\n<div class=\"pk-choose-loading\">\r\n  <span></span>\r\n</div>\r\n<!--/ko-->";

ko$1.components.register("x-pk-choose", {
  viewModel: Model,
  template: tpl
});

}(ko,$));
