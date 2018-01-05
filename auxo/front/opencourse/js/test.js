;(function(window, $){
  'use strict';
  //课程详细数据模型
  var viewModel = {
    model: {

    },
    init: function(){
      this.model = ko.mapping.fromJS(this.model);
      ko.applyBindings(this, document.getElementById("OpenCourseContent"));
    }
  };
  $(function(){
    viewModel.init();
  })
})(window, jQuery);