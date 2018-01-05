(function ($) {
  'use strict';

  var search = window.location.search;
  if(search.length > 0){
      search = search.substring(1, search.length);
  }
  var queries = search.split('&');
  var isOpenEditor = false;
  var i = 0, ln = queries.length;
  var query;
  for(;i<ln;i++){
      query = queries[i].split('=');
      if(query[0] === 'create'){
          isOpenEditor = true;
          break;
      }
  }
  
  
  
  var model = {
      course: ko.observable(null),
      isOpenCourseEditor: ko.observable(isOpenEditor),
      isOpenCourseDetail: ko.observable(false),
      createCourse: function(){
          model.isOpenCourseEditor(true);
          model.course(null);
      },
      modifyCourse: function(course){
          model.course(course);
          model.isOpenCourseEditor(true);
      },
      openCourseDetail: function(course){
          model.course(course);
          model.isOpenCourseDetail(true);
      },
      closeCourseDetail: function(){
          model.isOpenCourseDetail(false);
      }
  };
  

  ko.applyBindings(model, document.getElementById("js_content"));
})(jQuery);
