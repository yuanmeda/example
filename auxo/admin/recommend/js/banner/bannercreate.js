;(function ($) {
    var store = {
        //加载banner信息
        queryBannerInfo: function (bannerId) {
            var url = '/' + projectCode + '/recommends/banners/'+bannerId;
            return commonJS._ajaxHandler(url);
        },
        //保存banner信息
        saveBannerInfo: function (data) {
            var url = '/' + projectCode + '/v1/recommends/banners';
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'POST');
        },
        //修改banner信息
        editBannerInfo: function (data) {
            var url = '/' + projectCode + '/v1/recommends/banners/' + bannerId;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        }
    };
    var viewModel = {
        model: {
            bannerInfo: {
                custom_type: 'auxo-open-course',
                web_store_object_id: '',
                web_store_object_url: '',
                app_store_object_id: '',
                app_store_object_url: '',
                status: '',
                title: '',
                web_url: '',
                app_url: '',
                custom_id: '',
                banner_id: bannerId || ''
            },
            channelList: {
                channel: [
                    {value: 'auxo-open-course', key: '公开课'},
                    {value: 'auxo-exam-center', key: '测评中心'},
                    {value: 'auxo-train', key: '培训认证'},
                    {value: 'url-address', key: 'url地址'}]
            }
        },
        //初始化
        init: function () {
            var _self = this;

            this.model = ko.mapping.fromJS(this.model);

            this.model.bannerInfo.custom_type.subscribe(function (nv) {
                if (nv) {
                    this.model.bannerInfo.custom_id('');
                    this.model.bannerInfo.title('');
                }
            }, this);

            this._queryBannerInfo(bannerId || null).
                done(function () {
                    _self._uploadParamsInit();
                });

            this._validator();

            ko.applyBindings(this, document.getElementById('bannerEdit'));
        },
        //获取banner基本信息
        _queryBannerInfo: function (bannerId) {
            var _self = this,
                _defer = $.Deferred();
            if (bannerId) {
                store.queryBannerInfo(bannerId)
                    .done(function (data) {
                        ko.mapping.fromJS(data, {}, _self.model.bannerInfo);
                        _defer.resolve();
                    });
            } else {
                _defer.resolve();
            }
            return _defer.promise();
        },
        //上传参数初始化
        _uploadParamsInit: function () {
            var bannerInfo = this.model.bannerInfo;
            var webDefaultUrl = '';
            var appDefaultUrl = '';
            if (bannerId) {
                webDefaultUrl = 'http://p11.e.99.com/s/p/1/1de5f758106b4dfeaa8175e885d79b75.jpg';
                appDefaultUrl = 'http://p11.e.99.com/s/p/1/8defa230276846ffb06706cebc0768ee.jpg';
            }
            var params = [{
                target: $('#web_logo'),
                defaultUrl: bannerInfo.web_store_object_url() || webDefaultUrl,
                cb: function (data) {
                    bannerInfo.web_store_object_id(data[0].id);
                    bannerInfo.web_store_object_url(data[0].relative_url);
                }
            }, {
                target: $('#app_logo'),
                defaultUrl: bannerInfo.app_store_object_url() || appDefaultUrl,
                cb: function (data) {
                    bannerInfo.app_store_object_id(data[0].id);
                    bannerInfo.app_store_object_url(data[0].relative_url);
                }
            }];
            require.config({
                baseUrl: staticUrl
            });
            this._loadUploadPlugin(params);
        },
        //打开openDialog(加载catalogs)
        _openDialog: function () {

            var type = this.model.bannerInfo.custom_type();
            var self = this;
            window.selectedCourse = [{id: this.model.bannerInfo.custom_id(), title: this.model.bannerInfo.title()}];
            $.recommend({
                type: type, success: function (data) {
                    if (data) {
                        self.model.bannerInfo.title(data.title);
                        self.model.bannerInfo.custom_id(data.id);
                        $("#bannerForm").valid();
                    }
                }
            });
        },
        //保存或编辑banner界面
        _recommend: function () {
            var _self = viewModel,
                _bannerInfo = _self.model.bannerInfo;
            if (!$("#bannerForm").valid()) return;
            if (_bannerInfo.custom_type() == "url-address") {
                if (_bannerInfo.web_url() && !_bannerInfo.web_url().match(/^(https?|cmp:\/\/)/)) {
                    _bannerInfo.web_url('http://' + _bannerInfo.web_url());
                }
                if (_bannerInfo.app_url() && !_bannerInfo.app_url().match(/^(https?|cmp:\/\/)/)) {
                    _bannerInfo.app_url('http://' + _bannerInfo.app_url());
                }
            }
            var _postData = {
                custom_type: _bannerInfo.custom_type(),
                custom_id: _bannerInfo.custom_id(),
                title: _bannerInfo.title(),
                status: _bannerInfo.status(),
                web_store_object_id: _bannerInfo.web_store_object_id(),
                app_store_object_id: _bannerInfo.app_store_object_id(),
                app_url: _bannerInfo.app_url(),
                web_url: _bannerInfo.web_url()
            };
            if (bannerId) {
                store.editBannerInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('编辑成功');
                        window.setTimeout(function () {
                            location.href = "/" + projectCode + "/recommend/banner";
                        }, 500);
                    });
            } else {
                store.saveBannerInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('创建成功');
                        window.setTimeout(function () {
                            location.href = "/" + projectCode + "/recommend/banner";
                        }, 500);
                    });

            }
        },
        //加载上传插件
        _loadUploadPlugin: function (params) {
            //加载ICO图片上传模块
            require(["require", "exports", "admin/recommend/js/upload/upload-2.0"], function (require, exports, upload) {
                $.each(params, function (index, item) {
                    item.target.upload({
                        uploadOptions: {
                            uploadUrl: storeUrl,
                            fileTypes: "*.jpg;*.png;*.gif",
                            onQueued: function (e) {
                                this.startUpload();
                            },
                            fileSizeLimit: 1024 * 2,
                            onQueueError: function (fileEvent) {
                                var err = '';
                                switch (fileEvent.error) {
                                    case -110:
                                        err = "文件超出指定大小，请重新选择文件上传。";
                                        break;
                                    case -130:
                                        err = "请上传指定格式的文件（JPG、PNG、GIF）。";
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
                                $.fn.dialog2.helpers.alert("上传图片失败！<br/>错误信息：" + mgs);
                            } else {
                                $.fn.dialog2.helpers.alert("上传图片失败！" + data);
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
        //表单验证
        _validator: function () {
            $('#bannerForm').validate({
                rules: {
                    courseTitle: {
                        required: true
                    },
                    bannerTitle:{
                        required: true
                    }
                },
                messages: {
                    courseTitle: {
                        required: "请选择推荐内容"
                    },
                    bannerTitle:{
                        required: '请输入标题'
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                onsubmit: true,
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
