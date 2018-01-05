/**
 * Created by Administrator on 2017.8.31.
 */
;(function () {
    var Upload = function (id, staticUrl, storeUrl, fn) {
        var upload = {
            /**
             * 初始化图片上传插件
             */
            _bindUpload: function (id) {
                var self = this;
                var swfu = new SWFUpload({
                    // Backend Settings
                    upload_url: storeUrl,

                    // File Upload Settings
                    file_size_limit: "4 MB",
                    file_types: "*.JPG;*.PNG;*.GIF;",
                    file_types_description: "image",
                    file_upload_limit: "0",

                    file_queue_error_handler: $.proxy(upload._queueError, upload),
                    file_dialog_complete_handler: fileDialogComplete,
                    upload_progress_handler: uploadProgress,
                    upload_error_handler: uploadError,
                    upload_success_handler: $.proxy(upload._uploadSuccess, upload),
                    upload_complete_handler: uploadComplete,

                    // Button Settings
                    button_placeholder_id: id,
                    button_text: "",
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    button_cursor: SWFUpload.CURSOR.HAND,
                    button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
                    // Flash Settings
                    flash_url: staticUrl + "auxo/addins/swfupload/v2.5.0/flash/swfupload.swf",

                    // Debug Settings
                    debug: false
                });
            },
            _uploadSuccess: function (file, serverData) {
                var that = this,
                    data = JSON.parse(serverData);
                if (data && data.length) {
                    var d = data.shift();
                    if ($.isFunction(fn)) {
                        fn(d);
                    }
                } else {
                    showMsg(data.Message);
                }
            },

            _queueError: function (file, code, message) {
                var msg = "";
                switch (code) {
                    case -110:
                        msg = "上传的文件大小超过4M限制";
                        break;
                    case -120:
                        msg = "所选择的文件大小不能为0";
                        break;
                    case -130:
                        msg = "所选择文件扩展名与允许不符";
                        break;
                    default:
                        msg = "队列错误";
                        break;
                }
                showMsg(msg);
            }
        };
        var showMsg = function (message) {
            if ($.alert) {
                $.alert(message);
            } else {
                alert(message);
            }
        };
        upload._bindUpload(id);
    }

    window['Upload'] = Upload;
}());