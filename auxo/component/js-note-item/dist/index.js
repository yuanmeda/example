(function (ko, $) {
    'use strict';

    ko = 'default' in ko ? ko['default'] : ko;
    $ = 'default' in $ ? $['default'] : $;

    var template = '\n<div class="u-ui-mask">\n  <div class="u-ui-pop adjustPopPosition">\n    <h3 class="pop-tit" style="width:100%;">\n      <span class="tit-left">\u63D0\u793A</span>\n      <span class="pop-close" data-bind="click:cancel"></span>\n    </h3>\n    <div class="pop-content">\n      <p class="tip" data-bind="text:message"></p>\n    </div>\n    <div class="pop-footer">\n      <!--ko if:showConfirm-->\n      <a class="u-ui-btn on" data-bind="click:confirm">\u786E\u5B9A</a>\n      <!--/ko-->\n      <!--ko if:showCancel-->\n      <a class="u-ui-btn ml10" data-bind="click:cancel">\u53D6\u6D88</a>\n      <!--/ko-->\n    </div>\n  </div>\n</div>\n';

    function Model(params) {
        var buttons = params.buttons || ['confirm', 'cancel'];
        var vm = this;
        var onConfirmCommand = params.onConfirmCommand;
        var onCancelCommand = params.onCancelCommand;

        vm.message = params.message;
        vm.confirm = confirm;
        vm.cancel = cancel;
        vm.showConfirm = buttons.indexOf('confirm') > -1;
        vm.showCancel = buttons.indexOf('cancel') > -1;

        function confirm() {
            onConfirmCommand();
        }

        function cancel() {
            onCancelCommand();
        }
    }

    ko.components.register("x-note-tip", {
        viewModel: Model,
        template: template
    });

    function ajax(path, options) {
        options = options || {};
        options.dataType = 'json';
        options.contentType = 'application/json; charset=utf-8';
        options.url = path;
        return $.ajax(options);
    }

    var template$1 = '\n<div class="u-ui-mask" style="z-index:999999">\n    <div class="u-ui-pop pop-report adjustPopPosition">\n        <h3 class="pop-tit" style="width:100%;"><span class="tit-left">\u63D0\u793A</span><span class="pop-close" data-bind="click:onCancelCommand"></span></h3>\n        <div class="pop-content u-layout-scroll">\n            <p class="tip">\u786E\u5B9A\u4E3E\u62A5\u6B64\u7BC7\u7B14\u8BB0\u5417\uFF1F</p>\n            <!--\u7B14\u8BB0\u5185\u5BB9-->\n            <div class="content" data-bind="text:noteContent"></div>\n        </div>\n        <div class="pop-footer">\n            <a class="u-ui-btn" data-bind="click:onConfirmCommand">\u786E\u5B9A</a>\n            <a class="u-ui-btn ml10" data-bind="click:onCancelCommand">\u53D6\u6D88</a>\n        </div>\n    </div>\n</div>\n';

    function Model$1(params) {
        var vm = this;
        var noteId = params.noteId;
        var onBlowed = params.onBlowed;
        var onCanceled = params.onCanceled;
        var apiHost = params.apiHost;

        var apiUrlBlowing = apiHost + '/v1/note_reports/' + noteId;
        var reasons = [{name: '垃圾广告', value: 1}, {name: '反动信息', value: 2}, {name: '色情信息', value: 3}, {
            name: '暴力信息',
            value: 4
        }, {name: '其他原因', value: 5}];
        vm.reasons = ko.observableArray(reasons);
        vm.selectedReason = ko.observable(reasons[0]);


        vm.noteContent = params.noteContent;
        vm.isSubmitting = ko.observable(false);
        vm.onConfirmCommand = onConfirmCommand;
        vm.onCancelCommand = onCancelCommand;

        function onConfirmCommand() {
            if (vm.isSubmitting()) {
                return;
            }
            vm.isSubmitting(true);
            ajax(apiUrlBlowing, {type: 'POST'}).then(function (resp) {
                onBlowed(resp);
                vm.isSubmitting(false);
            }, function (err) {
                vm.isSubmitting(false);
            });
        }

        function onCancelCommand() {
            onCanceled();
        }
    }

    ko.components.register("x-note-blowing", {
        viewModel: Model$1,
        template: template$1
    });

    var template_a = "<!--我的笔记-->\r\n<div class=\"n-ui-note-item person-note\">\r\n  <div class=\"note-item-header\">\r\n    <div class=\"note-icon-txt\">\r\n      <!--ko if:biz_data-->\r\n      <a target=\"_blank\" data-bind=\"attr:{href:biz_data.location.web_link, 'class':'note-icon iconfont-learn '+ resourceClassName}\"></a>\r\n      <span class=\"note-txt\" data-bind=\"text:biz_data.location.location\"></span>\r\n      <!--/ko-->\r\n    </div>\r\n    <!--ko if:biz_data-->\r\n    <p class=\"note-txt-light-gray\">\r\n      <!-- ko translate:{key:'noteitem.course'}--> 课程：<!--/ko--><!--ko text:biz_data.course_name--><!--/ko-->\r\n      <!--ko if:biz_data.chapter_name-->\r\n      /  <!-- ko translate:{key:'noteitem.chapter'}--> 章节：<!--/ko--><!--ko text:biz_data.chapter_name.name--><!--/ko-->\r\n      <!--/ko-->\r\n    </p>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--笔记内容-->\r\n  <div class=\"note-item-body\">\r\n    <p data-bind=\"text:content\"></p>\r\n  </div>\r\n  <div class=\"note-item-footer\">\r\n    <!--创建时间-->\r\n    <span class=\"note-txt-light-gray\" data-bind=\"text:create_time\"></span>\r\n    <!--ko if:isFromExcerpt-->\r\n    <div class=\"note-icon-txt fr\" style=\"display:inline-block;float:none;margin-left:20px\">\r\n      <a class=\"note-icon iconfont-learn n-icon-star\" style=\"cursor:default\"></a>\r\n      <span class=\"note-txt note-txt-light-gray\" data-bind=\"translate:{key: 'noteitem.form'}\" style=\"cursor:default\">来自摘录</span>\r\n    </div>\r\n    <!--/ko-->\r\n    <div class=\"btn-wrap fr\">\r\n      <!--点赞-->\r\n      <!--ko if:is_open()-->\r\n      <div class=\"note-icon-txt\">\r\n        <a class=\"note-icon iconfont-learn n-icon-like\" data-bind=\"click:togglePraise\"></a>\r\n        <span class=\"note-txt\" data-bind=\"text: praise_count() > 0 ? praise_count() : i18nHelper.getKeyValue('noteitem.like')\" style=\"cursor:default\"></span>\r\n      </div>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:isLogin-->\r\n      <div class=\"note-icon-txt pdl40\">\r\n        <!--ko if:is_mine-->\r\n        <a class=\"note-icon iconfont-learn n-icon-edit mr10\" title=\"编辑\" data-bind=\"click:edit, attr:{title: i18nHelper.getKeyValue('noteitem.edit') }\"></a>\r\n        <!--/ko-->\r\n        <!--ko if:is_mine-->\r\n        <a class=\"note-icon iconfont-learn n-icon-delete ml10\" title=\"删除\" data-bind=\"click:del, attr:{title: i18nHelper.getKeyValue('noteitem.del') }\"></a>\r\n        <!--/ko-->\r\n      </div>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:showExcerpt && userId!= user_id() -->\r\n      <div class=\"note-icon-txt pdl20\">\r\n        <!--ko if:!has_excerpted()-->\r\n        <a class=\"note-txt note-txt-light-gray\" data-bind=\"click:excerpt, translate:{key:'noteitem.excerpt'}\">摘录</a>\r\n        <!--/ko-->\r\n        <!--ko if:has_excerpted()-->\r\n        <a class=\"note-txt note-txt-light-gray\" data-bind=\"translate:{key:'noteitem.excerpted'}\">已摘录</a>\r\n        <!--/ko-->\r\n      </div>\r\n      <!--/ko-->\r\n\r\n      <!--ko if:showBlowing && userId!= user_id() -->\r\n      <div class=\"note-icon-txt pdl20\">\r\n        <!--ko if:!has_reported()-->\r\n        <a class=\"note-txt\" data-bind=\"click:whistleBlowing, translate:{key:'noteitem.report'}\">举报</a>\r\n        <!--/ko-->\r\n        <!--ko if:has_reported()-->\r\n        <a class=\"note-txt\" data-bind=\"translate:{key: 'noteitem.reported'}\">已被举报</a>\r\n        <!--/ko-->\r\n      </div>\r\n      <!--/ko-->\r\n\r\n    </div>\r\n  </div>\r\n</div>\r\n<!--ko if:showLoginTipDlg-->\r\n<div data-bind=\"component:{\r\n  name: 'x-note-tip',\r\n  params:{\r\n    message: i18nHelper.getKeyValue('noteitem.login'),\r\n    onConfirmCommand: confirmToLogin,\r\n    onCancelCommand:cancelToLogin\r\n  }\r\n}\"></div>\r\n<!--/ko-->\r\n<!--ko if:showBlowingDlg-->\r\n<div data-bind=\"component:{\r\n  name: 'x-note-blowing',\r\n  params: {\r\n    apiHost: apiHost,\r\n    noteId: noteId,\r\n    noteContent: content,\r\n    onBlowed: onBlowed,\r\n    onCanceled: onBlowCancel\r\n  }\r\n}\"></div>\r\n<!--/ko-->\r\n<!--ko if:showBlowSuccessDlg-->\r\n<div data-bind=\"component:{\r\n  name: 'x-note-tip',\r\n  params:{\r\n    message: i18nHelper.getKeyValue('noteitem.reportedSuccess'),\r\n    onConfirmCommand: closeBlowSuccess,\r\n    onCanceled: closeBlowSuccess,\r\n    buttons: ['confirm']\r\n  }\r\n}\"></div>\r\n<!--/ko-->";

    var template_b = "<!--做笔记-->\r\n<div class=\"n-ui-note-item\">\r\n  <div class=\"note-item-header\">\r\n    <div class=\"note-icon-txt\">\r\n      <!--ko if:biz_data-->\r\n      <a target=\"_blank\" data-bind=\"attr:{href:biz_data.location.web_link, 'class':'note-icon iconfont-learn '+ resourceClassName}\"></a>\r\n      <span class=\"note-txt\" data-bind=\"text:biz_data.location.location\"></span>\r\n      <!--/ko-->\r\n    </div>\r\n    <!--创建时间-->\r\n    <span class=\"note-txt fr note-txt-light-gray\" data-bind=\"text:create_time\"></span>\r\n  </div>\r\n  <!--笔记内容-->\r\n  <div class=\"note-item-body\">\r\n    <p data-bind=\"text:content,limitNoteContent\"></p>\r\n    <span class=\"iconfont-learn n-icon-down\" data-id=\"unfold\"></span>\r\n  </div>\r\n  <div class=\"note-item-footer\">\r\n\r\n    <!--点赞-->\r\n    <!--ko if:is_open()-->\r\n    <div class=\"note-icon-txt first\">\r\n      <a class=\"note-icon iconfont-learn n-icon-like\" data-bind=\"click:togglePraise\"></a>\r\n      <span class=\"note-txt\" data-bind=\"text: praise_count() > 0 ? praise_count() : i18nHelper.getKeyValue('noteitem.like')\" style=\"cursor:default\"></span>\r\n    </div>\r\n    <!--/ko-->\r\n\r\n    <!--ko if: showExcerpt && userId!= user_id() -->\r\n    <!--ko if:!has_excerpted()-->\r\n    <a class=\"note-txt note-txt-light-gray\" data-bind=\"click:excerpt, translate:{key:'noteitem.excerpt'}\">摘录</a>\r\n    <!--/ko-->\r\n    <!--ko if:has_excerpted()-->\r\n    <a class=\"note-txt note-txt-light-gray\" data-bind=\"translate:{key:'noteitem.excerpted'}\">已摘录</a>\r\n    <!--/ko-->\r\n    <!--/ko-->\r\n\r\n    <!--ko if:showBlowing && userId!= user_id() -->\r\n    <!--ko if:!has_reported()-->\r\n    <a class=\"note-txt note-txt-light-gray\" data-bind=\"click:whistleBlowing, translate:{key:'noteitem.report'}\">举报</a>\r\n    <!--/ko-->\r\n    <!--ko if:has_reported()-->\r\n    <a class=\"note-txt note-txt-light-gray\" data-bind=\"translate:{key: 'noteitem.reported'}\">已被举报</a>\r\n    <!--/ko-->\r\n    <!--/ko-->\r\n\r\n    <!--ko if:isLogin-->\r\n    <!--ko if:showEdit-->\r\n    <a class=\"note-icon iconfont-learn n-icon-edit\" title=\"编辑\" data-bind=\"click:edit, attr:{title: i18nHelper.getKeyValue('noteitem.edit') }\"></a>\r\n    <!--/ko-->\r\n    <!--ko if:showDel-->\r\n    <a class=\"note-icon iconfont-learn n-icon-delete\" title=\"删除\" data-bind=\"click:del, attr:{title: i18nHelper.getKeyValue('noteitem.del') }\"></a>\r\n    <!--/ko-->\r\n    <!--/ko-->\r\n\r\n\r\n    <!--ko if:isFromExcerpt-->\r\n    <div class=\"note-icon-txt fr\">\r\n      <a class=\"note-icon iconfont-learn n-icon-star\"></a>\r\n      <span class=\"note-txt note-txt-light-gray\" data-bind=\"translate:{key: 'noteitem.form'}\">来自摘录</span>\r\n    </div>\r\n    <!--/ko-->\r\n  </div>\r\n</div>\r\n<!--ko if:showLoginTipDlg-->\r\n<div data-bind=\"component:{\r\n  name: 'x-note-tip',\r\n  params:{\r\n    message: i18nHelper.getKeyValue('noteitem.login'),\r\n    onConfirmCommand: confirmToLogin,\r\n    onCancelCommand:cancelToLogin\r\n  }\r\n}\"></div>\r\n<!--/ko-->\r\n\r\n<!--ko if:showBlowingDlg-->\r\n<div data-bind=\"component:{\r\n  name: 'x-note-blowing',\r\n  params: {\r\n    apiHost: apiHost,\r\n    noteId: noteId,\r\n    noteContent: content,\r\n    onBlowed: onBlowed,\r\n    onCanceled: onBlowCancel\r\n  }\r\n}\"></div>\r\n<!--/ko-->";

    function Model$2(params) {
        var vm = this;
        var note = params.note;
        var options = params.options;
        var noteId = note.id;
        var biz_data = void 0;
        var resourceMap = {
            0: 'n-icon-video',
            1: 'n-icon-chapter',
            2: 'n-icon-topic'
        };
        $.extend(vm, {
            apiHost: null,
            gatewayHost: null,
            isLogin: false,
            userId: '',
            showExcerpt: false,
            showBlowing: false,
            showEdit: false,
            showDel: false,
            onEditCommand: function onEditCommand() {
            },
            onDelCommand: function onDelCommand() {
            }
        }, options);

        var curr_user_id = window.userId;
        var apiHost = options.apiHost;
        var apiUrlPraise = apiHost + '/v1/notes/' + noteId + '/praise';
        var apiUrlExcerpts = apiHost + '/v1/note_excerpts/' + noteId;

        if (note.biz_data && typeof note.biz_data === 'string') {
            try {
                biz_data = $.parseJSON(note.biz_data);
            } catch (e) {
                console.error('biz_data格式非法');
            }
        }

        vm.apiHost = apiHost;
        vm.noteId = note.id;
        vm.content = ko.observable(note.content);
        vm.create_time = note.create_time.substr(0, 10) + ' ' + note.create_time.substr(11, 5);
        vm.is_open = ko.observable(note.is_open);
        vm.biz_data = biz_data || null;
        vm.praise_count = ko.observable(note.praise_count);
        vm.has_excerpted = ko.observable(note.has_excerpted);
        vm.has_praised = ko.observable(note.has_praised);
        vm.has_reported = ko.observable(note.has_reported);
        vm.showLoginTipDlg = ko.observable(false);
        vm.isFromExcerpt = ko.observable(!!note.excerpt_note_id);
        vm.showBlowingDlg = ko.observable(false);
        vm.showBlowSuccessDlg = ko.observable(false);
        vm.user_id = ko.observable(note.user_id);
        vm.is_mine = curr_user_id == note.user_id;

        if (biz_data) {
            vm.resourceClassName = resourceMap[biz_data.resource_type] || resourceMap[0];
        }

        vm.togglePraise = togglePraise;
        vm.excerpt = excerpt;
        vm.whistleBlowing = whistleBlowing;
        vm.del = del;
        vm.edit = edit;
        vm.confirmToLogin = confirmToLogin;
        vm.cancelToLogin = cancelToLogin;
        vm.onBlowed = onBlowed;
        vm.onBlowCancel = onBlowCancel;
        vm.closeBlowSuccess = closeBlowSuccess;

        function edit() {
            vm.onEditCommand(params.note);
        }

        function excerpt() {
            if (!checkLogin()) {
                return;
            }
            ajax(apiUrlExcerpts, {
                type: 'POST'
            }).then(function () {
                vm.has_excerpted(true);
                if (!vm.has_praised()) {
                    vm.has_praised(true);
                    vm.praise_count(vm.praise_count() + 1);
                }
            });
        }

        function whistleBlowing() {
            if (!checkLogin()) {
                return;
            }
            vm.showBlowingDlg(true);
        }

        function onBlowed() {
            vm.showBlowingDlg(false);
            vm.showBlowSuccessDlg(true);
            vm.has_reported(true);
        }

        function onBlowCancel() {
            vm.showBlowingDlg(false);
        }

        function closeBlowSuccess() {
            vm.showBlowSuccessDlg(false);
        }

        function del() {
            vm.onDelCommand(noteId);
        }

        function togglePraise() {
            if (!checkLogin()) {
                return;
            }
            if (vm.has_praised()) {
                ajax(apiUrlPraise, {
                    type: 'DELETE'
                }).then(function () {
                    vm.praise_count(vm.praise_count() - 1);
                    vm.has_praised(false);
                });
            } else {
                addPraise();
            }
        }

        function addPraise() {
            ajax(apiUrlPraise, {
                type: 'POST'
            }).then(function () {
                vm.praise_count(vm.praise_count() + 1);
                vm.has_praised(true);
            });
        }

        function confirmToLogin() {
            window.location.href = window.portal_web_url + '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
        }

        function cancelToLogin() {
            vm.showLoginTipDlg(false);
        }

        function checkLogin() {
            if (!vm.isLogin) {
                vm.showLoginTipDlg(true);
                return false;
            }
            return true;
        }
    }

    ko.bindingHandlers.limitNoteContent = {
        init: function init(element) {
            var _this = this;

            var limitClassName = 'text-limit';
            var h = element.scrollHeight,
                computedStyle = void 0;
            if (window.getComputedStyle) {
                computedStyle = window.getComputedStyle(element);
            } else if (element.currentStyle) {
                computedStyle = element.currentStyle;
            }
            var lineHeight = window.parseInt(computedStyle.lineHeight);
            var lineNum = void 0;
            try {
                lineNum = Math.ceil(h / lineHeight);
            } catch (e) {
                lineNum = 0;
            }
            if (lineNum > 5) {
                $(element).parent().addClass(limitClassName);
            } else {
                $(element).parent().removeClass(limitClassName);
            }
            $(element).next().on('click', function () {
                $(element).parent().removeClass(limitClassName);
                $(_this).remove();
            });
        }
    };

    ko.components.register("x-note-item-a", {
        viewModel: Model$2,
        template: template_a
    });

    ko.components.register("x-note-item-b", {
        viewModel: Model$2,
        template: template_b
    });

}(ko, $));
