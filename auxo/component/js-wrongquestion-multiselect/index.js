import tpl from './template.html'
import ko from 'knockout'

var store = {
    getErrorStatistics: function (data) {
        return $.ajax({
            url: wrongQuestionGatewayUrl + '/v1/wrong_questions/stat?component=' + data.component + '&tag_types=' + data.tag_types,//开发环境（暂时）
            dataType: "json",
            type: 'POST'
        })
    }
};

function ViewModel(params) {
    this.callBack = params.callBack;
    this.questionType = params.questionType;
    this.model = {
        flag: params.flag,
        multiSelectId: params.multiSelectId,
        needMultiSelectId: params.needMultiSelectId,
        tags: params.tags,
        chosenSubject: params.subject,//传入学科名称
        chosenCourse: params.courseId,//选中的课程id
        showCourseTags: params.showCourseTags, // 是否显示课程标签
        showQuestionTypes: params.showQuestionTypes, // 是否显示错题类型
        filter: {
            component: params.flag,
            tag_types: params.flag == 'homework' ? 'subject&tag_types=question_type&tag_types=wrong_reason&tag_types=teaching_material' : 'course&tag_types=question_type&tag_types=wrong_reason'
        },
        mastery: ['全部','未掌握','重点错题','已掌握'],//掌握度
        subject_tags: [],//学科（包含教材）
        subject_tag_index: 0,
        course_tags: [],//课程
        course_tag_index: 0,
        question_types: [],//题型
        question_type_index: 0,
        wrong_reason_tags: [],//错因
        wrong_reason_index: 0,
        teaching_material_tags: [],//教材
        teaching_material_tag_index: 0,
        mastered_index: 1,
        questionTags: {
            //是否标记重点
            "is_mark_key": {
                type: '',
                "value": false
            },
            //是否已掌握
            "is_mastered": {
                type: '',
                "value": false
            },
            //教材
            "teaching_material": {
                "type": "",
                "value": ""
            },
            //课程
            "course": {
                "type": "",
                "value": ""
            },
            //题型
            "question_type": {
                "type": "",
                "value": ""
            },
            //错因
            "wrong_reason": {
                "type": "",
                "value": ""
            }
        }
    };
    this.init(params);
}

