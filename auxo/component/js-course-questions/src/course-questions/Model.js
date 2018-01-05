import ko from 'knockout';
import $ from 'jquery';
import {ajax} from '../ajax';

function Model(params){
  const vm = this;
  const api_host = window.assistUrl;
  const gw_host = window.assistGatewayUrl;
  const course_id = window.courseId;
  const curr_user_id = window.userId;
  const course_name = window.courseName;
  const course_host = window.courseUrl;
  const business_course_host = window.businessCourseUrl;
  const user_id = window.userId;
  const register_status = window.parseInt(window.userRegistStatus, 10);
  const course_register_type = window.parseInt(window.courseRegistType, 10);
  const is_open_course_1 = params && typeof params.is_open_course_1 !== 'undefined' ? params.is_open_course_1 : true;
  const getI18nKeyValue = window.i18nHelper.getKeyValue;
  const page_size = 10;
  let search_xhr;
  let search_query;
  // 是否可以发布问题、回答、回复
  const is_publish_permit = (()=>{
    // 无需报名
    if(course_register_type === 1){ return true; }
    // 只有1是“可学习”
    return register_status === 1;
  })(); // 当前用户是否已报名
  const store = {
    get_questions: function get_questions(query){
      search_xhr && search_xhr.abort();
      search_xhr = ajax(`${gw_host}/v2/questions/search`, {
        type: 'GET',
        data: query
      })
        .then((res) =>{
          $.each(res.items, (idx, course)=>{
            // biz_data处理
            let biz_data = JSON.parse(course.biz_data || null);
            let src_route, routes = [];
            if(!biz_data){
              src_route = course.target_name ? course.target_name : course_name;
            }else{
              routes.push(biz_data.course_name);
              get_names(routes, biz_data.chapter_name);
              src_route = routes.join('>');
            }
            course.target_name = src_route;
          });
          on_get_list_success(res.items, res.total);

          function get_names(routes, node){
            if(!node){return;}
            routes.push(node.name);
            if(node.child){
              get_names(routes, node.child);
            }
          }
        });
      return search_xhr;
    },
    get_my_answers: function get_my_answers(query){
      search_xhr && search_xhr.abort();
      search_xhr = ajax(`${gw_host}/v2/answers/mine`, {
        type: 'GET',
        data: query
      })
        .then(res =>{
          on_get_list_success(res.items, res.total);
        });
      return search_xhr;
    },
    get_my_follow: function (query){
      search_xhr && search_xhr.abort();
      search_xhr = ajax(`${gw_host}/v1/questions/mine/follows`, {
        type: 'GET',
        data: query
      })
        .then(res=>{
          on_get_list_success(res.items, res.total);
        });
      return search_xhr
    }
  };

  vm.is_login = !!user_id;
  vm.is_loading = ko.observable(false);
  vm.target_name = ko.observable(course_name);
  vm.target_id = ko.observable(course_id);
  vm.keyword = ko.observable('');
  vm.has_fts_input_focus = ko.observable(false);
  vm.page_content = ko.observable('list'); // 页面内容类型 list / question-editor
  vm.empty_message = ko.observable(); // 空列表提示
  vm.total_items = ko.observable();
  vm.page_num = ko.observable(1); // 从1开始，实际请求时会减1
  vm.list = ko.observableArray([]);
  vm.list_type = ko.observable(0); // 列表类型 0：我的问题 1：我的回答 2：全部问题
  vm.list_tab = ko.observable(0);
  vm.show_pagination = ko.observable(); // 是否显示分页
  vm.pagination_options = ko.observable();
  vm.nav_params = {
    course_id: course_id,
    init_id: course_id,
    content: window.noteContent,
    course_name: window.courseName,
    on_chapter_command: on_nav_chapter_command,
    on_course_command: on_nav_course_command
  };
  // 我的回答列表项
  vm.question_options = {
    is_publish_permit,
    curr_user_id,
    gw_host,
    api_host,
    on_del_command,
    on_edit_command(question_id){
      edit_question(find_item(question_id));
    },
    on_title_command(question_id){
      view_question_details(find_item(question_id));
    }
  };
  // 全文搜索中的回答列表项
  vm.fts_question_opts = $.extend({
    keyword: vm.keyword
  }, vm.question_options, true);
  // 我的关注列表项
  vm.question_follow_opts = $.extend({
    on_unfollowed
  }, vm.question_options, true);
  // 全部问题列表
  vm.all_question_opts = vm.question_options;
  // 我的回答列表项
  vm.my_answer_options = {
    gw_host,
    on_question_title_command(question){
      view_question_details(question);
    }
  };
  vm.editor_params = {
    course_host,
    business_course_host,
    api_host,
    gw_host,
    course_id,
    is_open_course_1,
    target_name: vm.target_name,
    target_id: vm.target_id,
    context_id: `${window.customType}:${window.customId}.business_course:${course_id}`,
    on_back_command,
    check_question:view_question_details
  };
  vm.details_params = {
    is_publish_permit,
    curr_user_id,
    on_back_command,
    api_host,
    gw_host
  };

  vm.search = classify_search;
  vm.show_question_editor = show_question_editor;
  vm.full_txt_search = full_txt_search;
  vm.on_back_command = on_back_command;
  vm.on_fts_keyup = on_fts_keyup;
  vm.dispose = dispose;

  classify_search(vm.list_type(), vm.list_tab(), vm.page_num());

  /*分类搜索，封装is_loading*/
  function classify_search(type, tab, page_num){
    vm.is_loading(true);
    vm.list_type(type);
    vm.list_tab(tab);
    vm.page_num(page_num);
    search_list()
      .then(()=>{
        vm.is_loading(false);
      });
  }

  /*全文搜索*/
  function full_txt_search(page_num){
    vm.total_items(0);
    vm.page_content('full-text-search-list');
    vm.page_num(page_num);
    let query = $.extend(create_common_query(page_num), {
      type:1,
      content: $.trim(vm.keyword())
    });
    vm.is_loading(true);
    return store.get_questions(query)
      .always(()=>{
        vm.is_loading(false);
      });
  }

  /**
   * 分类搜索，底层
   * @returns {*}
   */
  function search_list(){
    let type = vm.list_type();
    let tab = vm.list_tab();
    let page_num = vm.page_num();
    // 一般搜索条件
    search_query = create_common_query(page_num);
    let is_accepted = undefined; // 默认为“全部”
    switch (type) {
      case 0:
        // 我的问题
        search_query.type = 2;
        if (tab === 1) {
          // “等待解答”
          is_accepted = false;
        } else if (tab === 2) {
          // “已解决”
          is_accepted = true;
        }
        if (is_accepted !== null) {
          search_query.is_accepted = is_accepted;
        }
        return store.get_questions(search_query);
      case 1:
        // 我的回答
        if(tab === 1){
          // 已被采纳
          is_accepted = true;
        }
        if(is_accepted){
          search_query.is_accepted = is_accepted;
        }
        return store.get_my_answers(search_query);
      case 2:
        // 全部问题
        if(tab === 0){
          // 最热
          search_query.type = 5;
        }
        if(tab === 1){
          // 最新
          search_query.type = 3;
        }
        search_query.custom_id = course_id;
        return store.get_questions(search_query);
      case 3:
        // 我的关注
        if (tab === 1) {
          // “等待解答”
          is_accepted = false;
        } else if (tab === 2) {
          // “已解决”
          is_accepted = true;
        }
        search_query.is_accepted = is_accepted;
        return store.get_my_follow(search_query);
    }
  }

  /*成功获取列表后*/
  function on_get_list_success(list, total){
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

  /*创建公共的查询条件*/
  function create_common_query(page_num){
    let target_id = vm.target_id();
    let query = {
      page_no: page_num - 1,
      page_size,
      custom_id: course_id,
      biz_view: is_open_course_1 ? 'course_biz_view' : 'course2_biz_view'
    };
    if(target_id !== course_id){
      // 当搜索章节时需要target_id
      query.target_id = target_id;
    }
    return query;
  }

  /*切换到提问页面*/
  function show_question_editor(){
    if(is_publish_permit){
      // 可发布问题
      search_xhr && search_xhr.abort();
      edit_question(null);
    }else{
      // 不可发布
      let msg = getI18nKeyValue('qas_course_question.dlg_msg.unregister');
      let title = getI18nKeyValue('qas_course_question.dlg_msg.dlg_title');
      $.fn.udialog.alert(msg, {title});
    }
  }

  /*查看问题详情*/
  function view_question_details(question){
    vm.details_params.question = question;
    setTimeout(()=>{
      vm.page_content('question-details');
    }, 100);
  }

  function on_del_command(){
    let curr_page_num = vm.page_num();
    if (vm.list().length === 1) {
      if (curr_page_num === 1) {
        // 一共只有一条数据
        vm.list([]);
      } else {
        // 本页只有一条数据
        vm.page_num(curr_page_num - 1);
        search_list();
      }
    } else {
      // 有多条数据，刷新本页
      search_list();
    }
  }

  function edit_question(question){
    search_xhr && search_xhr.abort();
    vm.editor_params.question = question;
    vm.page_content('question-editor');
  }

  function on_page_command(page){
    let page_content_type = vm.page_content();
    switch(page_content_type){
      case 'list':
        classify_search(vm.list_type(), vm.list_tab(), page);
        break;
      case 'full-text-search-list':
        full_txt_search(page);
        break;
    }

  }

  /*根据ID从列表中找到某一项*/
  function find_item(id){
    let list = vm.list();
    let i = 0, ln = list.length;
    for (; i < ln; i++) {
      if (list[i].id === id) {
        return list[i];
      }
    }
  }

  /*从其他页返回列表页*/
  function on_back_command(options = {}){
    if(options.page_name === 'MY_QUESTION'){
      vm.list_type(0);
      vm.list_tab(0);
    }
    vm.page_content('list');
    vm.keyword('');
    classify_search(vm.list_type(), vm.list_tab(), 1);
  }

  /*侧栏选中章节时*/
  function on_nav_chapter_command(data){
    let target_name = course_name;
    if (data.parent) {
      target_name = `${target_name}>${data.parent.title}`;
    }
    target_name = `${target_name}>${data.title}`;
    vm.target_name(target_name);
    vm.target_id(data.id);
    nav_command();
  }

  /*侧栏选中课程时*/
  function on_nav_course_command(){
    vm.target_name(course_name);
    vm.target_id(course_id);
    nav_command();
  }

  function nav_command(){
    let page_content = vm.page_content();
    if(page_content !== 'list' && page_content !== 'question-editor'){
      // 不在列表或问题编辑页，转到列表页
      vm.page_content('list');
    }
    if(vm.page_content() === 'list'){
      classify_search(vm.list_type(), vm.list_tab(), 1);
    }
  }

  /*我的关注列表中取消关注后回调*/
  function on_unfollowed(){
    classify_search(vm.list_type(), vm.list_tab(), vm.page_num());
  }

  /*关键字输入框按下回车*/
  function on_fts_keyup(data, event){
    if(event.which === 13){
      event.preventDefault();
      vm.page_num(1);
      full_txt_search(vm.page_num());
    }
  }

  function dispose(){
    search_xhr && search_xhr.abort();
  }

}

export {Model}