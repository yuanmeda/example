(function ($, window) {
    'use strict';
    //数据仓库
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
        search: function (searchUrl) {
            var url = '/' + projectCode + '/v1/exams/templates' + searchUrl;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        //复制，无返回值
        copy: function (templateId) {
            var url = '/' + projectCode + '/v1/exams/templates/' + templateId + '/copy';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                error: store.errorCallback
            });
        },
        online: function (templId) {
            var url = '/' + projectCode + '/v1/exams/templates/' + templId + '/online';
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                error: store.errorCallback
            });
        },
        offline: function (templId) {
            var url = '/' + projectCode + '/v1/exams/templates/' + templId + '/offline';
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                error: store.errorCallback
            });
        },
        del: function (id) {
            var url = '/' + projectCode + '/v1/exams/templates/' + id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'delete',
                error: store.errorCallback
            });
        },
        getExams: function (filter, tmplId) {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/rooms';
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                data: filter,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            items: [],
            filter: {
                title: '',
                page: 0,
                size: 20/*,
                 orderBy: 1*/
            },
            exams: [],
            examFilter: {
                page: 0,
                size: 10
            }
        },
        currentTmplId: '',
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            $('#keyword').bind("keyup blur", $.proxy(function (e) {
                if (e.keyCode == 13) {
                    this.doSearch();
                }
            }, this));
            this.list();
        },
        list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            var searchData = '?page=' + filter.page + '&size=' + filter.size;
            if (filter.title) {
                searchData += ('&title=' + encodeURIComponent(filter.title));
            }
            store.search(searchData)
                .done($.proxy(function (data) {
                    var items = data && data.items && data.items.length > 0 ? data.items : [];
                    this.model.items(items);
                    this.page(data.count, filter.page, filter.size);
                }, this));
        },
        goEditExam: function (exam) {
            if (exam.type == 'exam') {
                if (exam.offlineExam) {
                    if (exam.offlineExamType == 1) {
                        location.href = '/' + projectCode + "/exam/offline_exam/edit?tmpl_id=" + exam.id;
                    } else {
                        //其它类型的线下考试
                    }
                } else {
                    //线上考试
                }
            } else if (exam.type = 'exercise') {
                if (exam.offlineExam) {
                    if (exam.offlineExamType == 1) {
                        location.href = '/' + projectCode + "/exam/offline_exam/exercise/edit?tmpl_id=" + exam.id;
                    } else {
                        //其它类型的线下练习
                    }
                } else {
                    //线上练习
                }
            }
        },
        page: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.filter.page(page_id);
                        self.list();
                    }
                }
            });
        },
        doSearch: function () {
            viewModel.model.filter.page(0);
            viewModel.list();
        },
        onOffline: function (tmplId, enabled) {
            var _self = viewModel;
            store[enabled ? 'online' : 'offline'](tmplId).done(function (data) {
                $.fn.dialog2.helpers.alert((enabled ? '上线' : '下线') + '成功!');
                _self.list();
            });
        },
        delExam: function (id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？', {
                "confirm": function () {
                    store.del(id)
                        .done(function () {
                            _self.list();
                        });
                },
                "decline": function () {
                    return;
                },
                buttonLabelYes: '确定',
                buttonLabelNo: '取消'
            })
        },
        getExamTime: function (item) {
            var cyclicStrategy = item.cyclicStrategy;
            var beginTime = item.beginTime;
            var endTime = item.endTime;
            var text = '';
            switch (cyclicStrategy) {
                case 0:
                    text = "不限时间";
                    break;
                case 2:
                    text = "每天循环";
                    break;
                case 3:
                    text = "每周循环";
                    break;
                case 4:
                    text = "每月循环";
                    break;
                case 1:
                    if (beginTime || endTime) {
                        text = (beginTime ? Date.format(new Date(Date.formatTimezone(beginTime)),'yyyy-MM-dd HH:mm') : '') + ' - ' + (endTime ? Date.format(new Date(Date.formatTimezone(endTime)),'yyyy-MM-dd HH:mm') : '');
                    } else {
                        text = "自定义时间点";
                    }
            }
            return text;
        },
        getExamType: function (item) {
            var returnText = '';
            var type = item.type;

            if (type == 'exam') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 1 ? '设计方法论考试' : '其他';
                } else {
                    returnText = item.subType == 1 ? '自定义考试' : '标准考试';
                }
            } else if (type == 'exercise') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 1 ? '设计方法论练习' : '其他';
                } else {
                    returnText = '练习';
                }
            }
            return returnText;
        },
        copyExam: function (id) {
            store.copy(id)
                .done($.proxy(function (data) {
                    this.model.filter.page(0);
                    this.list();
                }, this))
        },
        getExams: function (tmplId) {
            var filter = ko.mapping.toJS(this.model.examFilter);
            store.getExams(filter, this.currentTmplId)
                .done(function (data) {
                    var items = data && data.items && data.items.length > 0 ? data.items : [];
                    this.model.exams(items);
                    this.pageExam(data.count, filter.page, filter.size);
                    $('#showExamModal').modal('show');
                }.bind(this));
        },
        pageExam: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination_exam').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.examFilter.page(page_id);
                        self.getExams();
                    }
                }
            });
        },
        showExamModal: function (tmplId) {
            this.currentTmplId = tmplId;
            this.getExams();
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);