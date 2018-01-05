import tpl from './template.html'
import ko from 'knockout'

function Model(params) {
  this.model = {
    "data": null,
    "host": ""
  }
  this.init(params);
}

Model.prototype = {
  init: function (params) {
    this.model.bxkType=params.bxkType;
    this.model.data = params.model;
    this.model.host = params.host;
    this.model.openType = params.openType;
    var cover_url = params.model.unit_info.cover_url || null;
    var cover = params.model.unit_info.cover;
    if(cover_url && cover.indexOf('CS') === -1){
      cover_url += '!m270x180.jpg';
    }
    this.model.cover_url = cover_url;
  },
  onBtnClick: function (m, e) {
    if (this.model.data.extra.last_study_course_id) {
      var url =  ko.unwrap(this.model.host) + "/course/" + ko.unwrap(this.model.data.extra.last_study_course_id) +
        "/learn?resource_uuid=" + ko.unwrap(this.model.data.extra.last_study_resource_id) +
        "&resource_type=" + ko.unwrap(this.model.data.extra.last_study_resource_type);
      
      this.navigateTo(url);

      // window.location.href = ko.unwrap(this.model.host) + '/course/' + ko.unwrap(this.model.data.extra.last_study_course_id) +
      //   '/learn?resource_uuid=' + ko.unwrap(this.model.data.extra.last_study_resource_id) +
      //   "&resource_type=" + ko.unwrap(this.model.data.extra.last_study_resource_type);
      e.stopPropagation();
    } else {
      this.onClick(m, e);
    }

  },
  onClick: function (m, e) {
    var url = ko.unwrap(this.model.host) + "/course/" + ko.unwrap(this.model.data.unit_id);
    this.navigateTo(url);
    
    // window.location.href = ko.unwrap(this.model.host) + '/course/' + ko.unwrap(this.model.data.unit_id);
    e.stopPropagation();
  },
  navigateTo: function (url) {
    switch (this.model.openType) {
      case "_blank":
        window.open(url);
        break;
      default:
        window.top.location.href = url;
        break;
    }
  }
}

ko.components.register("x-opencoursecard", {
  viewModel: Model,
  template: tpl
})