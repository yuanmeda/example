KindEditor.plugin('imageswf', function (K) {
    var self = this, name = 'imageswf',
        staticUrl = K.undef(self.staticUrl),
        imageUploadServer = K.undef(self.imageUploadServer),
        imageUploadSession = K.undef(self.imageUploadSession);
    imageUploadPath = K.undef(self.imageUploadPath);
    var html = '<div style="padding:20px"><p>点击浏览，在您电脑中选择要上传的图片，仅支持JPG、GIF、PNG图片，单张图片小于2M。每张图片上传完毕后将会自动添加到正文中。</p>' +
        '<div style="position: relative;display: inline-block;">' +
        '<button class="btn btn-info">选择文件</button>' +
        '<div id="imageswf_uploader" style="position: absolute;left: 0;top:0;width: 100%">' +
        '<div style="width: 100%; height: 100%;">&nbsp;</div>' +
        '</div>' +
        '</div></div>';
    self.clickToolbar(name, function () {
        var dialog = self.createDialog({
            name: name,
            width: 400,
            height: 180,
            title: self.lang(name),
            body: html
        });
        var div = dialog.div;
        var uploader = new WebUploader.Uploader({
            swf: 'http://' + staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
            server: 'http://' + imageUploadServer + '/v0.1/upload?session=' + imageUploadSession,
            auto: true,
            duplicate: true,
            pick: {
                id: '#imageswf_uploader',
                multiple: false
            },
            formData: {
                path: imageUploadPath
            },
            fileSingleSizeLimit: 2 * 1024 * 1024,
            accept: [{
                title: "Images",
                extensions: "png,jpg,gif",
                mimeTypes: 'image/png,image/jpeg,image/pjpeg,image/gif'
            }]
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
            self.hideDialog();
            if (error == "Q_TYPE_DENIED") {
                $.fn.dialog2.helpers.alert("选择图片类型错误（仅支持JPG、GIF、PNG格式）");
            } else if (error == "F_EXCEED_SIZE") {
                $.fn.dialog2.helpers.alert("图片大小超过上限（2M）");
            }
        }).on('uploadError', function (file, reason) {
            self.hideDialog();
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
        }).on('uploadSuccess', function (file, response) {
            self.hideDialog();
            // var imgHtml = K('<img src="' + 'http://' + imageUploadServer + '/v0.1/download?path=' + response.path + '"/>',document);
            // K(document.body).append(imgHtml);
            var imgHtml = '<img src="' + 'http://' + imageUploadServer + '/v0.1/download?path=' + response.path + '"/>';
            self.insertHtml(imgHtml);
        });
    });
});
