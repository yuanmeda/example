/**
 * 课程详情页
 * 全局变量：projectId/courseId
 */
(function ($,window) {
    'use strict';
    var store = {
        queryCourse: function () {
            var url= '/' + projectCode+ '/resource_courses/' + courseId;
            return $.ajax({
                url:url
            });
        },
        //获取上传cs用的session
        getUploadSession: function () {
            var url = '/' + projectCode + '/courses/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            course: {
                id: courseId,
                name: '',
                front_cover_object_id:null,
                front_cover_url: null,
                summary: '',
                user_suit: '',
                introduction: ''
            }
        },
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('content'));
            this._baseInfo();
        },
        _baseInfo: function() {
            var _self = this;
            if (courseId) {
                $.when(store.getUploadSession(),store.queryCourse())
                    .done(function(resData, returnData) {
                        var data = returnData[0];
                        var _model = ko.mapping.toJS(_self.model);
                        if(!data.front_cover_url){
                            data.front_cover_url=defaultImage;
                        }
                        data.summary=(data.summary)&&data.summary.replace(/\n/g,'<br/>').replace(/\s{1}/g,'&nbsp;');
                        data.introduction = (data.introduction)&&data.introduction.replace(/\$\{cs_host}/gim, resData[0].server_url);
                        _model.course = data;
                        ko.mapping.fromJS(_model, _self.model);
                        $(document).trigger('showContent');
                    });
            }
        },
        _ueditConfig: function() {
            // window.UMEDITOR_CONFIG.toolbar=[];
            this.um = UE.getEditor('umEditor',{toolbars:[],readonly:true,wordCount:false,enableAutoSave:false});
        },
        toEdit: function () {
            window.open('/' + projectCode+ '/course/${courseId}/edit', '_parent');
            // window.parentModel._setFullPath('1.2.99');
        },
        nextStep:function(){
            window.parentModel._setFullPath('1.2.2');
        }
    };
    viewModel._init();
})(jQuery,window);