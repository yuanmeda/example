;(function ($) {
    var store = {
        //保存banner信息
        saveBannerInfo: function (data) {
            data.role_type = roleType;
            var url = '/fjedu/banner';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'POST',
                data: JSON.stringify(data)
            });
        },
        //修改banner信息
        editBannerInfo: function (data) {
            var url = '/fjedu/banner/update/' + bannerId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'PUT',
                data: JSON.stringify(data)
            });
        },
        getUploadSession: function () {
            var url = '/fjedu/upload_sessions?type=banner';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取单个banner
        getSingleBanner: function () {
            var url = '/fjedu/banner/' + bannerId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            bannerInfo: {
                front_cover_object_id: '',
                img_url: '',
                banner_name: '',
                banner_url: '',
                content: '',
                role_type: 0
                //sort_number: ''
            }
        },
        //初始化
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._validator();
            //初始化webuploader
            store.getUploadSession().done(function (res) {
                _self._initUpload(res);
            });
            //编辑初始化
            this._queryBannerInfo();
        },
        getUrlParam: function (key) {
            var url = window.location.search;
            var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
            var result = url.substr(1).match(reg);
            return result ? decodeURIComponent(result[2]) : null;
        },
        _initUpload: function (data) {
            var uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + data.server_url + '/v0.1/upload?session=' + data.session,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#imageswf_uploader',
                    multiple: false
                },
                formData: {
                    path: data.path
                },
                fileSingleSizeLimit: 2 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "png,jpg,gif",
                    mimeTypes: 'image/png,image/jpeg,image/pjpeg,image/gif'
                }],
                compress: false
            }).on('beforeFileQueued', function (file) {
                if (file && file.size == 0) {
                    $.fn.dialog2.helpers.alert("图片大小为0，不能上传！");
                    return false;
                }
            }).on('uploadBeforeSend', function (obj, file, headers) {
                file.type = undefined;
                file.scope = 1;
                headers.Accept = "*/*";
            }).on('error', function (error) {
                if (error == "Q_TYPE_DENIED") {
                    $.fn.dialog2.helpers.alert("选择图片类型错误（仅支持JPG、GIF、PNG格式）");
                } else if (error == "F_EXCEED_SIZE") {
                    $.fn.dialog2.helpers.alert("图片大小超过上限（2M）");
                }
            }).on('uploadError', function (file, reason) {
                $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
            }).on('uploadSuccess', function (file, response) {
                viewModel.model.bannerInfo.front_cover_object_id(response.dentry_id);
                viewModel.model.bannerInfo.img_url("http://" + csHost + "/v0.1/download?dentryId=" + response.dentry_id);
            });
        },
        //获取banner基本信息
        _queryBannerInfo: function () {
            var _self = this;
            if (bannerId) {
                store.getSingleBanner().done(function (resData) {
                    if (resData) {
                        var bannerInfo = _self.model.bannerInfo;
                        bannerInfo.banner_name(resData.banner_name);
                        bannerInfo.banner_url(resData.banner_url);
                        bannerInfo.img_url(resData.img_url);
                        bannerInfo.front_cover_object_id(resData.front_cover_object_id);
                        bannerInfo.content(resData.content);
                        bannerInfo.role_type(resData.role_type);
                        //bannerInfo.sort_number(resData.sort_number);
                    }
                });
            }
        },
        //保存或编辑banner界面
        _recommend: function () {
            var _self = viewModel,
                _bannerInfo = _self.model.bannerInfo;
            if (!$("#bannerForm").valid()) return;
            if (!_bannerInfo.img_url()) {
                $.fn.dialog2.helpers.alert("请上传banner封面");
                return;
            }
            var _postData = {
                banner_name: _bannerInfo.banner_name(),
                front_cover_object_id: _bannerInfo.front_cover_object_id(),
                img_url: _bannerInfo.img_url(),
                banner_url: _bannerInfo.banner_url(),
                content: _bannerInfo.content(),
                role_type: _bannerInfo.role_type()
                //sort_number: _bannerInfo.sort_number()
            };
            if (bannerId) {
                store.editBannerInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('编辑成功');
                        window.setTimeout(function () {
                            location.href = "/system/bannerlist";
                        }, 500);
                    });
            } else {
                store.saveBannerInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('创建成功');
                        window.setTimeout(function () {
                            location.href = "/system/bannerlist";
                        }, 500);
                    });

            }
        },
        //表单验证
        _validator: function () {
            $('#bannerForm').validate({
                rules: {
                    webUrl: {
                        required: true,
                        url: true
                    },
                    number: {
                        range: [1, 100],
                        digits: true
                    }
                },
                messages: {
                    webUrl: {
                        required: '请输入banner Url',
                        url: '请输入正确格式的网址'
                    },
                    number: {
                        range: '请输入1-100的正整数',
                        digits: '请输入1-100的正整数'
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
