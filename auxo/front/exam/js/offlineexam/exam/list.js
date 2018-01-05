(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert(i18nHelper.getKeyValue('offlineExam.common.networkError'));
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
        search: function (filter) {
            var url = selfUrl + '/' + projectCode + '/v1/exams/templates';
            return $.ajax({
                url: url,
                cache: false,
                data: filter,
                type: 'get',
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
                page: 0,
                size: 20
            }
        },
        init: function () {            
            document.title = i18nHelper.getKeyValue('offlineExam.list.title');
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.list();
        },
        list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store.search(filter)
                .done($.proxy(function (data) {
                    var items = data && data.items && data.items.length > 0 ? data.items : [];
                    this.model.items(items);
                    this.page(data.count, filter.page, filter.size);
                }, this));
        },
        page: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: false,
                is_show_input: true,
                prev_text: i18nHelper.getKeyValue('offlineExam.common.prev'),
                next_text: i18nHelper.getKeyValue('offlineExam.common.next'),
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.filter.page(page_id);
                        self.list();
                    }
                }
            });
        },
        getExamTime: function (item) {
            var cyclicStrategy = item.cyclicStrategy;
            var beginTime = item.beginTime;
            var endTime = item.endTime;
            var text = '';
            switch (cyclicStrategy) {
                case 0:
                    text = i18nHelper.getKeyValue('offlineExam.list.noLimitTime');
                    break;
                case 2:
                    text = i18nHelper.getKeyValue('offlineExam.list.dayCycle');
                    break;
                case 3:
                    text = i18nHelper.getKeyValue('offlineExam.list.weekCycle');
                    break;
                case 4:
                    text = i18nHelper.getKeyValue('offlineExam.list.monthCycle');
                    break;
                case 1:
                    if (beginTime || endTime) {
                        text = (beginTime ? Date.format(new Date(Date.formatTimezone(beginTime)), 'yyyy-MM-dd HH:mm') : '') + ' - ' + (endTime ? Date.format(new Date(Date.formatTimezone(endTime)), 'yyyy-MM-dd HH:mm') : '');
                    } else {
                        text =  i18nHelper.getKeyValue('offlineExam.list.customTime');
                    }
            }
            return text;
        },
        getBeginTime: function (item) {
            var cyclicStrategy = item.cyclicStrategy;
            var beginTime = item.beginTime;
            var endTime = item.endTime;
            var text = '';
            switch (cyclicStrategy) {
                case 0:
                    text = i18nHelper.getKeyValue('offlineExam.list.noLimitTime');
                    break;
                case 3:
                    text = i18nHelper.getKeyValue('offlineExam.list.weekCycle');
                    break;
                case 1:
                    if (beginTime || endTime) {
                        text = beginTime ? Date.format(new Date(Date.formatTimezone(beginTime)), 'yyyy-MM-dd HH:mm') : '';
                    } else {
                        text = i18nHelper.getKeyValue('offlineExam.list.customTime');
                    }
            }
            return text;
        },
        getEndTime: function (item) {
            var cyclicStrategy = item.cyclicStrategy;
            var beginTime = item.beginTime;
            var endTime = item.endTime;
            var text = '';
            switch (cyclicStrategy) {
                case 0:
                    text = i18nHelper.getKeyValue('offlineExam.list.noLimitTime');
                    break;
                case 3:
                    text = i18nHelper.getKeyValue('offlineExam.list.weekCycle');
                    break;
                case 1:
                    if (beginTime || endTime) {
                        text = beginTime ? Date.format(new Date(Date.formatTimezone(beginTime)), 'yyyy-MM-dd HH:mm') : '';
                    } else {
                        text = i18nHelper.getKeyValue('offlineExam.list.customTime');
                    }
            }
            return text;
        },
        getExamType: function (item) {
            var returnText = '';
            var type = item.type;

            if (type == 'exam') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 1 ? i18nHelper.getKeyValue('offlineExam.list.designExam') : i18nHelper.getKeyValue('offlineExam.list.other');
                } else {
                    returnText = item.subType == 1 ? i18nHelper.getKeyValue('offlineExam.list.customExam') : i18nHelper.getKeyValue('offlineExam.list.standerExam');
                }
            } else if (type == 'exercise') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 1 ? i18nHelper.getKeyValue('offlineExam.list.designExercise') : i18nHelper.getKeyValue('offlineExam.list.other');
                } else {
                    returnText = i18nHelper.getKeyValue('offlineExam.prepare.exercise');
                }
            }
            return returnText;
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);