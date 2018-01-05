/**
 * Created by Administrator on 2016/4/26.
 */
(function ($, window) {
    /*表单合法性验证*/
    $('#scoreForm').validate({
        rules: {
            score: {
                required: true,
                number: true,
                min: 0,
            }
        },
        messages: {
            score: {
                required: '必填项',
                number: '输入值必须是数字',
                min: '输入值不能小于0'
            }
        }
    });


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
        updateUserExamScore: function (data, userId) {
            var url = '/' + projectCode + '/v1/m/exams/'+ examId +'/users/'+ userId +'/scores';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            scoreModelUrl: staticurl + "auxo/admin/exam/downloadTemplate/c7aa3eced916444b93a1f8395c100497.xls",
            filter: {
                name: '',//姓名
                nodeName: '',//部门
                passStatus: "",//是否合格
                scoreFrom: null,
                scoreTo: null,
                page: 0,
                size: 20
            },
            count: 0,
            items: []
        },

        editorScore: function (item) {
            $('#score').val('');
            $('.error').html('');
            userId = item.userId;
            $('#editorScoreModal').modal('show');
            $('#saveScore').attr('disabled', true);
            $('#score').keyup(function () {
                if ($('#scoreForm').valid()) {
                    $('#saveScore').attr('disabled', false);
                }else {
                    $('#saveScore').attr('disabled', true);
                }
            });
        },

        saveScore: function () {
            var dataScore = $('#score').val();
            $('#editorScoreModal').modal('hide');
            store.updateUserExamScore({'best_scores':dataScore}, userId).done(
                function () {
                    viewModel._updateItems();
                }
            );

        },

        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._updateItems();
            $('#nameSearch,#orgSearch,#startScore,#endScore').bind("keyup blur", function (e) {
                if (e.keyCode == 13) {
                    viewModel.searchAction();
                }
            });
            this._bindUpload();
            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });
        },


        _bindUpload: function () {
            var that = this, $ele = $("#uploadPlaceHolder", this.element);
            //实例化一个SWFUpload，传入参数配置对象
            $ele.swfupload($.extend(true, {}, SWFUPDefaultSetting, {
                //下面这两个地址中职后端应该有
                upload_url: 'http://' + window.location.host + '/' + projectCode + '/v1/m/exams/' + examId + '/scores/import',
                flash_url: staticurl + "/auxo/addins/swfupload/v2.5.0/flash/swfupload.swf",
                custom_settings: {
                    _thisPointer: that
                },
                file_queue_limit: 0,
                file_upload_limit: 0,
                file_types: "*.XLS;*.XLSX;*.XLSM;",
                file_types_description: "Excel文件",
                file_size_limit: "10240",
                button_text: String.format('<span>请选择导入文件</span>'),
                button_text_style: '.button { color: #0302DF;}',
                button_width: 200,
                button_height: 25,
                debug: false
            })).bind("uploadSuccess", function (evt, file, serviceData) {
                var instance = $(this).swfupload("instance");
                if(!serviceData) {
                    $.fn.dialog2.helpers.alert("导入成功！");
                    instance.settings.custom_settings._thisPointer._updateItems();
                }
                else {
                    var serviceData = JSON.parse(serviceData);
                    if(serviceData.code != 200) {
                        $.fn.dialog2.helpers.alert(serviceData.message);
                    }
                }
            }).bind("fileQueueError", function (evt, file, errorCode, message) {
                $.fn.dialog2.helpers.alert("上传出错，错误信息：" + message);
            }).bind("uploadError", function (evt, file, errorCode, message) {
                $.fn.dialog2.helpers.alert("上传出错，错误信息：" + message);
            });
        },
        _successCallback: function(serviceData) {
            if(!serviceData) {
                $("#uploadmodal").modal('hide');
                $.fn.dialog2.helpers.alert("导入成功！");
                this._updateItems();
            }
            else {
                var serviceData = JSON.parse(serviceData);
                if(serviceData.code != 200) {
                    $.fn.dialog2.helpers.alert(serviceData.message);
                }
            }
        },
        _getUri: function(){
            var _filter = ko.mapping.toJS(this.model.filter);
            _filter.name = $.trim(_filter.name);
            _filter.nodeName = $.trim(_filter.nodeName);
            var uri = '?name=' + encodeURIComponent(_filter.name) + '&node_name=' + encodeURIComponent(_filter.nodeName)+'&page='+_filter.page+'&size='+_filter.size;
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
            var w = window.open();
            w.location.href = '/' + projectCode + '/v1/m/exams/' + examId + '/scores/export' + this._getUri();
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
            store.getUserExamList(this._getUri()).done($.proxy(function (returnUserExamList) {
                this.model.items(returnUserExamList && returnUserExamList.items && returnUserExamList.items.length > 0 ? returnUserExamList.items : []);
                this.model.count(returnUserExamList && returnUserExamList.items ? returnUserExamList.count : 0);
                this._pagination(this.model.count(), this.model.filter.page(), this.model.filter.size());
            }, this));
        },
        searchAction: function () {
            viewModel.model.filter.page(0);
            viewModel._updateItems();
        },
        dateFormat: function (date) {
            var value = new Date(date.replace(/(\d{4})-(\d{2})-(\d{2})T(.*)?\.(.*)/, "$1/$2/$3 $4"));
            var format = "yyyy/MM/dd hh:mm:ss";
            var o = {
                "M+": value.getMonth() + 1,                 //月份
                "d+": value.getDate(),                    //日
                "h+": value.getHours(),                   //小时
                "m+": value.getMinutes(),                 //分
                "s+": value.getSeconds(),                 //秒
                "q+": Math.floor((value.getMonth() + 3) / 3), //季度
                "S": value.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return format;
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);