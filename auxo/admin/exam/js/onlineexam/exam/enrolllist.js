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
                    var endTime = this.model.filter.createTimeTo().replace(/-/g, "/");
                    beginTime = beginTime.replace(/-/g, "/");
                    if (beginTime && endTime)
                        return new Date(beginTime).getTime() < new Date(endTime).getTime();

                    return true;
                }, this),
                message: '开始时间必须要早于结束时间'
            };
            ko.validation.rules["endTime"] = {
                validator: $.proxy(function (endTime) {
                    var beginTime = this.model.filter.createTimeFrom().replace(/-/g, "/");
                    endTime = endTime.replace(/-/g, "/");
                    if (beginTime && endTime)
                        return new Date(beginTime).getTime() < new Date(endTime).getTime();

                    return true;
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
        list: function () {
            var filterData = "exam_id=" + this.model.filter.examId()
                + "&page=" + this.model.filter.page()
                + "&size=" + this.model.filter.size();

            if (this.model.filter.userEnrollType() != "-1")
                filterData += "&user_enroll_type=" + this.model.filter.userEnrollType();
            if (this.model.filter.userName())
                filterData += "&user_name=" + encodeURIComponent(this.model.filter.userName());
            if (this.model.filter.createTimeFrom())
                filterData += "&create_time_from=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeFrom()));
            if (this.model.filter.createTimeTo())
                filterData += "&create_time_to=" + encodeURIComponent(timeZoneTrans(this.model.filter.createTimeTo()));

            store.list(filterData).done($.proxy(function (returnData) {
                (returnData && returnData.items && returnData.items.length > 0) ? this.model.items(returnData.items) : this.model.items([]);

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
                case 5:
                    return "待填表单";
                case 8:
                    return "已考试";
                case 12:
                    return "待付款";
                case 13:
                    return "已取消";
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
            var requestData = {opinion: this.model.approve.opinion()};
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
        },
        downloadModel: function () {
            location.href = '/' + projectCode + '/v1/exams/import_model/download'
        },
        showModal: function () {
            $('#uploadmodal').modal('show');
            this.bindUpload();
        },
        bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + window.location.host + '/' + projectCode + '/v1/m/exams/' + examId + '/candidates/excel_import',
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#js_uploader',
                    multiple: false
                },
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                    title: "excel",
                    extensions: "xls,xlsx,xlsm",
                    mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this));
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (file, response) {
            $('body').loading('hide');
            if (!response.code) {
                $.fn.dialog2.helpers.alert("导入成功！");
                $("#uploadmodal").modal('hide');
                this.list();
            } else {
                response ? $.fn.dialog2.helpers.alert(response.message) : $.fn.dialog2.helpers.alert("上传出错");
            }
        },
        gotoEnroll: function () {
            var url = elearning_enroll_gateway_url + '/' + projectCode + '/enroll/manage?unit_id=' + examId;
            url = url + '&__mac=' + Nova.getMacToB64(url);
            window.open(url);
        }
    };

    $(function () {
        viewModel.init();
    })
}(jQuery));
