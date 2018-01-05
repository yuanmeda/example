
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
        getExamList: function (name,pageNum) {
            var url =  name ? apiServiceDomain + "/v1/periodic_exams/search?$filter="+encodeURIComponent("name like '%"+ name +"%'")+"&$offset="+pageNum*20+"&$result=pager&$limit=20" : apiServiceDomain + "/v1/periodic_exams/search?$offset="+pageNum*20+"&$result=pager&$limit=20";
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        },
        getExamById: function (id) {
            var url =  apiServiceDomain + "/v1/periodic_exams/" + id;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                error: this.errorCallback
            });
        },
        deleteExam: function (id) {
            var url = apiServiceDomain + '/v1/periodic_exams/' + id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                error: this.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            searchTitle: '',
            items: [],
            count: '',
            page_num: 0
        },
        init: function () {
            var _self = this;
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this);
            this._getExamItems(this.model.searchTitle(),this.model.page_num());
            $('#titleSearch').on('keyup', function (evt) {
                if (evt.keyCode == 13) {
                    _self.searchAction();
                }
            });
        },
        _pagination: function (count, offset, limit) {
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.page_num(index);
                        this._getExamItems(this.model.searchTitle(),this.model.page_num());
                    }
                }, this)
            });
        },
        _getExamItems: function (name,pageNum) {
            store.getExamList(name,pageNum).done($.proxy(function (resData) {
                this.model.items(resData && resData.items && resData.items.length > 0 ? resData.items : []);
                this.model.count(resData && resData.items ? resData.total : 0);
                this._pagination(this.model.count(), this.model.page_num(), 20);
            }, this));
        },
        _getExamById: function (id) {
            store.getExamById(id).done($.proxy(function (resData) {
                this.model.items(resData ? [resData] : []);
                this._pagination(1, 0, 20);
            }, this));
        },
        searchAction: function () {
            var name = $.trim(viewModel.model.searchTitle());
            viewModel.model.page_num(0);
            viewModel._getExamItems(name,viewModel.model.page_num());
        },
        /*删除周期性考试*/
        delete: function (id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('真的要删除吗？',{
                confirm: function () {
                    store.deleteExam(id).done(function () {
                        $.fn.dialog2.helpers.alert('删除成功');
                        _self.model.page_num(0);
                        _self._getExamItems(_self.model.page_num());
                    });
                }
            });
        },
        edit: function (id) {
            window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/periodic_exam/setting?periodic_exam_id=' + id;
        },
        create: function () {
            window.location.href = 'http://' + location.host + '/' + projectCode + '/admin/periodic_exam/setting';
        },
        clear: function () {
            viewModel.model.searchTitle('');
        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery));


