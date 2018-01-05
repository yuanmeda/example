(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

function Model(params) {
  var vm = this;
  vm.content = JSON.parse(params.content || '[]');
  vm.course_name = params.course_name;
  vm.course_id = params.course_id;
  vm.selected = ko.observable({ id: params.init_id });

  vm.toggle_list = toggle_list;
  vm.switch_chapter = switch_chapter;
  vm.select_course = select_course;

  rebuild_content();

  function rebuild_content() {
    $.each(vm.content, function (idx, chapter) {
      $.each(chapter.children, function (i, section) {
        section.parent = chapter;
      });
    });
  }

  function toggle_list($data, event) {
    $(event.target).toggleClass('n-icon-minus');
    $(event.target).parent().toggleClass('open');
  }

  function switch_chapter($data, event) {
    vm.selected($data);
    params.on_chapter_command($data, event);
  }

  function select_course() {
    params.on_course_command();
    vm.selected({ id: params.course_id });
  }
}

var tpl = "<div class=\"note-side\">\r\n  <div class=\"n-ui-tab-menu\">\r\n    <a href=\"javascript:void(0);\" class=\"btn-tab\" data-bind=\"translate:{key:'qas_course_question.nav_course_title'}\">课程目录</a>\r\n    <!--<a href=\"###\" class=\"btn-tab\">知识索引</a>-->\r\n  </div>\r\n  <div class=\"n-ui-menu\">\r\n    <!-- 课程目录 -->\r\n    <dl class=\"dlist\" data-bind=\"visible: content.length\">\r\n      <!--课程名称-->\r\n      <dt data-bind=\"text: course_name,\r\n      click: select_course,\r\n      css:{active: selected().id === course_id},\r\n      attr: {title: course_name}\"></dt>\r\n      <!-- 一级-->\r\n      <!-- ko foreach: {data: content ,as: 'content'} -->\r\n      <dd data-bind=\"css:{'open': !$index()}\">\r\n        <em class=\"iconfont-learn n-icon-add\" data-bind=\"click: $component.toggle_list.bind($component),\r\n            css: $index()>0 ? 'n-icon-add': 'n-icon-minus'\"></em>\r\n        <span class=\"d-item\" data-bind=\"text: content.title,\r\n              css:{active: $component.selected() && $data.id === $component.selected().id},\r\n              attr:{title: content.title},\r\n              click: $component.switch_chapter.bind($component)\"></span>\r\n        <!-- 二级-->\r\n        <!-- ko if: content.children.length-->\r\n        <ul class=\"list\" data-bind=\"foreach: {data: content.children, as: 'section'}\">\r\n          <li class=\"sub-item\" data-bind=\"text: section.title,\r\n              css:{active: $component.selected() && $data.id === $component.selected().id},\r\n              attr:{title: section.title},\r\n              click: $component.switch_chapter.bind($component)\"></li>\r\n        </ul>\r\n        <!-- /ko -->\r\n      </dd>\r\n      <!-- /ko -->\r\n    </dl>\r\n    <!-- 课程目录为空 -->\r\n    <p class=\"no-menu\" data-bind=\"visible: !content.length,translate:{key:'qas_course_question.empty.nav'}\">暂无课程目录</p>\r\n  </div>\r\n</div>";

ko.components.register('x-qas-course-q-nav', {
  viewModel: Model,
  template: tpl
});

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

function Model$1(params) {
  var vm = this;
  var api_host = params.api_host;
  var gw_host = params.gw_host;
  var business_course_host = params.business_course_host;
  var course_host = params.course_host;
  var context_id = params.context_id;
  var course_id = params.course_id;
  var question = params.question || null;
  var is_open_course_1 = params.is_open_course_1;
  var is_modify = !!question;
  var on_post_success = params.on_post_success || function () {};
  var getI18nKeyValue = window.i18nHelper.getKeyValue;
  var watch_title = void 0;
  var get_match_xhr = void 0;
  var get_match_tmo = void 0;
  var get_question_xhr = void 0;
  var store = {
    upsert: function upsert(url, method, data) {
      return ajax(url, {
        type: method,
        data: JSON.stringify(data)
      });
    },
    get_match_list: function get_match_list(keyword) {
      return ajax(gw_host + '/v2/questions/search', {
        type: 'GET',
        data: {
          content: keyword,
          custom_id: course_id,
          page_no: 0,
          page_size: 10,
          type: 5
        }
      });
    },
    get_question: function get_question(id) {
      get_question_xhr = ajax(gw_host + '/v1/questions/' + id);
      return get_question_xhr;
    }
  };

  vm.is_loading_question = ko.observable(false);
  vm.max_title = 50;
  vm.max_content = 2000;
  vm.title_err_msg = ko.observable();
  vm.title = ko.observable();
  vm.title_has_focus = ko.observable(false);
  vm.content = ko.observable('');
  vm.content_has_focus = ko.observable(false);
  vm.match_enable = ko.observable(false);
  vm.match_list = ko.observableArray([]);
  vm.images = ko.observableArray([]);
  vm.show_images_upload = ko.observable(false);
  vm.submitting = ko.observable(false);
  vm.title_placeholder = window.i18nHelper.getKeyValue('qas_course_question.title_placeholder');
  vm.content_placeholder = window.i18nHelper.getKeyValue('qas_course_question.content_placeholder');
  vm.target_name = ko.computed(function () {
    return params.target_name();
  });
  vm.target_id = ko.computed(function () {
    return params.target_id();
  });
  vm.image_upload_params = {
    api_url: api_host,
    attach_pictures: vm.images,
    is_show: vm.show_images_upload
  };
  if (is_modify) {
    vm.target_name = ko.observable(question.target_name);
    vm.target_id = ko.observable(question.target_id);
  }

  vm.back = back;
  vm.submit = submit;
  vm.check_question = params.check_question;
  vm.toggle_images_upload = toggle_images_upload;
  vm.on_title_focus = on_title_focus;
  vm.stop_propagation = stop_propagation;
  vm.dispose = dispose;

  watch_title = vm.title.subscribe(subscribe_title);
  vm.content.subscribe(subscribe_content);

  get_question().then(function () {
    subscribe_title(vm.title());
  }).always(function () {
    vm.is_loading_question(false);
  });

  function get_question() {
    if (!is_modify) {
      return $.Deferred().resolve();
    } else {
      vm.is_loading_question(true);
      return store.get_question(question.id).then(function (res) {
        question = res;
        vm.title(res.title);
        vm.content(res.content);
        vm.images(res.attach_pictures);
      });
    }
  }

  function subscribe_title(v) {
    if (typeof v === 'undefined') {
      return;
    }
    var length = v.length;
    var max = vm.max_title;
    var err_msg = void 0;

    if (length > 0) {
      err_msg = '';
    } else {
      err_msg = getI18nKeyValue('qas_course_question.title_err.empty');
    }
    vm.title_err_msg(err_msg);
    if (length > max) {
      vm.title(v.substr(0, max));
    }

    if (vm.title_has_focus()) {
      try {
        get_match_xhr.abort();
      } catch (e) {}
      if (v.length > 0) {
        clearTimeout(get_match_tmo);
        get_match_tmo = setTimeout(function () {
          var kw = vm.title();
          if (kw) {
            get_match_xhr = store.get_match_list(kw).then(function (res) {
              vm.match_list(res.items);
            });
          } else {
            vm.match_list([]);
          }
        }, 500);
      } else {
        vm.match_list([]);
      }
    }
  }

  function subscribe_content(v) {
    var length = v.length;
    var max = vm.max_content;
    if (length > max) {
      vm.content(v.substr(0, max));
    }
  }

  function back() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    params.on_back_command(options);
  }

  function submit() {
    if (vm.submitting()) {
      return;
    }

    var title = $.trim(vm.title());
    if (title.length === 0) {
      vm.title_err_msg(getI18nKeyValue('qas_course_question.title_err.empty'));
      return;
    } else {
      vm.title_err_msg('');
    }

    var api_post_question = api_host + '/v1/questions';
    var method = 'POST';
    var target_name = vm.target_name();
    var target_id = vm.target_id();
    var biz_url = void 0,
        biz_param = void 0,
        biz_view = void 0;
    if (is_modify) {
      api_post_question = api_post_question + '/' + question.id;
      method = 'PUT';
      biz_url = question.biz_url;
      biz_param = question.biz_url;
      biz_view = question.biz_view;
    } else {
      if (target_id === course_id) {
        biz_param = JSON.stringify({
          course_id: course_id,
          resource_id: null,
          resource_type: null,
          location: null
        });
        biz_url = is_open_course_1 ? course_host + '/v1/business_courses/biz_data' : business_course_host + '/v1/business_courses/biz_data';
      }
      biz_view = is_open_course_1 ? 'course_biz_view' : 'course2_biz_view';
    }
    var post_data = {
      title: title,
      content: $.trim(vm.content()),
      context_id: context_id,
      custom_id: course_id,
      target_name: target_name,
      target_id: target_id,
      biz_url: biz_url,
      biz_param: biz_param,
      biz_view: biz_view,
      attach_pictures: vm.images()
    };

    vm.submitting(true);
    store.upsert(api_post_question, method, post_data).then(function () {
      var msg = getI18nKeyValue('qas_course_question.dlg_msg.post_question_success');
      var title = getI18nKeyValue('qas_course_question.dlg_msg.dlg_title');
      var tmo = void 0;
      var page_name = is_modify ? null : 'MY_QUESTION';
      $.fn.udialog.alert(msg, {
        closeTimes: 2000,
        title: title
      }, function () {
        back({ page_name: page_name });
        on_post_success();
        window.clearTimeout(tmo);
      });

      tmo = window.setTimeout(function () {
        back({ page_name: page_name });
        on_post_success();
      }, 2000);
      watch_title.dispose();
      vm.title('');
      vm.content('');
    }).always(function () {
      vm.submitting(false);
    });
  }

  function toggle_images_upload() {
    vm.show_images_upload(!vm.show_images_upload());
  }

  function on_title_focus() {
    vm.match_enable(true);
    var doc = $(document);
    doc.on('click.match', function () {
      vm.match_enable(false);
      doc.off('click.match');
    });
  }

  function stop_propagation(data, event) {
    event.stopPropagation();
  }

  function dispose() {
    get_question_xhr && get_question_xhr.abort();
  }
}

