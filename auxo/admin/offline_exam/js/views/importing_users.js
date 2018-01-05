
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
        onlineExamEdits: function () {
            var url = service_domain + "/v1/periodic_exam_details/" + periodic_exam_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                dataType: 'json',
                error: this.errorCallback
            });
        },
        sessionSearch: function () {
            var url = service_domain + '/v1/periodic_exam_sessions?periodic_exam_id=' + periodic_exam_id;
            var filter = "periodic_exam_id eq '" + periodic_exam_id + "'";
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: 'json',
                error: this.errorCallback
            });
        },
        sessionUsersSearch: function (periodicExamSessionId, page, page_size) {
            var url = service_domain + '/v1/periodic_exam_session_users';
            var params = {
                periodic_exam_session_id: periodicExamSessionId,
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
        },
        scoreWrite: function (sessionId, userId, data) {
            var url = service_domain + '/v1/periodic_exam_session_users/' + sessionId + '/users/' + userId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(data),
                error: this.errorCallback
            });
        },
        export: function (periodicExamSessionId) {
            var url = service_domain + '/' + projectCode + '/admin/periodic_exam_session_users/' + periodicExamSessionId + '/actions/export';
            // location.href = url;
            window.open(url);
        }
    };

    var viewModel = {
        start_time: '',
        end_time: '',
        uploadSetting: {
            session: '',
            path: '',
            serverUrl: '',
            serviceId: ''
        },
        model: {
            examName: "",
            sessions: {
                total: 0,
                items: []
            },
            sessionUsers: {
                total: 0,
                items: []
            },
            filter: {
                size: 10,
                page: 0
            },
            currSessionUser: ko.observable({
                periodic_exam_session_user: {
                    periodic_exam_session_id: '',
                    highest_score: 0.0
                },
                uc_user_display_facade: {
                    nick_name: '',
                    user_id: ''
                }
            }),
            writeData: {
                highest_score: 0
            },
            editData: {
                highest_score: 0,
                comment: ''
            },
            uploadTarget: ''
        },

        init: function () {
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this, document.getElementById('session-list'));

            this.exec();
        },
        exec: function () {
            store.sessionSearch().then($.proxy(function (data) {
                ko.mapping.fromJS(data, {}, this.model.sessions);
                if(data && data.length > 0) {
                    this.query();
                }
            }, this));
            store.onlineExamEdits().then($.proxy(function (data) {
                this.model.examName(data.periodic_exam.name);
            }, this));
        },
        initUpload: function () {
            $("#js_uploader").empty();
            var sessionId = $("#session").val();
            this.uploader = new WebUploader.Uploader({
                swf: static_url + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: service_domain + '/' + projectCode + '/admin/periodic_exam_session_users/' + sessionId + '/actions/import',
                auto: true,
                duplicate: true,
                fileVal: 'Filedata',
                pick: {
                    id: '#js_uploader',
                    multiple: false,
                },
                formData: {
                    path: this.uploadSetting.path
                },
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                    title: 'Excel',
                    extension: 'xls, xlsx, xlsm, xltx, xltm, xlsb, xlam',
                    mimeTypes: 'application/vnd.ms-excel|xls'
                }]
            })
            this.uploader.on('beforeFileQueued', $.proxy(this._beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this._uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this._uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this._uploadSuccess, this));
        },
        _beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        _uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason + " ！");
        },
        _uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        _uploadSuccess: function (file, response) {
            if (response.code == 400) {
                $.fn.dialog2.helpers.alert("导入失败：" + response.localized_message)
            }
            if (response.code == 200) {
                $.fn.dialog2.helpers.alert("导入成功");

                this.query();
            }
        },
        _selectFile: function () {
            $("input[type=file]").click();
        },
        dateFmt: function (item) {
            var data = ko.mapping.toJS(item);
            var start_date = (new Date(data.start_time)).format('yyyy-MM-dd');
            var end_date = (new Date(data.end_time)).format('yyyy-MM-dd');
            var start = (new Date(data.start_time)).format('yyyy-MM-dd HH:mm');
            if (start_date == end_date) {
                var end = (new Date(data.end_time)).format('HH:mm')
            } else {
                var end = (new Date(data.end_time)).format('yyyy-MM-dd HH:mm')
            }
            return start + '至' + end;
        },

        query: function (n) {
            if (n) this.model.filter.page(0)
            var _self = this;
            var sessionId = $("#session").val();
            var _filter = ko.mapping.toJS(_self.model.filter);
            store.sessionUsersSearch(sessionId, _filter.page, _filter.size).then(function (data) {
                _self.model.sessionUsers.total(data.total)
                _self.model.sessionUsers.items(data.items)
                _self._pagePlugin(data.total, _filter.size, _filter.page);
            });
        },

        export: function () {
            var _self = this;
            var sessionId = $("#session").val();
            store.export(sessionId);
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
            var sessionId = item.periodic_exam_session_user.highest_score_user_exam_session_id
            location.href = '/' + projectCode + '/admin/periodic_exam/admin/' + sessionId + '/detail';
        },

        showWriteModal: function (item) {
            var item = ko.mapping.toJS(item);
            this.model.currSessionUser(item);
            $('#writeModal').modal('show');
        },

        hideWriteModal: function () {
            $('#writeModal').modal('hide');
        },

        showEditModal: function (item) {
            var item = ko.mapping.toJS(item);
            this.model.currSessionUser(item);
            $('#editModal').modal('show');
        },

        hideEditModal: function () {
            $('#editModal').modal('hide');
        },

        import: function () {
            this.initUpload();
            $('#importModal').modal('show');
        },

        hideImportModal: function () {
            $('#importModal').modal('hide');
        },

        writeScore: function () {
            var writeData = this.model.writeData,
                highest_score = writeData.highest_score();

            if (!/^[1-9]\d*$/.test(highest_score)) {
                $.fn.dialog2.helpers.alert("成绩得分必须为正整数");
                return;
            }

            var postData = ko.mapping.toJS(this.model.writeData);
            postData.highest_score = postData.highest_score * 1;

            store.scoreWrite(postData).done(function (resData) {
                this.hideWriteModal();
                $.fn.dialog2.helpers.alert("成绩录入成功");
            }.bind(this));
        },

        editScore: function () {
            var self = this;
            var editData = this.model.editData,
                highest_score = editData.highest_score(),
                comment = editData.comment();
            var sessionId = this.model.currSessionUser().periodic_exam_session_user.periodic_exam_session_id;
            var user_id = this.model.currSessionUser().uc_user_display_facade.user_id;

            if (!/^[1-9]\d*$/.test(highest_score)) {
                $.fn.dialog2.helpers.alert("成绩得分必须为正整数");
                return;
            }

            var postData = ko.mapping.toJS(this.model.editData);
            postData.highest_score = postData.highest_score * 1;
            postData.comment = postData.comment;

            store.scoreWrite(sessionId, user_id, postData).done(function (resData) {
                this.hideEditModal();
                self.query();
                $.fn.dialog2.helpers.alert("成绩修改成功");
            }.bind(this));
        }
    };

    $(function () {
        viewModel.init();
    });

}(jQuery));


Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}