(function ($, window) {
    //数据仓库
    var store = {
        update: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/' + examId + '/strategy';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8'
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
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var viewModel = {
        model: {
            subType: subType || '0',
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
                exam_strategy: 1,
                paper_list: [],
                question_setting_list: [],
                custom_question_count: 0,
            },
            max_custom_question_count: 0,
            originalPapers: [],//初始出卷范围，用于判断是否删除
            questionTypes: [],//可用的试卷包含的题目类型及数量
            selectedIds: [],
            style: 'table',//列表显示风格
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
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        cancel: function () {
            location.href = '/' + projectCode + "/exam_center/index";
        },
        save: function () {
            this.doSave($.proxy(function () {
                $.fn.dialog2.helpers.alert("保存成功");
                this.refreshAddPaperBtn();
            }, this));
        },
        saveThenReturn: function () {
            this.doSave(this.cancel);
        },
        saveThenNext: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam_center/script?exam_id=" + examId + '&sub_type=' + (this.model.subType() ? +this.model.subType() : 0);
            }.bind(this));
        },
        toExam: function () {
            location.href = '/' + projectCode + '/exam_center/exam/edit?id=' + examId + '&sub_type=' + (this.model.subType() ? +this.model.subType() : 0);
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
                $.fn.dialog2.helpers.alert("至少启用一份试卷");
                return;
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
                    location: element.location
                };
                papers.push(it);
            });
            data.removed_paper_ids = removedIds;
            data.paper_list = papers;
            return data;
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);