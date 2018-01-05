/**
 * 课程编辑新建
 * 全局变量：projectId/courseId(编辑时存在)
 */
;(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //获取业务课程配置
        getStudySet: function () {
            var url = '/' + projectCode + '/courses/' + courseId + '/configs';
            return $.ajax({
                url: url
            });
        },
        //更新业务课程配置
        updateStudySet: function (data) {
            var url = '/' + projectCode + '/courses/' + courseId + '/configs';

            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'PUT'
            });
        }
    };
    var viewModel = {
        model: {
            noChapterLock: noChapterLock,
            config: {
                sequential: '',
                drawable: '',
                skippable: '',
                page_require_time: '',
                resource_downloadable: '',
                study_time_limit_type: '',
                study_start_time: '',
                study_end_time: '',
                study_days: ''
            }
        },
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('content'));
            this.model.config.skippable.subscribe(function (val) {
                if (val == 'false') {
                    this.model.config.page_require_time(0);
                    this._resetForm();
                }
            }, this);
            this.model.config.study_time_limit_type.subscribe(function (val) {
                if (val == '1') {
                    this.model.config.study_days("");
                    this.model.config.study_start_time("");
                    this.model.config.study_end_time("");
                    this._resetForm();
                } else if (val == '2') {
                    this.model.config.study_days("");
                    this._resetForm();
                } else {
                    this.model.config.study_start_time("");
                    this.model.config.study_end_time("");
                    this._resetForm();
                }
            }, this);
            $(document).trigger('showContent');
            this._getStudySet();
            this.initDatePicker();
            this._validator();
        },
        initDatePicker: function () {
            //课程有效时间
            $('#study_s,#study_e').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
        },
        _getStudySet: function () {
            store.getStudySet().done($.proxy(function (data) {
                this.model.config.sequential(data.sequential + '');
                this.model.config.drawable(data.drawable + '');
                this.model.config.skippable(!data.skippable + '');
                this.model.config.page_require_time(data.page_require_time);
                this.model.config.resource_downloadable(data.resource_downloadable.toString());
                this.model.config.study_time_limit_type(data.study_time_limit_type.toString());
                if (data.study_start_time) {
                    this.model.config.study_start_time(timeZoneTrans(data.study_start_time));
                }
                if (data.study_end_time) {
                    this.model.config.study_end_time(timeZoneTrans(data.study_end_time));
                }
                this.model.config.study_days(data.study_days);
            }, this));
        },
        formatTime: function (time) {
            return time ? time.split('.')[0].replace('T', ' ').substring(0, time.split('.')[0].replace('T', ' ').length - 3) : '';
        },
        _updateConfig: function () {
            if (!$('#studysetting').valid())return;
            var _self = this, putData, config = this.model.config,
                study_time_limit_type = config.study_time_limit_type(),
                study_start_time = config.study_start_time() ? new Date(config.study_start_time()).getTime() : null,
                study_end_time = config.study_end_time() ? new Date(config.study_end_time()).getTime() : null;
            if (study_time_limit_type == "2") {
                if (!study_start_time) {
                    Utils.alertTip('学习开始时间必填', {
                        icon: 7
                    });
                    return;
                }
                if (!study_end_time) {
                    Utils.alertTip('学习结束时间必填', {
                        icon: 7
                    });
                    return;
                }
                if (study_start_time - study_end_time > 0) {
                    Utils.alertTip('学习开始时间应小于学习结束时间', {
                        icon: 7
                    });
                    return;
                }
            }
            if (study_time_limit_type == "3") {
                if (!/^[0-9]+$/.test(config.study_days()) || config.study_days().length > 5 || +config.study_days() === 0) {
                    Utils.alertTip('请填写有效学习天数(正整数输入，最多5位数，不允许输入负数)！', {
                        icon: 7
                    });
                    return;
                }
            }
            putData = {
                drawable: _self.model.config.drawable() === "true",
                sequential: _self.model.config.sequential(),
                skippable: !(_self.model.config.skippable() === "true"),
                page_require_time: _self.model.config.page_require_time(),
                resource_downloadable: _self.model.config.resource_downloadable(),
                study_time_limit_type: study_time_limit_type,
                study_start_time: config.study_start_time() ? timeZoneTrans(config.study_start_time()) : null,
                study_end_time: config.study_end_time() ? timeZoneTrans(config.study_end_time()) : null,
                study_days: config.study_days() || null
            };
            if (study_time_limit_type)
                store.updateStudySet(putData).done(function (data) {
                    $.fn.dialog2.helpers.alert('更新成功', {
                        close: function () {
                            // window.location.reload();
                        }
                    });
                }).fail(function () {
                    $.fn.dialog2.helpers.alert('更新失败', {
                        close: function () {
                            window.location.reload();
                        }
                    });
                })
        },
        _resetForm: function () {
            var form = $('#studysetting');
            form.validate().resetForm();
            form.find('.success').removeClass('success');
            form.find('.error').removeClass('error');
        },
        _validator: function () {
            $("#studysetting").validate({
                rules: {
                    docTime: {
                        digits: true,
                        max: 6000
                    }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                messages: {
                    docTime: {
                        required: '请输入0-6000的数字',
                        digits: '请输入正整数',
                        max: '最大仅限6000'
                    }
                },
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'span',
                errorClass: 'help-inline',
                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
            })
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);