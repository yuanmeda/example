(function($, window) {
    var store = {
        errorCallback: function(jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        //考试管理考生成绩列表
        getExamList: function() {
            //todo
            var url = '/' + projectCode + '/trains/' + trainId + '/included_exams';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            examList: [],
            scoreModelUrl: staticurl + "auxo/admin/train/downloadTemplate/c7aa3eced916444b93a1f8395c100497.xls",
            filter: {
                name: '', //姓名
                nodeName: '', //部门
                passStatus: "", //是否合格
                scoreFrom: null,
                scoreTo: null,
                page: 0,
                size: 20
            },
            count: 0,
            items: []
        },
        init: function() {
            this.model = ko.mapping.fromJS(this.model);
            this.getTrainExam().done($.proxy(function() {
                ko.applyBindings(this);
            }, this));
            
        },
        getTrainExam: function() {
            return store.getExamList().done($.proxy(function(returnData) {
                this.model.examList(returnData);
                // if(this.model.examList() && this.model.examList().length>1){
                //     this.model.selectedExamId(this.model.examList()[0].id);
                // }
            }, this))
        }
    };
    $(function() {
        viewModel.init();
    });
})(jQuery, window);