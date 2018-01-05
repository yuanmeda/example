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
            var url = '/' + projectCode + '/v1/exercises/' + exerciseId + '/strategy';
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
            var url = '/' + projectCode + '/v1/exercises/' + exerciseId + '/online';
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
            exercise: {
                id: exerciseId || null,
                title: "",
                enabled: false,//考试是否上线
                exercise_strategy: 1,
                paper_list: [],
                question_setting_list: []
            },
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
            selectedNDRPapers:[]
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

        },
        cancel: function () {
            location.href = '/' + projectCode + "/exam/exercise";
        },
        //保存按钮事件
        save: function () {
            this.doSave($.proxy(function () {
                $.fn.dialog2.helpers.alert("保存成功");
                this.refreshAddPaperBtn();
            }, this));
        },
        saveThenReturn: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/exercise";
            });
        },
        toExercise: function () {
            location.href = '/' + projectCode + "/exam/exercise/edit?exercise_id=" + exerciseId;
        },
        refreshAddPaperBtn: function () {
            if (this.model.exercise.enabled() || (this.model.exercise.paper_list().length > 50)) {
                $('#btnUpload').hide();
                $('#btnAdd').hide();
            } else {
                $('#btnUpload').show();
                $('#btnAdd').show();
            }
        },
        doSave: function (callback) {
            if (!$("form").valid()) {
                return;
            }
            var data = this.getData();
            if (Enumerable.from(data.paper_list).all("$.disabled")) {
                $.fn.dialog2.helpers.alert("至少启用一份试卷");
                return;
            }

            store.update(data).done(function () {
                if (callback) {
                    callback();
                }
            });
        },
        getData: function () {
            var self = this;
            var exercise = ko.mapping.toJS(this.model.exercise);
            var data = {};
            data.exam_strategy = exercise.exercise_strategy;
            if (data.exam_strategy == '2') {
                data.question_setting_list = exercise.question_setting_list;
            } else {
                data.question_setting_list = [];
            }
            var removedIds = [];
            for (var i = 0; i < self.model.originalPapers.length; i++) {
                var originalPaper = self.model.originalPapers[i];
                var found = false;
                for (var j = 0; j < exercise.paper_list.length; j++) {
                    var currentPaper = exercise.paper_list[j];
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
            $.each(exercise.paper_list, function (index, element) {
                var it = {paper_id: element.id, version: element.version, disabled: element.disabled, location:element.location};
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