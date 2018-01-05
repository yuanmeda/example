define(function (require, exports) {
    var store = {
        reportProgress: function (uuid) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/urls/' + uuid + '/progress',
                type: "POST",
                cache: false,
                success: viewModel.success
            });
        },
        getUrl: function (uuid) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/urls/' + uuid,
                cache: false
            });
        }
    };


    var viewModel = {
        uuid: '',
        open: function (uuid, cb) {
            this.uuid = uuid;
            store.getUrl(uuid).done(function (data) {
                cb(data.url);
            });
        },
        reportProgress: function () {
            store.reportProgress(this.uuid);
        }
    };

    exports.viewModel = viewModel;
});