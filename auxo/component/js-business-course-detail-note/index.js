import tpl from './template.html'
import ko from 'knockout'
import $ from 'jquery';

var _i18nValue = i18nHelper.getKeyValue,
  _ = ko.utils;

function ViewModel(params){
  this.model = {
    course_name: params.course_name,
    user_name: params.user_name,
    api_url: params.api_url,
    gateway: params.gateway,
    catalogGateway: params.catalogGateway,
    course_id: params.course_id,
    user_id: params.user_id,
    is_login: !!params.is_login, //是否显示我的笔记tab 根据是否登录判断
    content: ko.observableArray(JSON.parse(params.content || "[]")),
    search: {
      target_id: ko.observable('businesscourse_2:' + params.course_id),
      keyword: ko.observable(''),
      order_by: ko.observable(1), //排序（0：最新 1：最热）
      page: ko.observable(0),
      size: 20,
      course_id: ko.observable(params.course_id)
    },
    data: {
      items: ko.observableArray([]),
      total: ko.observable(0)
    },
    note_type: ko.observable(0), //笔记类型（0：我的笔记 1：全部笔记）
    search_all_result: ko.observable(0), //搜索结果 1 0
    is_hide_statusbar: ko.observable(false),
    mynote_count: ko.observable(0),
    init: ko.observable(false)
  };
  this.init();


  var vm = this;
  vm.show_editor = ko.observable(false);

  vm.on_del_command = function(id){
    $.fn.udialog.confirm(window.i18nHelper.getKeyValue('courseNote.del_confirm_msg'), [{
      'class':'ui-btn-confirm',
      text:window.i18nHelper.getKeyValue('courseNote.confirm'),
      click: function(){
        var that = this;
        vm.store.deleteNote(vm.model.api_url, id)
          .then(() =>{
            var index = find_note_index(vm.model.data.items, id);
            vm.model.data.items.splice(index, 1);
            $(that).udialog("hide");
          });
      }
    }, {
      'class':'ui-btn-primary',
      text:window.i18nHelper.getKeyValue('courseNote.cancel'),
      click: function(){
        $(this).udialog("hide");
      }
    }], {
      title: window.i18nHelper.getKeyValue('courseNote.tip_title')
    });
  };
  vm.on_edit_command = function(note){
    vm.editor_params.note = note;
    vm.show_editor(true);
  };
  vm.editor_params = {
    note: null,
    options: {
      apiHost: vm.model.api_url,
      courseUrl: window.courseUrl,
      onCancelCommand: function(){
        vm.show_editor(false);
      },
      onSubmitSuccess: function(newNote){
        var index = find_note_index(vm.model.data.items, newNote.id);
        vm.model.data.items.splice(index, 1, newNote);
        vm.show_editor(false);
      }
    }
  }
}

ViewModel.prototype.store = {
  getAllNote: function(api_url, search){
    return $.ajax({
      url: api_url + '/v2/notes',
      data: search,
      dataType: "json",
      cache: false
    })
  },
  getMyNote: function(api_url, search){
    return $.ajax({
      url: api_url + '/v2/my_notes',
      data: search,
      dataType: "json",
      cache: false
    })
  },
  deleteNote: function(api_url, id){
    return $.ajax({
      url: api_url + '/v1/notes/' + id,
      type: 'DELETE',
      dataType: 'json',
      cache: false
    });
  }
};

ViewModel.prototype.init = function(){
  this.getList();
};

ViewModel.prototype.getList = function(){
  if (!this.model.is_login && !this.model.note_type()) {
    this.model.init(true);
    this.model.data.items([]);
    this.model.data.total(0);
    return;
  }
  var search = ko.mapping.toJS(this.model.search),
    t = this,
    d = this.model.data;
  this.model.init(false);
  d.total(0);
  if (this.model.note_type()) {
    search.keyword = $.trim(search.keyword);
    this.store.getAllNote(this.model.gateway, search).done(function(res){
      d.items(res.items || []);
      d.total(res.count || 0);
      t.model.is_hide_statusbar(t.model.search_all_result() && !d.total());
      t._page(d.total(), search.page, search.size);
      t.model.init(true);
    });
  } else {
    search.keyword = undefined;
    search.order_by = undefined;
    this.store.getMyNote(this.model.gateway, search).done(function(res){
      d.items(res.items || []);
      d.total(res.count || 0);
      if (~search.target_id.indexOf('course')) t.model.mynote_count(d.total());
      t._page(d.total(), search.page, search.size);
      t.model.init(true);
    });
  }
};

ViewModel.prototype.search = function(type, key){
  this.model.search.page(0);
  this.model.search_all_result(0);
  this.model.is_hide_statusbar(false);
  if (typeof key === 'string') {
    switch (key) {
      case 'note_type':
        $('.dlist').find('.active').removeClass('active');
        this.model.search.keyword('');
        this.model.search.order_by(1);
        this.model.search.target_id('businesscourse_2:' + this.model.course_id);
        this.model.note_type(type);
        break;
      case 'search.order_by':
        this.model.search.order_by(type);
        break;
    }
  } else {
    this.model.search_all_result(1);
  }
  this.getList();
};

ViewModel.prototype.switchCourse = function(){
  this.model.search.page(0);
  this.model.search.target_id('businesscourse_2:' + this.model.course_id);
  this.getList();
};
ViewModel.prototype.switchChapter = function($data, event){
  this.model.search.page(0);
  this.model.search.target_id('chapter:' + $data.id);
  this.getList();
  // $('.dlist').find('.active').removeClass('active');
  // $(event.target).addClass('active');
};

ViewModel.prototype.toggleList = function($data, event){
  $(event.target).toggleClass('n-icon-minus');
  $(event.target).parent().toggleClass('open');
};

ViewModel.prototype.focus = function($data, event){
  $(event.target).siblings('.txt').focus();
};

ViewModel.prototype._page = function(total, page, size){
  var search = this.model.search,
    t = this;
  $('#js_note_pagination').pagination(total, {
    items_per_page: size,
    num_display_entries: 5,
    current_page: page,
    is_show_total: false,
    is_show_input: true,
    pageClass: 'pagination-box',
    prev_text: "common.addins.pagination.prev",
    next_text: "common.addins.pagination.next",
    callback: function(pageNum){
      if (pageNum != page) {
        search.page(pageNum);
        t.getList();
      }
    }
  });
};

ViewModel.prototype.updateLesson = function(data) {
  var data = {
    id: data.id
  };

  this.switchChapter(data);
};

ViewModel.prototype.updateCourse = function(data) {
  this.switchCourse();
};

function find_note_index(list, id){
  var i = 0, ln = list.length;
  for (; i < ln; i++) {
    if (list[i].id == id) {
      return i;
    }
  }
}


ko.components.register('x-course-detail-note', {
  viewModel: ViewModel,
  template: tpl
});

