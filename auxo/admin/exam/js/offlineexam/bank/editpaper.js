(function ($) {
    var errorHandler = function (jqXHR) {
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
    };

    var store = {
        getPaper: function () {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + paperId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            })
        },
        getUploadInfo: function () {
            var url = '/' + projectCode + '/v1/papers/' + paperId + '/uploading';
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        updateComplexQuestion: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + paperId + '/questions/' + data.id;
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(window.toggleCase(data, 'snake')),
                type: 'PUT',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        createPaperQuestion: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + paperId + '/questions';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(window.toggleCase(data, 'snake')),
                type: 'POST',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        },
        updatePaper: function (data) {
            var url = '/' + projectCode + '/v1/questionbanks/papers/' + paperId;
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(window.toggleCase(data, 'snake')),
                type: 'PUT',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        }
    };

    var viewModel = {
        model: {
            uploadInfo: {
                path: "",
                serverUrl: "",
                session: "",
                url: ""
            },
            paper: {
                title: ''
            },
            complexQuestion: {
                id: '',
                partId: '',
                complexBody: '',
                complexExplanation: '',
                questionType: 50,
                subItems: [],
                bodyAttachments: []
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validate();
            ko.applyBindings(this);

            $.when(this.getPaper(), this.initUploadInfo()).done($.proxy(function () {
                this.initEditor('#complexBody', this.model.complexQuestion, 'complexBody');
                this.bindUpload('#complexBodyUpload');
                for (var i = 0; i < this.model.complexQuestion.subItems().length; i++) {
                    this.initEditor('#subBody' + (i + 1), this.model.complexQuestion.subItems()[i], 'body');
                    this.initEditor('#subAnswer' + (i + 1), this.model.complexQuestion.subItems()[i], 'answer');
                    this.bindUpload('#uploadplaceholder' + (i + 1), i);
                }
            }, this));
        },
        validate: function () {
            ko.validation.configuration.insertMessages = false;

            var paper = this.model.paper;
            ko.validation.registerExtenders();

            paper.title.extend({
                required: {params: true, message: "请填写试卷名称"},
                maxLength: {params: 100, message: "不能超过100个字符"}
            });
        },
        getPaper: function () {
            return store.getPaper().done($.proxy(function (data) {
                this.model.paper.title(data.title);

                if (data.parts.length > 0) {
                    var part = data.parts[0];
                    if (part.questions.length > 0) {
                        var complexQuestion = data.parts[0]['questions'][0];
                        this.model.complexQuestion.id(complexQuestion.id);
                        this.model.complexQuestion.partId(part.id);
                        this.model.complexQuestion.complexBody(complexQuestion.complexBody);
                        this.model.complexQuestion.complexExplanation(complexQuestion.complexExplanation);
                        this.model.complexQuestion.questionType(complexQuestion.questionType);
                        this.model.complexQuestion.bodyAttachments(complexQuestion.bodyAttachments);

                        for (var j = 0; j < complexQuestion.items.length; j++)
                            this.model.complexQuestion.subItems.push(ko.mapping.fromJS(complexQuestion.items[j]));
                    }
                }
            }, this));
        },
        initUploadInfo: function () {
            var def = $.Deferred();

            store.getUploadInfo().done($.proxy(function (data) {
                this.model.uploadInfo.session(data.session);
                this.model.uploadInfo.url(data.url);
                this.model.uploadInfo.path(data.path);
                this.model.uploadInfo.serverUrl(data.serverUrl);

                def.resolve();
            }, this));

            return def.promise();
        },
        initEditor: function (selector, question, property) {
            var that = this;
            KindEditor.create(selector, {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
                resizeType: 0,
                items: [
                    'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'],
                afterChange: function () {
                    question[property](this.html());
                }
            });
        },
        updatePaper: function () {
            var errors = ko.validation.group(this.model.paper);
            if (errors().length) {
                errors.showAllMessages();
                return;
            }

            var complexData = ko.mapping.toJS(this.model.complexQuestion);
            if (complexData.complexBody.length > 2000) {
                $.fn.dialog2.helpers.alert('总题干长度不能超过2000！');
                return;
            }
            if (complexData.complexBody.length <= 0) {
                $.fn.dialog2.helpers.alert('总题干不能为空！');
                return;
            }

            if (complexData.subItems.length <= 0) {
                $.fn.dialog2.helpers.alert('至少需要包括一个子题目！');
                return;
            }

            for (var qi = 0; qi < complexData.subItems.length; qi++) {
                if (complexData.subItems[qi].answer == '' && complexData.subItems[qi].answerAttachments.length <= 0) {
                    $.fn.dialog2.helpers.alert('【子题目' + (qi + 1) + '】的答案或附件不能全为空！');
                    return;
                }
                if (complexData.subItems[qi].body.length > 2000) {
                    $.fn.dialog2.helpers.alert('【子题目' + (qi + 1) + '】的题干长度不能超过2000！');
                    return;
                }
                if (complexData.subItems[qi].answer.length > 2000) {
                    $.fn.dialog2.helpers.alert('【子题目' + (qi + 1) + '】的答案长度不能超过2000！');
                    return;
                }
            }

            var paper = ko.mapping.toJS(this.model.paper);
            paper.title = $.trim(paper.title);
            if (complexData.id == '') {
                delete complexData.id;
                delete complexData.partId;
                store.createPaperQuestion(complexData).done($.proxy(function (data) {
                    window.location = 'http://' + window.location.host + '/' + projectCode + "/exam/offline_exam/bank/paper?questionbank_id=" + questionBankId;
                }, this));
            }
            else {
                store.updateComplexQuestion(complexData).done(function (data) {
                    window.location = 'http://' + window.location.host + '/' + projectCode + "/exam/offline_exam/bank/paper?questionbank_id=" + questionBankId;
                });
            }
        },
        addSubQuestion: function () {
            var length = this.model.complexQuestion.subItems().length + 1;
            var data = ko.mapping.fromJS({
                body: '',
                answer: '',
                explanation: '',
                questionType: 25,
                bodyAttachments: [],
                explanationAttachments: [],
                answerAttachments: []
            });

            this.model.complexQuestion.subItems.push(data);

            this.initEditor('#subBody' + length, data, 'body');
            this.initEditor('#subAnswer' + length, data, 'answer');
            this.bindUpload('#uploadplaceholder' + length, length - 1);
        },
        removeComplexAttachment: function (id, index) {
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    var array = this.model.complexQuestion.bodyAttachments();
                    array.splice(index, 1);
                    this.model.complexQuestion.bodyAttachments(array);
                }, this)
            });
        },
        removeSubQuestionAttachment: function () {
            var event = arguments[3],
                index = arguments[1];
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    var that = viewModel;
                    var si = $(event.target).parents('.zone').data('index');
                    var sq = that.model.complexQuestion.subItems()[si];
                    sq.answerAttachments.splice(index, 1);
                }, this)
            });
        },
        removeSubQuestion: function (index) {
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    var item = this.model.complexQuestion.subItems.splice(index, 1);
                }, this)
            });
        },
        bindUpload: function (selector, subQuestionIndex) {
            var uploader = new WebUploader.Uploader({
                swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: this.model.uploadInfo.url(),
                auto: true,
                duplicate: true,
                pick: {
                    id: selector,
                    multiple: false
                },
                formData: {
                    path:  this.model.uploadInfo.path()
                },
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                    title: "Images & Word",
                    extensions: "txt,doc,docx,xls,xlsx,png,jpg",
                    mimeTypes: 'image/*,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadProgress', $.proxy(this.uploadProgress, this,selector));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, subQuestionIndex,selector));
        },
        uploadProgress:function(selector,file, percentage){
            $(selector).parent().siblings('.parcent').show().text("正在上传： (" +  Math.floor(percentage*100) + "%)");
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：" + reason);
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (index,selector, file, response) {
            if (index == undefined) {
                this.model.complexQuestion.bodyAttachments.push({
                    id: ko.observable(response.dentry_id),
                    name: file.name,
                    description: ko.observable(''),
                    url: ko.observable(this.model.uploadInfo.serverUrl() + '/download?dentryId=' + response.dentry_id)
                });
            }
            else {
                var subItem = this.model.complexQuestion.subItems()[index];
                subItem.answerAttachments.push({
                    id: ko.observable(response.dentry_id),
                    name: ko.observable(file.name),
                    description: ko.observable(''),
                    url: ko.observable(this.model.uploadInfo.serverUrl() + '/download?dentryId=' + response.dentry_id)
                });
            }
            setTimeout($.proxy(function () {
                $(selector).parent().siblings('.parcent').hide();
            }, this), 1000);
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);