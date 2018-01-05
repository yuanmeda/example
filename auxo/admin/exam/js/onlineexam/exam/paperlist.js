(function ($, window) {
    //数据仓库
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
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/strategy';
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
        },
        online: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/online';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        }

    };
    var viewModel = {
        model: {
            subType: subType || 0,
            showPaperList: false,
            questionbanks: null,
            paperFilter: {
                title: '',
                custom_id: '',
                question_bank_id: '',
                page: 0,
                size: 10,
                type: 2
            },
            papers: {
                items: [],
                count: 0
            },
            selectedPapers: [],
            count: 0,
            exam: {
                id: examId || null,
                title: "",
                enabled: false,//考试是否上线
                paper_list: [],
                question_setting_list: [],
                custom_question_count: 0,
                exam_strategy: 1
            },
            max_custom_question_count: 0,
            originalPapers: [],//初始出卷范围，用于判断是否删除
            questionTypes: [],//可用的试卷包含的题目类型及数量
            selectedIds: [],
            //from 3.9.1
            ndrBtnActive: true,
            addBtnActive: true,
            ndrFilter: {
                words: '',
                coverage: 'App/f4bfd12b-e9bb-4665-8745-7e7dd42c8b66/OWNER',
                page: 0,
                size: 20
            },
            ndrPapers: {
                items: [],
                count: 0
            },
            selectedNDRPapers: [],
            strategyOne: '0',
            strategyTwo: '0',
            add_question_array: [],

            //from 3.9.5
            ndrType: 0,
            ndrModalTitle: '',
            customerNDRFilter: {
                title: '',
                custom_id: '',
                custom_type: '',
                page: 0,
                size: 20
            },
            selectedCustomerNDRQB: null,
            //customer modal related
            bankId: '',
            modalModule: '',
            showModalFoot: false
        },
        returnStatus: true,
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.setTemplateEngine(new ko.nativeTemplateEngine());
            ko.applyBindings(this);
        },

        cancel: function () {
            var returnUrl = this.getQueryStringByName('return_url');
            if (__parent_return_url && __parent_return_url.indexOf('http') != -1) {
                /*培训跨域发送消息*/
                var z = window.parent;
                var n = new Nova.Notification(z,"*");
                var message_key = "train.paperlist";
                var message_data = {
                    event_type: "paperlist",
                    //context_id: __context_id ? __context_id : "",
                    data:{
                        returnUrl: __parent_return_url
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
                return;
            }
            var hasParams = returnUrl.indexOf('?') >= 0,
                hasExamId = returnUrl.indexOf('exam_id') >= 0;
            if (returnUrl) {
                if (!hasExamId)
                    returnUrl = returnUrl + (hasParams ? '&exam_id=' + ko.unwrap(examId) : '?exam_id=' + ko.unwrap(examId));
                location.href = returnUrl + '&__mac=' + Nova.getMacToB64(returnUrl);
            } else {
                if (__parent_return_url) {
                    window.parent.location.href = __parent_return_url;
                    return;
                }
                location.href = '/' + projectCode + "/exam" + (window.isExercise ? '/exercise' : '');
            }
        },
        save: function () {
            this.doSave($.proxy(function () {
                $.fn.dialog2.helpers.alert("保存成功");
                this.refreshAddPaperBtn();
                var returnUrl = decodeURIComponent(this.getQueryStringByName('return_url'));
                var hasParam = returnUrl.indexOf('?');
                if (returnUrl) {
                    location.href = returnUrl + '&__mac=' + Nova.getMacToB64(returnUrl);
                }
            }, this));
        },
        saveThenReturn: function () {
            this.doSave($.proxy(this.cancel, this));
        },
        saveThenNext: function () {
            this.doSave($.proxy(this.next, this));
        },
        next: function () {
            if (__parent_next_url && __parent_next_url.indexOf('http') != -1) {
                /*跨域发送消息*/
                var z = window.parent;
                var n = new Nova.Notification(z,"*");
                var message_key = "open_course.course.examCondition";
                var message_data = {
                    event_type: "examCondition",
                    //context_id: __context_id ? __context_id : "",
                    data:{
                        returnUrl: __parent_next_url + '?__mac=' + Nova.getMacToB64(__parent_next_url)
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
                return;
            }
            location.href = '/' + projectCode + "/exam/script?exam_id=" + examId;
        },
        toExam: function () {
            var returnUrl = this.getQueryStringByName('return_url');
            if (__parent_prev_url && __parent_prev_url.indexOf('http') != -1) {
                /*跨域发送消息*/
                var z = window.parent;
                var n = new Nova.Notification(z,"*");
                var message_key = __train_id ? 'train.examCondition' : "open_course.course.examCondition";
                var message_data = {
                    event_type: "examCondition",
                    //context_id: __context_id ? __context_id : "",
                    data:{
                        returnUrl: __train_id ? __parent_prev_url : __parent_prev_url + '?__mac=' + Nova.getMacToB64(__parent_prev_url)
                    }
                }
                n.dispatchEvent("message:" + message_key, message_data);
                return;
            }
            if (window.isExercise) {
                location.href = '/' + projectCode + '/exam/exercise/edit?exercise_id=' + examId + (returnUrl ? '&return_url=' + encodeURIComponent(returnUrl) : '');
            } else {
                location.href = '/' + projectCode + '/exam/edit?id=' + examId + '&sub_type=' + subType + +(returnUrl ? '&return_url=' + encodeURIComponent(returnUrl) : '');
            }
        },
        refreshAddPaperBtn: function () {
            if (this.model.exam.enabled() || (this.model.exam.paper_list().length > 50)) {
                $('#btnUpload').hide();
                $('#btnAdd').hide();
            } else {
                $('#btnUpload').show();
                $('#btnAdd').show();
            }
        },
        saveThenPreview: function () {
            var self = this;
            this.doSave(function () {
                $.fn.dialog2.helpers.alert('保存成功!', {
                    "close": function () {
                        window.open("/" + projectCode + "/exam/paper/preview?exam_id=" + examId)
                        return;
                    },
                    buttonLabelOk: '预览'
                });
                self.refreshAddPaperBtn();
            })
        },
        doSave: function (callback) {
            var self = this;
            if (!self.returnStatus) {
                return;
            }
            if (!$("form").valid()) {
                return;
            }
            var data = this.getData();
            if (Enumerable.from(data.paper_list).all("$.disabled")) {
                if (data.ndr_question_bank_ids.length < 1) {
                    $.fn.dialog2.helpers.alert("至少启用一份试卷");
                    return;
                }
            }
            if (data.exam_strategy == 3) {
                if (data.custom_question_count > this.model.max_custom_question_count()) {
                    $.fn.dialog2.helpers.alert("出题数不能大于题目总数");
                    return;
                }
            } else if (data.exam_strategy == 1) {
                delete data.custom_question_count;
            } else if (data.exam_strategy == 2) {
                if (data.question_setting_list.length < 1) {
                    $.fn.dialog2.helpers.alert("题目设置不能为空");
                    return;
                }
            }
            self.returnStatus = false;
            store.update(data)
                .done(function () {
                    self.model.originalPapers = ko.mapping.toJS(self.model.exam.paper_list);
                    if (callback) {
                        callback();
                    }
                })
                .always(function () {
                    self.returnStatus = true;
                });
        },
        getData: function () {
            var self = this;
            var exam = ko.mapping.toJS(this.model.exam);
            var data = {};
            data.exam_strategy = +(this.model.exam.exam_strategy());
            data.custom_question_count = +exam.custom_question_count;
            if (data.exam_strategy != 1) {
                data.question_setting_list = exam.question_setting_list;
                var selectedCustomerNDRQB = this.model.selectedCustomerNDRQB();
                if (selectedCustomerNDRQB) {
                    data.ndr_question_bank_ids = [selectedCustomerNDRQB.id];
                } else {
                    data.ndr_question_bank_ids = [];
                }

                if (data.exam_strategy == 2) {
                    data.custom_question_count = 0;
                    $.each(data.question_setting_list, function (index, list) {
                        data.custom_question_count += +list.count;
                    });
                }
            } else {
                data.question_setting_list = [];
                data.ndr_question_bank_ids = [];
            }
            var removedIds = [];
            for (var i = 0; i < self.model.originalPapers.length; i++) {
                var originalPaper = self.model.originalPapers[i];
                var found = false;
                for (var j = 0; j < exam.paper_list.length; j++) {
                    var currentPaper = exam.paper_list[j];
                    if (originalPaper.id == currentPaper.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    removedIds.push(originalPaper.id);
                }
            }
            var papers = [];
            $.each(exam.paper_list, function (index, element) {
                var it = {
                    paper_id: element.id,
                    version: element.version,
                    disabled: element.disabled,
                    location: element.location,
                    word_id: element.word_id
                };
                papers.push(it);
            });
            data.removed_paper_ids = removedIds;
            data.paper_list = papers;
            return data;
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);