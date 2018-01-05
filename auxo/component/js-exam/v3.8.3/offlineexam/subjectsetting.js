(function ($, w) {
    'use strict';

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

    function Model(params) {
        this.model = params.model;
        this.init();
    };

    Model.prototype = {
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
        },
        addSubmitNode: function (index) {
            var item = new SubmitNode();
            this.model.submitNodeList.splice(index + 1, 0, item);
        },
        delSubmitNode: function (data) {
            var submitNodeList = ko.mapping.toJS(this.model.submitNodeList);
            if (submitNodeList.length < 2) {
                $.fn.dialog2.helpers.alert("提交节点不可以为空");
            }
            else {
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
            }
            else {
                this.model.subjectNodeList.remove(data);
            }
        }
    };

    ko.components.register('x-subjectsetting', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(jQuery, window);