var tpl$1 = "<div class=\"qas-course-q-editor\">\r\n  <div class=\"qas-h\">\r\n    <!--ko if:target_name-->\r\n    <span class=\"qas-label\"><!--ko translate:{key:'qas_course_question.range'}--><!--/ko-->：<!--ko text:target_name--><!--/ko--></span>\r\n    <!--/ko-->\r\n    <span class=\"qas-return\" data-bind=\"click:back,translate:{key:'qas_course_question.acts.back'}\">返回</span>\r\n  </div>\r\n\r\n  <!--ko if:!is_loading_question()-->\r\n  <!--表单-->\r\n  <div class=\"qas-form\">\r\n    <p><!--ko translate:{key:'qas_course_question.label_question_title'}--><!--/ko-->：<span class=\"remain\" data-bind=\"text:(title() ? title().length : 0) + '/'+ max_title\"></span></p>\r\n    <div class=\"qas-q-title qas-q-field\" data-bind=\"css:{on:title_has_focus()}\">\r\n      <input type=\"text\" data-bind=\"\r\n        value:title,\r\n        valueUpdate:'input',\r\n        event:{focus:on_title_focus,click:stop_propagation},\r\n        attr:{placeholder:title_placeholder},\r\n        hasFocus:title_has_focus\">\r\n    </div>\r\n    <!--自动匹配-->\r\n    <!--ko if:match_list().length>0 && match_enable()-->\r\n    <div class=\"qas-q-title-match-list\" data-bind=\"event:{click:stop_propagation}\">\r\n      <h1 data-bind=\"translate:{key:'qas_course_question.match_list_title'}\">你的问题可能已有答案</h1>\r\n      <ul>\r\n        <!--ko foreach:match_list-->\r\n        <li data-bind=\"click:$component.check_question\">\r\n          <h2 data-bind=\"text:title\"></h2>\r\n          <!--ko if:answer_count>0-->\r\n          <span data-bind=\"translate:{key:'qas_course_question.answers_count', properties:{count:answer_count}}\"></span>\r\n          <!--/ko-->\r\n          <!--ko if:answer_count === 0-->\r\n          <span data-bind=\"translate:{key: 'qas_course_question.empty.no_answer'}\"></span>\r\n          <!--/ko-->\r\n        </li>\r\n        <!--/ko-->\r\n      </ul>\r\n    </div>\r\n    <!--/ko--><!--end if:match_list.length-->\r\n    <p style=\"color:red\" data-bind=\"text:title_err_msg\"></p>\r\n    <p><!--ko translate:{key:'qas_course_question.label_question_content'}--><!--/ko-->：</p>\r\n    <div class=\"qas-q-content qas-q-field\" data-bind=\"css:{on:content_has_focus()}\">\r\n      <textarea rows=\"10\" data-bind=\"value:content,valueUpdate:'input',attr:{placeholder:content_placeholder},hasFocus:content_has_focus\"></textarea>\r\n    </div>\r\n    <p><span class=\"remain\" data-bind=\"text:content().length + '/' + max_content\"></span></p>\r\n  </div>\r\n  <p class=\"qas-act\">\r\n    <span class=\"img-upload\" data-bind=\"click:toggle_images_upload,css:{on:show_images_upload()}\">\r\n      <i class=\"iconfont-qas-page ico-qasp-image\"></i>\r\n      <!--ko translate:{key:'qas_course_question.pics'}--><!--/ko-->\r\n    </span>\r\n    <span class=\"submit\" data-bind=\"click:submit,translate:{key:'qas_course_question.acts.submit_question'}\">马上提问</span>\r\n  </p>\r\n\r\n  <!--图片上传-->\r\n  <div class=\"qas-img-uploader\" data-bind=\"visible:show_images_upload()\">\r\n    <!--ko component:{name:'x-question-uploadimg',params:image_upload_params}--><!--/ko-->\r\n  </div>\r\n  <!--/ko--><!--end if:!is_loading_question-->\r\n\r\n\r\n  <!--ko if:is_loading_question()-->\r\n  <div class=\"qas-loading\" data-bind=\"translate:{key:'qas_course_question.loading'}\">加载中</div>\r\n  <!--/ko-->\r\n</div>";