ViewModel.prototype = {
    init: function (params) {
        var _self = this;
        this.model = ko.mapping.fromJS(this.model);
        var filter = ko.mapping.toJS(this.model.filter);
        store.getErrorStatistics(filter).done(function (resData) {
            if (resData) {
                _self.model.subject_tags(resData.subject_tags);
                // var teachingMaterial = resData.subject_tags.length ? (resData.subject_tags[0].teaching_material_tags ? resData.subject_tags[0].teaching_material_tags : []) : [];
                var teachingMaterial = [];
                if (params.subject) {
                    for (var i = 0; i < resData.subject_tags.length; i++) {
                        var subject = resData.subject_tags[i];
                        if (subject.tag_name == params.subject || subject.tag_value == params.subject) {
                            _self.model.subject_tag_index(i);
                            teachingMaterial = subject.teaching_material_tags ? subject.teaching_material_tags : [];
                            break;
                        }
                    }
                    if (teachingMaterial.length == 0) {
                        _self._showEmpty();
                        return;
                    }
                }else {
                    teachingMaterial = resData.subject_tags.length ? (resData.subject_tags[0].teaching_material_tags ? resData.subject_tags[0].teaching_material_tags : []) : [];
                }
                if (params.courseId) {
                    var i = 0
                    for (; i < resData.course_tags.length; i++) {
                        if (resData.course_tags[i].tag_value == params.courseId) {
                            _self.model.course_tag_index(i);
                            break;
                        }
                    }
                    if (i == resData.course_tags.length) {
                        _self._showEmpty();
                        return;
                    }
                }
                //课程
                var courseTag = resData.course_tags;
                _self.model.questionTags.course.type(courseTag.length ? courseTag[_self.model.course_tag_index()].tag_type : '');
                _self.model.questionTags.course.value(courseTag.length ? courseTag[_self.model.course_tag_index()].tag_value : '');
                _self.model.teaching_material_tags(teachingMaterial);
                _self.model.course_tags(resData.course_tags);
                /*解析题目*/
                $.each(resData.question_types, function (index, item) {
                    item.tag_name = _self.questionType[item.tag_value];
                });
                _self.model.question_types(resData.question_types);
                _self.model.wrong_reason_tags(resData.wrong_reason_tags);
                //这里要初始化questionTags
                //掌握度
                _self.model.questionTags.is_mastered.type('is_mastered');
                _self.model.questionTags.is_mastered.value(false);
                //教材
                _self.model.questionTags.teaching_material.type(teachingMaterial.length ? teachingMaterial[0].tag_type : '');
                _self.model.questionTags.teaching_material.value(teachingMaterial.length ? teachingMaterial[0].tag_value : '');
                _self._mergeTags(params.subject||params.courseId, resData);
                if(!_self.model.multiSelectId() && params.needMultiSelectId()) {
                    courseTag && courseTag.length && _self.model.multiSelectId(courseTag[_self.model.course_tag_index()].tag_value);
                    teachingMaterial.length && _self.model.multiSelectId(teachingMaterial[0].tag_value);
                }
                _self.callBack(_self.model.questionTags);
            }
        });
        /*判断每行标签是否超过一行,需要优化*/
        setTimeout(function() {
            var selectList = $('.select-list-cell');
            var innerHeight = $(selectList[0].children[0]).outerHeight(true) || 37;
            if (params.flag == 'homework') {
                $.each(selectList, function (index, item) {
                    var lastItem = $(item).find('span:last');
                    if (lastItem && lastItem.position().top >= innerHeight) {
                        $(item).parent().css('height', innerHeight + 'px');
                        $(item).next().css('display', 'block');
                    }
                });
            } else {
                $.each(selectList, function (index, item) {
                    var lastItem = $(item).find('span:last');
                    if (showCourseTags == 'true' && index == 0 && lastItem && lastItem.position().top == innerHeight) {
                        $(item).parent().parent().css('height', innerHeight * 2 + 'px');
                        // $(item).next().css('margin-top', '35px');
                    } else if (showCourseTags == 'true' && index == 0 && lastItem && lastItem.position().top > innerHeight) {
                        $(item).parent().parent().css('height', innerHeight * 2 + 'px');
                        $(item).parent().css('height', innerHeight * 2 + 'px');
                        $(item).parent().css('min-height', innerHeight * 2 + 'px');
                        $(item).parent().parent().css('min-height', innerHeight * 2 + 'px');
                        $(item).next().css('display', 'block');
                    } else if (index != 0 && lastItem && lastItem.position().top >= innerHeight) {
                        $(item).parent().css('height', innerHeight + 'px');
                        $(item).next().css('display', 'block');
                    }
                });
            }
        }, 500);
    },
    _showTip: function (message) {
        $('#js_tip').html(message);
        $('#js_tip').show();
        setTimeout(function () {
            $('#js_tip').hide();
            $('#js_tip').html('');
        }, 1000);
    },
    _showEmpty: function () {
        $('.main.main-homework').hide();
        $('.error-empty').show();
    },
    _mergeTags: function (flag, resData) {
        var _self = this;
        var tags = ko.mapping.toJS(_self.model.tags);
        if (!flag && tags && tags.length > 0) {
            $.each(tags, function (index, tag) {
                if (_self.model.questionTags[tag.type]) {
                    _self.model.questionTags[tag.type].type(tag.type);
                    _self.model.questionTags[tag.type].value(tag.value);
                    _self._locateIndex(tag, resData);
                }
            })
        }
    },
    _locateIndex: function (tag, resData) {
        var _self = this;
        switch (tag.type) {
            case 'is_mastered':
                if (tag.value) {
                    _self.model.mastered_index(3);
                } else if (tag.value != null) {
                    _self.model.mastered_index(1);
                } else if (_self.model.mastered_index() != 2) {
                    _self.model.mastered_index(0);
                }
                break;
            case 'is_mark_key':
                if (tag.value) {
                    _self.model.mastered_index(2);
                }
                break;
            case 'teaching_material':
                $.each(resData.subject_tags, function (_index, item) {
                    var index = _self._getIndex(tag.value, item.teaching_material_tags);
                    if (index != -1) {
                        _self.model.teaching_material_tag_index(index);
                        _self.model.subject_tag_index(_index);
                        _self.model.teaching_material_tags(item.teaching_material_tags);
                        return false;
                    }
                })
                break;
            case 'course':
                var index = _self._getIndex(tag.value, resData.course_tags);
                if (index != -1) {
                    _self.model.course_tag_index(index);
                }
                break;
            case 'question_type':
                var index = _self._getIndex(tag.value, resData.question_types);
                if (index != -1) {
                    _self.model.question_type_index(index+1);
                }
                break;
            case 'wrong_reason':
                var index = _self._getIndex(tag.value, resData.wrong_reason_tags);
                if (index != -1) {
                    _self.model.wrong_reason_index(index+1);
                }
                break;
        }
    },
    _getIndex: function (value, arr) {
        var index = -1;
        $.each(arr, function (_index, item) {
            if (item.tag_value == value) {
                index = _index;
                return false;
            }
        })
        return index;
    },
    /*切换学科*/
    switchSubject: function (element, data) {
        $(element).addClass('active').siblings().removeClass('active');
        this.model.teaching_material_tag_index(0);
        /*将对应的教材添加*/
        this.model.teaching_material_tags(data&&data.teaching_material_tags ? data.teaching_material_tags : []);
        var teachingMaterialTags = data&&data.teaching_material_tags ? data.teaching_material_tags : [];
        var len = teachingMaterialTags.length;
        this.model.multiSelectId(len ? teachingMaterialTags[0].tag_value : '');
        this.model.questionTags.teaching_material.type(len ? teachingMaterialTags[0].tag_type : '');
        this.model.questionTags.teaching_material.value(len ? teachingMaterialTags[0].tag_value : '');
        this.callBack(this.model.questionTags);
        window.parent.postMessage(JSON.stringify({ 'type': 'changeSubject', 'name': "changeSubject", 'subject': data.tag_name }), '*');
    },
    /*切换教材*/
    switchMaterial: function (element, data) {
        $(element).addClass('active').siblings().removeClass('active');
        this.model.multiSelectId(data.tag_value);
        this.model.questionTags.teaching_material.type(data.tag_type);
        this.model.questionTags.teaching_material.value(data.tag_value);
        this.callBack(this.model.questionTags);
    },
    /*切换题型*/
    switchQuestionType: function (element, data) {
        $(element).addClass('active').siblings().removeClass('active');
        this.model.questionTags.question_type.type(data.tag_type);
        this.model.questionTags.question_type.value(data.tag_value);
        this.callBack(this.model.questionTags);
    },
    /*切换错因*/
    switchWrongReason: function (element, data) {
        $(element).addClass('active').siblings().removeClass('active');
        this.model.questionTags.wrong_reason.type(data.tag_type);
        this.model.questionTags.wrong_reason.value(data.tag_value);
        this.callBack(this.model.questionTags);
    },
    /*切换掌握度*/
    switchMaster: function (element, index) {
        $(element).addClass('active').siblings().removeClass('active');
        switch (index) {
            case 0:
                this.model.questionTags.is_mastered.type('is_mastered');
                this.model.questionTags.is_mark_key.type('is_mark_key');
                this.model.questionTags.is_mastered.value(null);
                this.model.questionTags.is_mark_key.value(null);
                break;
            case 1:
                this.model.questionTags.is_mastered.type('is_mastered');
                this.model.questionTags.is_mark_key.type('is_mark_key');
                this.model.questionTags.is_mastered.value(false);
                this.model.questionTags.is_mark_key.value(null);
                break;
            case 2:
                this.model.questionTags.is_mastered.type('is_mastered');
                this.model.questionTags.is_mark_key.type('is_mark_key');
                this.model.questionTags.is_mark_key.value(true);
                this.model.questionTags.is_mastered.value(null);
                break;
            case 3:
                this.model.questionTags.is_mastered.type('is_mastered');
                this.model.questionTags.is_mark_key.type('is_mark_key');
                this.model.questionTags.is_mastered.value(true);
                this.model.questionTags.is_mark_key.value(null);
                break;
        }
        this.callBack(this.model.questionTags);
    },
    /*切换课程*/
    switchCourse: function (element, data) {
        $(element).addClass('active').siblings().removeClass('active');
        this.model.multiSelectId(data.tag_value);
        this.model.questionTags.course.type(data.tag_type);
        this.model.questionTags.course.value(data.tag_value);
        this.callBack(this.model.questionTags);
    },
    /*切换全部, type: 0-题型，1-错因*/
    switchAll: function (element, type) {
        $(element).addClass('active').siblings().removeClass('active');
        switch (type) {
            case 0:
                this.model.questionTags.question_type.type('');
                break;
            case 1:
                this.model.questionTags.wrong_reason.type('');
        }
        this.callBack(this.model.questionTags);
    },
    /*显示更多*/
    showMore: function (element) {
        var flag = $(element).hasClass('active');
        if (!flag) {
            $(element).parent().parent().css('height', 'auto');
            $(element).parent().css('height', 'auto');
            $(element).addClass('active');
        } else {
            $(element).parent().parent().css('height', '25px');
            $(element).parent().css('height', '25px');
            $(element).removeClass('active');
        }
    }
};

ko.components.register('x-wrongquestion-multiselect', {
    viewModel: ViewModel,
    template: tpl
});