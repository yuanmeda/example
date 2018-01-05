;(function ($) {
    var store = {
        //保存banner信息
        saveNewsInfo: function (data) {
            data.role_type = roleType;
            var url = '/fjedu/news_recommand';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'POST',
                data: JSON.stringify(data)
            });
        },
        //修改banner信息
        editNewsInfo: function (data) {
            var url = '/fjedu/news_recommand/update/' + newsId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                type: 'PUT',
                data: JSON.stringify(data)
            });
        },
        getUploadSession: function () {
            var url = '/fjedu/upload_sessions?type=news';
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        },
        //获取单个banner
        getSingleNews: function () {
            var url = '/fjedu/news_recommand/' + newsId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            newsInfo: {
                front_cover_object_id: '',
                img_url: '',
                news_name: '',
                news_url: '',
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
            this._queryNewsInfo();
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
                viewModel.model.newsInfo.front_cover_object_id(response.dentry_id);
                viewModel.model.newsInfo.img_url("http://" + csHost + "/v0.1/download?dentryId=" + response.dentry_id);
            });
        },
        //获取banner基本信息
        _queryNewsInfo: function () {
            var _self = this;
            if (newsId) {
                store.getSingleNews().done(function (resData) {
                    if (resData) {
                        var newsInfo = _self.model.newsInfo;
                        newsInfo.news_name(resData.news_name);
                        newsInfo.news_url(resData.news_url);
                        newsInfo.img_url(resData.img_url);
                        newsInfo.front_cover_object_id(resData.front_cover_object_id);
                        newsInfo.content(resData.content);
                        newsInfo.role_type(resData.role_type);
                        //newsInfo.sort_number(resData.sort_number);
                    }
                });
            }
        },
        //保存或编辑banner界面
        _recommend: function () {
            var _self = viewModel,
                _newsInfo = _self.model.newsInfo;
            if (!$("#newsForm").valid()) return;
            if (!_newsInfo.img_url()) {
                $.fn.dialog2.helpers.alert("请上传新闻封面");
                return;
            }
            var _postData = {
                news_name: _newsInfo.news_name(),
                front_cover_object_id: _newsInfo.front_cover_object_id(),
                img_url: _newsInfo.img_url(),
                news_url: _newsInfo.news_url(),
                content: _newsInfo.content(),
                role_type: _newsInfo.role_type()
                //sort_number: _newsInfo.sort_number()
            };
            if (newsId) {
                store.editNewsInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('编辑成功');
                        window.setTimeout(function () {
                            location.href = "/system/newslist";
                        }, 500);
                    });
            } else {
                store.saveNewsInfo(_postData)
                    .done(function () {
                        $.fn.dialog2.helpers.alert('创建成功');
                        window.setTimeout(function () {
                            location.href = "/system/newslist";
                        }, 500);
                    });

            }
        },
        //表单验证
        _validator: function () {
            $('#newsForm').validate({
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
                        required: '请输入News Url',
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
