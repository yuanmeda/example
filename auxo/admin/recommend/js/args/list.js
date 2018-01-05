;
(function ($) {
    var store = {
        getList: function (search) {
            var url = '/' + projectCode + '/v1/recommends/kvs';
            return commonJS._ajaxHandler(url, search);
        },
        del: function (id) {
            var url = '/' + projectCode + '/v1/recommends/kvs/' + id;
            return commonJS._ajaxHandler(url, null, 'DELETE');
        },
        update: function (id, data) {
            var url = '/' + projectCode + '/v1/recommends/kvs/' + id;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/recommends/kvs';
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'POST');
        }
    };
    var viewModel = {
        model: {
            search: {
                page: 0,
                size: 20,
                key: '',
                group_key: ''
            },
            list: {
                items: [],
                count: 0
            },
            args: {
                id: '',
                key: '',
                value: '',
                remark: '',
                method: ko.observable('2'),
                isolation_strategy:'0'
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this._getList();
            this.validator();
            ko.applyBindings(this, document.getElementById('argsList'));
            viewModel.model.args.method.subscribe(function (val) {
                if (val == 1) {
                    $("#apk_url").show();
                } else {
                    $("#apk_url").hide();
                }
            });
        },
        _getList: function () {
            var self = this;
            var search = ko.mapping.toJS(self.model.search);
            search.key = $.trim(search.key);
            search.group_key = $.trim(search.group_key);
            store.getList(search)
                .done(function (data) {
                    self.model.list.items(data.items);
                    self.model.list.count(data.count);
                    self._page(data.count, self.model.search.page(), self.model.search.size());
                });
        },
        search: function () {
            this.model.search.page(0);
            this._getList();
        },
        del: function ($data) {
            var me = this;
            $.fn.dialog2.helpers.confirm("是否确认删除", {
                "confirm": function () {
                    store.del($data)
                        .done(function () {
                            me.model.search.page(0);
                            me._getList();
                        });
                },
                buttonLabelYes: '是',
                buttonLabelNo: '否'
            });

        },
        edit: function ($data, event) {
            var form = $('#argsForm');
            form.validate().resetForm();
            form.find('.error').removeClass('error');
            form.find('.success').removeClass('success');
            viewModel._uploadParamsInit();
            this.model.args.id($data.id);
            this.model.args.key($data.key);
            this.model.args.value($data.value);
            this.model.args.remark($data.remark);
            this.model.args.method('2');
            if ($data.isolation_strategy){
                this.model.args.isolation_strategy($data.isolation_strategy+"");
            }else{
                this.model.args.isolation_strategy("0");
            }

            $('#argsModal').modal('show');
        },
        save: function () {
            if (!$('#argsForm').valid()) return;
            var data = ko.mapping.toJS(this.model.args),
                that = this;
            if (data.id) {
                store.update(data.id, data).then(function () {
                    $('#argsModal').modal('hide');
                    that.model.search.page(0);
                    that._getList();
                });
            } else {
                store.create(data).then(function () {
                    $('#argsModal').modal('hide');
                    that.model.search.page(0);
                    that._getList();
                });
            }
        },
        reset: function () {
            this.model.search.key('');
            this.model.search.group_key('');
            this.model.search.page(0);
            this._getList();
        },
        _page: function (count, offset, limit) {
            var self = this;
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.search.page(index);
                        self._getList();
                    }
                }
            });
        },
        //上传参数初始化
        _uploadParamsInit: function () {
            var params = [
                {
                    target: $('#apk_url'),
                    defaultUrl: '',
                    cb: function (data) {
                        var temp_url = viewModel.model.args.value();
                        var searchArr = temp_url ? temp_url.split('&'):[];
                        var isVersion = false;
                        var version;
                        $.each(searchArr, function (i, v) {
                            if (v.toLowerCase().indexOf('v=') == 0) {
                                isVersion = true;
                                version = v.substring(2);
                                return false;
                            } else if (v.toLowerCase().indexOf('?v=') > 0) {
                                isVersion = true;
                                var startIndex = v.toLowerCase().indexOf('?v=') + 3;
                                version = v.substring(startIndex);
                                return false;
                            }
                        });
                        if (isVersion) {
                            if (isNaN(version)) {
                                viewModel.model.args.value(data[0].absolute_url + "?v=1");
                            } else {
                                version = Number(version) + 1;
                                viewModel.model.args.value(data[0].absolute_url + "?v=" + version);
                            }
                        } else {
                            viewModel.model.args.value(data[0].absolute_url + "?v=1");
                        }
                    }
                }
            ];
            require.config({
                baseUrl: staticUrl
            });
            this._selfLoadUploadPlugin(params);
        },
        _selfLoadUploadPlugin: function (params) {

            //加载ICO图片上传模块
            require(["require", "exports", "admin/recommend/js/upload/upload-2.0"], function (require, exports, upload) {
                $.each(params, function (index, item) {
                    item.target.upload({
                        uploadOptions: {
                            uploadUrl: storeUrl,
                            fileTypes: "*.apk;*.ipa",
                            onQueued: function (e) {
                                this.startUpload();
                            },
                            fileSizeLimit: 1024 * 100,
                            onQueueError: function (fileEvent) {
                                var err = '';
                                switch (fileEvent.error) {
                                    case -110:
                                        err = "文件超出指定大小，请重新选择文件上传。";
                                        break;
                                    case -130:
                                        err = "请上传指定格式的文件（APK、IPA）。";
                                        break;
                                    default:
                                        err = "文件不符合条件。";
                                }
                                $.fn.dialog2.helpers.alert(err);
                            }
                        },
                        clientType: 2,
                        defaultUrl: item.defaultUrl,
                        errorCallBack: function (data) {
                            var mgs = data.message || data.Message;
                            if (typeof(mgs) !== undefined && mgs !== "") {
                                $.fn.dialog2.helpers.alert("上传文件失败！<br/>错误信息：" + mgs);
                            } else {
                                $.fn.dialog2.helpers.alert("上传文件失败！" + data);
                            }
                        },
                        successCallBack: function (data) {
                            if (typeof(data) !== undefined && data !== null) {
                                if (item.cb) {
                                    item.cb(data.data);
                                }
                            }
                        }
                    });
                });
            });
        },
        validator: function () {
            $.validator.addMethod("char", function (value, element) {
                var pattern = /^[a-zA-Z\d_]+$/;
                var txt = value;
                return pattern.test(txt);
            }, "只能包含数字字母下划线");
            $('#argsForm').validate({
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                rules: {
                    key: {
                        required: true,
                        char: true,
                        maxlength: 50
                    },
                    value: {
                        required: true,
                        maxlength: 1000
                    },
                    remark: {
                        maxlength: 500
                    }
                },
                messages: {
                    key: {
                        required: '必填',
                        maxlength: $.validator.format('长度必须小于{0}字符')
                    },
                    value: {
                        required: '必填',
                        maxlength: $.validator.format('长度必须小于{0}字符')
                    },
                    remark: {
                        maxlength: $.validator.format("长度必须小于{0}字符")
                    }
                },

                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid');
                    if (label.closest('.control-group').find('p').length != label.closest('.control-group').find('p.valid').length)
                        return;
                    label.closest('.control-group').addClass('success');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
