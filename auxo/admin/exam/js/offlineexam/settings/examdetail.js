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
        get: function () {
            var url = '/' + projectCode + '/v1/exams/templates/' + examId;
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            exam: {
                id: examId,
                appId: 0,
                customId: "",
                customType: "",
                title: "",
                beginTime: "2015-01-01T00:00:00",
                endTime: "2015-01-01T00:00:00",
                duration: 0,
                passingScore: 0,
                examChance: 0,
                description: "",
                enable: true,
                enabledTime: "2015-01-01T00:00:00",
                disabledTime: "2015-01-01T00:00:00",
                examStrategy: 0,
                examStrategyData: "",
                questionSettingData: "",
                analysisCondStatus: 0,
                analysisCondData: "",
                enrollType: 0,
                examTags: [],
                totalScore: 0.0,
                candidateCount: 0,
                type: "",
                uploadAllowed: true,
                subType: 0,
                offlineExam: true,
                offlineExamType: 0,
                cyclicStrategy: 0,
                examNumPerUser: 0,
                markApplyEndTime: 0,
                randomStrategy: 0
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            if (examId) {
                var testData = {
                    id: examId,
                    appId: 0,
                    customId: "",
                    customType: "",
                    title: "test exam title",
                    beginTime: "2020-01-01T00:00:00",
                    endTime: "2020-01-01T00:00:00",
                    duration: 600,
                    passingScore: 10,
                    examChance: 1,
                    description: "fdsa fds fdsa fdsa fas fdsa fsa",
                    enable: true,
                    enabledTime: "2015-01-01T00:00:00",
                    disabledTime: "2015-01-01T00:00:00",
                    examStrategy: 1,
                    examStrategyData: "chu juan fan wei",
                    questionSettingData: "ti mu she zhi",
                    analysisCondStatus: 0,
                    analysisCondData: "{'begin_time' : '2016-02-19T13:52:36.415+0800', 'end_time' : '2016-12-30T07:50:00.000+0800'}",
                    enrollType: 0,
                    examTags: ['tag1', 'tag2'],
                    totalScore: 100.0,
                    candidateCount: 100,
                    type: "exam",
                    uploadAllowed: true,
                    subType: 0,
                    offlineExam: true,
                    offlineExamType: 0,
                    cyclicStrategy: 0,
                    examChance: 100,
                    examNumPerUser: 10,
                    markApplyEndTime: 6000,
                    randomStrategy: 0
                };
                ko.mapping.fromJS(testData, {}, this.model.exam);
            }
        },
        getExamType: function () {
            var item = ko.mapping.toJS(this.model.exam);
            var returnText = '';
            var type = item.type;

            if (type == 'exam') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 0 ? '设计方法论考试' : '其他';
                } else {
                    returnText = item.subType == 1 ? '自定义考试' : '标准考试';
                }
            } else if (type == 'exercise') {
                if (item.offlineExam) {
                    returnText = item.offlineExamType == 0 ? '设计方法论考试练习' : '其他';
                } else {
                    returnText = '练习';
                }
            }
            return returnText;
        },
        getExamTime: function () {
            var item = ko.mapping.toJS(this.model.exam);
            var cyclicStrategy = item.cyclicStrategy;
            var beginTime = item.beginTime;
            var endTime = item.endTime;
            var text = '';
            switch (cyclicStrategy) {
                case 0:
                    text = "不限时间";
                    break;
                case 2:
                    text = "每天循环";
                    break;
                case 3:
                    text = "每周循环";
                    break;
                case 4:
                    text = "每月循环";
                    break;
                case 1:
                    if (beginTime || endTime) {
                        text = (beginTime ? Date.format(new Date(beginTime)) : '') + ' - ' + (endTime ? Date.format(new Date(endTime)) : '');
                    } else {
                        text = "自定义时间点";
                    }
            }
            return text;
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);