ko.components.register('x-qas-course-q-editor', {
  viewModel: Model$1,
  template: tpl$1
});

function Model$2(params) {
  var vm = this;
  var api_host = window.assistUrl;
  var gw_host = window.assistGatewayUrl;
  var course_id = window.courseId;
  var curr_user_id = window.userId;
  var course_name = window.courseName;
  var course_host = window.courseUrl;
  var business_course_host = window.businessCourseUrl;
  var user_id = window.userId;
  var register_status = window.parseInt(window.userRegistStatus, 10);
  var course_register_type = window.parseInt(window.courseRegistType, 10);
  var is_open_course_1 = params && typeof params.is_open_course_1 !== 'undefined' ? params.is_open_course_1 : true;
  var getI18nKeyValue = window.i18nHelper.getKeyValue;
  var page_size = 10;
  var search_xhr = void 0;
  var search_query = void 0;

  var is_publish_permit = function () {
    if (course_register_type === 1) {
      return true;
    }

    return register_status === 1;
  }();
  var store = {
    get_questions: function get_questions(query) {
      search_xhr && search_xhr.abort();
      search_xhr = ajax(gw_host + '/v2/questions/search', {
        type: 'GET',
        data: query
      }).then(function (res) {
        $.each(res.items, function (idx, course) {
          var biz_data = JSON.parse(course.biz_data || null);
          var src_route = void 0,
              routes = [];
          if (!biz_data) {
            src_route = course.target_name ? course.target_name : course_name;
          } else {
            routes.push(biz_data.course_name);
            get_names(routes, biz_data.chapter_name);
            src_route = routes.join('>');
          }
          course.target_name = src_route;
        });
        on_get_list_success(res.items, res.total);

        function get_names(routes, node) {
          if (!node) {
            return;
          }
          routes.push(node.name);
          if (node.child) {
            get_names(routes, node.child);
          }
        }
      });
      return search_xhr;
    },
    get_my_answers: function get_my_answers(query) {
      search_xhr && search_xhr.abort();
      search_xhr = ajax(gw_host + '/v2/answers/mine', {
        type: 'GET',
        data: query
      }).then(function (res) {
        on_get_list_success(res.items, res.total);
      });
      return search_xhr;
    },
    get_my_follow: function get_my_follow(query) {
      search_xhr && search_xhr.abort();
      search_xhr = ajax(gw_host + '/v1/questions/mine/follows', {
        type: 'GET',
        data: query
      }).then(function (res) {
        on_get_list_success(res.items, res.total);
      });
      return search_xhr;
    }
  };

  vm.is_login = !!user_id;
  vm.is_loading = ko.observable(false);
  vm.target_name = ko.observable(course_name);
  vm.target_id = ko.observable(course_id);
  vm.keyword = ko.observable('');
  vm.has_fts_input_focus = ko.observable(false);
  vm.page_content = ko.observable('list');
  vm.empty_message = ko.observable();
  vm.total_items = ko.observable();
  vm.page_num = ko.observable(1);
  vm.list = ko.observableArray([]);
  vm.list_type = ko.observable(0);
  vm.list_tab = ko.observable(0);
  vm.show_pagination = ko.observable();
  vm.pagination_options = ko.observable();
  vm.nav_params = {
    course_id: course_id,
    init_id: course_id,
    content: window.noteContent,
    course_name: window.courseName,
    on_chapter_command: on_nav_chapter_command,
    on_course_command: on_nav_course_command
  };

  vm.question_options = {
    is_publish_permit: is_publish_permit,
    curr_user_id: curr_user_id,
    gw_host: gw_host,
    api_host: api_host,
    on_del_command: on_del_command,
    on_edit_command: function on_edit_command(question_id) {
      edit_question(find_item(question_id));
    },
    on_title_command: function on_title_command(question_id) {
      view_question_details(find_item(question_id));
    }
  };

  vm.fts_question_opts = $.extend({
    keyword: vm.keyword
  }, vm.question_options, true);

  vm.question_follow_opts = $.extend({
    on_unfollowed: on_unfollowed
  }, vm.question_options, true);

  vm.all_question_opts = vm.question_options;

  vm.my_answer_options = {
    gw_host: gw_host,
    on_question_title_command: function on_question_title_command(question) {
      view_question_details(question);
    }
  };
  vm.editor_params = {
    course_host: course_host,
    business_course_host: business_course_host,
    api_host: api_host,
    gw_host: gw_host,
    course_id: course_id,
    is_open_course_1: is_open_course_1,
    target_name: vm.target_name,
    target_id: vm.target_id,
    context_id: window.customType + ':' + window.customId + '.business_course:' + course_id,
    on_back_command: on_back_command,
    check_question: view_question_details
  };
  vm.details_params = {
    is_publish_permit: is_publish_permit,
    curr_user_id: curr_user_id,
    on_back_command: on_back_command,
    api_host: api_host,
    gw_host: gw_host
  };

  vm.search = classify_search;
  vm.show_question_editor = show_question_editor;
  vm.full_txt_search = full_txt_search;
  vm.on_back_command = on_back_command;
  vm.on_fts_keyup = on_fts_keyup;
  vm.dispose = dispose;

  classify_search(vm.list_type(), vm.list_tab(), vm.page_num());

  function classify_search(type, tab, page_num) {
    vm.is_loading(true);
    vm.list_type(type);
    vm.list_tab(tab);
    vm.page_num(page_num);
    search_list().then(function () {
      vm.is_loading(false);
    });
  }

  function full_txt_search(page_num) {
    vm.total_items(0);
    vm.page_content('full-text-search-list');
    vm.page_num(page_num);
    var query = $.extend(create_common_query(page_num), {
      type: 1,
      content: $.trim(vm.keyword())
    });
    vm.is_loading(true);
    return store.get_questions(query).always(function () {
      vm.is_loading(false);
    });
  }

  function search_list() {
    var type = vm.list_type();
    var tab = vm.list_tab();
    var page_num = vm.page_num();

    search_query = create_common_query(page_num);
    var is_accepted = undefined;
    switch (type) {
      case 0:
        search_query.type = 2;
        if (tab === 1) {
          is_accepted = false;
        } else if (tab === 2) {
          is_accepted = true;
        }
        if (is_accepted !== null) {
          search_query.is_accepted = is_accepted;
        }
        return store.get_questions(search_query);
      case 1:
        if (tab === 1) {
          is_accepted = true;
        }
        if (is_accepted) {
          search_query.is_accepted = is_accepted;
        }
        return store.get_my_answers(search_query);
      case 2:
        if (tab === 0) {
          search_query.type = 5;
        }
        if (tab === 1) {
          search_query.type = 3;
        }
        search_query.custom_id = course_id;
        return store.get_questions(search_query);
      case 3:
        if (tab === 1) {
          is_accepted = false;
        } else if (tab === 2) {
          is_accepted = true;
        }
        search_query.is_accepted = is_accepted;
        return store.get_my_follow(search_query);
    }
  }

  function on_get_list_success(list, total) {
    vm.total_items(total || 0);
    vm.list(list || []);
    vm.pagination_options({
      curr_page: vm.page_num(),
      page_size: page_size,
      total: vm.total_items(),
      on_page_command: on_page_command
    });
    vm.show_pagination(total > page_size);
  }

  function create_common_query(page_num) {
    var target_id = vm.target_id();
    var query = {
      page_no: page_num - 1,
      page_size: page_size,
      custom_id: course_id,
      biz_view: is_open_course_1 ? 'course_biz_view' : 'course2_biz_view'
    };
    if (target_id !== course_id) {
      query.target_id = target_id;
    }
    return query;
  }

  function show_question_editor() {
    if (is_publish_permit) {
      search_xhr && search_xhr.abort();
      edit_question(null);
    } else {
      var msg = getI18nKeyValue('qas_course_question.dlg_msg.unregister');
      var title = getI18nKeyValue('qas_course_question.dlg_msg.dlg_title');
      $.fn.udialog.alert(msg, { title: title });
    }
  }

  function view_question_details(question) {
    vm.details_params.question = question;
    setTimeout(function () {
      vm.page_content('question-details');
    }, 100);
  }

  function on_del_command() {
    var curr_page_num = vm.page_num();
    if (vm.list().length === 1) {
      if (curr_page_num === 1) {
        vm.list([]);
      } else {
        vm.page_num(curr_page_num - 1);
        search_list();
      }
    } else {
      search_list();
    }
  }

  function edit_question(question) {
    search_xhr && search_xhr.abort();
    vm.editor_params.question = question;
    vm.page_content('question-editor');
  }

  function on_page_command(page) {
    var page_content_type = vm.page_content();
    switch (page_content_type) {
      case 'list':
        classify_search(vm.list_type(), vm.list_tab(), page);
        break;
      case 'full-text-search-list':
        full_txt_search(page);
        break;
    }
  }

  function find_item(id) {
    var list = vm.list();
    var i = 0,
        ln = list.length;
    for (; i < ln; i++) {
      if (list[i].id === id) {
        return list[i];
      }
    }
  }

  function on_back_command() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (options.page_name === 'MY_QUESTION') {
      vm.list_type(0);
      vm.list_tab(0);
    }
    vm.page_content('list');
    vm.keyword('');
    classify_search(vm.list_type(), vm.list_tab(), 1);
  }

  function on_nav_chapter_command(data) {
    var target_name = course_name;
    if (data.parent) {
      target_name = target_name + '>' + data.parent.title;
    }
    target_name = target_name + '>' + data.title;
    vm.target_name(target_name);
    vm.target_id(data.id);
    nav_command();
  }

  function on_nav_course_command() {
    vm.target_name(course_name);
    vm.target_id(course_id);
    nav_command();
  }

  function nav_command() {
    var page_content = vm.page_content();
    if (page_content !== 'list' && page_content !== 'question-editor') {
      vm.page_content('list');
    }
    if (vm.page_content() === 'list') {
      classify_search(vm.list_type(), vm.list_tab(), 1);
    }
  }

  function on_unfollowed() {
    classify_search(vm.list_type(), vm.list_tab(), vm.page_num());
  }

  function on_fts_keyup(data, event) {
    if (event.which === 13) {
      event.preventDefault();
      vm.page_num(1);
      full_txt_search(vm.page_num());
    }
  }

  function dispose() {
    search_xhr && search_xhr.abort();
  }
}

