import dialog from "./dialog.html"

export default {
    showDialog(params) {
        var options = {
            autoClose: false,
            showCancel: true,
            showConfirm: true,
            title: "操作成功",
            content: null,
            type: "notice"
        };
        var $dialog = $(dialog);
        $("body").append($dialog);
        function DialogModel() {
            var self = this;
            this.closeDialog = function () {
                $(".model-dialog").remove();
            };
            this.confirm = function () {
                if (typeof params.confirm == "function") {
                    params.confirm();
                }
                self.closeDialog();
            };
            this.model = $.extend(true, {}, options, params);
            if (this.model.autoClose) {
                setTimeout(function () {
                    self.closeDialog();
                }, 1000)
            }
        }

        ko.applyBindings(new DialogModel(), $dialog[0]);
    }
}