(function ($, window) {
    'use strict';
    var viewModel = {
        model: {
            //search: {
            //    content: ko.observable(''),
            //    star: ko.observable(),
            //    page_no: ko.observable(0),
            //    page_size: ko.observable(10)
            //},
            //tabIndex: ko.observable(0),
            //items: ko.observableArray([])
            course:{
                id:'4cae68d5-ca61-4c4e-b968-b4bc401d878c',
                title:'测试课程'
            },
            resources:{
                projectCode:'',
                resource:{
                    id:'4cae68d5-ca61-4c4e-b968-b4bc401d878c'
                }
                //resourceList:[
                //    {
                //        'id':1,
                //        'name':"课程1"
                //    },
                //    {
                //        'id':2,
                //        'name':"课程2"
                //    },
                //    {
                //        'id':3,
                //        'name':"课程3"
                //    }
                //]
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);