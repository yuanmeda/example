var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./uploader", "../../addins/common/event"], function (require, exports, uploader, evt) {
    var SwfUploader = (function (_super) {
        __extends(SwfUploader, _super);
        function SwfUploader(setting) {
            var _this = this;
            _super.call(this);
            this.setting = setting;
            require(["../../../addins/swfupload/swfupload", "../../../addins/swfupload/plugins/swfupload.queue"], function () { return _this.onready(); });
        }
        SwfUploader.prototype.onready = function () {
            this.inner = new SWFUpload(this.getSetting());
        };
        SwfUploader.prototype.getSetting = function () {
            var _this = this;
            var s = {};
            s.upload_url = this.setting.uploadUrl;
            s.post_params = this.setting.postParams;
            s.use_query_string = this.setting.useQueryString;
            s.file_size_limit = this.setting.fileSizeLimit;
            s.file_queue_limit = this.setting.fileQueueLimit;
            s.file_upload_limit = this.setting.fileUploadLimit;
            s.file_types = this.setting.fileTypes;
            s.file_types_description = this.setting.fileTypesDescription;
            s.debug = this.setting.debug;
            s.prevent_swf_caching = this.setting.preventSwfCaching;
            s.preserve_relative_urls = this.setting.preserveRelativeUrls;
            s.button_placeholder_id = this.setting.buttonPlaceholderId ? this.setting.buttonPlaceholderId : "test";
            s.button_action = this.setting.buttonAction ? this.setting.buttonAction : -110;
            s.button_text = this.setting.buttonText ? this.setting.buttonText : "";
            s.button_width = this.setting.buttonWidth ? this.setting.buttonWidth : 100;
            s.button_height = this.setting.buttonHeight ? this.setting.buttonHeight : 100;
            s.button_window_mode = this.setting.buttonWindowMode ? this.setting.buttonWindowMode : 'transparent';
            s.button_cursor = -2;
            s.flash_url = require.toUrl("../../../addins/swfupload/flash/swfupload.swf");
            s.swfupload_loaded_handler = function () { return _this.triggerEvent(uploader.UploaderEvent.Loaded); };
            s.file_dialog_start_handler = function () { return _this.triggerEvent(uploader.UploaderEvent.DialogStart); };
            s.file_queued_handler = function (file) { return _this.dispatchEvent(new uploader.UploadFileEvent(uploader.UploaderEvent.Queued, _this.toFile(file))); };
            s.file_queue_error_handler = function (file, error, message) { return _this.dispatchEvent(new uploader.UploadFileErrorEvent(uploader.UploaderEvent.QueueError, _this.toFile(file), error, message)); };
            s.file_dialog_complete_handler = function () { return _this.triggerEvent("dialogComplete"); };
            s.upload_start_handler = function (file) { return _this.dispatchEvent(new uploader.UploadFileEvent(uploader.UploaderEvent.UploadStart, _this.toFile(file))); };
            s.upload_progress_handler = function (file, sended, total) { return _this.dispatchEvent(new uploader.UploadFileProgressEvent(_this.toFile(file), sended, total)); };
            s.upload_error_handler = function (file, error, message) { return _this.dispatchEvent(new uploader.UploadFileErrorEvent(uploader.UploaderEvent.UploadError, _this.toFile(file), error, message)); };
            s.upload_success_handler = function (file, data, response) { return _this.dispatchEvent(new uploader.UploadSuccessEvent(uploader.UploaderEvent.UploadSuccess, _this.toFile(file), data, response)); };
            s.upload_complete_handler = function (file) { return _this.dispatchEvent(new uploader.UploadFileEvent(uploader.UploaderEvent.UploadComplete, _this.toFile(file))); };
            s.queue_complete_handler = function (uploaded) { return _this.dispatchEvent(new evt.Event(uploader.UploaderEvent.QueueComplete)); };
            s.debug_handler = function (message) { return _this.dispatchEvent(new uploader.DebugEvent(message)); };
            if (this.setting.onLoaded)
                this.addEventListener(uploader.UploaderEvent.Loaded, this.setting.onLoaded);
            if (this.setting.onDialogStart)
                this.addEventListener(uploader.UploaderEvent.DialogStart, this.setting.onDialogStart);
            if (this.setting.onQueued)
                this.addEventListener(uploader.UploaderEvent.Queued, this.setting.onQueued);
            if (this.setting.onQueueError)
                this.addEventListener(uploader.UploaderEvent.QueueError, this.setting.onQueueError);
            if (this.setting.onDialogComplete)
                this.addEventListener(uploader.UploaderEvent.DialogComplete, this.setting.onDialogComplete);
            if (this.setting.onUploadStart)
                this.addEventListener(uploader.UploaderEvent.UploadStart, this.setting.onUploadStart);
            if (this.setting.onUploadProgress)
                this.addEventListener(uploader.UploaderEvent.UploadProgress, this.setting.onUploadProgress);
            if (this.setting.onUploadError)
                this.addEventListener(uploader.UploaderEvent.UploadError, this.setting.onUploadError);
            if (this.setting.onUploadSuccess)
                this.addEventListener(uploader.UploaderEvent.UploadSuccess, this.setting.onUploadSuccess);
            if (this.setting.onUploadComplete)
                this.addEventListener(uploader.UploaderEvent.UploadComplete, this.setting.onUploadComplete);
            if (this.setting.onQueueComplete)
                this.addEventListener(uploader.UploaderEvent.QueueComplete, this.setting.onQueueComplete);
            if (this.setting.onDebug)
                this.addEventListener(uploader.UploaderEvent.Debug, this.setting.onDebug);
            return s;
        };
        SwfUploader.prototype.triggerEvent = function (name) {
            this.dispatchEvent(new evt.Event(name));
        };
        SwfUploader.prototype.startUpload = function (fileId) {
            this.inner.startUpload(fileId);
        };
        SwfUploader.prototype.cancelUpload = function (fileId, triggerErrorEvent) {
            this.inner.cancelUpload(fileId, triggerErrorEvent);
        };
        SwfUploader.prototype.stopUpload = function () {
            this.inner.stopUpload();
        };
        SwfUploader.prototype.cancelQueue = function () {
            this.inner.cancelQueue();
        };
        SwfUploader.prototype.getFile = function (fileId) {
            var swfFile = this.inner.getFile(fileId);
            return this.toFile(swfFile);
        };
        SwfUploader.prototype.setUploadUrl = function (url) {
            this.setUploadUrl(url);
        };
        SwfUploader.prototype.setPostParams = function (params) {
            this.inner.setPostParams(params);
        };
        SwfUploader.prototype.toFile = function (swfFile) {
            if (swfFile == null)
                return null;
            var file = new uploader.UploadFile();
            file.name = swfFile.name;
            file.fileStatus = swfFile.filestatus;
            file.size = swfFile.size;
            file.type = swfFile.type;
            return file;
        };
        return SwfUploader;
    })(evt.EventDispatcher);
    exports.SwfUploader = SwfUploader;
});
//# sourceMappingURL=swfuploader.js.map