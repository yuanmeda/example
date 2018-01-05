void function () {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        getSubject: function () {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/subject';
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        updateSubject: function (data) {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/subject';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
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
            submitNodeList: [],
            subjectNodeList: []
        },
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
            this.validationsInfo = ko.validatedObservable(this.model, { deep: true });
            ko.applyBindings(this);
            store.getSubject().done(function (data) {
                if (data) {
                    if (data.subjectNodeList && data.subjectNodeList.length > 0) {
                        $.each(data.subjectNodeList, function (index, subjectNode) {
                            this.model.subjectNodeList.push(new SubjectNode(subjectNode.title, subjectNode.passingScoreText));
                        }.bind(this));
                    } else {
                        this.model.subjectNodeList.push(new SubjectNode());
                    }

                    if (data.submitNodeList && data.submitNodeList.length > 0) {
                        $.each(data.submitNodeList, function (index, submitNode) {
                            this.model.submitNodeList.push(new SubmitNode(submitNode.title, submitNode.duration / 60, submitNode.description));
                        }.bind(this));
                    } else {
                        this.model.submitNodeList.push(new SubmitNode());
                    }
                }
            }.bind(this));
        },
        addSubmitNode: function (index) {
            var item = new SubmitNode();
            this.model.submitNodeList.splice(index + 1, 0, item);
        },
        delSubmitNode: function (data) {
            var submitNodeList = ko.mapping.toJS(this.model.submitNodeList);
            if (submitNodeList.length < 2) {
                $.fn.dialog2.helpers.alert("提交节点不可以为空");
                return;
            } else {
                this.model.submitNodeList.remove(data);
            }
        },
        addSubjectNode: function (index) {
            var item = new SubjectNode();
            this.model.subjectNodeList.splice(index + 1, 0, item);
        },
        delSubjectNode: function (data) {
            var subjectNodeList = ko.mapping.toJS(this.model.subjectNodeList);
            if (subjectNodeList.length < 2) {
                $.fn.dialog2.helpers.alert("考试成绩设置不可以为空");
                return;
            } else {
                this.model.subjectNodeList.remove(data);
            }
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
                if (!callBack) {
                    $.fn.dialog2.helpers.alert('保存成功');
                }
            });
        },
        saveThenBack: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam";
            });

        },
        save: function () {
            this.doSave();
        }
    };
    $(function () {
        viewModel.init();
    });

} (jQuery);