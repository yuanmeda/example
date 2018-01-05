"use strict";
(function(){
    var store = {

        //获取公开课基本信息
        getCourse: function() {
            var url = '/auxo/opencourse/v1/opencourses/' +  courseId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json'
            });
        }}
    var viewModel = {
        model: {
            cover_url:'',
            description:'',
            name:''
        },
        getCourse: function() {
            var self = viewModel;
            if (!courseId) {
              return;
            }

            store.getCourse().done(function(data) {
                ko.mapping.fromJS(data,{},self.model);
            });
        },
        //页面初始化
        init: function() {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.getCourse();



            ko.applyBindings(_self,document.getElementById("js_content"));}

    }
    $(function() {
        viewModel.init();
    });

})(jQuery);
