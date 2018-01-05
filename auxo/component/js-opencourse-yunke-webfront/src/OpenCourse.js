import {HttpAdapter} from './HttpAdapter';
import $ from 'jquery';

const auditStatus = {
  '0':'草稿',
  '1':'待审核',
  '2':'已审核',
  '4':'已复审',
  '8':'驳回'
};

const pageSize = 10;

function OpenCourse(model){
  model = model || {};
  this.setModel(model);
  if(model.unit_id){
    this.chapterSettingUrl = this.getChapterSettingUrl();
  }
}
OpenCourse.prototype = {
  setModel(model){
    this.model = model || {};
    let tags = [];
    let tmp = this.model.tags || this.model.open_course_tag_base_vos || [];
    $.each(tmp, (idx, tag)=>{
      tags.push({
        id: tag.id || tag.tag_id,
        name: tag.title || tag.tag_name
      });
    });
    this.model.tags = tags;
  },

  getTagsText(){
    let tagTitles = [];
    let tags = this.model.tags || [];
    if(tags.length > 0){
      $.each(tags, function(idx, tag){
        tagTitles.push(tag.name);
      })
    }else{
      tagTitles.push('---');
    }
    return tagTitles.join('/');
  },

  // 显示列表时使用的字段
  getListView(){
    // 审核状态文本
    let auditStatusText = auditStatus[this.model.audit_status];
    // 分类标签文本
    let tagsText = this.getTagsText();
    return {
      auditStatusText,
      tagsText,
      name: this.model.name,
      title: this.model.title,
      auditStatus: this.model.audit_status,
      id: this.model.id
    }
  },

  // 新建课程
  create(){
    let defer = $.Deferred();
    HttpAdapter
      .request('/open_courses', {type: 'POST', data: ko.toJSON(this.model)})
      .then(resp=>{
        this.model.id = resp.id;
        this.model.unit_id = resp.unit_id;
        this.chapterSettingUrl = this.getChapterSettingUrl();
        defer.resolve(resp);
      }, defer.reject);
    return defer.promise();
  },

  getChapterSettingUrl(){
    return `${cloudHost}/unitcourse/tree?cloud_token=${encodeURIComponent(cloudToken)}&unitId=${this.model.unit_id}&typeids=111,100,11,111`;
  },

  update(){
    let defer = $.Deferred();
    HttpAdapter
      .request(`/open_courses/${this.model.id}`, {type: 'PUT', data: ko.toJSON(this.model)})
      .then(defer.resolve, defer.reject);
    return defer.promise();
  },

  submitAudit(){
    let defer = $.Deferred();
    HttpAdapter
      .request(`/open_courses/${this.model.id}/actions/submit`, {
        type:'POST'
      })
      .then(defer.resolve, defer.reject);
    return defer.promise();
  }
};

OpenCourse.fetch = function(id){
  let defer = $.Deferred();
  HttpAdapter
    .request(`/open_courses/${id}`)
    .then(data=>{
      defer.resolve(new OpenCourse(data));
    });
  return defer.promise();
};
OpenCourse.search = function(audit_status, pageNum){
  let defer = $.Deferred();
  let queries = {
    page_size:pageSize,
    page_no:pageNum-1
  };
  audit_status !== null && (queries.audit_status = audit_status);
  HttpAdapter
    .request('/open_courses/m/search', {
      data: queries
    })
    .then(function(data){
      let courses = [];
      $.each(data.items, function(idx, item){
        let course = new OpenCourse(item);
        courses.push(course.getListView());
      });
      defer.resolve({
        courses,
        total: data.count
      });
    }, defer.reject);
  return defer.promise();
};
OpenCourse.getTree = function(){
  let defer = $.Deferred();
  HttpAdapter.request('/tags/tree?custom_type=auxo-open-course', {
    cache: false
  })
    .then(defer.resolve, defer.reject);
  return defer.promise();
};

export {OpenCourse};

