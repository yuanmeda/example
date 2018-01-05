
(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
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
        sessionSearch: function(){
            // var url = apiServiceDomain + '/v1/periodic_exam_sessions/search?periodic_exam_id=' + periodic_exam_id;
            var url = service_domain + '/v1/periodic_exam_sessions?periodic_exam_id=' + periodic_exam_id;
            var filter = "periodic_exam_id eq '"+ periodic_exam_id + "'";
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: 'json',
                error: this.errorCallback
            });
        },
        sessionUsersSearch: function(periodicExamId, page, page_size){
            var url = service_domain + '/v1/periodic_exam_session_users';
            var params = {
                periodic_exam_session_id: periodicExamId,
                size: page_size,
                page: page || 0
            };
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: 'json',
                data: params,
                error: this.errorCallback
            });

        }

    };

    var viewModel = {
        start_time: '',
        end_time: '',
        model: {
            sessions: {
                total: 0,
                items: []
            },
            sessionUsers:{
                total: 0,
                items: []
            },
            filter: {
                size: 10,
                page: 0
            }

        },

        init: function () {
            var _self = this;
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this, document.getElementById('session-list'));
            store.sessionSearch().then(function(data){
                ko.mapping.fromJS(data, {}, _self.model.sessions);
                _self.query();
            });
        },

        dateFmt:function(item) {
            var data = ko.mapping.toJS(item);
            var start_date = (new Date(data.start_time)).format('yyyy-MM-dd');
            var end_date = (new Date(data.end_time)).format('yyyy-MM-dd');
            var start = (new Date(data.start_time)).format('yyyy-MM-dd HH:mm');
            if(start_date == end_date){
                var end = (new Date(data.end_time)).format('HH:mm')
            }else {
                var end = (new Date(data.end_time)).format('yyyy-MM-dd HH:mm')
            }
            return start + '至' + end;
        },

        query: function(n){
            if(n) this.model.filter.page(0)
            var _self = this;
            var sessionId = $("#session").val();
            var _filter = ko.mapping.toJS(_self.model.filter);
            store.sessionUsersSearch(sessionId, _filter.page, _filter.size).then(function(data){
                _self.model.sessionUsers.total(data.total)
                _self.model.sessionUsers.items(data.items)
                _self._pagePlugin(data.total, _filter.size, _filter.page);
            });
            
        },

        export: function(){
            var _self = this;
        },


        /**
         * 分页初始化
         * @param  {int}   total       总条数
         * @param  {int}   pageSize    每页条数
         * @param  {int}   currentPage 当前页码
         * @return {null}               null
         */
        _pagePlugin: function (total, pageSize, currentPage) {
            var _vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        _vm.model.filter.page(pageNum);
                        _vm.model.sessionUsers.total(0);
                        _vm.model.sessionUsers.items([]);
                        _vm.query();
                    }
                }
            });
        },

        gopage: function (item) {
            var item = ko.mapping.toJS(item);
            var sessionId = item.periodic_exam_session_user.highest_score_user_exam_session_id // ?
            // http://{domain}/{project_code}/periodic_exam/admin/{session_id}/detail
            location.href = '/' + projectCode + '/admin/periodic_exam/admin/'+ sessionId +'/detail';
        }
    };

    $(function () {
        viewModel.init();
    });

}(jQuery));


Date.prototype.Format = function(fmt){ 
    var o = {   
        "M+" : this.getMonth()+1,                 //月份   
        "d+" : this.getDate(),                    //日   
        "h+" : this.getHours(),                   //小时   
        "m+" : this.getMinutes(),                 //分   
        "s+" : this.getSeconds(),                 //秒   
        "q+" : Math.floor((this.getMonth()+3)/3), //季度   
        "S"  : this.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
        }   
    } 
    return fmt;   
}