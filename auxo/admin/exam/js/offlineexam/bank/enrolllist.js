(function ($) {
    var store = {
        list: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/candidates/pages?' + data,
                cache: false,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                type: 'GET',
                contentType: 'application/json;charset=utf8'
            });
        },
        export: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/candidates/export?' + data,
                cache: false,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                type: 'GET',
                contentType: 'application/json;charset=utf8'
            });
        },
        approved: function (data, candidateId) {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/candidates/' + candidateId + '/approve',
                cache: false,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: JSON.stringify(data),
                type: 'PUT',
                contentType: 'application/json;charset=utf8'
            });
        },
        rejected: function (data, candidateId) {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/' + examId + '/candidates/' + candidateId + '/disapprove',
                cache: false,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: JSON.stringify(data),
                type: 'PUT',
                contentType: 'application/json;charset=utf8'
            });
        }
    };

    var viewModel = {
        model: {
            items: [],
            filter: {
                examId: examId,
                userName: "",
                userEnrollType: "-1",
                createTimeFrom: "",
                createTimeTo: "",
                page: 0,
                size: 20
            },
            approve: {
                userEnrollType: "1",
                opinion: "",
                candidateId: 0
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            $('#beginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#endTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });

            this.validate();
            this.list();
        },
        validate: function () {
            var filter = this.model.filter;
            ko.validation.rules["startTime"] = {
                validator: $.proxy(function (beginTime) {
                    var endTime = this.model.filter.createTimeTo();
                    if (endTime && beginTime) {
                        endTime = timeZoneTrans(endTime);
                        beginTime = timeZoneTrans(beginTime);
                        return new Date(beginTime).getTime() < new Date(endTime).getTime();
                    } else {
                        return true;
                    }
                }, this),
                message: '开始时间必须要早于结束时间'
            };
            ko.validation.rules["endTime"] = {
                validator: $.proxy(function (endTime) {
                    var beginTime = this.model.filter.createTimeFrom();
                    if (beginTime && endTime) {
                        beginTime = timeZoneTrans(beginTime);
                        endTime = timeZoneTrans(endTime);
                        return new Date(beginTime).getTime() < new Date(endTime).getTime();
                    } else {
                        return true;
                    }
                }, this),
                message: '开始时间必须要早于结束时间'
            };

            ko.validation.registerExtenders();
            filter.createTimeFrom.extend({
                startTime: ko.unwrap(this.model.filter.createTimeTo)
            });
            filter.createTimeTo.extend({
                endTime: ko.unwrap(this.model.filter.createTimeFrom)
            });
        },
        doSearch: function () {
            var errors = ko.validation.group(this.model.filter);
            if (errors().length > 0) {
                $.fn.dialog2.helpers.alert(errors()[0]);
                return;
            }

            this.model.filter.page(0);
            this.list();
        },
        doExport: function () {
            var filterData = "exam_id=" + this.model.filter.examId();

            if (this.model.filter.userEnrollType() != "-1")
                filterData += "&user_enroll_type=" + this.model.filter.userEnrollType();
            if (this.model.filter.userName())
                filterData += "&user_name=" + encodeURIComponent(this.model.filter.userName());
            if (this.model.filter.createTimeFrom())
                filterData += "&create_time_from=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeFrom()));
            if (this.model.filter.createTimeTo())
                filterData += "&create_time_to=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeTo()));
            // store.export(filterData);
            window.open('/' + projectCode + '/v1/exams/' + examId + '/candidates/export?' + filterData, '_blank');
        },
        list: function () {
            var filterData = "exam_id=" + this.model.filter.examId() + "&page=" + this.model.filter.page() + "&size=" + this.model.filter.size();

            if (this.model.filter.userEnrollType() != "-1")
                filterData += "&user_enroll_type=" + this.model.filter.userEnrollType();
            if (this.model.filter.userName())
                filterData += "&user_name=" + encodeURIComponent(this.model.filter.userName());
            if (this.model.filter.createTimeFrom())
                filterData += "&create_time_from=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeFrom()));
            if (this.model.filter.createTimeTo())
                filterData += "&create_time_to=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeTo()));

            store.list(filterData).done($.proxy(function (returnData) {
                (returnData && returnData.items.length > 0) ? this.model.items(returnData.items) : this.model.items([]);

                this.page(returnData.count, ko.unwrap(this.model.filter.page), ko.unwrap(this.model.filter.size));
            }, this));
        },
        page: function (totalCount, currentPage, pageSize) {
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                items_per: [20, 50, 100, 200, 500, 1000],
                callback: $.proxy(function (index) {
                    if (index != currentPage) {
                        this.model.filter.page(index);
                        this.list();
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page(0);
                    this.model.filter.size(size);
                    this.doSearch();
                }, this)
            });
        },
        getEnrollStatus: function (status) {
            switch (status) {
                case 0:
                    return "待审核";
                case 1:
                    return "审核通过";
                case 2:
                    return "审核不通过";
                case 4:
                    return "已报名";
                case 8:
                    return "已考试";
                default:
                    return "已考试"
            }
        },
        showApproveModal: function (data) {
            this.model.approve.opinion(data.opinion);
            this.model.approve.userEnrollType(1);
            this.model.approve.candidateId(data.id);
            $('#approveModal').modal('show');
        },
        saveApprove: function () {
            var requestData = {
                opinion: this.model.approve.opinion()
            };
            var request = null;

            if (this.model.approve.userEnrollType() == 1)
                request = store.approved(requestData, this.model.approve.candidateId());
            else
                request = store.rejected(requestData, this.model.approve.candidateId());

            request.done($.proxy(function () {
                this.doSearch();
            }, this));

            $('#approveModal').modal('hide');
        },
        clearEndTime: function () {
            this.model.filter.createTimeTo('');
            // $('#endTime').val('').datetimepicker('reset');
        },
        clearStartTime: function () {
            this.model.filter.createTimeFrom('');
            // $('#beginTime').val('').datetimepicker('reset');
        }
    };

    $(function () {
        viewModel.init();
    })
}(jQuery));