;(function ($) {
    var store = {
        get: function () {
            return $.ajax({
                url: '/fjedu/recommand/' + window.recommendId,
                dataType: 'json',
                cache: false
            });
        },
        create: function (data) {
            data.role_type = roleType;
            return $.ajax({
                url: '/fjedu/recommand',
                // dataType: 'json',
                type: 'post',
                data: JSON.stringify(data)
            });
        },
        update: function (data) {
            return $.ajax({
                url: '/fjedu/recommand/update/' + window.recommendId,
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data)
            });
        },
        getUploadSession: function () {
            return $.ajax({
                url: '/fjedu/upload_sessions?type=recommand',
                dataType: 'json',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            recommend: {
                recommand_name: '',
                front_cover_object_id: '',
                img_url: undefined,
                recommand_url: '',
                content: '',
                direct_type: 0,
                role_type: 0
            },
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validator();
            ko.applyBindings(this, document.getElementById('container'));
            if (window.recommendId) this.get();
            this.startUpload();
        },
        startUpload: function () {
            var self = this;
            store.getUploadSession().done(function (res) {
                self.uploader = self.initUploader(res);
            })
        },
        get: function () {
            var self = this;
            store.get().done(function (res) {
                self.model.recommend.recommand_name(res.recommand_name);
                self.model.recommend.front_cover_object_id(res.front_cover_object_id);
                self.model.recommend.img_url(res.img_url);
                self.model.recommend.recommand_url(res.recommand_url);
                self.model.recommend.direct_type(res.direct_type);
                self.model.recommend.content(res.content);
                self.model.recommend.role_type(res.role_type);
                self.model.init(true);
            });
        },
        initUploader: function (data) {
            var uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + data.server_url + '/v0.1/upload?session=' + data.session,
                auto: true,
                fileVal: 'Filedata',
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
                    extensions: "png,jpg,jpeg,gif",
                    mimeTypes: 'image/png,image/jpeg,image/pjpeg,image/gif'
                }],
                compress: false
            });
            uploader.on('beforeFileQueued', function (file) {
                if (file && file.size == 0) {
                    $.fn.dialog2.helpers.alert("图片大小为0，不能上传！");
                    return false;
                }
            });
            uploader.on('uploadBeforeSend', function (obj, file, headers) {
                file.type = undefined;
                file.scope = 1;
                headers.Accept = "*/*";
            });
            uploader.on('error', function (error) {
                if (error == "Q_TYPE_DENIED") {
                    $.fn.dialog2.helpers.alert("选择图片类型错误（仅支持JPG、GIF、PNG格式）");
                } else if (error == "F_EXCEED_SIZE") {
                    $.fn.dialog2.helpers.alert("图片大小超过上限（2M）");
                }
            });
            uploader.on('uploadError', $.proxy(function (file, reason) {
                this.uploaderError = this.uploaderError || 0;
                if (++this.uploaderError <= 1) {
                    store.getUploadSession().done($.proxy(function (res) {
                        uploader.option("server", "http://" + res.server_url + "/v0.1/upload?session=" + res.session);
                        uploader.retry();
                    }, this));
                } else {
                    $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
                }
            }, this));
            uploader.on('uploadSuccess', $.proxy(function (file, response) {
                if (!response.code) {
                    this.uploaderError = 0;
                    this.model.recommend.front_cover_object_id(response.dentry_id);
                    this.model.recommend.img_url('http://' + window.csHost + '/v0.1/download?dentryId=' + response.dentry_id);
                } else {
                    response ? $.fn.dialog2.helpers.alert(response.message) : $.fn.dialog2.helpers.alert('上传错误！')
                }
            }, this));
            return uploader;
        },
        save: function () {
            var self = this, recommend = ko.mapping.toJS(this.model.recommend);
            var errors = ko.validation.group(this.model.recommend);
            if (errors().length) {
                errors.showAllMessages();
                return;
            }
            if (window.recommendId) {
                store.update(recommend).done(function () {
                    $.fn.dialog2.helpers.alert('编辑成功');
                    window.setTimeout(function () {
                        location.href = "/system/recommend";
                    }, 2000);
                });
            } else {
                store.create(recommend).done(function () {
                    $.fn.dialog2.helpers.alert('创建成功');
                    window.setTimeout(function () {
                        location.href = "/system/recommend";
                    }, 2000);
                });
            }
        },
        //表单验证
        validator: function () {
            ko.validation.init({
                "insertMessages": false,
                "errorsAsTitleOnModified": false,
                // "decorateInputElement": true
            });
            ko.validation.registerExtenders();
            this.model.recommend.content.extend({
                "maxLength": {"params": 2000, "message": "推荐信息不能超过2000个字"}
            });
            this.model.recommend.recommand_name.extend({
                "required": {"params": true, "message": "推荐标题不能为空"},
                "maxLength": {"params": 50, "message": "推荐标题不能超过50个字"}
            });
            this.model.recommend.img_url.extend({
                "required": {"params": true, "message": "推荐图片不能为空"}
            });
            this.model.recommend.recommand_url.extend({
                "required": {"params": true, "message": "推荐地址不能为空"},
                "maxLength": {"params": 1000, "message": "推荐地址不能超过1000个字符"}
            })
            // this.model.validatedInfo =  ko.validatedObservable(this.model.recommend, {
            //     observable: true,
            //     live: true,
            //     deep: true
            // });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