var tpl$2 = "<div class=\"qas-course-questions\">\r\n\r\n  <!--ko if:is_login-->\r\n  <div class=\"qas-nav\">\r\n    <!--ko component: {name: \"x-qas-course-q-nav\", params:nav_params}--><!--/ko-->\r\n  </div>\r\n  <div class=\"qas-main\">\r\n    <!--搜索与数据列表-->\r\n    <!--ko if:page_content() === 'list'-->\r\n    <div class=\"qas-t-h\">\r\n      <!--关键字搜索-->\r\n      <div class=\"qas-keyword-search\" data-bind=\"css:{on:has_fts_input_focus}\">\r\n        <input type=\"text\" data-bind=\"\r\n        attr:{placeholder: window.i18nHelper.getKeyValue('qas_course_question.label_kw_ph')},\r\n        textInput:keyword,\r\n        hasFocus:has_fts_input_focus,\r\n        event:{keyup:on_fts_keyup}\">\r\n        <img width=\"32\" data-bind=\"click:full_txt_search.bind(this, 1)\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACiUlEQVRYR+2Wv4sTURDHZ94GQxqJByb5A+QqOQ/RTkE8RLTQRiKHp4gWabLvJV7wGtHIiYWFm/cSkkotPD200srzwMYflT9QrlFbq8Rf0S7J7o48MCAr2bdB4ikk3TI/3mdmvswEYZ1/uM7vwxjg/+lAvV7f1Ov1TiPiYQDYCgAbAeA7Ea0h4n3P864Vi8X2sJqK1AGl1EkAuAIAK4h4CxFfpFKpdqvVSnqetxMAjiHifiKaF0LcHAbCCFCpVBYB4IhlWVnbttcGJVdKbSOiuwCwLIQoR4UIBdCV+76/4Lru7lKp9MmUVCm1mYieMsYWbdteMvlr+0AAPXPXdd8h4kxY5cFHHMeZtixr1fO8ySiaGAggpSwh4hTn/ESUSn71UUotEdErIcRVU+xAAKXUE0S8ZNv2Q1OSoL1arR4gogXO+R5TbBjAV8bYlnw+/9mUJGhvNBqpTqfztlAoTJhiwwC8TCazIZvNeqYkQXu5XI4lk8luoVBgpth/twNSyscAcFkIsWKqImiXUh5ExLN/qoF5IpoWQhwfFqBSqdy2LOu5bduOKXbgCBzHSVqW9R4A9nHO35gS9e21Wm2767oPEonEZC6X+2aKC92EUkpd/TlE3MU5/2hKptXf6/WeAcB5zvmyyT90E/aDpZR6r8/6vn+0WCy+HpRUV+77/h0A+MA53xvl8UgA2qlarc4Rkd5qq/oaxmKxl81m80s6nZ7odrs7iGgOAGYA4BFjbJaILkY9SMZr2K9Ea4IxdgoRD/m+PwUA+lvPWOvjXjwev6FnrjuGiBeiQkQGiNpS7TcMxEgAhoEYGUBUiJECBCD037XfzvPIAX5CnEHENuf8elBLfwUgTMBjgHEHfgB2xxwweE1PpAAAAABJRU5ErkJggg==\">\r\n      </div>\r\n      <span class=\"qas-to-post-q\" data-bind=\"click:show_question_editor,translate:{key:'qas_course_question.open_editor'}\">我要提问</span>\r\n    </div>\r\n    <div class=\"qas-t-switch\">\r\n      <table>\r\n        <tr>\r\n          <th data-bind=\"translate:{key:'qas_course_question.types_title'}\">答疑类型：</th>\r\n          <td>\r\n            <span data-bind=\"click:search.bind(this, 0, 0, 1),css:{selected:list_type() === 0},translate:{key:'qas_course_question.types.my_questions'}\">我的问题</span>\r\n            <span data-bind=\"click:search.bind(this, 1, 0, 1),css:{selected:list_type() === 1},translate:{key:'qas_course_question.types.my_answers'}\">我的回答</span>\r\n            <span data-bind=\"click:search.bind(this, 3, 0, 1),css:{selected:list_type() === 3},translate:{key:'qas_course_question.types.my_follow'}\">我的关注</span>\r\n            <span data-bind=\"click:search.bind(this, 2, 0, 1),css:{selected:list_type() === 2},translate:{key:'qas_course_question.types.all_questions'}\">全部问题</span>\r\n          </td>\r\n        </tr>\r\n        <tr>\r\n          <th data-bind=\"translate:{key:'qas_course_question.states_title'}\">问题状态：</th>\r\n          <td>\r\n            <!--ko if:list_type() == 0-->\r\n            <span data-bind=\"click:search.bind(this, 0, 0, 1),css:{selected:list_tab() === 0},translate:{key:'qas_course_question.states.all'}\">全部</span>\r\n            <span data-bind=\"click:search.bind(this, 0, 1, 1),css:{selected:list_tab() === 1},translate:{key:'qas_course_question.states.unsolved'}\">等待解答</span>\r\n            <span data-bind=\"click:search.bind(this, 0, 2, 1),css:{selected:list_tab() === 2},translate:{key:'qas_course_question.states.solved'}\">已解决</span>\r\n            <!--/ko-->\r\n\r\n            <!--ko if:list_type() == 1-->\r\n            <span data-bind=\"click:search.bind(this, 1, 0, 1),css:{selected:list_tab() === 0},translate:{key:'qas_course_question.states.all'}\">全部</span>\r\n            <span data-bind=\"click:search.bind(this, 1, 1, 1),css:{selected:list_tab() === 1},translate:{key:'qas_course_question.states.accepted'}\">被采纳</span>\r\n            <!--/ko-->\r\n\r\n            <!--ko if:list_type() == 2-->\r\n            <span data-bind=\"click:search.bind(this, 2, 0, 1),css:{selected:list_tab() === 0},translate:{key:'qas_course_question.states.hottest'}\">最热</span>\r\n            <span data-bind=\"click:search.bind(this, 2, 1, 1),css:{selected:list_tab() === 1},translate:{key:'qas_course_question.states.newest'}\">最新</span>\r\n            <!--/ko-->\r\n\r\n            <!--ko if:list_type() == 3-->\r\n            <span data-bind=\"click:search.bind(this, 3, 0, 1),css:{selected:list_tab() === 0},translate:{key:'qas_course_question.states.all'}\">全部</span>\r\n            <span data-bind=\"click:search.bind(this, 3, 1, 1),css:{selected:list_tab() === 1},translate:{key:'qas_course_question.states.unsolved'}\">等待解答</span>\r\n            <span data-bind=\"click:search.bind(this, 3, 2, 1),css:{selected:list_tab() === 2},translate:{key:'qas_course_question.states.solved'}\">已解决</span>\r\n            <!--/ko-->\r\n          </td>\r\n        </tr>\r\n      </table>\r\n    </div>\r\n    <div class=\"qas-res-list\">\r\n      <div class=\"qas-list-bean\">\r\n        <!--ko if:!is_loading()-->\r\n        <!--ko if:list().length > 0-->\r\n\r\n        <!--我的问题列表-->\r\n        <!--ko if:list_type() == 0-->\r\n        <!--ko foreach:list-->\r\n        <!--ko component:{name:\"x-qas-question\", params:{question:$data, options:$component.question_options}}--><!--/ko-->\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--我的回答列表-->\r\n        <!--ko if:list_type() == 1-->\r\n        <!--ko foreach:list-->\r\n        <!--ko component:{name:\"x-qas-answer-mine\", params:{my_answer:$data, options:$component.my_answer_options}}--><!--/ko-->\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--全培问题列表-->\r\n        <!--ko if:list_type() == 2-->\r\n        <!--ko foreach:list-->\r\n        <!--ko component:{name:\"x-qas-question\", params:{question:$data, options:$component.all_question_opts}}--><!--/ko-->\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--我的关注-->\r\n        <!--ko if:list_type() == 3-->\r\n        <!--ko foreach:list-->\r\n        <!--ko component:{name:\"x-qas-question\", params:{question:$data, options:$component.question_follow_opts}}--><!--/ko-->\r\n        <!--/ko-->\r\n        <!--/ko-->\r\n\r\n        <!--分页-->\r\n        <!--ko if:show_pagination()-->\r\n        <div class=\"qas-l-footer\">\r\n        <!--ko component:{name:'x-qas-pagination-prv',params:$component.pagination_options}--><!--/ko-->\r\n        </div>\r\n        <!--/ko-->\r\n\r\n        <!--/ko--><!--end if:list.length>0-->\r\n\r\n\r\n        <!--无数据-->\r\n        <!--ko if:list().length === 0-->\r\n        <div class=\"qas-empty\" data-bind=\"translate:{key:'qas_course_question.empty.msg'}\">无数据</div>\r\n        <!--/ko-->\r\n        <!--/ko--><!--end if:!is_loading-->\r\n\r\n        <!--ko if:is_loading()-->\r\n        <div class=\"qas-loading\" data-bind=\"translate:{key:'qas_course_question.loading'}\">加载中</div>\r\n        <!--/ko-->\r\n\r\n      </div>\r\n    </div>\r\n    <!--/ko--><!--end if:page_content === list-->\r\n\r\n    <!--编辑问题-->\r\n    <!--ko if:page_content() === 'question-editor'-->\r\n    <!--ko component:{name:\"x-qas-course-q-editor\", params:editor_params}--><!--/ko-->\r\n    <!--/ko-->\r\n\r\n    <!--问题详情-->\r\n    <!--ko if:page_content() === 'question-details'-->\r\n    <!--ko component:{name:\"x-qas-course-q-details\", params:details_params}--><!--/ko-->\r\n    <!--/ko-->\r\n\r\n    <!--全文搜索结果列表-->\r\n    <!--ko if:page_content() === 'full-text-search-list'-->\r\n    <div class=\"qas-full-txt-search-list\">\r\n      <div class=\"qas-h\">\r\n        <span class=\"qas-label\" data-bind=\"translate:{key: 'qas_course_question.label_kw_search_res', properties:{total:total_items()}}\"></span>\r\n        <span class=\"qas-return\" data-bind=\"translate:{key:'qas_course_question.acts.back'},click:on_back_command\"></span>\r\n      </div>\r\n      <div class=\"qas-list-bean\">\r\n\r\n        <!--ko if:!is_loading()-->\r\n        <!--列表-->\r\n        <!--ko if:list().length>0-->\r\n        <!--ko foreach:list-->\r\n        <!--ko component:{name:\"x-qas-question\", params:{question:$data, options:$component.fts_question_opts}}--><!--/ko-->\r\n        <!--/ko-->\r\n        <!--分页-->\r\n        <!--ko if:show_pagination()-->\r\n        <div class=\"qas-l-footer\">\r\n          <!--ko component:{name:'x-qas-pagination-prv',params:$component.pagination_options}--><!--/ko-->\r\n        </div>\r\n        <!--/ko-->\r\n        <!--/ko--><!--end if:list.length>0-->\r\n\r\n        <!--ko if:list().length === 0-->\r\n        <div class=\"qas-empty\" data-bind=\"translate:{key:'qas_course_question.empty.msg'}\">无数据</div>\r\n        <!--/ko-->\r\n        <!--/ko--><!--end if:!is_loading-->\r\n\r\n        <!--ko if:is_loading()-->\r\n        <div class=\"qas-loading\" data-bind=\"translate:{key:'qas_course_question.loading'}\">加载中</div>\r\n        <!--/ko-->\r\n\r\n      </div>\r\n    </div>\r\n    <!--/ko-->\r\n\r\n  </div>\r\n  <!--/ko--><!--end if:is_login-->\r\n\r\n  <!--ko if:!is_login-->\r\n  <div class=\"qas-list-fl\">\r\n    <i class=\"ico\"></i>\r\n    <p data-bind=\"translate:{key:'qas_course_question.empty.un_login'}\">您还没有登录</p>\r\n  </div>\r\n  <!--/ko-->\r\n</div>";

