/**
 * Created by NoManReady on 2015/12/21.
 */
(function (window, $) {

    'use strict';
    //store仓库
    var store = {
        //获取课程基本信息
        getCouseBaseInfo: function () {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false
            })
        },

        //获取课程学时规则
        getCourseHours: function () {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/time_rules';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //更新课程学时规则
        updateCourseHours: function (data) {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/time_rules';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data)
            });
        },
        //获取资源详细信息
        getExtraInfos: function () {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/extra_infos';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //获取资源详细信息
        getResourceTime: function (data) {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/resource_time';
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                global: false
            });
        },
        //获取前端信息展示方式
        getPeriod: function () {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/configs';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //更新前端信息展示方式
        updatePeriod: function (data) {
            var url = window.auxoCourseWebpage + '/' + projectCode + '/courses/' + courseId + '/configs';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data)
            });
        },
        //获取实践学时、周学时
        getXs: function () {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/courses/' + myCourseId + '/actions/xs';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        //更新实践学时、周学时
        updateXs: function (data) {
            var url = window.envconfig.service + '/v1/teaching_plans/' + specialtyId + '/courses/' + myCourseId + '/actions/xs';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            examConfig: '1',
            adjustedConfig: true,
            offlineCoueseHourSetting: '', // 离线课程学时设置
            extraInfos: {
                video_count: 0, //视频个数
                video_duration: 0, //视频总时长
                document_count: 0, //文档个数
                document_page_count: 0, //文档页数
                document_total_time: 0, //文档学时
                exercise_count: 0, //习题个数
                exercise_question_count: 0,//习题题目个数
                exercise_total_time: 0, //习题学时
                course_total_time: 0, //总时间
                vr_count: 0, //VR个数
                vr_total_time: 0, //VR总时长
                total_period: 0

            },
            courseHourRule: {
                project_id: 0, //项目标识
                time_conversion_ratio: 0, //学时资源转换比
                decimal_place: 0, //精度,范围
                time_unit: '', //学时单位名称
                document_unit: 0, //文档时长
                exercise_unit: 0, //练习时长
                vr_unit: 3600, //VR时长
                include_exam_time: true, //考试是否算入资源时长
                exam_unit: 0, //考试时长,考试算入资源时长时生效，配置0代表考试实际配置时长
                business_course_id: courseId, //业务课程标识
                enable_custom: false, //启用自定义资源时长配置，为false时，使用项目的资源学时配置
                adjusted_time: 0, //课程人为调整时长，单位秒，0为不调整，范围0~999999
                video_effect_max: 0, //一个视频可获得的时长上限，0为不限制
                document_effect_max: 0, //一个文档可获得的时长上限，0为不限制
                exercise_effect_max: 0, //一份习题可获得的时长上限，0为不限制
                vr_effect_max: 0 //一个VR可获得的时长上限，0为不限制
            },
            xS: {
                practise_xs: '',//实践学时
                week_xs: ''//周学时
            },
            periodSetting: {
                period_display_type: '0'
            },
            tips: false,
            radio: {
                video: '0',
                doc: '0',
                exercise: '0',
                vr: '0'
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.adjustedConfig.subscribe(function (val) {
                if (!val) {
                    this.model.courseHourRule.adjusted_time(0);
                    this.model.xS.practise_xs('');
                    this.model.xS.week_xs('');
                }
            }, this);
            this.model.examConfig = ko.computed({
                write: function (val) {
                    if (val === '2') {
                        this.model.courseHourRule.exam_unit(0);
                    }
                },
                read: function () {
                    return +(this.model.courseHourRule.exam_unit()) > 0 ? '1' : '2';
                },
                owner: this
            });
            $('#hoursetting').show();

            ko.applyBindings(this);
            this.originTimeRule = {
                document_unit: 0,
                exercise_unit: 0,
                vr_unit: 0
            };
            this._getHourRule();
            this._getXs();
            this._getPeriod();
            this._validator();
        },
        _getResourceTime: function (needBind) {
            var _self = this;
            if (!$('#hoursetting').valid()) return;
            var data = {
                document_unit: parseInt(this.model.courseHourRule.enable_custom() ? this.model.courseHourRule.document_unit() : this.originTimeRule.document_unit),
                exercise_unit: parseInt(this.model.courseHourRule.enable_custom() ? this.model.courseHourRule.exercise_unit() : this.originTimeRule.exercise_unit),
                vr_unit: parseInt(this.model.courseHourRule.enable_custom() ? this.model.courseHourRule.vr_unit() : this.originTimeRule.vr_unit),
                video_effect_max: this.model.radio.video() == 1 ? parseInt(this.model.courseHourRule.video_effect_max() * 60) : -1,
                document_effect_max: _self.model.radio.doc() == 1 ? parseInt(this.model.courseHourRule.document_effect_max() * 60) : -1,
                exercise_effect_max: _self.model.radio.exercise() == 1 ? parseInt(this.model.courseHourRule.exercise_effect_max() * 60) : -1,
                vr_effect_max: _self.model.radio.vr() == 1 ? parseInt(this.model.courseHourRule.vr_effect_max() * 60) : -1
            };

            store.getResourceTime(data).done(function (returnData) {
                _self.model.extraInfos.course_total_time(returnData.course_total_time);
                _self.model.extraInfos.video_count(returnData.video_count);
                _self.model.extraInfos.video_duration(returnData.video_total_time);
                _self.model.extraInfos.document_page_count(returnData.document_count);
                _self.model.extraInfos.document_total_time(returnData.document_total_time);
                _self.model.extraInfos.exercise_question_count(returnData.exercise_count);
                _self.model.extraInfos.exercise_total_time(returnData.exercise_total_time);
                _self.model.extraInfos.vr_count(returnData.vr_count);
                _self.model.extraInfos.vr_total_time(returnData.vr_total_time);
                _self.model.extraInfos.total_period(returnData.total_period);
                if (needBind) _self._setListenHandler();
                $('#hours').removeAttr('style');
            });
        },
        _setListenHandler: function () {
            this.model.courseHourRule.document_unit.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.exercise_unit.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.vr_unit.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.video_effect_max.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.document_effect_max.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.exercise_effect_max.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.courseHourRule.vr_effect_max.subscribe(function (val) {
                this._getResourceTime();
            }, this);

            this.model.radio.video.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.radio.doc.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.radio.exercise.subscribe(function (val) {
                this._getResourceTime();
            }, this);
            this.model.radio.vr.subscribe(function (val) {
                this._getResourceTime();
            }, this);
        },
        //获取学时规则
        _getHourRule: function () {
            var _self = this;

            store.getCourseHours()
                .done(function (data) {
                    ko.mapping.fromJS(data.update_config ? data.update_config : data.effect_config, {}, _self.model.courseHourRule);
                    _self.model.radio.video(_self.model.courseHourRule.video_effect_max() == -1 ? '0' : '1');
                    _self.model.radio.doc(_self.model.courseHourRule.document_effect_max() == -1 ? '0' : '1');
                    _self.model.radio.exercise(_self.model.courseHourRule.exercise_effect_max() == -1 ? '0' : '1');
                    _self.model.radio.vr(_self.model.courseHourRule.vr_effect_max() == -1 ? '0' : '1');

                    _self.originTimeRule.document_unit = _self.model.courseHourRule.document_unit();
                    _self.originTimeRule.exercise_unit = _self.model.courseHourRule.exercise_unit();
                    _self.originTimeRule.vr_unit = _self.model.courseHourRule.vr_unit();
                    _self.model.courseHourRule.vr_unit(_self.model.courseHourRule.vr_unit());
                    _self.model.courseHourRule.time_conversion_ratio(_self.model.courseHourRule.time_conversion_ratio() / 60);
                    _self.model.courseHourRule.exam_unit(_self.model.courseHourRule.exam_unit() / 60);
                    _self.model.offlineCoueseHourSetting((+_self.model.courseHourRule.adjusted_time() / 3600).toFixed(2));
                    _self.model.courseHourRule.adjusted_time((+_self.model.courseHourRule.adjusted_time() / 3600).toFixed(2));
                    _self.model.adjustedConfig(!!+_self.model.courseHourRule.adjusted_time());
                    _self.model.courseHourRule.video_effect_max(_self.model.courseHourRule.video_effect_max() == -1 ? 0 : _self.model.courseHourRule.video_effect_max() / 60);
                    _self.model.courseHourRule.document_effect_max(_self.model.courseHourRule.document_effect_max() == -1 ? 0 : _self.model.courseHourRule.document_effect_max() / 60);
                    _self.model.courseHourRule.exercise_effect_max(_self.model.courseHourRule.exercise_effect_max() == -1 ? 0 : _self.model.courseHourRule.exercise_effect_max() / 60);
                    _self.model.courseHourRule.vr_effect_max(_self.model.courseHourRule.vr_effect_max() == -1 ? 0 : _self.model.courseHourRule.vr_effect_max() / 60);
                    _self._getResourceTime(true);
                    $(document).trigger('showContent');
                })
        },

        isEmptyXs: function (value) {
            return value === null || value === ''
        },

        //获取实践学时，周学时
        _getXs: function () {
            var _self = this;

            store.getXs()
                .done(function (data) {
                    ko.mapping.fromJS(data, {}, _self.model.xS);
                    _self.model.xS.practise_xs(_self.isEmptyXs(_self.model.xS.practise_xs()) ? '' : (+_self.model.xS.practise_xs() / 3600).toFixed(2));
                    _self.model.xS.week_xs(_self.isEmptyXs(_self.model.xS.week_xs()) ? '' : (+_self.model.xS.week_xs() / 3600).toFixed(2));
                })
        },
        //获取前端信息展示方式
        _getPeriod: function () {
            var _self = this;

            store.getPeriod().done(function (data) {
                _self.model.periodSetting.period_display_type(data.period_display_type + '');
            });
        },
        //获取课程资源信息
        _getExtraInfos: function () {
            var _self = this;
            store.getExtraInfos()
                .done(function (data) {
                    _self.model.extraInfos.video_count(data.video_count);
                    _self.model.extraInfos.video_duration(data.video_duration);
                    _self.model.extraInfos.document_count(data.document_count);
                    _self.model.extraInfos.document_page_count(data.document_page_count);
                    _self.model.extraInfos.exercise_count(data.exercise_count);
                    _self.model.extraInfos.exercise_question_count(data.exercise_question_count);
                    _self.model.extraInfos.vr_count(data.vr_count);
                    _self.model.extraInfos.vr_total_time(data.vr_total_time);
                })
        },
        _validator: function () {
            var _self = this;
            $.validator.addMethod("examNumber", function (value, element) {
                if (_self.model.examConfig() == '1') {
                    return !isNaN(value) && value > 0;
                } else {
                    return true;
                }
            }, "请输入考试时长");
            $.validator.addMethod("timeRule", function (value, element) {
                return !isNaN(value) && value > 0;
            }, "请输入合法数字");

            $.validator.addMethod("xsRule", function (value, element) {
                if (value === null || value === '') return true;
                else return !isNaN(value);
            }, "请输入合法数字");

            $("#hoursetting").validate({
                rules: {
                    documentUnit: {
                        required: true,
                        timeRule: ''
                    },
                    exerciseUnit: {
                        required: true,
                        timeRule: ''
                    },
                    VRUnit: {
                        required: true,
                        timeRule: ''
                    },
                    adjustedTtime: {
                        required: true,
                        timeRule: '',
                        max: 999999
                    },
                    practiseXs: {
                        xsRule: '',
                        max: 999999
                    },
                    weekXs: {
                        xsRule: '',
                        max: 999999
                    },
                    timeRatio: {
                        required: true,
                        timeRule: ''
                    },
                    videoEffectMax: {
                        required: true,
                        digits: true,
                        max: 6000
                    },
                    documentEffectMax: {
                        required: true,
                        digits: true,
                        max: 6000
                    },
                    exerciseEffectMax: {
                        required: true,
                        digits: true,
                        max: 6000
                    },
                    VREffectMax: {
                        required: true,
                        digits: true,
                        max: 6000
                    }
                    // ,
                    // examUnit:{
                    //     examNumber:''
                    // }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                messages: {
                    documentUnit: {
                        required: '请输入时间',
                        max: '最大仅限500'
                    },
                    exerciseUnit: {
                        required: '请输入时间',
                        max: '最大仅限500'
                    },
                    VRUnit: {
                        required: '请输入时间',
                        max: '最大仅限99999'
                    },
                    adjustedTtime: {
                        required: '请输入学时',
                        max: '最大仅限999999'
                    },
                    practiseXs: {
                        max: '最大仅限999999'
                    },
                    weekXs: {
                        max: '最大仅限999999'
                    },
                    timeRatio: {
                        required: '请输入学时时长',
                        max: '最大仅限500'
                    },
                    videoEffectMax: {
                        required: '请输入0-6000的数字',
                        digits: '请输入整数',
                        max: '最大仅限6000'
                    },
                    documentEffectMax: {
                        required: '请输入0-6000的数字',
                        digits: '请输入整数',
                        max: '最大仅限6000'
                    },
                    exerciseEffectMax: {
                        required: '请输入0-6000的数字',
                        digits: '请输入整数',
                        max: '最大仅限6000'
                    },
                    VREffectMax: {
                        required: '请输入0-6000的数字',
                        digits: '请输入整数',
                        max: '最大仅限6000'
                    }
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'p',
                errorClass: 'help-inline',
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            })
        },

        //保存学时规则
        _toSave: function () {
            if (!$('#hoursetting').valid()) {
                return;
            }

            var _self = this,
                _courseHourRule;
            var periodData = {
                period_display_type: +_self.model.periodSetting.period_display_type()
            };
            var xsObj = {};

            if (_self.model.courseHourRule.enable_custom()) {
                _courseHourRule = ko.mapping.toJS(_self.model.courseHourRule);
                _courseHourRule.time_conversion_ratio = _courseHourRule.time_conversion_ratio * 60;
                _courseHourRule.exam_unit = _courseHourRule.exam_unit * 60;
//                _courseHourRule.adjusted_time = _courseHourRule.adjusted_time * 3600;
            } else {
                _courseHourRule = {
                    enable_custom: _self.model.courseHourRule.enable_custom()
//                    adjusted_time: _self.model.courseHourRule.adjusted_time() * 3600
                }
            }

            if (_self.model.adjustedConfig()) {
                _courseHourRule.adjusted_time = +_self.model.courseHourRule.adjusted_time() * 3600;
                xsObj.practise_xs = this.isEmptyXs(_self.model.xS.practise_xs()) ? '' : +_self.model.xS.practise_xs() * 3600;
                xsObj.week_xs = this.isEmptyXs(_self.model.xS.week_xs()) ? '' : +_self.model.xS.week_xs() * 3600;

                if (_courseHourRule.adjusted_time < ((this.isEmptyXs(xsObj.practise_xs) ? 0 : xsObj.practise_xs) + (this.isEmptyXs(xsObj.week_xs) ? 0 : xsObj.week_xs ))) {
                    $.fn.dialog2.helpers.alert("实践学时加周学时不能大于总的人为调整学时", {
                        close: function () {}
                    });

                    return;
                }

            } else {
                _courseHourRule.adjusted_time = 0;
                xsObj.practise_xs = '';
                xsObj.week_xs = '';
            }

            _courseHourRule.video_effect_max = _self.model.radio.video() == 1 ? _self.model.courseHourRule.video_effect_max() * 60 : -1;
            _courseHourRule.document_effect_max = _self.model.radio.doc() == 1 ? _self.model.courseHourRule.document_effect_max() * 60 : -1;
            _courseHourRule.exercise_effect_max = _self.model.radio.exercise() == 1 ? _self.model.courseHourRule.exercise_effect_max() * 60 : -1;
            _courseHourRule.vr_effect_max = _self.model.radio.vr() == 1 ? _self.model.courseHourRule.vr_effect_max() * 60 : -1;
            $.when(store.updateCourseHours(_courseHourRule), store.updatePeriod(periodData), store.updateXs(xsObj))
                .done(function () {
                    $.fn.dialog2.helpers.alert("保存成功", {
                        close: function () {
                            window.location.reload();
                        }
                    });
                })
        }
    };

    $(function () {
        viewModel.init();
    });

})(window, jQuery);