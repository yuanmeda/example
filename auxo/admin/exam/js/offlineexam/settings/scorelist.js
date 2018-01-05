(function ($, window) {
    var ROOM_ID = roomId;
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
        //考试管理考生成绩列表
        getUserExamList: function (uri) {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/users/list' + uri;
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        getNodes: function (room_id) {
            return $.ajax({
                url: '/' + projectCode + '/v1/m/exams/' + examId + '/nodes?room_id=' + room_id,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        answerExport: function (uri) {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/answers/export_dm' + uri;
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                error: store.errorCallback
            });
        },
        getRooms: function () {
            return $.ajax({
                url: '/' + projectCode + '/v1/exams/templates/' + examId + '/rooms',
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            scoreModelUrl: scoreModelUrl,
            filter: {
                name: '',
                selectedNodeId: 0,
                passStatus: -1,
                page: 0,
                size: 20,
                markApplied: -1,
                beginTime: '',
                endTime: ''
            },
            count: 0,
            nodes: [],
            items: [],
            rooms: [],
            selectedRoomId: null
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.initNodes();

            $('#nameSearch,#orgSearch,#startScore,#endScore').bind("keyup blur", function (e) {
                if (e.keyCode == 13) {
                    viewModel.searchAction();
                }
            });
            this.model.filter.passStatus.subscribe(function (val) {
                this.searchAction();
            }, this);
            this.model.filter.markApplied.subscribe(function (val) {
                this.searchAction();
            }, this);
            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });

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
            $('#uploadmodal').on('shown', function () {
                this._bindUpload();
            }.bind(this));
            this.validate();
        },
        initNodes: function () {
            store.getRooms().done($.proxy(function (data) {
                if (typeof data == 'undefined' || data == null)
                    data.items = [];

                $.each(data.items, function (index, item) {
                    if (item.beginTime) {
                        item.name = timeZoneTrans(item.beginTime) + ' ~ ';
                    } else {
                        item.name = ' ~ ';
                    }
                    if (item.endTime) {
                        item.name = item.name + timeZoneTrans(item.endTime);
                    }
                });
                this.model.rooms(data.items);

                if (ROOM_ID)
                    this.model.selectedRoomId(ROOM_ID);
                else
                    data.items.length && this.model.selectedRoomId(data.items[data.items.length - 1].id);

                if (data.items && data.items.length > 0)
                    this._updateItems();
            }, this));
        },
        validate: function () {
            ko.validation.configuration.insertMessages = false;

            var filter = this.model.filter;
            ko.validation.rules["beginTime"] = {
                validator: $.proxy(function (beginTime) {
                    var result = true;
                    var endTime = this.model.filter.beginTime();
                    if(beginTime && endTime){
                        endTime = timeZoneTrans(this.model.filter.endTime());
                        beginTime = timeZoneTrans(beginTime);
                        if (beginTime && endTime)
                            result =  new Date(beginTime).getTime() <= new Date(endTime).getTime();
                    }

                    return result;
                }, this),
                message: '开始时间必须要早于等于结束时间'
            };
            ko.validation.rules["endTime"] = {
                validator: $.proxy(function (endTime) {
                    var beginTime = this.model.filter.beginTime();
                    if(endTime && beginTime){
                        beginTime = timeZoneTrans(this.model.filter.beginTime());
                        endTime = timeZoneTrans(endTime);
                        if (beginTime && endTime)
                            return new Date(beginTime).getTime() <= new Date(endTime).getTime();
                    }else{
                        return true;
                    }

                }, this),
                message: '开始时间必须要早于等于结束时间'
            };

            ko.validation.registerExtenders();
            filter.beginTime.extend({
                startTime: ko.unwrap(this.model.filter.beginTime)
            });
            filter.endTime.extend({
                endTime: ko.unwrap(this.model.filter.endTime)
            });
        },
        _getUri: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            filter.name = $.trim(filter.name);
            var uri = '?name=' + encodeURIComponent(filter.name) + '&page=' + filter.page + '&size=' + filter.size;
            if (this.model.selectedRoomId()) {
                uri = uri + '&room_id=' + this.model.selectedRoomId();
            }
            if (filter.passStatus == "0" || filter.passStatus == "1") {
                filter.passStatus = parseInt(filter.passStatus);
                uri = uri + '&pass_status=' + filter.passStatus;
            }
            if (filter.markApplied == "0" || filter.markApplied == "1") {
                filter.markApplied = parseInt(filter.markApplied);
                uri = uri + '&mark_applied=' + filter.markApplied;
            }
            if (filter.selectedNodeId) {
                filter.selectedNodeId = parseInt(filter.selectedNodeId);
                uri = uri + '&node_id=' + filter.selectedNodeId;
            }
            if ($.trim(filter.beginTime) != "") {
                uri = uri + '&submit_time_from=' + encodeURIComponent(timeZoneTrans(filter.beginTime));
            }
            if ($.trim(filter.endTime) != "") {
                uri = uri + "&submit_time_to=" + encodeURIComponent(timeZoneTrans(filter.endTime));
            }
            return uri;
        },
        exportListAction: function () {
            var w = window.open();
            w.location.href = '/' + projectCode + '/v1/m/exams/' + examId + '/scores/export_dm' + this._getUri();
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
                items_per: [20, 50, 100, 200, 500, 1000],
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.filter.page(index);
                        this._updateItems();
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page(0);
                    this.model.filter.size(size);
                    this._updateItems();
                }, this)
            });
        },
        _updateItems: function () {
            store.getNodes(this.model.selectedRoomId()).done($.proxy(function (data) {
                if (typeof data == 'undefined' || data == null)
                    data = [];
                this.model.nodes(data);
            }, this));
            store.getUserExamList(this._getUri()).done($.proxy(function (returnUserExamList) {
                this.model.items(returnUserExamList && returnUserExamList.items && returnUserExamList.items.length > 0 ? returnUserExamList.items : []);
                this.model.count(returnUserExamList && returnUserExamList.items ? returnUserExamList.count : 0);
                this._pagination(this.model.count(), this.model.filter.page(), this.model.filter.size());
            }, this));
        },
        searchAction: function () {
            var errors = ko.validation.group(this.model.filter);
            if (errors().length > 0) {
                errors.showAllMessages();
                return;
            }

            viewModel.model.filter.page(0);
            viewModel._updateItems();
        },
        dateFormat: function (date) {
            var value = new Date(date.replace(/(\d{4})-(\d{2})-(\d{2})T(.*)?\.(.*)/, "$1/$2/$3 $4"));
            var format = "yyyy/MM/dd hh:mm:ss";
            var o = {
                "M+": value.getMonth() + 1, //月份
                "d+": value.getDate(), //日
                "h+": value.getHours(), //小时
                "m+": value.getMinutes(), //分
                "s+": value.getSeconds(), //秒
                "q+": Math.floor((value.getMonth() + 3) / 3), //季度
                "S": value.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return format;
        },
        answerExport: function () {
            var _self = this,
                filter = _self.model.filter;
            if (!(filter.selectedNodeId() ||
                filter.name() ||
                filter.passStatus() != -1 ||
                filter.markApplied() != -1 ||
                filter.beginTime() ||
                filter.endTime())) {
                $.fn.dialog2.helpers.confirm("未进行答卷过滤，导出耗时较长，确定要全部导出？", {
                    confirm: function () {
                        _self.postAnswerExport();
                    },
                    decline: function () {
                    }
                });
            } else {
                _self.postAnswerExport();
            }
        },
        postAnswerExport: function () {
            var _self = this, downLoadUrl = '/' + projectCode + '/exam/offline_exam/download';
            store.answerExport(_self._getUri()).done(function () {
                $.fn.dialog2.helpers.alert('下载任务已提交，请前往<a href="' + downLoadUrl + '">下载中心</a>查看文档处理进度');
            })
        },
        scoreListTemplate: function () {
            var w = window.open();
            w.location.href = '/' + projectCode + '/v1/m/exams/' + examId + '/score_templates/export_dm';
        },
        _bindUpload: function () {
            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + window.location.host + '/' + projectCode + '/v1/m/exams/' + examId + '/scores/import_dm?exam_id=' + examId + '&room_id=' + this.model.selectedRoomId(),
                auto: true,
                duplicate: true,
                fileVal: 'Filedata',
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
            if (response) {
                $.fn.dialog2.helpers.alert(response.message || "导入成功！");
                this._updateItems();
            } else {
                if (response.code != 200) {
                    $.fn.dialog2.helpers.alert(response.message);
                }
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);