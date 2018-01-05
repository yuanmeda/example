/**
 * @file 课程编辑  jQuery、knockoutjs、bootstrap部分样式等
 * @author gqz
 */
(function (w, $) {
    function Model(params) {

        this.model = params.model;
        this.model.selectedExamId = ko.observable();
        //update score list request url
        this.getScoreListUrl = params.getScoreListUrl ? params.getScoreListUrl : null;
        //upload score list request url
        this.importScoreUrl = params.importScoreUrl ? params.importScoreUrl : null;
        this.showExamSelect = params.showExamSelect ? params.showExamSelect : false;
        this.store = {
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
            getScoreList: function (uri, pExamId, getScoreListUrl) {

                var url = getScoreListUrl ? getScoreListUrl : (window.examWebpage || '') + '/' + projectCode + '/v1/m/exams/' + pExamId + '/users/list' + uri;
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: "json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: true,
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            }
        };
        this.init();
    }

    /**
     * Model 方法
     * @return {null} null
     */
    Model.prototype = {
        init: function () {
            var _self = this;

            if (this.model.examList() && this.model.examList().length > 1) {
                this.model.selectedExamId(this.model.examList()[0].id);
            }

            this.model.selectedExamId.subscribe(function (value) {
                this.searchAction();
            }, this)

            this._updateItems();
            $('#nameSearch,#orgSearch,#startScore,#endScore').bind("keyup blur", function (e) {
                if (e.keyCode == 13) {
                    this.searchAction();
                }
            }.bind(this));
            // this._bindUpload();
            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });
            $('#uploadmodal').on('shown', function () {
                this._bindUpload(this.model.selectedExamId());
            }.bind(this));
        },
        _bindUpload: function (examId) {

            this.uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: (window.examWebpage || '') + '/' + projectCode + '/v1/m/exams/' + examId + '/scores/import',
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
                this._updateItems();
            } else {
                response ? $.fn.dialog2.helpers.alert(response.message) : $.fn.dialog2.helpers.alert("上传出错");
            }
        },
        _getUri: function () {
            var _filter = ko.mapping.toJS(this.model.filter);
            _filter.name = $.trim(_filter.name);
            _filter.nodeName = $.trim(_filter.nodeName);
            var uri = '?name=' + encodeURIComponent(_filter.name) + '&node_name=' + encodeURIComponent(_filter.nodeName) + '&page=' + _filter.page + '&size=' + _filter.size;
            if (_filter.passStatus == "0" || _filter.passStatus == "1") {
                _filter.passStatus = parseInt(_filter.passStatus);
                uri = uri + '&pass_status=' + _filter.passStatus;
            }
            if (_filter.scoreFrom) {
                _filter.scoreFrom = parseInt(_filter.scoreFrom);
                uri = uri + '&score_from=' + _filter.scoreFrom;
            }
            if (_filter.scoreTo) {
                _filter.scoreTo = parseInt(_filter.scoreTo);
                uri = uri + '&score_to=' + _filter.scoreTo;
            }
            return uri;
        },
        exportListAction: function () {
            if (this.model.selectedExamId()) {
                var w = window.open();
                w.location.href = (window.examWebpage || '') + '/' + projectCode + '/v1/m/exams/' + this.model.selectedExamId() + '/scores/export' + this._getUri();
            }
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
            if (!this.model.selectedExamId())
                return;

            this.store.getScoreList(this._getUri(), this.model.selectedExamId(), this.getScoreListUrl).done($.proxy(function (returnUserExamList) {
                this.model.items(returnUserExamList && returnUserExamList.items && returnUserExamList.items.length > 0 ? returnUserExamList.items : []);
                this.model.count(returnUserExamList && returnUserExamList.items ? returnUserExamList.count : 0);
                this._pagination(this.model.count(), this.model.filter.page(), this.model.filter.size());
            }, this));
        },
        searchAction: function () {
            this.model.filter.page(0);
            this._updateItems();
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
        }
    };
    ko.components.register('x-examscorelist', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(window, jQuery);