import tpl from './template.html'
import ko from 'knockout'

function Model(params) {
    this.model = {
        "data": null,
        "host": ""
    }
    this.init(params);
}

Model.prototype = {
    init: function (params) {
        this.model.data = params.model;
        this.model.host = params.host;
    },
    formatDateTime: function (data) {
        var data = data.model.data.unit_info;
        var timeArr = data.end_time ? data.end_time.split('T') : '',
            html = data.end_time ? timeArr[0] + ' ' + timeArr[1].substr(0, 5) 
            + '<em class="ml">' + i18nHelper.getKeyValue('exam_mooc_card.ending') + '</em>' : "";
        return html;
    },
    formatScore: function (score) {
        return score ? parseFloat(score).toFixed(1) : 0;
    },
    getExamPrepareUrl: function () {
        return this.model.host + "/examinee/myexam/" + ko.unwrap(this.model.data.unit_info.extra.exam_id); 
    },
    refreshMac: function (data, event) {
        if (event.currentTarget.children && event.currentTarget.children.length > 0) {
            var url = this.model.host + "/examinee/myexam/" + ko.unwrap(this.model.data.unit_info.extra.exam_id);
            $.each(event.currentTarget.children, function () {
                var href = $(this).attr('href');
                if (href && href != 'javascript:void(0)' && href != '#') {
                    var mac = Nova.getMacToB64(url);
                    if (mac) {
                        $(this).attr('href', url + '?__mac=' + mac);
                    }
                }
            });
        }
        return true;
    },
    disableBtn: function () {
        var isDisable = -1,
            dataInfo = ko.mapping.toJS(this.model.data);
        switch (dataInfo.unit_type){
            case 'mooc-exam':
                switch (dataInfo.status){
                    case 1:
                        isDisable = 0;
                        break;
                    default:
                        isDisable = 1;
                        break;
                }
            break;
            case 'mooc-exercise':
                switch (dataInfo.status){
                    case 1:
                        isDisable = 0;
                        break;
                    default:
                        isDisable = 1;
                        break;
                }
            break;
        }
        return isDisable;
    },
    //NOT_START(0, "未开始"),START(1, "开始练习"),GO_ON(2, "继续练习"),AGAIN(3, "再练一次"),OPPORTUNITY_RUN_OUT(4, "已完成作答"),
    //    END(5, "练习时间已过");
    getExerciseStatusName:function(dataInfo){
        var txt ='';
        switch (dataInfo.status) {
            case 0:
                txt = 'exam_mooc_card.aboutToBegin';//即将开始
                break;
            case 1:
                txt = 'exam_mooc_card.underway';//进行中
                break;
            case 2:
                txt = 'exam_mooc_card.end';//已结束
                break;
            case 3:
                txt = 'exam_mooc_card.againExercise';
                break;
            case 4:
                txt = 'exam_mooc_card.opportunityRunOutExercise';
                break;
            case 5:
                txt = 'exam_mooc_card.endExercise';
                break;
        }
        return txt;
    },
    //START(1, "开始考试"),GO_ON(2, "继续考试"),ABOUT_TO_BEGIN(3, "即将开始"), NOT_START(4, "离考试"),
    //AGAIN(5, "再考一次"),CHEAT(6, "被标记作弊"),OPPORTUNITY_RUN_OUT(7, "已交卷"), END(8, "考试时间已过");    
    getExamStatusName:function(dataInfo){
        var txt ='';
        switch (dataInfo.status) {
           case 0:
                txt = 'exam_mooc_card.aboutToBegin';//即将开始
                break;
            case 1:
                txt = 'exam_mooc_card.underway';//进行中
                break;
            case 2:
                txt = 'exam_mooc_card.end';//已结束
                break;
            case 3:
                txt = 'exam_mooc_card.aboutToBegin';
                break;
            case 4:
                txt = 'exam_mooc_card.aboutToBegin';
                break;
            case 5:
                txt = 'exam_mooc_card.again';
                break;
            case 6:
                txt = 'exam_mooc_card.cheat';
                break;
            case 7:
                txt = 'exam_mooc_card.opportunityRunOut';
                break;
            case 8:
                txt = 'exam_mooc_card.end';
                break;
        }
        return txt;
    },
    userExamStatus: function (data) {
        var txt = '',
            dataInfo = ko.mapping.toJS(data.model.data);
        switch (dataInfo.unit_type) {
            case 'mooc-exam':
                txt = this.getExamStatusName(dataInfo);
                break;
            case 'mooc-exercise':
                txt = this.getExerciseStatusName(dataInfo);
                break;
        }
        return txt;
    },
    getExamStatus: function () {
        var dataInfo = ko.mapping.toJS(this.model.data.extra);
        switch (dataInfo.last_status) {
            case 4:
            case 8:
            case 112:
                return 50;
            case 16:
            case 101:
            case 32:
                return 60;
            case 0:
            case 64:
            case 80:
            case 96:
                return 70; // 考试已结束
        }
    },
    getExamType:function(data){
       //0培训结业考试、1职业认证考试、2期末考试、4补考、5重修考试、6期中考试、10其它、12日常测验     
       var txt = '', dataInfo = ko.mapping.toJS(data.unit_info.extra);
        switch (dataInfo.type) {
            case '0':
                txt = '培训结业考试';
                break;
            case '1':
                txt = '职业认证考试';
                break;
            case '2':
                txt = '期末考试';
                break;
            case '4':
               txt = '补考';
                break;
            case '5':
                txt = '重修考试';
                break;
            case '6':
                txt = '期中考试';
                break;
            case '10':
                txt = '其它';
                break;
            case '12':
                txt = '日常测验';
                break;
            default:
                txt = '';
                break;
        }
        return txt;
    },
    formatName:function(data){
        if (data) {
            return data;
        };
        return '--';
    }
}

ko.components.register('x-exam-mooc', {
    viewModel: Model,
    template: tpl
})