ko.components.register('x-qas-course-questions', {
  viewModel: Model$2,
  template: tpl$2
});

function Model$3(params) {
  var vm = this;
  var curr_user_id = params.curr_user_id;
  var api_host = params.api_host;
  var gw_host = params.gw_host;
  var is_publish_permit = typeof params.is_publish_permit === 'undefined' ? true : params.is_publish_permit;
  var get_question_xhr = void 0;
  var store = {
    get_question: function get_question() {
      get_question_xhr = ajax(gw_host + '/v1/questions/' + params.question.id);
      return get_question_xhr;
    }
  };

  vm.is_loading = ko.observable(true);
  vm.question = ko.observable();
  vm.question_options = {
    gw_host: gw_host,
    api_host: api_host,
    is_publish_permit: is_publish_permit,
    curr_user_id: curr_user_id,
    on_del_command: function on_del_command(id) {},
    on_edit_command: function on_edit_command(question_id) {},
    on_title_command: function on_title_command(question_id) {},

    on_answer_submit_success: on_answer_submit_success,
    display_answers: false,
    display_acts: false
  };
  vm.answers_params = ko.observable();

  vm.back = back;

  store.get_question().pipe(function (res) {
    vm.question(res);
    vm.answers_params({
      gw_host: gw_host,
      api_host: api_host,
      question: res,
      curr_user_id: curr_user_id,
      show_images: true
    });
  }).always(function () {
    vm.is_loading(false);
  });

  function back() {
    get_question_xhr && get_question_xhr.abort();
    params.on_back_command();
  }

  function on_answer_submit_success() {
    vm.answers_params.valueHasMutated();
  }
}

var tpl$3 = "<div class=\"qas-course-q-details\">\r\n  <div class=\"qas-h\">\r\n    <span class=\"qas-return\" data-bind=\"click:back,translate:{key:'qas_course_question.acts.back'}\">返回</span>\r\n  </div>\r\n  <!--ko if:!is_loading()-->\r\n  <!--ko component:{name:\"x-qas-question-indep\", params:{question:question(), options:question_options}}--><!--/ko-->\r\n  <!--ko component:{name:\"x-qas-ans-indep\", params:answers_params}--><!--/ko-->\r\n  <!--/ko-->\r\n\r\n  <!--ko if:is_loading()-->\r\n  <div class=\"qas-loading\" data-bind=\"translate:{key:'qas_course_question.loading'}\">加载中</div>\r\n  <!--/ko-->\r\n</div>";

ko.components.register('x-qas-course-q-details', {
  viewModel: Model$3,
  template: tpl$3
});

}(ko,$));
