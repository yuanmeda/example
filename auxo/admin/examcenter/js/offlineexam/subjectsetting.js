$(function ($, w) {
    var PROJECT_CODE = w.projectCode,
        TMPL_ID = tmplId,
        TEMPLATE_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/' + TMPL_ID + '/subject';
    // TEMPLATE_REQ_URL = '/' + PROJECT_CODE + '/v1/exams/templates/' + TMPL_ID + '/subject';

    var store = {
        getSubject: function () {
            return $.ajax({
                url: TEMPLATE_REQ_URL,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        },
        updateSubject: function (data) {
            return $.ajax({
                url: TEMPLATE_REQ_URL,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8'
            });
        }
    };

    function SubmitNode(title, duration, description) {
        this.title = ko.observable(title).extend({
            required: {
                value: true,
                message: '节点名称不可为空'
            },
            maxLength: {
                params: 50,
                message: '长度最多{0}'
            },
            pattern: {
                params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                message: '不可含有非法字符'
            }
        });
        this.duration = ko.observable(duration).extend({
            required: {
                value: true,
                message: "考试时长不可为空"
            },
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '请输入正整数'
            },
            maxLength: {
                params: 7,
                message: '长度最多{0}'
            }
        });
        this.description = ko.observable(description).extend({
            maxLength: {
                params: 200,
                message: '长度最多{0}'
            }
        });
    }

    function SubjectNode(title, passingScoreText) {
        this.title = ko.observable(title).extend({
            required: {
                value: true,
                message: '科目名称不可为空'
            },
            maxLength: {
                params: 50,
                message: '长度最多{0}'
            },
            pattern: {
                params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                message: '不可含有非法字符'
            }
        });
        this.passingScoreText = ko.observable(passingScoreText || 'B');
    }

    var viewModel = {
        model: {
            enabled: false,
            submitNodeList: [],
            subjectNodeList: []
        },
        return_url: return_url || '',
        init: function () {
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});

            store.getSubject().done($.proxy(function (data) {
                if (data) {
                    this.model.enabled(data.enabled);
                    if (data.subjectNodeList && data.subjectNodeList.length > 0) {
                        $.each(data.subjectNodeList, $.proxy(function (index, subjectNode) {
                            this.model.subjectNodeList.push(new SubjectNode(subjectNode.title, subjectNode.passingScoreText));
                        }, this));
                    }
                    else {
                        this.model.subjectNodeList.push(new SubjectNode());
                    }

                    if (data.submitNodeList && data.submitNodeList.length > 0) {
                        $.each(data.submitNodeList, $.proxy(function (index, submitNode) {
                            this.model.submitNodeList.push(new SubmitNode(submitNode.title, submitNode.duration / 60, submitNode.description));
                        }, this));
                    }
                    else {
                        this.model.submitNodeList.push(new SubmitNode());
                    }
                }

                ko.applyBindings(this);
            }, this));
        },
        doSave: function (callBack) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var newData = ko.mapping.toJS(this.model);
            $.each(newData.submitNodeList, function (index, submitNode) {
                submitNode.duration = submitNode.duration * 60;//分转秒
            });
            store.updateSubject(newData).done(function () {
                callBack && callBack();
                !callBack && $.fn.dialog2.helpers.alert('保存成功');
            });

        },
        saveThenBack: function () {
            var url = this.return_url ? this.return_url : '/' + PROJECT_CODE + "/exam_center/index";
            this.doSave(function () {
                location.href = url;
            });
        },
        save: function () {
            this.doSave();
        },
        cancel: function () {
            if (this.return_url) {
                location.href = this.return_url;
            } else {
                location.href = '/' + PROJECT_CODE + '/exam_center/index';
            }

        }
    };
    $(function () {
        viewModel.init();
    });
}(jQuery, window));
