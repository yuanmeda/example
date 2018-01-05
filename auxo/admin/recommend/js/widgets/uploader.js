var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../upload/addins/common/event"], function (require, exports, evt) {
    (function (UploadFileStatus) {
        UploadFileStatus[UploadFileStatus["Queue"] = -1] = "Queue";
        UploadFileStatus[UploadFileStatus["InProgress"] = -2] = "InProgress";
        UploadFileStatus[UploadFileStatus["Error"] = -3] = "Error";
        UploadFileStatus[UploadFileStatus["Complete"] = -4] = "Complete";
        UploadFileStatus[UploadFileStatus["Cancelled"] = -5] = "Cancelled";
    })(exports.UploadFileStatus || (exports.UploadFileStatus = {}));
    var UploadFileStatus = exports.UploadFileStatus;
    var UploadFile = (function () {
        function UploadFile() {
        }
        return UploadFile;
    })();
    exports.UploadFile = UploadFile;
    var UploadFileEvent = (function (_super) {
        __extends(UploadFileEvent, _super);
        function UploadFileEvent(type, file) {
            _super.call(this, type);
            this.file = file;
        }
        return UploadFileEvent;
    })(evt.Event);
    exports.UploadFileEvent = UploadFileEvent;
    var UploadSuccessEvent = (function (_super) {
        __extends(UploadSuccessEvent, _super);
        function UploadSuccessEvent(type, file, data, response) {
            _super.call(this, type, file);
            this.file = file;
            this.data = data;
            this.response = response;
        }
        return UploadSuccessEvent;
    })(UploadFileEvent);
    exports.UploadSuccessEvent = UploadSuccessEvent;
    var UploadFileErrorEvent = (function (_super) {
        __extends(UploadFileErrorEvent, _super);
        function UploadFileErrorEvent(type, file, error, message) {
            _super.call(this, type, file);
            this.error = error;
            this.message = message;
        }
        return UploadFileErrorEvent;
    })(UploadFileEvent);
    exports.UploadFileErrorEvent = UploadFileErrorEvent;
    var UploadFileProgressEvent = (function (_super) {
        __extends(UploadFileProgressEvent, _super);
        function UploadFileProgressEvent(file, sended, total) {
            _super.call(this, UploaderEvent.UploadProgress, file);
            this.sended = sended;
            this.total = total;
        }
        return UploadFileProgressEvent;
    })(UploadFileEvent);
    exports.UploadFileProgressEvent = UploadFileProgressEvent;
    var DebugEvent = (function (_super) {
        __extends(DebugEvent, _super);
        function DebugEvent(message) {
            _super.call(this, UploaderEvent.Debug);
            this.message = message;
        }
        return DebugEvent;
    })(evt.Event);
    exports.DebugEvent = DebugEvent;
    var UploaderEvent = (function () {
        function UploaderEvent() {
        }
        UploaderEvent.Loaded = "loaded";
        UploaderEvent.DialogStart = "dialogStart";
        UploaderEvent.Queued = "queued";
        UploaderEvent.QueueError = "queueError";
        UploaderEvent.DialogComplete = "dialogComplete";
        UploaderEvent.UploadStart = "uploadStart";
        UploaderEvent.UploadProgress = "uploadProgress";
        UploaderEvent.UploadError = "uploadError";
        UploaderEvent.UploadSuccess = "uploadSuccess";
        UploaderEvent.UploadComplete = "uploadComplete";
        UploaderEvent.QueueComplete = "queueComplete";
        UploaderEvent.Debug = "debug";
        return UploaderEvent;
    })();
    exports.UploaderEvent = UploaderEvent;
});
//# sourceMappingURL=uploader.js.map