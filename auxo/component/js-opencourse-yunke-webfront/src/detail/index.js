import tpl from './template.html'
import ko from 'knockout';
import defaultCoverImage from '../assets/default_cover.png';
import close from '../assets/close.png';

function Model(params) {
  let $vm = this;
  let course = params.course;
  let courseModel = course.model;
  let defaultText = '---';
  $vm.courseCoverUrl = ko.observable(courseModel.pic_url ? `${courseModel.pic_url}!m300x200.jpg` : defaultCoverImage);
  $vm.courseTitle = ko.observable(courseModel.title);
  $vm.courseSummary = ko.observable(courseModel.summary || defaultText);
  $vm.courseTagsText = ko.observable(course.getTagsText());
  $vm.close = close;

  function close(){
    this.closeCourseDetail();
  }
}

ko.components.register("x-opencourse-yunke-detail", {
  viewModel: Model,
  template: tpl
});
