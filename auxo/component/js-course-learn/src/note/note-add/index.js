import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue,
    _ = ko.utils;

function ViewModel(params) {
    this.maxlength = 400;
    this.config = params.config;
    this.model = {
        biz_param: params.data.biz_param,
        noteContent: ko.observable(''),
        isOpen: ko.observable(true),
        videoCurrentTime: params.data.videoCurrentTime,
        docInfo: params.data.docInfo,
        refreshNotes: params.data.refreshNotes,//保存后的刷新标识
        editNoteInfo: params.data.editNoteInfo,//编辑是的笔记信息
        excerpt_note_id: params.data.excerpt_note_id,//该属性不为Null则标识该条笔记属于摘录
        report_count: ko.observable(0),//被举报数(备用)
        note_id: params.data.note_id
    }
    this.wordCount = ko.computed(function () {
        if (this.model.noteContent()) {
            return this.model.noteContent().length;
        } else {
            return 0;
        }
    }, this);
    this.model.noteContent.subscribe(function (val) {
        if (!val) {
            $('.n-ui-btn-main').hide();
            $('.n-ui-btn-disable').show();
        } else {
            $('.n-ui-btn-main').show();
            $('.n-ui-btn-disable').hide();
        }
        var _maxLen = this.maxlength;
        this.model.noteContent(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
    }, this);
    this.model.editNoteInfo.subscribe(function (val) {
        var newVal = (typeof val.biz_data == 'string') ? JSON.parse(val.biz_data) : val.biz_data;
        val.biz_data = newVal;
        this.model.note_id(val.id);
        this.model.noteContent(val.content);
        this.model.videoCurrentTime(val.biz_data && val.biz_data.location && val.biz_data.location.location ? val.biz_data.location.location : '');
        this.model.docInfo(val.biz_data && val.biz_data.location && val.biz_data.location.location ? val.biz_data.location.location : '');
        this.model.biz_param.resource_type(val.biz_data && val.biz_data.resource_type ? val.biz_data.resource_type : '');
        this.model.isOpen(val.is_open);
        this.model.excerpt_note_id(val.excerpt_note_id);
        this.model.report_count(val.report_count);
        this.model.biz_param.resource_id(val.biz_data && val.biz_data.resource_id ? val.biz_data.resource_id : '');
        this.model.report_count(val.report_count ? val.report_count : 0);
        $('.add-note-input').removeClass('hide');//显示编辑框
    }, this);
    this.store = {
        createNote: (data) => {
            return $.ajax({
                url: `${this.config.urls.noteServiceUrl}/v1/notes`,
                dataType: "json",
                type: 'post',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            })
        },
        updateNote: (data, note_id) => {
            return $.ajax({
                url: `${this.config.urls.noteServiceUrl}/v1/notes/${note_id}`,
                dataType: "json",
                type: 'put',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            })
        }
    }
}

ViewModel.prototype = {
    /*取消笔记编辑窗口*/
    cancel: function () {
        $('.add-note-input').addClass('hide');
        this.model.noteContent('');
        this.model.isOpen(true);
    },
    /*保存笔记*/
    saveNote: function () {
        var location, resourceType, context_id, custom_type;
        if (!this.model.noteContent()) return;
        /*传入对应的值：视频、文档、试卷*/
        switch (this.model.biz_param.resource_type()) {
            case 0:
            case '101':
                location = this.formatVideoTime(this.model.videoCurrentTime());
                resourceType = 'video';
                break;
            case 1:
            case '102':
                location = +this.model.docInfo().split('/')[0];
                resourceType = 'document';
                break;
            case '2':
            case '103':
                location = null;
                resourceType = 'question';
                break;
            case '3':
            case '104':
                location = null;
                resourceType = 'url';
                break;
            case '4':
            case '105':
                location = null;
                resourceType = 'vr';
                break;
            case '5':
                location = null;
                resourceType = 'live';
                break;
            case '6':
                location = null;
                resourceType = 'panorama';
                break;
        }
        var tempData = JSON.stringify({
            course_id: this.model.biz_param.course_id(),
            resource_id: this.model.biz_param.resource_id(),
            resource_type: +this.model.biz_param.resource_type(),
            location: location
        });
        if (this.config.contextId) {
            switch (this.config.contextId.split(':')[0]) {
                case 'auxo-specialty':
                case 'auxo-train':
                    context_id = this.config.contextId;
                    custom_type = this.config.contextId.split(':')[0];
                    break;
                default:
                    context_id = 'businesscourse_2:' + this.model.biz_param.course_id();
                    custom_type = 'businesscourse_2';
            }
        } else {
            context_id = this.config.contextId;
            custom_type = 'businesscourse_2';
        }

        var params = {
            content: this.model.noteContent(),
            target_id: resourceType + ":" + this.model.biz_param.resource_id(),
            target_name: this.model.biz_param.resource_title(),
            is_open: this.model.isOpen(),
            excerpt_note_id: '',
            biz_url: this.config.urls.businessCourseServiceUrl + '/v1/business_courses/biz_data',
            biz_param: tempData,
            context_id: context_id,
            custom_type: custom_type,
            biz_view: 'course2_biz_view'
        };
        if (this.model.note_id()) {
            this.store.updateNote(params, this.model.note_id()).done((res) => {
                this.model.note_id('');
                this.model.noteContent('');
                this.model.refreshNotes(true);
                this.model.isOpen(true);
                $('.add-note-input').addClass('hide');
            });
        } else {
            this.store.createNote(params).done((res) => {
                this.model.noteContent('');
                this.model.refreshNotes(true);
                this.model.isOpen(true);
                $('.add-note-input').addClass('hide');
            })
        }

    },
    /*将时间格式化为秒数*/
    formatVideoTime: function (val) {
        var timeArr = val.split(':');
        return Number(timeArr[0]) * 60 + Number(timeArr[1]);
    }
};

ko.components.register('x-course-learn-note__note-add', {
    viewModel: ViewModel,
    template: tpl
});

