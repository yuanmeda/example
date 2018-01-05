(function($) {
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
        getSubjectInfo: function() {
            var url = '/' + projectCode + '/v1/exams/templates/' + templateId + '/detail_with_subject';
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        getTemplateDetail: function() {
            var url = '/' + projectCode + '/v1/exams/templates/' + templateId + '/detail';
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            tempInfo: {
                title: '',
                beginTime: '',
                endTime: '',
                analysisCondStatus: '',
                description: '',
                paperList: [],
                subjectNodeList: [],
                submitNodeList: [],
                analysisCondData: {
                    beginTime: '',
                    endTime: '',
                    endSeconds: 0
                }
            },
            detail: {
                beginTime: '',
                endTime: '',
                cyclicStrategy: '',
                weekdays: [],
                dates: [],
                dateList: [],
                timeList: [],
                beginDate: '',
                endDate: ''
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.getInfo();
        },
        formatTime: function (time) {
            if (time > -1) {
                var result = '', h = parseInt(time / 3600), m = parseInt((time % 3600) / 60), s = parseInt(time % 60);
                if (h > 0)
                    return h + '小时' + m + '分钟' + s + '秒';
                if (m > 0)
                    return m + '分钟' + s + '秒';
                return s + '秒';
            }
            else {
                return "0" + '秒';
            }
        },
        getInfo: function () {
            $.when(store.getSubjectInfo(), store.getTemplateDetail()).done($.proxy(function(subjectResultData, templateDetailData) {
                var subject = subjectResultData[0], templateDetail = templateDetailData[0];
                this.model.tempInfo.title(subject.title);
                this.model.tempInfo.beginTime(Date.ajustTimeString(subject.beginTime));
                this.model.tempInfo.endTime(Date.ajustTimeString(subject.endTime));
                this.model.tempInfo.analysisCondStatus(subject.analysisCondStatus);
                this.model.tempInfo.description(subject.description);
                this.model.tempInfo.paperList(subject.paperList);
                this.model.tempInfo.subjectNodeList(subject.subjectNodeList ? subject.subjectNodeList : []);
                this.model.tempInfo.submitNodeList(subject.submitNodeList ? subject.submitNodeList : []);

                var analysisCondData = (subject.analysisCondData && subject.analysisCondData.length > 0) ? JSON.parse(subject.analysisCondData) : {};
                analysisCondData.begin_time ? this.model.tempInfo.analysisCondData.beginTime(analysisCondData.begin_time) : "";
                analysisCondData.end_time ? this.model.tempInfo.analysisCondData.endTime(analysisCondData.end_time) : "";
                analysisCondData.end_seconds ? this.model.tempInfo.analysisCondData.endSeconds(analysisCondData.end_seconds) : 0;

                this.model.detail.cyclicStrategy(templateDetail.cyclicStrategy.toString());
                this.model.detail.weekdays(templateDetail.weekdays ? templateDetail.weekdays.toString().split(',') : []);
                this.model.detail.dates(templateDetail.dates);
                this.model.detail.dateList(templateDetail.dateList);
                this.model.detail.timeList(templateDetail.timeList);
                this.model.detail.beginDate(templateDetail.beginDate);
                this.model.detail.endDate(templateDetail.endDate);
                this.model.detail.beginTime(templateDetail.beginTime);
                this.model.detail.endTime(templateDetail.endTime);
            }, this));
        },
        dateFormat: function (date) {
            var value = new Date(date.replace(/(\d{4})-(\d{2})-(\d{2})T(.*)?\.(.*)/, "$1/$2/$3 $4"));
            var format = "yyyy/MM/dd hh:mm:ss";
            var o = {
                "M+": value.getMonth() + 1,                 //月份
                "d+": value.getDate(),                    //日
                "h+": value.getHours(),                   //小时
                "m+": value.getMinutes(),                 //分
                "s+": value.getSeconds(),                 //秒
                "q+": Math.floor((value.getMonth() + 3) / 3), //季度
                "S": value.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return format;
        },
        toJSTime: function (dt) {
            if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
            return dt;
        }
    };

    $(function() {
        viewModel.init();
    })
})(jQuery);