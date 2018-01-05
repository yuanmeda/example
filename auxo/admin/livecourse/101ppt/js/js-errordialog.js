(function () {
    'use strict';
    function ErrorDialog(text, callBack) {
        if (!$('#js-livecourse-error-msg').length) {
            var dialog = templ(text);
            document.body.appendChild($(dialog)[0]);
            $(document).on('click', '.js-livecourse-close-dialog', function () {
                $('#js-livecourse-error-dialog').hide();
                if (callBack) {
                    callBack();
                }
            });
        } else {
            $('#js-livecourse-error-msg').text(text);
        }
        return {
            show: function () {
                $('#js-livecourse-error-dialog').show()
            },
            hide: function () {
                $('#js-livecourse-error-dialog').hide()
            }
        }
    }

    function templ(text) {
        return '<div class="ui-pop" data-style="style-nomask" id="js-livecourse-error-dialog">\
                   <div class="popwrap">\
                        <div class="pop-header">\
                            <h4 class="poptit">提示</h4>\
                            <a href="javascript:;" class="btn-closepop js-livecourse-close-dialog"></a>\
                        </div>\
                        <div class="pop-body" style="padding-bottom: 55px">\
                            <p class="maintxt" style="word-wrap: break-word;word-break: break-all;" id="js-livecourse-error-msg">' + text + '</p>\
                        </div>\
                        <div class="pop-footer">\
                            <a href="javascript:;" class="ui-btn ui-btn-cancel txtorg js-livecourse-close-dialog">确认</a>\
                        </div>\
                    </div>\
                </div>';
    }

    function confirmDialog(text, cancelText, cancelCallBack, confirmText, confirmCallBack) {
        if (!$('#live-course-confirm-dialog').length) {
            var html = '<div class="mod-scriptSyn modlay-teacher">\
                              <div class="ui-pop  open" data-style="style-nomask" id="live-course-confirm-dialog">\
                                <div class="popwrap">\
                                    <div class="pop-header">\
                                        <h4 class="poptit">提示</h4>\
                                        <a href="javascript:;" class="btn-closepop live-course-confirm-dialog-close-button"></a>\
                                    </div>\
                                    <div class="pop-body">\
                                        <i class="set-icon set-icon-poptip"></i>\
                                        <p class="tip-text">' + text + '</p>\
                                    </div>\
                                    <div class="pop-footer">\
                                        <a href="javascript:;" class="ui-btn ui-btn-cancel live-course-confirm-dialog-cancel-button">' + cancelText + '</a>\
                                        <a href="javascript:;" class="ui-btn ui-btn-cancel txtorg live-course-confirm-dialog-confirm-button">' + confirmText + '</a>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>';

            document.body.appendChild($(html)[0]);
            $(document).on('click', '.live-course-confirm-dialog-cancel-button', function () {
                if (cancelCallBack) {
                    cancelCallBack();
                }
                $('#live-course-confirm-dialog').remove();
            });
            $(document).on('click', '.live-course-confirm-dialog-close-button', function () {
                $('#live-course-confirm-dialog').remove();
            });
            $(document).on('click', '.live-course-confirm-dialog-confirm-button', function () {
                if (confirmCallBack) {
                    confirmCallBack();
                }
                $('#live-course-confirm-dialog').remove();
            });
        }
        return {
            show: function () {
                $('#live-course-confirm-dialog').show()
            },
            hide: function () {
                $('#live-course-confirm-dialog').remove()
            }
        }
    }

    $.extend({
        errorDialog: ErrorDialog,
        confirmDialog: confirmDialog
    });
})();
