(function () {
    (function () {
        var loading = null;
        // ajax开始回调
        $(document).ajaxStart(function () {
            loading = layer.load(0, {
                time: 1000 * 100
            });
        });
        // ajax结束回调
        $(document).ajaxComplete(function () {
            layer.close(loading);
        });
    }());

    ko.options.deferUpdates = true;
}());