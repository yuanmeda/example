(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

function Model(params) {
  var vm = this;
  var offset = 2;

  vm.currPage = ko.observable(params.curr_page);
  vm.pageSize = params.page_size;
  vm.totalItems = ko.observable(params.total);

  vm.pages = ko.observableArray([]);
  vm.hasMore = ko.observable(false);
  vm.hasLess = ko.observable(false);
  vm.hasNext = ko.observable(false);
  vm.hasPrev = ko.observable(false);
  vm.changePage = changePage;

  watchCurrPage(vm.currPage());

  function changePage(page) {
    if (page == vm.currPage()) {
      return;
    }
    params.on_page_command(page);
  }

  function watchCurrPage(currPage) {
    var max = void 0;
    var min = 1;
    var start = void 0,
        end = void 0;
    max = Math.ceil(vm.totalItems() / vm.pageSize);
    vm.hasPrev(currPage > min);
    vm.hasNext(currPage < max);
    start = currPage - offset;
    end = currPage + offset;
    if (start < min) {
      start = min;
    }
    if (end > max) {
      end = max;
    }
    vm.hasLess(start > min);
    vm.hasMore(end < max);
    var pages = [];
    var i = start;
    while (i <= end) {
      pages.push(i);
      i++;
    }
    vm.pages(pages);
  }
}

var template = "<!--ko if:pages().length>1-->\r\n<div class=\"qas-pagination\">\r\n  <!--ko if:hasPrev()-->\r\n  <span class=\"prev\" data-bind=\"click:changePage.bind(this, currPage()-1),translate:{key:'qas_cmp_questions.acts.prev_page'}\">上一页</span>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:hasLess()-->\r\n  <span class=\"omit\">...</span>\r\n  <!--/ko-->\r\n\r\n  <!--ko foreach: pages-->\r\n  <span data-bind=\"text:$data,css:{on:$data == $component.currPage()},click:$component.changePage.bind(this, $data)\"></span>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:hasMore()-->\r\n  <span class=\"omit\">...</span>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:hasNext()-->\r\n  <span class=\"next\" data-bind=\"click:changePage.bind(this, currPage()+1),translate:{key:'qas_cmp_questions.acts.next_page'}\">下一页</span>\r\n  <!--/ko-->\r\n</div>\r\n<!--/ko-->";

ko.components.register('x-qas-pagination-prv', {
  viewModel: Model,
  template: template
});

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

var timeZoneTrans = window.timeZoneTrans;

function Model$1(params) {
  var vm = this;
  var reply = params.reply;
  var options = params.options;
  var gw_host = options.gw_host;
  var reply_user = reply.reply_user_info;
  var reply_to_user = reply.reply_to_user_info;
  var is_toggle_like_loading = false;
  var store = {
    like: function like(id, is_like) {
      return ajax(gw_host + '/v1/answers/' + id + '/like', {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };
  var reply_label = window.i18nHelper.getKeyValue('qas_cmp_questions.acts.reply');

  vm.user_icon = reply.reply_user_info.icon + '&defaultImage=1';
  var reply_user_name = reply_user.display_name || reply_user.user_name || reply_user.nick_name || reply_user.nick_name_full || reply_user.nick_name_short;
  var reply_to_user_name = reply_to_user.display_name || reply_to_user.user_name || reply_to_user.nick_name || reply_to_user.nick_name_full || reply_to_user.nick_name_short;
  vm.pre_info = reply_user_name + ' ' + reply_label + '\uFF1A ' + reply_to_user_name;
  vm.content = reply.content;
  vm.update_time = timeZoneTrans(reply.update_time);
  vm.is_current_user_like = ko.observable(reply.is_current_user_like || false);
  vm.like_count = ko.observable(reply.like_count || 0);

  vm.toggle_like = toggle_like;

  function toggle_like() {
    if (is_toggle_like_loading) {
      return;
    }
    is_toggle_like_loading = true;
    var target_like = !vm.is_current_user_like();
    store.like(reply.id, target_like).then(function () {
      var count = void 0;
      var curr_count = vm.like_count();
      vm.is_current_user_like(target_like);
      count = vm.is_current_user_like() ? curr_count + 1 : curr_count - 1;
      vm.like_count(count);
    }).always(function () {
      is_toggle_like_loading = false;
    });
  }
}

var template$1 = "<!--回复-->\r\n<div class=\"qas-rose\">\r\n  <!--头像-->\r\n  <div class=\"qas-profile\">\r\n    <img width=\"50\" height=\"50\" data-bind=\"attr:{src:user_icon}\">\r\n  </div>\r\n  <div class=\"qas-wrap\">\r\n    <!--用户名等前导信息-->\r\n    <p class=\"qas-prelead\" data-bind=\"text:pre_info\"></p>\r\n    <!--回答内容-->\r\n    <div class=\"qas-re-desc\" data-bind=\"text:content\"></div>\r\n    <!--时间-->\r\n    <p class=\"qas-time\" data-bind=\"text:update_time\"></p>\r\n    <!--脚部-->\r\n    <div class=\"qas-footer\">\r\n      <!--点赞-->\r\n      <span class=\"qas-praise\" data-bind=\"click:toggle_like,css:{on:is_current_user_like()}\">\r\n        <i class=\"iconfont-qas ico-qas-praise\"></i>\r\n        <!--ko text:like_count--><!--/ko-->\r\n      </span>\r\n    </div>\r\n  </div>\r\n</div>";

ko.components.register("x-qas-reply", {
  viewModel: Model$1,
  template: template$1
});

function Model$2(params) {

  var vm = this;
  var answer = params.answer;
  var options = params.options;
  var question = options.question;
  var api_host = options.api_host;
  var gw_host = options.gw_host;
  var is_publish_permit = typeof options.is_publish_permit === 'undefined' ? true : options.is_publish_permit;
  var is_toggle_like_loading = false;
  var store = {
    accept: function accept(is_accept) {
      return ajax(api_host + '/v1/answers/' + answer.id + '/actions/accept/' + is_accept.toString(), {
        type: 'PUT'
      });
    },
    del: function del() {
      return ajax(api_host + '/v1/answers/' + answer.id, {
        type: 'DELETE'
      });
    },
    like: function like(id, is_like) {
      return ajax(gw_host + '/v1/answers/' + id + '/like', {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };

  vm.show_images = options.show_images || false;
  vm.user_icon = answer.display_user.icon + '&defaultImage=1';
  vm.like_count = ko.observable(answer.like_count || 0);
  vm.reply_count = ko.observable(answer.reply_count || 0);
  vm.is_current_user_like = ko.observable(answer.is_current_user_like || false);
  vm.pre_info = answer.display_user.display_name;
  vm.content = answer.content;
  vm.create_time = timeZoneTrans(answer.create_time);
  vm.has_accepted = ko.observable(!!answer.accepted);
  vm.show_pop_replies = ko.observable(false);
  vm.is_my_answer = options.curr_user_id == answer.display_user.user_id;
  vm.is_my_question = options.curr_user_id == ko.unwrap(question.display_user.user_id);
  vm.pop_replies_params = {
    is_publish_permit: is_publish_permit,
    answer: answer,
    question: question,
    api_host: api_host,
    gw_host: gw_host,
    is_my_answer: vm.is_my_answer,
    on_close_command: function on_close_command(reply_add_count) {
      vm.reply_count(vm.reply_count() + reply_add_count);
      vm.show_pop_replies(false);
    }
  };
  vm.image_preview_params = {
    images: answer.attach_pictures || []
  };

  vm.has_question_accepted = question.accepted_answer_id;
  vm.open_pop_replies = open_pop_replies;
  vm.accept_it = accept_it;
  vm.cancel_accept = cancel_accept;
  vm.del = del;
  vm.toggle_like = toggle_like;

  function open_pop_replies() {
    vm.show_pop_replies(true);
  }

  function accept_it() {
    store.accept(true).then(function () {
      vm.has_accepted(true);
      vm.has_question_accepted(answer.id);
    });
  }

  function cancel_accept() {
    store.accept(false).then(function () {
      vm.has_accepted(false);
      vm.has_question_accepted(null);
    });
  }

  function del() {
    var title = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.alert_title');
    var confirm_label = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.confirm');
    var cancel_label = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.cancel');
    var msg = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_answer_confirm');
    if (vm.reply_count() > 0) {
      msg = window.i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.has_reply');
    }
    $.fn.udialog.confirm(msg, [{
      'class': 'ui-btn-confirm',
      text: confirm_label,
      click: function click() {
        store.del().then(function () {
          options.on_del_command(answer.id);
        });
        $(this).udialog("hide");
      }
    }, {
      'class': 'ui-btn-primary',
      text: cancel_label,
      click: function click() {
        $(this).udialog("hide");
      }
    }], {
      title: title
    });
  }

  function toggle_like() {
    if (is_toggle_like_loading) {
      return;
    }
    is_toggle_like_loading = true;
    var target_like = !vm.is_current_user_like();
    store.like(answer.id, target_like).then(function () {
      var count = void 0;
      var curr_count = vm.like_count();
      vm.is_current_user_like(target_like);
      count = vm.is_current_user_like() ? curr_count + 1 : curr_count - 1;
      vm.like_count(count);
    }).always(function () {
      is_toggle_like_loading = false;
    });
  }
}

function MyAnswerModel(params) {
  var vm = this;
  var answer = params.my_answer;
  var options = params.options;
  var question = answer.question_vo;
  var gw_host = options.gw_host;
  var is_toggle_like_loading = false;
  var store = {
    like: function like(id, is_like) {
      return ajax(gw_host + '/v1/answers/' + id + '/like', {
        type: is_like ? 'POST' : 'DELETE'
      });
    }
  };

  vm.user_icon = answer.display_user.icon + '&defaultImage=1';
  vm.answer_content = answer.content;
  vm.answer_create_time = timeZoneTrans(answer.create_time);
  vm.question_title = question.title;
  vm.question_user_name = question.display_user.display_name;
  vm.question_create_time = timeZoneTrans(question.create_time);
  vm.question_target_name = question.target_name;
  vm.like_count = ko.observable(answer.like_count || 0);
  vm.is_current_user_like = ko.observable(answer.is_current_user_like || false);

  vm.view_detail = view_detail;
  vm.toggle_like = toggle_like;

  function view_detail() {
    options.on_question_title_command(question);
  }

  function toggle_like() {
    if (is_toggle_like_loading) {
      return;
    }
    is_toggle_like_loading = true;
    var target_like = !vm.is_current_user_like();
    store.like(answer.id, target_like).then(function () {
      var count = void 0;
      var curr_count = vm.like_count();
      vm.is_current_user_like(target_like);
      count = vm.is_current_user_like() ? curr_count + 1 : curr_count - 1;
      vm.like_count(count);
    }).always(function () {
      is_toggle_like_loading = false;
    });
  }
}

var tpl_my_answer = "<!--回答-我的回答，包含问题-->\r\n<div class=\"qas-moran\">\r\n  <!--头像-->\r\n  <div class=\"qas-profile\">\r\n    <img width=\"50\" height=\"50\" data-bind=\"attr:{src:user_icon}\">\r\n  </div>\r\n  <div class=\"qas-wrap\">\r\n    <!--回答内容-->\r\n    <div class=\"qas-re-desc\" data-bind=\"text:answer_content\"></div>\r\n    <!--被回答的问题-->\r\n    <div class=\"qas-inner-question\">\r\n      <!--问题的标题-->\r\n      <h1 class=\"qas-title\" data-bind=\"text:question_title,click:view_detail\"></h1>\r\n      <!--问题的数据-->\r\n      <p class=\"qas-meta\">\r\n        <!--提问者名字-->\r\n        <span data-bind=\"text:question_user_name\"></span>\r\n        <!--问题创建日期-->\r\n        <span data-bind=\"text:question_create_time\"></span>\r\n        <!--来源-->\r\n        <!--ko if:question_target_name-->\r\n        <span data-bind=\"text:question_target_name\"></span>\r\n        <!--/ko-->\r\n      </p>\r\n      <span class=\"arrow\"></span>\r\n    </div>\r\n    <!--脚部-->\r\n    <div class=\"qas-footer\">\r\n      <!--回答创建时间-->\r\n      <span class=\"qas-time\" data-bind=\"text:answer_create_time\"></span>\r\n      <!--点赞-->\r\n      <span class=\"qas-praise\" data-bind=\"click:toggle_like,css:{on:is_current_user_like()}\">\r\n        <i class=\"iconfont-qas ico-qas-praise\"></i>\r\n        <!--ko text:like_count--><!--/ko-->\r\n      </span>\r\n    </div>\r\n  </div>\r\n</div>";

var tpl = "<!--回答-问题列表-展开回答列表-->\r\n<div class=\"qas-rose\">\r\n  <!--头像-->\r\n  <div class=\"qas-profile\">\r\n    <img width=\"50\" height=\"50\" data-bind=\"attr:{src:user_icon}\">\r\n  </div>\r\n  <div class=\"qas-wrap\">\r\n    <!--用户名等前导信息-->\r\n    <p class=\"qas-prelead\" data-bind=\"text:pre_info\"></p>\r\n    <!--回答内容-->\r\n    <div class=\"qas-re-desc\" data-bind=\"text:content\"></div>\r\n    <!--图片-->\r\n    <!--ko if:show_images && image_preview_params.images.length > 0-->\r\n    <!--ko component:{name:'x-qas-image-preview', params:image_preview_params}--><!--/ko-->\r\n    <!--/ko-->\r\n    <!--时间-->\r\n    <p class=\"qas-time\" data-bind=\"text:create_time\"></p>\r\n    <!--脚部-->\r\n    <div class=\"qas-footer\">\r\n      <!--回复数-->\r\n      <span class=\"qas-reply-count\" data-bind=\"click:open_pop_replies\">\r\n        <i class=\"iconfont-qas ico-qas-chat\"></i><strong></strong>\r\n        <!--ko text:reply_count--><!--/ko-->\r\n        <!--ko translate:{key: 'qas_cmp_questions.reply_label'}--><!--/ko-->\r\n      </span>\r\n\r\n      <!--点赞-->\r\n      <span class=\"qas-praise\" data-bind=\"click:toggle_like,css:{on:is_current_user_like()}\">\r\n        <i class=\"iconfont-qas ico-qas-praise\"></i>\r\n        <!--ko text:like_count--><!--/ko-->\r\n      </span>\r\n\r\n      <!--采纳-->\r\n      <!--ko if:is_my_question && !has_question_accepted() && !has_accepted()-->\r\n      <span class=\"qas-do-accept\" data-bind=\"click:accept_it\">\r\n        <i class=\"iconfont-qas ico-qas-xunzhang\"></i><!--ko translate:{key:'qas_cmp_questions.acts.accept'}--><!--/ko-->\r\n      </span>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:is_my_question && has_question_accepted() && has_accepted()-->\r\n      <span class=\"qas-do-accept\" data-bind=\"click:cancel_accept\">\r\n        <i class=\"iconfont-qas ico-qas-xunzhang\"></i><!--ko translate:{key:'qas_cmp_questions.acts.cancel_accept'}--><!--/ko-->\r\n      </span>\r\n      <!--/ko-->\r\n\r\n      <!--删除-->\r\n      <!--ko if:is_my_answer && !has_accepted()-->\r\n      <span class=\"qas-do-del\" data-bind=\"click:del\"><i class=\"iconfont-qas ico-qas-delete\"></i>\r\n        <!--ko translate:{key:'qas_cmp_questions.acts.del'}--><!--/ko-->\r\n      </span>\r\n      <!--/ko-->\r\n    </div>\r\n  </div>\r\n  <!--已采纳-->\r\n  <!--ko if:has_accepted()-->\r\n  <span class=\"qas-accepted\"></span>\r\n  <!--/ko-->\r\n</div>\r\n<!--ko if:show_pop_replies()-->\r\n<!--ko component:{name:'x-qas-pop-replies', params:pop_replies_params}--><!--/ko-->\r\n<!--/ko-->";

ko.components.register("x-qas-answer-mine", {
  viewModel: MyAnswerModel,
  template: tpl_my_answer
});

ko.components.register("x-qas-answer", {
  viewModel: Model$2,
  template: tpl
});

function Model$3(params) {
  var vm = this;
  var page_size = 5;
  var gw_host = params.gw_host;
  var api_host = params.api_host;
  var question = params.question;
  var on_answer_success = params.on_answer_success || function () {};
  var on_del_success = params.on_del_success || function () {};
  var question_id = question.id;
  var is_mine = params.is_mine;
  var curr_user_id = params.curr_user_id;
  var content_max = 2000;
  var is_publish_permit = typeof params.is_publish_permit === 'undefined' ? true : params.is_publish_permit;
  var getI18nKeyValue = window.i18nHelper.getKeyValue;
  var api_get_answers = gw_host + '/v1/answers/search';
  var api_post_answer = api_host + '/v1/answers';
  var get_answers_xhr = void 0;

  vm.is_mine = is_mine;
  vm.list = ko.observableArray();
  vm.total = ko.observable(0);
  vm.page_num = ko.observable(1);
  vm.showPagination = ko.observable(false);
  vm.pagination_params = ko.observable();
  vm.valid = ko.observable(false);
  vm.submitting = ko.observable(false);
  vm.re_content = ko.observable();
  vm.answer_options = {
    is_publish_permit: is_publish_permit,
    gw_host: gw_host,
    api_host: api_host,
    question: question,
    curr_user_id: curr_user_id,
    show_images: params.show_images || false,
    on_del_command: function on_del_command(answer_id) {
      get_answers_xhr = get_answers(vm.page_num()).then(function () {
        on_del_success(answer_id);
      });
    }
  };
  vm.post_answer_params = {
    question: question,
    is_publish_permit: is_publish_permit,
    gw_host: gw_host,
    api_host: api_host,
    on_submit_success: on_submit_success
  };

  vm.re_content.subscribe(subscribe_re_content);
  vm.dispose = dispose;

  get_answers(vm.page_num());

  function on_submit_success() {
    vm.page_num(1);
    on_answer_success();
    return get_answers(vm.page_num());
  }

  function get_answers(page_num) {
    return ajax(api_get_answers, {
      type: 'GET',
      data: {
        question_id: question_id,
        page_no: page_num - 1,
        page_size: page_size
      }
    }).then(function (res) {
      vm.list(res.items || []);
      vm.total(res.total || 0);
      vm.pagination_params({
        curr_page: page_num,
        page_size: page_size,
        total: vm.total(),
        on_page_command: on_page_command
      });
      vm.page_num(page_num);
      vm.showPagination(true);
    });
  }

  function on_page_command(page) {
    get_answers(page);
  }

  function subscribe_re_content(v) {
    var content = $.trim(v);
    vm.valid(content.length > 0);
    if (content.length > content_max) {
      vm.re_content(content.slice(0, content_max));
    }
  }

  function dispose() {
    get_answers_xhr && get_answers_xhr.abort();
  }
}

var template$2 = "<div class=\"qas-answer-list\">\r\n\r\n  <!--填写回答内容-->\r\n  <!--ko if:!is_mine-->\r\n  <!--ko component:{name:'x-qas-post-answer', params:post_answer_params}--><!--/ko-->\r\n  <!--/ko-->\r\n\r\n\r\n  <!--ko if:list().length-->\r\n  <h1 class=\"qas-title\" data-bind=\"translate:{key:'qas_cmp_questions.answers_count',properties:{total:total()}}\"></h1>\r\n\r\n  <div class=\"qas-list-container\">\r\n    <!--列表-->\r\n    <!--ko foreach:list-->\r\n    <!--ko component:{name:'x-qas-answer', params:{answer:$data, options:$component.answer_options}}--><!--/ko-->\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:!list().length-->\r\n  <div class=\"qas-list-empty\" data-bind=\"translate:{key: 'qas_cmp_questions.answer_list_empty'}\"></div>\r\n  <!--/ko-->\r\n\r\n\r\n  <!--分页-->\r\n  <!--ko if:showPagination()-->\r\n  <!--ko component:{name:'x-qas-pagination-prv',params:pagination_params}--><!--/ko-->\r\n  <!--/ko-->\r\n  <span class=\"qas-arr\"></span>\r\n</div>";

var tpl_indep = "<!--独立的回答列表-->\r\n<div class=\"qas-answer-list indep\">\r\n\r\n  <h1 class=\"qas-title\" data-bind=\"translate:{html:{key:'qas_cmp_questions.answers_count',properties:{total:total}}}\"></h1>\r\n\r\n  <div class=\"qas-list-container\">\r\n    <!--列表-->\r\n    <!--ko foreach:list-->\r\n    <!--ko component:{name:'x-qas-answer', params:{answer:$data, options:$component.answer_options}}--><!--/ko-->\r\n    <!--/ko-->\r\n  </div>\r\n  <!--分页-->\r\n  <!--ko if:showPagination()-->\r\n  <!--ko component:{name:'x-qas-pagination-prv',params:pagination_params}--><!--/ko-->\r\n  <!--/ko-->\r\n</div>";

ko.components.register('x-qas-ans-li-quick-view', {
  viewModel: Model$3,
  template: template$2
});

ko.components.register('x-qas-ans-indep', {
  viewModel: Model$3,
  template: tpl_indep
});

function Model$4(params) {
  var vm = this;
  var question = params.question;
  var options = {};
  $.extend(options, {
    keyword: ko.observable(''),
    curr_user_id: null,
    api_host: null,
    gw_host: null,
    on_del_command: function on_del_command() {},
    on_edit_command: function on_edit_command() {},
    on_title_command: function on_title_command() {},
    on_answer_submit_success: function on_answer_submit_success() {},

    display_answers: true,
    display_edit: true,
    display_acts: true,
    no_border: false
  }, params.options);
  var i18nHelper = window.i18nHelper;
  var curr_user_id = options.curr_user_id;
  var gw_host = options.gw_host;
  var api_host = options.api_host;
  var on_answer_submit_success = options.on_answer_submit_success;
  var is_publish_permit = typeof options.is_publish_permit === 'undefined' ? true : options.is_publish_permit;
  var on_unfollowed = options.on_unfollowed || function () {};
  var confirm_label = i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.confirm');
  var cancel_label = i18nHelper.getKeyValue('qas_cmp_questions.dlg_btn.cancel');
  var confirm_dlg_title = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.alert_title');
  var is_follow_loading = false;
  var store = {
    del: function del() {
      return ajax(gw_host + '/v1/questions/' + question.id, {
        type: 'DELETE'
      });
    },
    toggle_follow: function toggle_follow(is_add) {
      var method = is_add ? 'POST' : 'DELETE';
      return ajax(gw_host + '/v1/questions/' + question.id + '/follow', {
        type: method
      });
    }
  };

  question.accepted_answer_id = ko.observable(question.accepted_answer_id);
  vm.id = question.id;
  vm.user_icon = question.display_user.icon + '&defaultImage=1';
  vm.title = question.title;
  vm.keyword = options.keyword;
  vm.content = question.content || '';
  vm.user_name = question.display_user.display_name;
  vm.create_time = timeZoneTrans(question.create_time);
  vm.target_name = question.target_name;
  vm.answer_count = ko.observable(question.answer_count || 0);
  vm.follow_count = ko.observable(question.follow_count || 0);
  vm.is_current_user_follow = ko.observable(question.is_current_user_follow);
  vm.is_mine = curr_user_id == question.display_user.user_id;
  vm.show_answers = ko.observable(false);
  vm.display_answers = options.display_answers;
  vm.display_edit = options.display_edit;
  vm.display_acts = options.display_acts;
  vm.no_border = options.no_border;
  vm.answers_list_params = {
    gw_host: gw_host,
    api_host: api_host,
    is_publish_permit: typeof is_publish_permit === 'undefined' ? true : is_publish_permit,
    question: question,
    curr_user_id: curr_user_id,
    is_mine: vm.is_mine,
    on_answer_success: function on_answer_success() {
      vm.answer_count(vm.answer_count() + 1);
    },
    on_del_success: function on_del_success() {
      vm.answer_count(vm.answer_count() - 1);
    }
  };
  vm.image_preview_params = {
    images: question.attach_pictures || []
  };
  vm.post_answer_params = {
    question: question,
    is_publish_permit: is_publish_permit,
    gw_host: gw_host,
    api_host: api_host,
    on_submit_success: on_answer_submit_success
  };
  vm.follow_label = ko.pureComputed(function () {
    var key = void 0;
    key = this.is_current_user_follow() ? 'followed' : 'not_follow';
    return i18nHelper.getKeyValue('qas_cmp_questions.' + key);
  }, vm);

  vm.toggle_answers = toggle_answers;
  vm.del = del;
  vm.edit = edit;
  vm.view_detail = view_detail;
  vm.toggle_follow = toggle_follow;

  function toggle_answers() {
    vm.show_answers(!vm.show_answers());
  }

  function del() {
    var msg = void 0;
    if (vm.answer_count() > 0) {
      msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.has_answer');
    } else {
      msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.del_confirm.no_answer');
    }
    $.fn.udialog.confirm(msg, [{
      'class': 'ui-btn-confirm',
      text: confirm_label,
      click: function click() {
        store.del().then(function () {
          options.on_del_command(question.id);
        });
        $(this).udialog("hide");
      }
    }, {
      'class': 'ui-btn-primary',
      text: cancel_label,
      click: function click() {
        $(this).udialog("hide");
      }
    }], {
      title: confirm_dlg_title
    });
  }

  function edit() {
    options.on_edit_command(question.id);
  }

  function view_detail() {
    options.on_title_command(question.id);
  }

  function toggle_follow() {
    if (is_follow_loading) {
      return;
    }
    var is_followed = vm.is_current_user_follow();
    if (is_followed) {
      var msg = i18nHelper.getKeyValue('qas_cmp_questions.dlg_msg.unfollow_confirm');
      $.fn.udialog.confirm(msg, [{
        'class': 'ui-btn-confirm',
        text: confirm_label,
        click: function click() {
          $(this).udialog("hide");
          is_follow_loading = true;
          store.toggle_follow(false).then(function () {
            vm.is_current_user_follow(false);
            vm.follow_count(vm.follow_count() - 1);
            on_unfollowed(question);
          }).always(function () {
            is_follow_loading = false;
          });
        }
      }, {
        'class': 'ui-btn-primary',
        text: cancel_label,
        click: function click() {
          $(this).udialog("hide");
        }
      }], { title: confirm_dlg_title });
    } else {
      is_follow_loading = true;
      store.toggle_follow(true).then(function () {
        vm.is_current_user_follow(true);
        vm.follow_count(vm.follow_count() + 1);
      }).always(function () {
        is_follow_loading = false;
      });
    }
  }
}

var template$3 = "<div class=\"qas-azalea\">\r\n  <!--头像-->\r\n  <div class=\"qas-profile\">\r\n    <img width=\"50\" height=\"50\" data-bind=\"attr:{src: user_icon}\">\r\n  </div>\r\n  <div class=\"qas-wrapper\">\r\n    <!--标题-->\r\n    <h1 class=\"qas-title view-details\" data-bind=\"keywordhh:{content:title,keyword:keyword()},click:view_detail\"></h1>\r\n    <!--问题描述-->\r\n    <div class=\"qas-desc\" data-bind=\"dot,keywordhh:{content:content,keyword:keyword()}\"></div>\r\n\r\n    <!--数据-->\r\n    <p class=\"qas-meta\">\r\n      <!--提问者姓名-->\r\n      <span data-bind=\"text:user_name\"></span>\r\n      <!--创建日期-->\r\n      <span data-bind=\"text:create_time\"></span>\r\n      <!--来源-->\r\n      <!--ko if:target_name-->\r\n      <span><!--ko translate:{key:'qas_cmp_questions.from'}--><!--/ko-->：<!--ko text:target_name--><!--/ko--></span>\r\n      <!--/ko-->\r\n    </p>\r\n    <!--脚部-->\r\n    <div class=\"qas-footer\">\r\n\r\n      <!--回答数/展开/收起-->\r\n      <!--ko if:display_answers-->\r\n      <!--ko if:!show_answers()-->\r\n      <span class=\"qas-ans-count\" data-bind=\"click:toggle_answers\">\r\n        <i class=\"iconfont-qas ico-qas-chat\"></i>\r\n        <!--ko if:answer_count() > 0 || is_mine-->\r\n        <strong data-bind=\"text:answer_count\"></strong>\r\n        <!--ko translate:{key:'qas_cmp_questions.answers_count_suffix'}--><!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--ko if:!is_mine && answer_count() === 0-->\r\n        <!--ko translate:{key:'qas_cmp_questions.add_answer'}--><!--/ko-->\r\n        <!--/ko-->\r\n      </span>\r\n      <!--/ko-->\r\n      <!--/ko-->\r\n\r\n      <!--关注-->\r\n      <span class=\"qas-follow-count\" data-bind=\"css:{on:is_current_user_follow()},click:toggle_follow\">\r\n        <i class=\"iconfont-qas ico-qas-star\"></i>\r\n        <!--ko text:follow_label--><!--/ko-->\r\n      </span>\r\n\r\n      <!--回答-->\r\n      <!--ko if:show_answers()-->\r\n      <span class=\"qas-ans-count\" data-bind=\"click:toggle_answers\">\r\n        <i class=\"iconfont-qas ico-qas-chat\"></i><!--ko translate:{key:'qas_cmp_questions.acts.hide_answers'}--><!--/ko-->\r\n      </span>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:display_acts-->\r\n      <!--其他操作-->\r\n      <div class=\"qas-acts\">\r\n        <!--编辑-->\r\n        <!--ko if:display_edit-->\r\n        <!--ko if:answer_count() == 0 && is_mine-->\r\n        <span class=\"act modify\" data-bind=\"click:edit\"><i class=\"iconfont-qas ico-qas-bianji\"></i><!--ko translate:{key:'qas_cmp_questions.acts.edit'}--><!--/ko--></span>\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--删除-->\r\n        <!--ko if:is_mine-->\r\n        <span class=\"act del\" data-bind=\"click:del\"><i class=\"iconfont-qas ico-qas-delete\"></i><!--ko translate:{key:'qas_cmp_questions.acts.del'}--><!--/ko--></span>\r\n        <!--/ko-->\r\n      </div>\r\n      <!--/ko-->\r\n\r\n    </div>\r\n\r\n    <!--回答列表-->\r\n    <!--ko if:show_answers()-->\r\n    <!--ko component:{name:'x-qas-ans-li-quick-view',params:answers_list_params}--><!--/ko-->\r\n    <!--/ko-->\r\n  </div>\r\n\r\n\r\n</div>";

var tpl_indep$1 = "<div class=\"qas-azalea\">\r\n  <!--头像-->\r\n  <div class=\"qas-profile\">\r\n    <img width=\"50\" height=\"50\" data-bind=\"attr:{src: user_icon}\">\r\n  </div>\r\n  <div class=\"qas-wrapper\">\r\n    <!--标题-->\r\n    <h1 class=\"qas-title\" data-bind=\"text:title\"></h1>\r\n\r\n    <!--问题描述-->\r\n    <div class=\"qas-desc\" data-bind=\"prewrap:content\"></div>\r\n\r\n    <!--图片-->\r\n    <!--ko if:image_preview_params.images.length > 0-->\r\n    <!--ko component:{name:'x-qas-image-preview', params:image_preview_params}--><!--/ko-->\r\n    <!--/ko-->\r\n\r\n    <!--数据-->\r\n    <p class=\"qas-meta\">\r\n      <!--提问者姓名-->\r\n      <span data-bind=\"text:user_name\"></span>\r\n      <!--创建日期-->\r\n      <span data-bind=\"text:create_time\"></span>\r\n      <!--来源-->\r\n      <!--ko if:target_name-->\r\n      <span>来自：<!--ko text:target_name--><!--/ko--></span>\r\n      <!--/ko-->\r\n    </p>\r\n\r\n    <p class=\"qas-meta\">\r\n      <!--关注数-->\r\n      <span><!--ko text:follow_count--><!--/ko--><!--ko translate:{key: 'qas_cmp_questions.follow_count'}--><!--/ko--></span>\r\n    </p>\r\n  </div>\r\n\r\n  <!--回答框-->\r\n  <!--ko if:!is_mine-->\r\n  <!--ko component:{name:'x-qas-post-answer', params:post_answer_params}--><!--/ko-->\r\n  <!--/ko-->\r\n</div>";

ko.bindingHandlers.dot = {
  init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.tasks.schedule(function () {
      var elm = $(element);
      var toggle = $('<span class="toggle"></span>');
      elm.dotdotdot({
        height: 59,
        after: toggle
      });
      elm.on('click', '.toggle', function () {
        var content = elm.triggerHandler("originalContent");
        elm.html('');
        elm.append(content);
        elm.off('click');
      });
    });
  }
};

ko.bindingHandlers.keywordhh = {
  init: function init(element, valueAccessor) {
    var bind_val = valueAccessor();
    var content = bind_val.content;
    var keyword = bind_val.keyword;
    var original_word = void 0,
        found = void 0;
    var reg_keyword = reg_char_escape(keyword);
    var reg = new RegExp(reg_keyword, 'gi');
    var striped = void 0;
    if (content === null) {
      return;
    }
    if (keyword.length === 0) {
      striped = [content];
    } else {
      striped = content.split(reg);
    }
    found = content.match(reg);
    original_word = found ? found[0] : '';
    $.each(striped, function (i, word) {
      var text_keyword = document.createTextNode(original_word);
      var text_normal_word = document.createTextNode(word);
      element.appendChild(text_normal_word);
      if (i < striped.length - 1) {
        var sp = document.createElement('span');
        sp.appendChild(text_keyword);
        element.appendChild(sp);
      }
    });
  }
};

ko.bindingHandlers.prewrap = {
  init: function init(element, valueAccessor) {
    var bind_val = valueAccessor();
    var content_split = bind_val.split(/\n/gi);
    $.each(content_split, function (i, chunk) {
      var text = document.createTextNode(chunk);
      element.appendChild(text);
      if (i < content_split.length - 1) {
        var br_node = document.createElement('br');
        element.appendChild(br_node);
      }
    });
  }
};

function reg_char_escape(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

ko.components.register("x-qas-question", {
  viewModel: Model$4,
  template: template$3
});

ko.components.register("x-qas-question-indep", {
  viewModel: Model$4,
  template: tpl_indep$1
});

function Model$5(params) {
  var vm = this;
  var answer = params.answer;
  var question_id = params.question.id;
  var answer_to_id = answer.id;
  var gw_host = params.gw_host;
  var api_host = params.api_host;
  var is_publish_permit = typeof params.is_publish_permit === 'undefined' ? true : params.is_publish_permit;
  var on_close_command = params.on_close_command;
  var getI18nKeyValue = window.i18nHelper.getKeyValue;
  var content_max = 500;
  var page_size = 5;
  var store = {
    get_replies: function get_replies(page_num) {
      ajax(gw_host + '/v1/replies/search', {
        type: 'GET',
        data: {
          answer_to_id: answer_to_id,
          page_no: page_num - 1,
          page_size: page_size
        }
      }).then(function (res) {
        res.total = res.total || 0;
        vm.total_items(res.total);
        vm.total_pages(Math.ceil(res.total / page_size));
        if (page_num === 1) {
          vm.replies(res.items);
        } else {
          $.each(res.items, function (idx, item) {
            vm.replies.push(item);
          });
        }
        vm.page_num(page_num);
      });
    },
    submit: function submit(data) {
      return ajax(api_host + '/v1/replies', {
        type: 'POST',
        data: data
      });
    }
  };
  var reply_add_count = 0;

  vm.is_my_answer = params.is_my_answer;
  vm.replies = ko.observableArray([]);
  vm.total_items = ko.observable(0);
  vm.total_pages = ko.observable(0);
  vm.page_num = ko.observable(1);
  vm.valid = ko.observable(false);
  vm.re_content = ko.observable('');
  vm.content_max = content_max;
  vm.submitting = ko.observable(false);
  vm.place_holder = getI18nKeyValue('qas_cmp_questions.reply_placeholder');
  vm.reply_options = {
    api_host: api_host,
    gw_host: gw_host
  };

  vm.submit = submit;
  vm.load_more = load_more;
  vm.close = close;

  vm.re_content.subscribe(subscribe_re_content);

  store.get_replies(vm.page_num());

  function submit() {
    if (!vm.valid() || vm.submitting()) {
      return;
    }

    if (!is_publish_permit) {
      var msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.unregister');
      var title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
      $.fn.udialog.alert(msg, { title: title });
      return;
    }
    vm.submitting(true);
    var data = JSON.stringify({
      content: $.trim(vm.re_content()),
      question_id: question_id,
      answer_to_id: answer_to_id
    });
    store.submit(data).pipe(function (res) {
      return store.get_replies(1);
    }).pipe(function () {
      reply_add_count++;
      vm.re_content('');
    }).always(function () {
      vm.submitting(false);
    });
  }

  function subscribe_re_content(content) {
    vm.valid($.trim(content).length > 0);
    if (content.length > content_max) {
      vm.re_content(content.slice(0, content_max));
    }
  }

  function load_more() {
    vm.page_num(vm.page_num() + 1);
    store.get_replies(vm.page_num());
  }

  function close() {
    on_close_command(reply_add_count);
  }
}

var template$4 = "<div class=\"qas-pop-replies\">\r\n  <div class=\"qas-pop-header\">\r\n    <h1 data-bind=\"translate:{key:'qas_cmp_questions.reply_pop_title'}\">查看回复</h1>\r\n    <span class=\"close\" data-bind=\"click:close\">×</span>\r\n  </div>\r\n  <div class=\"qas-pop-body\">\r\n    <!--填写回复内容-->\r\n    <div class=\"qas-rep-form\">\r\n      <div class=\"qas-rep-textarea\">\r\n        <textarea rows=\"3\" data-bind=\"value:re_content,valueUpdate:'input',attr:{placeholder:place_holder}\"></textarea>\r\n      </div>\r\n      <p class=\"qas-re-act\">\r\n        <!--ko if:!submitting()-->\r\n        <span class=\"submit\" data-bind=\"click:submit, css:{disabled: !valid()}, translate:{key:'qas_cmp_questions.acts.reply'}\">回复</span>\r\n        <!--/ko-->\r\n        <!--ko if:submitting()-->\r\n        <span class=\"submit disabled\" data-bind=\"translate:{key:'qas_cmp_questions.acts.submitting'}\">正在提交</span>\r\n        <!--/ko-->\r\n        <!--字数统计-->\r\n        <span class=\"count-down\">\r\n          <!--ko text:re_content().length--><!--/ko-->/<!--ko text:content_max--><!--/ko-->\r\n        </span>\r\n      </p>\r\n    </div>\r\n    <!--回复列表-->\r\n    <!--ko if:is_my_answer || total_items() > 0-->\r\n    <h1 class=\"qas-title\" data-bind=\"translate:{key:'qas_cmp_questions.reply_count', properties:{'total':total_items()}}\"></h1>\r\n    <!--/ko-->\r\n    <!--ko if:!is_my_answer && total_items() === 0-->\r\n    <h1 class=\"qas-title\" data-bind=\"translate:{key:'qas_cmp_questions.add_reply'}\"></h1>\r\n    <!--/ko-->\r\n    <!--ko if:total_items()-->\r\n    <div class=\"qas-replies\">\r\n      <!--ko foreach:replies-->\r\n      <!--ko component:{name:\"x-qas-reply\", params:{reply: $data, options: $component.reply_options}}--><!--/ko-->\r\n      <!--/ko-->\r\n    </div>\r\n    <!--/ko-->\r\n\r\n    <!--ko if:!total_items()-->\r\n    <div class=\"qas-empty\" data-bind=\"translate:{key:'qas_cmp_questions.empty'}\"></div>\r\n    <!--/ko-->\r\n\r\n    <!--ko if:page_num() < total_pages()-->\r\n    <p class=\"qas-re-load\"><span data-bind=\"click:load_more, translate:{key:'qas_cmp_questions.load_replies'}\">更多回复</span></p>\r\n    <!--/ko-->\r\n  </div>\r\n</div>\r\n<div class=\"qas-g-mask\"></div>";

ko.components.register("x-qas-pop-replies", {
  viewModel: Model$5,
  template: template$4
});

function Model$6(params) {
  var vm = this;

  vm.images = params.images;
  vm.show_img_play = ko.observable(false);
  vm.index = ko.observable(-1);
  vm.loaded = ko.observable(false);
  vm.index.subscribe(function () {
    vm.loaded(false);
  });

  vm.zoom_in = zoom_in;
  vm.next = next;
  vm.prev = prev;
  vm.close = close;
  vm.load = load;

  function zoom_in(index) {
    vm.index(index);
    vm.show_img_play(true);
  }

  function next() {
    var idx = vm.index() + 1;
    if (idx > params.images.length - 1) {
      idx = 0;
    }
    vm.index(idx);
  }

  function prev() {
    var idx = vm.index() - 1;
    if (idx < 0) {
      idx = params.images.length - 1;
    }
    vm.index(idx);
  }

  function close() {
    vm.show_img_play(false);
    vm.index(-1);
  }

  function load() {
    vm.loaded(true);
  }
}

var template$5 = "<div class=\"qas-image-preview\">\r\n    <!--ko foreach:images-->\r\n    <div class=\"image-item\" data-bind=\"style:{background: 'url('+resource_path+'&size=160) no-repeat center' },click:$component.zoom_in.bind(this, $index())\"></div>\r\n    <!--/ko-->\r\n</div>\r\n\r\n<!--ko if:show_img_play() && index() > -1-->\r\n<div class=\"image-pv-play\">\r\n    <div class=\"pic-panel\" data-bind=\"imglocate:index(),visible:loaded\">\r\n        <span class=\"close\" data-bind=\"click:close\"></span>\r\n        <span class=\"prev\" data-bind=\"click:prev\"></span>\r\n        <span class=\"next\" data-bind=\"click:next\"></span>\r\n        <img data-bind=\"attr:{src:images[index()].resource_path + '&v=' + new Date().getTime()},click:close,event:{load:load}\">\r\n    </div>\r\n    <div class=\"msk\">\r\n        <img class=\"mask-loading\" src=\"data:image/gif;base64,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\">\r\n    </div>\r\n</div>\r\n<!--/ko-->";

ko.bindingHandlers.imglocate = {
  init: function init(element) {
    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
      $(window).off('resize.imglocate');
    });
  },
  update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.tasks.schedule(function () {
      element = $(element);
      var win_height = $(window).height() - 50;
      var win_width = $(window).width() - 100;
      var image = element.find('img');
      var height = $(image[0]).naturalHeight(),
          width = $(image[0]).naturalWidth();
      locate(element, image, width, height, win_width, win_height);
      image.on('load', function () {
        height = $(image[0]).naturalHeight();
        width = $(image[0]).naturalWidth();
        locate(element, image, width, height, win_width, win_height);
      });
      $(window).on('resize.imglocate', function () {
        win_height = $(window).height() - 50;
        win_width = $(window).width() - 100;
        locate(element, image, width, height, win_width, win_height);
      });
    });
  }
};

function locate(wrapper, image, width, height, max_width, max_height) {
  var ratio = void 0;
  if (height > max_height || width > max_width) {
    if (height > width) {
      ratio = max_height / height;
      height = max_height;
      width = width * ratio;
    } else {
      ratio = max_width / width;
      width = max_width;
      height = height * ratio;
    }
  }
  image.attr({
    width: width,
    height: height
  });
  wrapper.css({
    top: (max_height + 50 - height) / 2,
    left: (max_width + 100 - width) / 2
  });
}

function natural() {
  var props = ['Width', 'Height'],
      prop = void 0;
  while (prop = props.pop()) {
    (function (natural, prop) {
      $.fn[natural] = natural in new Image() ? function () {
        return this[0][natural];
      } : function () {
        var node = this[0],
            img = void 0,
            value = void 0;

        if (node.tagName.toLowerCase() === 'img') {
          img = new Image();
          img.src = node.src;
          value = img[prop];
        }
        return value;
      };
    })('natural' + prop, prop.toLowerCase());
  }
}

natural();

ko.components.register('x-qas-image-preview', {
  viewModel: Model$6,
  template: template$5
});

function Model$7(params) {
  var vm = this;
  var question = params.question;
  var is_publish_permit = typeof params.is_publish_permit === 'undefined' ? true : params.is_publish_permit;
  var on_submit_success = params.on_submit_success || function () {};
  var gw_host = params.gw_host;
  var api_host = params.api_host;
  var getI18nKeyValue = window.i18nHelper.getKeyValue;
  var content_max = 2000;
  var store = {
    submit: function submit(data) {
      return ajax(api_host + '/v1/answers', {
        type: 'POST',
        data: JSON.stringify(data)
      });
    }
  };

  vm.show_images_upload = ko.observable(false);
  vm.images = ko.observableArray([]);
  vm.re_content = ko.observable('');
  vm.valid = ko.observable();
  vm.submitting = ko.observable(false);
  vm.content_max = content_max;
  vm.image_upload_params = {
    api_url: api_host,
    attach_pictures: vm.images,
    is_show: vm.show_images_upload
  };

  vm.re_content.subscribe(subscribe_re_content);

  vm.submit = submit;
  vm.toggle_images_upload = toggle_images_upload;

  function subscribe_re_content(content) {
    vm.valid($.trim(content).length > 0);
    if (content.length > content_max) {
      vm.re_content(content.slice(0, content_max));
    }
  }
  function submit() {
    if (vm.submitting() || !vm.valid()) {
      return;
    }


    if (!is_publish_permit) {
      var msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.unregister');
      var title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
      $.fn.udialog.alert(msg, { title: title });
      return;
    }

    var data = {
      question_id: question.id,
      content: $.trim(vm.re_content()),
      attach_pictures: vm.images()
    };

    store.submit(data).pipe(function () {
      var msg = getI18nKeyValue('qas_cmp_questions.dlg_msg.answer_success');
      var confirm_label = getI18nKeyValue('qas_cmp_questions.dlg_btn.confirm');
      var title = getI18nKeyValue('qas_cmp_questions.dlg_msg.alert_title');
      $.fn.udialog.confirm(msg, [{
        text: confirm_label,
        'class': 'ui-btn-confirm',
        click: function click() {
          $(this).udialog("hide");
        }
      }], {
        title: title
      });
    }).pipe(function () {
      vm.re_content('');
      vm.images([]);
      vm.show_images_upload(false);
      on_submit_success();
    }).always(function () {
      vm.submitting(false);
    });
  }

  function toggle_images_upload() {
    vm.show_images_upload(!vm.show_images_upload());
  }
}

var template$6 = "<div class=\"qas-post-answer\">\r\n  <div class=\"qas-rep-textarea\">\r\n    <textarea rows=\"3\" placeholder=\"写下你的回答\" data-bind=\"value:re_content,valueUpdate:'input'\"></textarea>\r\n  </div>\r\n  <p class=\"qas-re-act\">\r\n    <span class=\"img-upload\" data-bind=\"click:toggle_images_upload,css:{on:show_images_upload()}\">\r\n      <i class=\"iconfont-qas ico-qas-image\"></i>\r\n      <!--ko translate:{key:'qas_cmp_questions.pics'}--><!--/ko-->\r\n    </span>\r\n    <!--ko if:!submitting()-->\r\n    <span class=\"submit\" data-bind=\"click:submit, css:{disabled: !valid()},translate:{key:'qas_cmp_questions.acts.answer'}\">回答</span>\r\n    <!--/ko-->\r\n    <!--ko if:submitting()-->\r\n    <span class=\"submit disabled\" data-bind=\"translate:{key:'qas_cmp_questions.acts.submitting'}\">正在提交</span>\r\n    <!--/ko-->\r\n    <!--字数统计-->\r\n    <span class=\"count-down\">\r\n      <!--ko text:re_content().length--><!--/ko-->/<!--ko text:content_max--><!--/ko-->\r\n    </span>\r\n  </p>\r\n  <div class=\"qas-img-uploader\" data-bind=\"visible:show_images_upload()\">\r\n    <!--ko component:{name:'x-question-uploadimg',params:image_upload_params}--><!--/ko-->\r\n  </div>\r\n</div>";

ko.components.register("x-qas-post-answer", {
  viewModel: Model$7,
  template: template$6
});

}(ko,$));
