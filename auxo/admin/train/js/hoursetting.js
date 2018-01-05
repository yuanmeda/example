;
(function ($, window) {
    'use strict';
    var courseType = {
        require: 0,
        choose: 1
    };
    //数据仓库
    var store = {
        updateHourSetting: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/pass_criteria',
                dataType: 'json',
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getTrainDetail: function () {
            var url = '/' + projectCode + '/trains/' + trainId + '/detail';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        updateSelectCourseConfig: function (data) {
            var url = '/' + projectCode + '/trains/' + trainId + '/select_course_config';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'json'
            });
        },
        getPeriodSetting: function () {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId,
                dataType: 'json',
                cache: false
            });
        },
        updatePeriodSetting: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId,
                dataType: 'json',
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        }
    };
    //列表数据模型
    var viewModel = {
        model: {
            head: {
                cover_url: '',
                enabled: false,
                title: '',
                course_count: '',
                exam_count: '',
                user_count: '',
                course_hour: 0,
                description: '',
                require_hour: 0,
                option_hour: 0
            },
            hoursetting: {
                require_hour: 0,
                option_hour: 0,
                require_course_count: 0,
                option_course_count: 0
            },
            periodsetting: {
                period_display_type: '0'
            },
            selectCourse: {
                "select_course_config": false,
                "select_course_caption": "string"
            }
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            var _self = this;
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this);
            //基本信息
            this._getHead();
            this._validator();
            // $("#OptionalCourseHour").keyup(function() {
            //     _self.model.hoursetting.option_hour(Number($("#OptionalCourseHour").val()));
            // });
            this.model.selectCourse.select_course_config.subscribe(function (flag) {
                if (!flag) this.model.selectCourse.select_course_caption('');
            }, this);
        },
        _getHead: function () {
            var _self = this,
                koHead = this.model.head,
                head = ko.mapping.toJS(koHead);
            store.getTrainDetail().done(function (data) {
                for (var key in head) {
                    if (head.hasOwnProperty(key)) {
                        koHead[key](data[key]);
                    }
                }
                _self.model.hoursetting.require_hour(data.demand_require_hour);
                _self.model.hoursetting.option_hour(data.demand_option_hour);
                _self.model.hoursetting.require_course_count(data.require_course_count);
                _self.model.hoursetting.option_course_count(data.option_course_count);

                _self.model.selectCourse.select_course_config(data.select_course_config == 1);
                _self.model.selectCourse.select_course_caption(data.select_course_caption);

                $('#js-content').show();
            });
            store.getPeriodSetting().done(function (data) {
                _self.model.periodsetting.period_display_type(data.period_display_type + '');
            });
        },
        _updateHourSetting: function () {
            var _self = this,
                selectCourse = ko.mapping.toJS(this.model.selectCourse);
            if (!$("#edit").valid()) {
                return;
            }
            var data = {
                option_hour: _self.model.hoursetting.option_hour()
            };
            var periodData = {
                "period_display_type": +_self.model.periodsetting.period_display_type()
            };
            selectCourse.select_course_config = +selectCourse.select_course_config;
            $.when(store.updateHourSetting(data), store.updatePeriodSetting(periodData))
                .done(function () {
                    store.updateSelectCourseConfig(selectCourse).done(function () {
                        Utils.msgTip('保存成功!');
                    });
                });
        },
        _validator: function () {
            $.validator.addMethod('fixedtow', function (value) {
                return /^((\d+)|(\d+\.\d{1,2}0*))$/.test(value);
            }, "学时最多保留两位小数且只能为数值");
            //表单验证
            $("#edit").validate({

                rules: {
                    OptionalCourseHour: {
                        required: true,
                        fixedtow: '',
                        range: [0, 10000]
                    },
                    select_course_caption: {
                        maxlength: 200
                    }
                },
                messages: {
                    OptionalCourseHour: {
                        required: "学时数不能为空",
                        range: "学时数范围必须在0到10000之间"
                    },
                    select_course_caption: {
                        maxlength: "选课说明不能超过200个字"
                    }
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                onkeyup: false,
                errorElement: 'p',
                errorClass: 'help-inline',
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').addClass('success');
                }
            });
        }
    };
    /**
     * 执行程序
     */
    $(function () {
        viewModel._init();
    });
})(jQuery, window);