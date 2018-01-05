(function ($) {
    "use strict";

    var commonTool = {
        getDataTime: function (dateStr) {
            if (dateStr.length < 11)
                dateStr += " 00:00:00";
            return new Date(dateStr.replace(/-/g, '/')).getTime();
        }
    }

    var store = {
        getList: function (search) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees/search",
                data: JSON.stringify(search),
                dataType: "json",
                type: "POST"
            });
        },
        audit: function (pass, data) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees/status/" + pass,
                type: 'PUT',
                dataType: "json",
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data),
                cache: false
            });
        },
        deleteUser: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees",
                data: JSON.stringify(data),
                type: 'DELETE',
                cache: false
            });
        },
        export: function (search) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/trainees/reporting",
                data: search,
                type: "GET",
                cache: false
            });
        },
        getUserIds: function (orgId, userName) {
            return $.ajax({
                url: "/" + projectCode + "/v0.93/organizations/" + orgId + "/orgnodes/0/users/actions/search?name=" + userName + "&$offset=0&$limit=100",
            });
        },
        getOrgInfo: function () {
            return $.ajax({
                url: "/" + projectCode + "/trains/manage_orgs",
            });
        }
    }

    var viewModel = {
        model: {
            train_id: trainId,
            list: [],
            totalCount: 0,
            checkList: [],
            importUserUrl: '/' + projectCode + importUserUrl,
            search: {
                "status": "",
                "start_time": "",
                "end_time": "",
                "page_no": 0,
                "page_size": 10,
                "user_ids": [],
                "user_id": ""
            },
            userSearch: {
                "user_name": "",
                "user_id": "",
                "org_id": ""
            },
            audit: {
                currentUserId: "",
                comment: ""
            }
        },
        observableValidate: function () {
            var that = this;
            that.model.audit.comment.extend({
                required: {
                    params: true,
                    message: "请输入报名审核"
                }
            });

            that.model.validatedInfo = ko.validatedObservable(that.model.audit, {
                observable: true,
                live: true,
                deep: true
            });
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            $("#js_starttime, #js_endtime").datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                todayBtn: true,
                autoclose: true,
                todayHighlight: true,
                format: 'yyyy-mm-dd',
                minView: "month",
                pickerPosition: "bottom-left",
                clearBtn: true
            });
            $("#checkAll").attr("checked", false);
            $("#checkAll").click(this.checkAll);

            this.observableValidate();
            this.search();
            ko.applyBindings(this);
            $('#uploadmodal').on('shown', function () {
                this._bindUpload();
            }.bind(this));

            store.getOrgInfo().done($.proxy(function (data) {
                this.model.userSearch.org_id(data.org_tree[0].root_id);
            }, this));
        },
        search: function () {
            var userName = this.model.userSearch.user_name();
            var orgId = this.model.userSearch.org_id();
            if (userName) {
                store.getUserIds(orgId, userName).done($.proxy(function (data) {
                    $.each(data.items, $.proxy(function(index, item) {
                        this.model.search.user_ids.push(item.user_id)
                    }, this));
                    this.model.search.page_no(0);
                    this.getList();
                }, this));
            }
            else {
                this.model.search.user_ids.removeAll()
                this.model.search.page_no(0);
                this.getList();
            }
        },
        page: function (totalCount, pageIndex, pageSize) {
            var self = this;
            $("#pagination").pagination(totalCount, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: pageIndex,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != pageIndex) {
                        viewModel.model.search.page_no(index);
                        viewModel.getList();
                    }
                }
            });
        },
        getList: function () {
            var self = this;
            $("#checkAll").attr("checked", false);
            var search = ko.mapping.toJS(self.model.search);
            if(search.user_id) {
                search.user_ids.push(search.user_id);
            }


            $("#nolist").hide();
            store.getList(search).done(function (data) {
                self.model.list(data.items);
                self.model.totalCount(data.total);
                if (!data.total)
                    $("#nolist").show();
                viewModel.page(data.total, self.model.search.page_no.peek(), self.model.search.page_size.peek());
            });
        },
        checkAll: function () {
            var ids;
            if ($("#checkAll").attr("checked") == "checked") {
                $("input[name*='checkItem']").attr("checked", "checked");
                ids = viewModel._getCheck();
                for (var i = 0; i < ids.length; i++) {
                    viewModel._addCheck(ids[i]);
                }
            } else {
                ids = viewModel._getCheck();
                $("input[name*='checkItem']").attr("checked", false);
                for (var i = 0; i < ids.length; i++) {
                    viewModel._removeCheck(ids[i]);
                }
            }
        },
        _getCheck: function () {
            var ids = [];
            $("input[name=checkItem]").each(function () {
                if ($(this).attr("checked")) {
                    ids.push($(this).val());
                }
            });
            return ids;
        },
        _removeCheck: function (id) {
            for (var i = 0; i < this.model.checkList().length; i++) {
                if (this.model.checkList()[i] == id) {
                    this.model.checkList.remove(this.model.checkList()[i]);
                }
            }
        },
        _addCheck: function (id) {
            for (var i = 0; i < this.model.checkList().length; i++) {
                if (this.model.checkList()[i] == id) {
                    return;
                }
            }
            this.model.checkList.push(parseInt(id));
        },
        deleteUser: function ($data) {
            $.fn.dialog2.helpers.confirm("确认要删除学员吗？", {
                confirm: function () {
                    store.deleteUser([$data.user_id]).done(function () {
                        viewModel.model.checkList([]);
                        viewModel.getList();
                    })
                }
            });
        },
        deleteSomeUser: function () {
            if (viewModel.model.checkList().length == 0) {
                $.fn.dialog2.helpers.alert('请选择要删除的学员');
                return;
            }
            $.fn.dialog2.helpers.confirm("确认要删除所有选中的学员吗？", {
                confirm: function () {
                    var ids = ko.mapping.toJS(viewModel.model.checkList);

                    store.deleteUser(ids).done(function () {
                        viewModel.model.checkList([]);
                        viewModel.getList();
                    })
                }
            });

        },
        audit: function ($data) {
            var that = viewModel;
            that.model.audit.currentUserId($data.user_id);
            that.model.audit.comment("");
            $("#shmodal").modal("show");
        },
        someAudit: function () {
            var that = viewModel;
            that.model.audit.currentUserId("");
            that.model.audit.comment("");
            if (that.model.checkList().length == 0) {
                $.fn.dialog2.helpers.alert('请选择要审核的学员');
                return;
            }
            $("#shmodal").modal("show");
        },
        checkTraineeSuccess: function () {
            this.checkTrainee(true);
        },
        checkTraineeFalse: function () {
            this.checkTrainee(false);
        },
        checkTrainee: function (pass) {
            if (!viewModel.model.validatedInfo.isValid()) {
                viewModel.model.validatedInfo.errors.showAllMessages();
                return;
            }
            var userIds = [viewModel.model.audit.currentUserId()];
            if (!viewModel.model.audit.currentUserId())
                userIds = viewModel.model.checkList();
            var data = {
                user_ids: userIds,
                comment: viewModel.model.audit.comment()
            };

            store.audit(pass, data).done(function () {
                $("#shmodal").modal("hide");
                $.fn.dialog2.helpers.alert('审核成功');
                if (!viewModel.model.audit.currentUserId())
                    viewModel.model.checkList([]);
                viewModel.getList();
            });
        },
        export: function () {
            if (viewModel.model.totalCount() == 0)
                return;
            var search = ko.mapping.toJS(viewModel.model.search);
            window.open("/" + projectCode + "/trains/" + trainId + "/trainees/reporting?status=" + search.status + "&start_time=" + search.start_time + "&end_time=" + search.end_time, "_blank");
        },
        _bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + window.location.host + '/' + projectCode + '/trains/' + trainId + '/trainees/import',
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
                this.getList();
            } else {
                response ? $.fn.dialog2.helpers.alert(response.message) : $.fn.dialog2.helpers.alert("上传出错");
            }
        }
    };
    $(function () {
        viewModel.init();
    })
})
    (jQuery);