(function (w, $) {
    'use strict';
    function Model(params) {
        this.model = params.exam;
        this.model.description.subscribe(function (val) {
            this.desEditor.html(val);
        }, this);

        this._init();
    };

    function ratingSettingList(rating_title, correct_rate) {
        ko.validation.rules["maxRate"] = {
            validator: function (val) {
                if (+val > 100) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '最大值为100'
        };

        ko.validation.registerExtenders();
        this.rating_title = ko.observable(rating_title);
        this.correct_rate = ko.observable(correct_rate).extend({
            required: {
                params: true,
                message: '不可以为空'
            },
            maxRate: {},
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '请输入大于0的整数'
            }
        });
    };

    Model.prototype = {
        _init: function () {
            /**
             * 初始化
             */
            $('#beginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });
            $('#endTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });

            $('#acBeginTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });
            $('#acEndTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });
            this._validateInit();
            this._bindingsExtend();
            this._editor();
        },
        //富文本编辑器
        _editor: function () {
            this.desEditor = KindEditor.create('#description', {
                loadStyleMode: false,
                pasteType: 2,
                allowFileManager: false,
                allowPreviewEmoticons: false,
                allowImageUpload: false,
                resizeType: 0,
                items: [
                    'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'
                ],
                afterChange: function () {
                    if (!this.desEditor) {
                        return;
                    }
                    if (this.desEditor.count("text") == 0) {
                        this.model.description = '';
                    } else {
                        this.model.description = this.desEditor.html();
                    }
                }.bind(this)
            });
        },
        //添加级别
        addLevel: function () {
            var _self = this,
                index = _self.model.rating_setting_list().length;
            if (index > 9) {
                $.fn.dialog2.helpers.alert('最多为十级');
                return;
            }
            _self.model.rating_setting_list.push(
                new ratingSettingList(_self._getChineseNumber(index) + '级', '60')
            );
        },
        //删除级别
        delLevel: function (index) {
            var _self = this;
            _self.model.rating_setting_list.splice(index, 1);
        },
        _getChineseNumber: function (num) {
            num = parseInt(num, 10);
            if (isNaN(num)) {
                return 0;
            }
            var cnNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            if (num > 10) {
                return;
            }
            return cnNum[num];
        },
        _validateInit: function () {
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

            ko.validation.rules['endTimeRules'] = {
                validator: function (obj, params) {
                    if (!obj)
                        return true;
                    var beginTime = params;
                    var endTime = obj;
                    beginTime = beginTime.replace(/-/g, "/");
                    endTime = endTime.replace(/-/g, "/");
                    if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }.bind(this),
                message: '结束时间不能早于开始时间'
            };
            ko.validation.rules['isScript'] = {
                validator: function (obj) {
                    var re = /<script.*?>.*?<\/script>/ig;
                    return !re.test(obj);
                },
                message: '考试介绍中包含危险信息'
            };
            ko.validation.rules['ratingSettingList'] = {
                validator: function (ratingSettingList) {
                    var result = true;
                    var ratingSettingList = ko.mapping.toJS(ratingSettingList);
                    if (ratingSettingList.length > 1) {
                        $.each(ratingSettingList, function (index, ratingSetting) {
                            if (index > 0) {
                                var lastRatingSetting = ratingSettingList[index - 1];
                                if (+lastRatingSetting.correct_rate >= +ratingSetting.correct_rate) {
                                    result = false;
                                }
                            }
                        })
                    }
                    return result;
                },
                message: '闯关结果分级需递增设置'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var exam = this.model;
            exam.title.extend({
                required: {
                    params: true,
                    message: '考试名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '考试名称最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5().-]*$",
                    message: '不可含有非法字符'
                }
            });
            exam.begin_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.end_time.extend({
                endTimeRules: {
                    params: exam.begin_time,
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2 && exam.begin_time();
                    }, this)
                }
            });
            exam.ac_begin_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3';
                    }, this)
                }
            });
            exam.ac_end_time.extend({
                required: {
                    value: true,
                    message: '结束时间不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3';
                    }, this)
                },
                endTimeRules: {
                    params: exam.ac_begin_time,
                    onlyIf: $.proxy(function () {
                        return this.model.analysis_cond_status() == '3' && exam.ac_begin_time()!='';
                    }, this)
                }
            });
            exam.duration.extend({
                required: {
                    value: true,
                    message: '考试时长不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() == 2;
                    }, this)
                },
                maxLength: {
                    params: 7,
                    message: '最大长度为{0}'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试时长格式有误，请重新输入'
                }
            });
            exam.passing_score.extend({
                required: {
                    value: true,
                    message: '及格线不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                maxLength: {
                    params: 9,
                    message: '最大长度为{0}',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '及格线格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.exam_chance.extend({
                required: {
                    value: true,
                    message: '考试机会不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                maxLength: {
                    params: 9,
                    message: '最大长度为{0}',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试机会格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.sub_type() != 2;
                    }, this)
                }
            });
            exam.limit_number.extend({
                required: {
                    value: true,
                    message: '考试机会不能为空',
                    onlyIf: $.proxy(function () {
                        return this.model.number_limit_type() == '1' || this.model.number_limit_type() == '2';
                    }, this)
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试机会格式有误，请重新输入',
                    onlyIf: $.proxy(function () {
                        return this.model.number_limit_type() == '1' || this.model.number_limit_type() == '2';
                    }, this)
                }
            });
            exam.end_answer_time.extend({
                required: {
                    value: true,
                    message: '可挑战时间不能为空',
                },
                min: { params: 0, message: "请输入不小于0的整数" },
                max: { params: 100, message: "请输入不大于100的正整数" }
            });
            exam.description.extend({
                isScript: {}
            });
            exam.rating_setting_list.extend({
                ratingSettingList: {}
            });

        }
    };
    ko.components.register('x-examedit', {
        /**
         * 组件viewModel类
         *
         * @class
         * @param params 组件viewModel实例化时的参数 studentList：可选列表，selectStudentList：已选列表
         */
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        /**
         * 组件模板
         */
        template: '<div></div>'
    })
})(window, jQuery);