(function (ko$1,$) {
'use strict';

ko$1 = 'default' in ko$1 ? ko$1['default'] : ko$1;
$ = 'default' in $ ? $['default'] : $;

var tpl = "<div class=\"opencourse-yunke-list\">\r\n\r\n  <div class=\"list-queries\">\r\n    <ul>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == null},click:searchByStatus.bind($root, null),translate:{key: 'opencourse.list.nav.0'}\">全部</li>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == 0},click:searchByStatus.bind($root, 0),translate:{key: 'opencourse.list.nav.1'}\">待修改</li>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == 1},click:searchByStatus.bind($root, 1),translate:{key: 'opencourse.list.nav.2'}\">待审核</li>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == 2},click:searchByStatus.bind($root, 2),translate:{key: 'opencourse.list.nav.3'}\">已审核</li>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == 4},click:searchByStatus.bind($root, 4),translate:{key: 'opencourse.list.nav.4'}\">已复审</li>\r\n      <li data-bind=\"css:{active:coursesAuditStatus() == 8},click:searchByStatus.bind($root, 8),translate:{key: 'opencourse.list.nav.5'}\">已驳回</li>\r\n    </ul>\r\n  </div>\r\n  <!--ko if:courses().length > 0-->\r\n  <div class=\"list\">\r\n    <table>\r\n      <thead>\r\n        <tr>\r\n          <th class=\"tl\" style=\"width: 35%\" data-bind=\"translate:{key:'opencourse.list.headers.names'}\">课程名称</th>\r\n          <th class=\"tl\" style=\"width: 35%\" data-bind=\"translate:{key:'opencourse.list.headers.tags'}\">课程标签</th>\r\n          <th style=\"width: 10%\" data-bind=\"translate:{key:'opencourse.list.headers.status'}\">状态</th>\r\n          <th style=\"width: 20%\" data-bind=\"translate:{key:'opencourse.list.headers.actions'}\">操作</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <!--ko foreach:courses-->\r\n        <tr>\r\n          <td class=\"tl\">\r\n            <span class=\"label\" data-bind=\"text:name\"></span>\r\n          </td>\r\n          <td class=\"tl\">\r\n            <span class=\"label\" data-bind=\"text:tagsText\"></span>\r\n          </td>\r\n          <td>\r\n            <span class=\"label\" data-bind=\"text:auditStatusText\"></span>\r\n          </td>\r\n          <td>\r\n            <!--ko if:auditStatus == 0-->\r\n            <a class=\"act\" data-bind=\"click:$parent.modifyCourse.bind($root, id),translate:{key:'opencourse.list.actions.modify'}\">修改</a>\r\n            <!--/ko-->\r\n\r\n            <!--ko if:auditStatus != 0-->\r\n            <a class=\"act\" data-bind=\"click:$parent.checkCourseDetail.bind($root, id),translate:{key:'opencourse.list.actions.detail'}\">课程详情</a>\r\n            <!--/ko-->\r\n          </td>\r\n        </tr>\r\n        <!--/ko-->\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:courses().length === 0-->\r\n  <div class=\"empty\">暂无课程</div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:totalPages() > 1-->\r\n  <div class=\"yunke-list-foot\">\r\n    <div class=\"yunke-pagination\">\r\n      <!--ko if:pageNum() > 1-->\r\n      <span data-bind=\"click:searchByPage.bind($root, pageNum()-1),translate:{key:'opencourse.list.pages.prev'}\"></span>\r\n      <span data-bind=\"click:searchByPage.bind($root, pageNum()-1),text:pageNum()-1\"></span>\r\n      <!--/ko-->\r\n\r\n      <span class=\"active\" data-bind=\"text:pageNum()\"></span>\r\n\r\n      <!--ko if:pageNum() < totalPages()-->\r\n\r\n      <span data-bind=\"click:searchByPage.bind($root, pageNum()+1),text:pageNum()+1\"></span>\r\n      <span data-bind=\"click:searchByPage.bind($root, pageNum()+1),translate:{key:'opencourse.list.pages.next'}\"></span>\r\n\r\n      <!--/ko-->\r\n    </div>\r\n    <div class=\"yunke-jump\">\r\n      <span data-bind=\"translate:{key:'opencourse.list.pages.jump'}\"></span>\r\n      <input type=\"text\" data-bind=\"value:inputPageNum\">\r\n      <span data-bind=\"translate:{key:'opencourse.list.pages.pgn'}\"></span>\r\n      <span class=\"btn\" data-bind=\"click:searchByPage.bind($root, inputPageNum()),translate:{key: 'opencourse.list.pages.go'}\"></span>\r\n    </div>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n</div>\r\n";

var host = window.self_host || '';
var HttpAdapter = {
  request: function request(path, options) {
    options = options || {};
    options.dataType = 'json';
    options.contentType = 'application/json; charset=utf-8';
    var url = host + '/' + projectCode + path;
    return $.ajax(url, options);
  }
};

var auditStatus = {
  '0': '草稿',
  '1': '待审核',
  '2': '已审核',
  '4': '已复审',
  '8': '驳回'
};

var pageSize = 10;

function OpenCourse(model) {
  model = model || {};
  this.setModel(model);
  if (model.unit_id) {
    this.chapterSettingUrl = this.getChapterSettingUrl();
  }
}
OpenCourse.prototype = {
  setModel: function setModel(model) {
    this.model = model || {};
    var tags = [];
    var tmp = this.model.tags || this.model.open_course_tag_base_vos || [];
    $.each(tmp, function (idx, tag) {
      tags.push({
        id: tag.id || tag.tag_id,
        name: tag.title || tag.tag_name
      });
    });
    this.model.tags = tags;
  },
  getTagsText: function getTagsText() {
    var tagTitles = [];
    var tags = this.model.tags || [];
    if (tags.length > 0) {
      $.each(tags, function (idx, tag) {
        tagTitles.push(tag.name);
      });
    } else {
      tagTitles.push('---');
    }
    return tagTitles.join('/');
  },
  getListView: function getListView() {
    var auditStatusText = auditStatus[this.model.audit_status];

    var tagsText = this.getTagsText();
    return {
      auditStatusText: auditStatusText,
      tagsText: tagsText,
      name: this.model.name,
      title: this.model.title,
      auditStatus: this.model.audit_status,
      id: this.model.id
    };
  },
  create: function create() {
    var _this = this;

    var defer = $.Deferred();
    HttpAdapter.request('/open_courses', { type: 'POST', data: ko.toJSON(this.model) }).then(function (resp) {
      _this.model.id = resp.id;
      _this.model.unit_id = resp.unit_id;
      _this.chapterSettingUrl = _this.getChapterSettingUrl();
      defer.resolve(resp);
    }, defer.reject);
    return defer.promise();
  },
  getChapterSettingUrl: function getChapterSettingUrl() {
    return cloudHost + '/unitcourse/tree?cloud_token=' + encodeURIComponent(cloudToken) + '&unitId=' + this.model.unit_id + '&typeids=111,100,11,111';
  },
  update: function update() {
    var defer = $.Deferred();
    HttpAdapter.request('/open_courses/' + this.model.id, { type: 'PUT', data: ko.toJSON(this.model) }).then(defer.resolve, defer.reject);
    return defer.promise();
  },
  submitAudit: function submitAudit() {
    var defer = $.Deferred();
    HttpAdapter.request('/open_courses/' + this.model.id + '/actions/submit', {
      type: 'POST'
    }).then(defer.resolve, defer.reject);
    return defer.promise();
  }
};

OpenCourse.fetch = function (id) {
  var defer = $.Deferred();
  HttpAdapter.request('/open_courses/' + id).then(function (data) {
    defer.resolve(new OpenCourse(data));
  });
  return defer.promise();
};
OpenCourse.search = function (audit_status, pageNum) {
  var defer = $.Deferred();
  var queries = {
    page_size: pageSize,
    page_no: pageNum - 1
  };
  audit_status !== null && (queries.audit_status = audit_status);
  HttpAdapter.request('/open_courses/m/search', {
    data: queries
  }).then(function (data) {
    var courses = [];
    $.each(data.items, function (idx, item) {
      var course = new OpenCourse(item);
      courses.push(course.getListView());
    });
    defer.resolve({
      courses: courses,
      total: data.count
    });
  }, defer.reject);
  return defer.promise();
};
OpenCourse.getTree = function () {
  var defer = $.Deferred();
  HttpAdapter.request('/tags/tree?custom_type=auxo-open-course', {
    cache: false
  }).then(defer.resolve, defer.reject);
  return defer.promise();
};

function Model() {
  var $vm = this;
  $vm.coursesAuditStatus = ko$1.observable(null);
  $vm.pageNum = ko$1.observable(1);
  $vm.courses = ko$1.observableArray([]);
  $vm.totalPages = ko$1.observable(0);
  $vm.inputPageNum = ko$1.observable();
  $vm.isLoading = ko$1.observable(false);

  $vm.searchByStatus = searchByStatus;
  $vm.searchByPage = searchByPage;
  $vm.modifyCourse = modifyCourse;
  $vm.checkCourseDetail = checkCourseDetail;

  searchCourses();

  function searchByStatus(status) {
    $vm.coursesAuditStatus(status);
    searchCourses();
  }

  function searchByPage(pageNum) {
    pageNum = window.parseInt(pageNum, 10);
    if (window.isNaN(pageNum)) {
      return;
    }
    if (pageNum > $vm.totalPages() || pageNum < 0 || pageNum === $vm.pageNum()) {
      return;
    }
    $vm.pageNum(pageNum);
    searchCourses();
  }

  function searchCourses() {
    if ($vm.isLoading()) {
      return;
    }
    $vm.isLoading(true);

    OpenCourse.search($vm.coursesAuditStatus(), $vm.pageNum()).then(function (_ref) {
      var courses = _ref.courses,
          total = _ref.total;

      var totalPages = Math.ceil(total / 10);
      $vm.courses(courses);
      $vm.totalPages(totalPages);
    }).always(function () {
      $vm.isLoading(false);
    });
  }

  function modifyCourse(id) {
    var _this = this;

    $vm.isLoading(true);
    OpenCourse.fetch(id).then(function (course) {
      $vm.isLoading(false);
      _this.modifyCourse(course);
    });
  }

  function checkCourseDetail(id) {
    var _this2 = this;

    $vm.isLoading(true);
    OpenCourse.fetch(id).then(function (course) {
      $vm.isLoading(false);
      _this2.openCourseDetail(course);
    });
  }
}

ko$1.components.register("x-opencoures-yunke-list", {
  viewModel: Model,
  template: tpl
});

var tpl$1 = "<div class=\"opencourse-yunke-dialog opencourse-yunke-editor\">\r\n  <div class=\"cc-dlg-header\">\r\n    <h1 data-bind=\"text:dlgTitle\"></h1>\r\n    <span class=\"close\" icon data-bind=\"click:closeYunkeEditor\">\r\n      <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAiEAAAIhAENVwL6AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGNQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf7bw3gAAACF0Uk5TAAEGBwsOFRctRUlVWGBie32WmKaywcLEzdri7vLz9Pf8M2K5HwAAAOVJREFUOMuFU8kWhCAMi6i4oOC+oIzz/185h1EBl9eeCklbSFvgtDBv+tmYuW/yEHdL6nXrVJllpeq2tU4uMKvMJKLjFInJVMwLH3URuBdBoUcnSaoHfi3JB52e8bpl90exVu852Dg84AAbxv99pTkejesKABJT4MUKkwCop+CNEEw1EK5iPy7yAOSyO2INkW+HPvIrLw6iLUfTnRl3wOJA16BX8BkuDtVjLuExPBzlDJPBY3g4MkMTyBLkI8lvkkJZqT9W6o8jtW1WbEvHTrPodpMDQ48cObT02NOLQ68evbzv6/8D99YT4ZkEYkQAAAAASUVORK5CYII=\">\r\n    </span>\r\n    <div class=\"progress-bar\">\r\n      <div class=\"bar\">\r\n        <!--ko if:step() >= 2-->\r\n        <span class=\"active-left\"></span>\r\n        <!--/ko-->\r\n        <!--ko if:step() >= 3-->\r\n        <span class=\"active-right\"></span>\r\n        <!--/ko-->\r\n      </div>\r\n      <div class=\"bar-num n1\" data-bind=\"css:{'done': step() >= 1}\">\r\n        <div class=\"circle\">\r\n          <span class=\"deco-back\"></span>\r\n          <span class=\"num\">1</span>\r\n        </div>\r\n        <p data-bind=\"translate:{key:'opencourse.editor.baseInfo'}\">基本信息</p>\r\n      </div>\r\n      <div class=\"bar-num n2\" data-bind=\"css:{'done': step() >= 2}\">\r\n        <div class=\"circle\">\r\n          <span class=\"deco-back\"></span>\r\n          <span class=\"num\">2</span>\r\n        </div>\r\n        <p data-bind=\"translate:{key:'opencourse.editor.createChapters'}\">创建章节</p>\r\n      </div>\r\n      <div class=\"bar-num n3\" data-bind=\"css:{'done': step() >= 3}\">\r\n        <div class=\"circle\">\r\n          <span class=\"deco-back\"></span>\r\n          <span class=\"num\">3</span>\r\n        </div>\r\n        <p data-bind=\"translate:{key:'opencourse.editor.setCover'}\">设置封面</p>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"cc-dlg-body\">\r\n    <!--基本信息-->\r\n    <div class=\"create-base-info\" data-bind=\"style:{'display':step() == 1 ? 'block' : 'none'}\">\r\n      <table>\r\n        <tr>\r\n          <th><i class=\"required\">*</i><span data-bind=\"translate:{key:'opencourse.courseModel.name'}\"></span>：</th>\r\n          <td>\r\n            <input type=\"text\" data-bind=\"value:courseTitle,valueUpdate:'input'\">\r\n          </td>\r\n        </tr>\r\n        <tr>\r\n          <th><i class=\"required\">*</i><span data-bind=\"translate:{key:'opencourse.courseModel.desc'}\"></span>：</th>\r\n          <td>\r\n            <textarea rows=\"4\" id=\"description\" data-bind=\"value:courseDescription\"></textarea>\r\n          </td>\r\n        </tr>\r\n        <tr>\r\n          <th><i class=\"required\">*</i><span data-bind=\"translate:{key:'opencourse.courseModel.summary'}\"></span>：</th>\r\n          <td>\r\n            <textarea rows=\"4\" data-bind=\"value:courseSummary,valueUpdate:'input'\" maxlength=\"100\"></textarea>\r\n            <p class=\"summary-remain-words\">你还可以输入<span data-bind=\"text:summaryRemainWords\"></span>个字</p>\r\n          </td>\r\n        </tr>\r\n        <tr>\r\n          <th><i class=\"required\">*</i><span data-bind=\"translate:{key:'opencourse.courseModel.tag'}\"></span>：</th>\r\n          <td>\r\n            <ul id=\"J_Tree\" class=\"ztree tree-border\"></ul>\r\n          </td>\r\n        </tr>\r\n      </table>\r\n    </div>\r\n\r\n    <!--创建章节-->\r\n    <div class=\"create-chapter\" data-bind=\"style:{'display':step() == 2 ? 'block' : 'none'}\">\r\n      <iframe frameborder=\"0\" width=\"100%\" height=\"99%\" data-bind=\"attr:{src:cloudChapterSettingUrl()}\"></iframe>\r\n    </div>\r\n\r\n    <!--设置封面-->\r\n    <div class=\"create-cover\" data-bind=\"style:{'display':step() == 3 ? 'block' : 'none'}\">\r\n      <div>\r\n        <img width=\"300\" height=\"200\" data-bind=\"attr:{src:courseCoverUrl}\">\r\n      </div>\r\n      <p><span data-bind=\"click:openImageUploader\">上传课程封面</span></p>\r\n    </div>\r\n  </div>\r\n  <div class=\"cc-dlg-footer\">\r\n\r\n    <!--ko if:step() == 1-->\r\n    <span data-bind=\"click:saveBaseInfo\">下一步</span>\r\n    <!--/ko-->\r\n\r\n    <!--ko if:step() == 2-->\r\n    <span data-bind=\"click:returnBaseInfo\">上一步</span>\r\n    <span data-bind=\"click:nextSetCover\">下一步</span>\r\n    <!--/ko-->\r\n\r\n    <!--ko if:step() == 3-->\r\n    <span data-bind=\"click:returnSetChapter\">上一步</span>\r\n    <span data-bind=\"click:submitAudit\">提交</span>\r\n    <!--/ko-->\r\n  </div>\r\n</div>\r\n\r\n<!--图片上传区-->\r\n<!--ko if:isOpenImgUploader() -->\r\n<div class=\"opencourse-yunke-dialog opencourse-yunke-img-uploader\">\r\n  <div class=\"cc-dlg-header\">\r\n    <h1>更换封面</h1>\r\n    <span class=\"close\" data-bind=\"click:closeImageUploader\">\r\n      <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAiEAAAIhAENVwL6AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGNQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf7bw3gAAACF0Uk5TAAEGBwsOFRctRUlVWGBie32WmKaywcLEzdri7vLz9Pf8M2K5HwAAAOVJREFUOMuFU8kWhCAMi6i4oOC+oIzz/185h1EBl9eeCklbSFvgtDBv+tmYuW/yEHdL6nXrVJllpeq2tU4uMKvMJKLjFInJVMwLH3URuBdBoUcnSaoHfi3JB52e8bpl90exVu852Dg84AAbxv99pTkejesKABJT4MUKkwCop+CNEEw1EK5iPy7yAOSyO2INkW+HPvIrLw6iLUfTnRl3wOJA16BX8BkuDtVjLuExPBzlDJPBY3g4MkMTyBLkI8lvkkJZqT9W6o8jtW1WbEvHTrPodpMDQ48cObT02NOLQ68evbzv6/8D99YT4ZkEYkQAAAAASUVORK5CYII=\">\r\n    </span>\r\n  </div>\r\n  <div class=\"cc-dlg-body\">\r\n    <div class=\"work-area\">\r\n      <div id=\"J_UploadImg\"></div>\r\n    </div>\r\n  </div>\r\n  <div class=\"cc-dlg-footer\">\r\n    <span data-bind=\"click:updateCover,css:{disabled: !courseCoverId()}\">使用该封面</span>\r\n  </div>\r\n</div>\r\n<div class=\"cc-img-uploader-mask\"></div>\r\n<!--/ko-->\r\n\r\n<!--ko if:isLoading()-->\r\n<div class=\"cc-loading-mask\"></div>\r\n<!--/ko-->";

var img = 'data:image/png;base64,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';

function Model$1(params) {
  var $vm = this;
  var course = params.course || new OpenCourse();
  var courseModel = course.model;
  var desEditor = void 0;
  var maxTitle = 50;
  var maxSummary = 100;
  var maxDescription = 300;
  var baseInfoValidator = void 0;

  $vm.dlgTitle = courseModel.id ? '修改课程' : '新增课程';
  $vm.step = ko$1.observable(1);
  $vm.isLoading = ko$1.observable(false);
  $vm.courseCoverUrl = ko$1.observable(courseModel.pic_url || img);
  $vm.courseCoverId = ko$1.observable(courseModel.pic_id || undefined);
  $vm.courseTitle = ko$1.observable(courseModel.title || undefined);
  $vm.courseDescription = ko$1.observable(courseModel.description || '');
  $vm.courseSummary = ko$1.observable(courseModel.summary || undefined);
  $vm.summaryRemainWords = ko$1.observable(maxSummary);
  $vm.descriptionRemainWords = ko$1.observable(maxDescription);
  $vm.isBaseInfoValid = ko$1.observable(false);
  $vm.courseTagIds = ko$1.observableArray(courseModel.tag_ids || []);
  $vm.cloudChapterSettingUrl = ko$1.observable(courseModel.id ? course.chapterSettingUrl : undefined);
  $vm.isOpenImgUploader = ko$1.observable(false);

  $vm.saveBaseInfo = saveBaseInfo;
  $vm.returnBaseInfo = returnBaseInfo;
  $vm.nextSetCover = nextSetCover;
  $vm.returnSetChapter = returnSetChapter;
  $vm.submitAudit = submitAudit;
  $vm.openImageUploader = openImageUploader;
  $vm.closeImageUploader = closeImageUploader;
  $vm.updateCover = updateCover;
  $vm.closeYunkeEditor = closeYunkeEditor;

  initKindEditor();
  initTree();

  function initKindEditor() {
    desEditor = KindEditor.create('#description', {
      loadStyleMode: false,
      pasteType: 2,
      allowFileManager: false,
      allowPreviewEmoticons: false,
      allowImageUpload: true,
      resizeType: 0,
      staticUrl: staticUrl,
      items: ['source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline', 'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'],
      afterChange: function afterChange() {
        if (!desEditor) {
          return;
        }

        if (desEditor.count("text") == 0) {
          $vm.courseDescription('');
        } else {
          $vm.courseDescription(desEditor.html());
        }
      }
    });

    desEditor.html($vm.courseDescription());
    $vm.courseSummary.subscribe(function (value) {
      $vm.summaryRemainWords(maxSummary - (value ? value.length : 0));
    });
    $vm.courseSummary.valueHasMutated();
  }

  function initTree() {
    $vm.isLoading(true);
    OpenCourse.getTree().then(function (data) {
      var setting = {
        data: {
          key: {
            name: 'title',
            title: 'title'
          }
        },
        check: {
          enable: true,
          chkboxType: {
            "Y": "",
            "N": ""
          }
        },
        callback: {
          onCheck: function onCheck(e, tid, tnode) {
            var id = tnode.id;
            if (tnode.checked) {
              $vm.courseTagIds.push(id);
            } else {
              $vm.courseTagIds.remove(function (item) {
                return item === id;
              });
            }
          }
        },
        simpleData: {
          enable: true,
          idKey: 'id',
          pIdKey: 'parent_id'
        }
      };
      var ztreeObject = $.fn.zTree.init($('#J_Tree'), setting, data.children);

      var selectedIds = course.model && course.model.tag_ids || [];
      $.each(selectedIds, function (index, item) {
        var node = ztreeObject.getNodeByParam('id', item);
        if (node) {
          ztreeObject.checkNode(node, true, false, false);
        }
      });
    }).always(function () {
      $vm.isLoading(false);
    });
  }

  function closeYunkeEditor() {
    if (window.confirm('关闭当前窗口会立即取消课程上传，所有编辑内容都不会保存')) {
      window.location.search = '';
    }
  }

  function saveBaseInfo() {
    var errMessage = '';
    var title = $vm.courseTitle() || '';
    var description = $vm.courseDescription() || '';
    var summary = $vm.courseSummary() || '';
    var tags = $vm.courseTagIds();

    if (title.length === 0 || title.length > maxTitle) {
      errMessage = '\u8BFE\u7A0B\u6807\u9898\u5FC5\u987B\u586B\u5199\uFF0C\u4E14\u5C0F\u4E8E' + maxTitle + '\u4E2A\u5B57';
    } else if (description.length === 0 || description.length > maxDescription) {
      errMessage = '\u8BFE\u7A0B\u63CF\u8FF0\u5FC5\u987B\u586B\u5199\uFF0C\u4E14\u5C0F\u4E8E' + maxDescription + '\u4E2A\u5B57\u7B26\uFF08\u5305\u542B\u6807\u7B7E\uFF09';
    } else if (summary.length === 0 || summary.length > maxSummary) {
      errMessage = '\u8BFE\u7A0B\u6458\u8981\u5FC5\u987B\u586B\u5199\uFF0C\u4E14\u5C0F\u4E8E' + maxSummary + '\u4E2A\u5B57\u7B26';
    } else if (tags.length === 0) {
      errMessage = '\u8BF7\u9009\u62E9\u8BFE\u7A0B\u6807\u7B7E';
    }

    if (errMessage) {
      Utils.alertTip(errMessage, {
        title: '警告',
        icon: 7
      });
      return;
    }

    courseModel.title = title;
    courseModel.description = description;
    courseModel.summary = summary;
    courseModel.tag_ids = tags;
    $vm.isLoading(true);
    if (!courseModel.id) {
      course.create().then(function (resp) {
        $vm.step(2);
        $vm.cloudChapterSettingUrl(course.chapterSettingUrl);
      }).always(function () {
        $vm.isLoading(false);
      });
    } else {
      course.update().then(function () {
        $vm.step(2);
      }).always(function () {
        $vm.isLoading(false);
      });
    }
  }

  function returnBaseInfo() {
    $vm.step(1);
  }

  function nextSetCover() {
    $vm.step(3);
  }

  function returnSetChapter() {
    $vm.step(2);
  }

  function submitAudit() {
    if ($vm.isLoading()) {
      return;
    }
    $vm.isLoading(true);
    course.submitAudit().then(function () {
      window.location.reload();
    }).always(function () {
      $vm.isLoading(false);
    });
  }

  function openImageUploader() {
    $vm.isOpenImgUploader(true);
    initImageUpload();
  }

  function closeImageUploader() {
    $vm.isOpenImgUploader(false);
  }

  function initImageUpload() {
    new SWFImageUpload({
      flashUrl: staticUrl + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
      width: 1024,
      height: 1200,
      htmlId: 'J_UploadImg',
      pSize: '600|400|360|240|270|180',
      uploadUrl: escape(cloudHost + '/v5/stores/objects/uploads?bucket_name=$image&cloud_token=' + encodeURIComponent(cloudToken)),
      imgUrl: '',
      showCancel: false,
      limit: 1,
      upload_complete: onImgUploadComplete,
      upload_error: onImgUploadError
    });
  }

  function updateCover() {
    if (!$vm.courseCoverId()) {
      return;
    }
    courseModel.pic_id = $vm.courseCoverId();
    courseModel.pic_url = $vm.courseCoverUrl();
    $vm.isLoading(true);
    course.update().always(function () {
      $vm.isOpenImgUploader(false);
      $vm.isLoading(false);
    });
  }

  function onImgUploadComplete(data) {
    $vm.courseCoverUrl(data.absolute_url + '!m300x200.jpg');
    $vm.courseCoverId(data.store_object_id);
  }

  function onImgUploadError(code) {
    var msg = void 0;
    switch (code) {
      case 120:
        msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
        break;
      case 110:
        msg = '上传文件超过规定大小';
        break;
      default:
        msg = '上传失败，请稍后再试';
        break;
    }
  }
}

ko$1.components.register("x-opencourse-yunke-editor", {
  viewModel: Model$1,
  template: tpl$1
});

var tpl$2 = "<div class=\"opencourse-yunke-dialog opencourse-yunke-detail\">\r\n  <div class=\"cc-dlg-header\">\r\n    <h1>课程详情</h1>\r\n    <span class=\"close\" data-bind=\"click: close.bind($root)\">\r\n      <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAiEAAAIhAENVwL6AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAGNQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf7bw3gAAACF0Uk5TAAEGBwsOFRctRUlVWGBie32WmKaywcLEzdri7vLz9Pf8M2K5HwAAAOVJREFUOMuFU8kWhCAMi6i4oOC+oIzz/185h1EBl9eeCklbSFvgtDBv+tmYuW/yEHdL6nXrVJllpeq2tU4uMKvMJKLjFInJVMwLH3URuBdBoUcnSaoHfi3JB52e8bpl90exVu852Dg84AAbxv99pTkejesKABJT4MUKkwCop+CNEEw1EK5iPy7yAOSyO2INkW+HPvIrLw6iLUfTnRl3wOJA16BX8BkuDtVjLuExPBzlDJPBY3g4MkMTyBLkI8lvkkJZqT9W6o8jtW1WbEvHTrPodpMDQ48cObT02NOLQ68evbzv6/8D99YT4ZkEYkQAAAAASUVORK5CYII=\">\r\n    </span>\r\n  </div>\r\n  <div class=\"cc-dlg-body\">\r\n    <div class=\"course-detail\">\r\n      <table>\r\n        <tr>\r\n          <th><span data-bind=\"translate:{key:'opencourse.courseModel.name'}\"></span>：</th>\r\n          <td data-bind=\"text:courseTitle\"></td>\r\n        </tr>\r\n        <tr>\r\n          <th><span data-bind=\"translate:{key:'opencourse.courseModel.summary'}\"></span>：</th>\r\n          <td data-bind=\"text:courseSummary\"></td>\r\n        </tr>\r\n        <tr>\r\n          <th><span data-bind=\"translate:{key:'opencourse.courseModel.tag'}\"></span>：</th>\r\n          <td data-bind=\"text:courseTagsText\"></td>\r\n        </tr>\r\n        <tr>\r\n          <th><span data-bind=\"translate:{key:'opencourse.courseModel.cover'}\"></span>：</th>\r\n          <td>\r\n            <img width=\"300\" height=\"200\" data-bind=\"attr:{src:courseCoverUrl}\">\r\n          </td>\r\n        </tr>\r\n      </table>\r\n    </div>\r\n  </div>\r\n</div>\r\n";

function Model$2(params) {
  var $vm = this;
  var course = params.course;
  var courseModel = course.model;
  var defaultText = '---';
  $vm.courseCoverUrl = ko$1.observable(courseModel.pic_url ? courseModel.pic_url + '!m300x200.jpg' : img);
  $vm.courseTitle = ko$1.observable(courseModel.title);
  $vm.courseSummary = ko$1.observable(courseModel.summary || defaultText);
  $vm.courseTagsText = ko$1.observable(course.getTagsText());
  $vm.close = close;

  function close() {
    this.closeCourseDetail();
  }
}

ko$1.components.register("x-opencourse-yunke-detail", {
  viewModel: Model$2,
  template: tpl$2
});

}(ko,$));
