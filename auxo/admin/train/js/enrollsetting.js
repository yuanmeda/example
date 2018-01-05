/**
 * @file 报名设置新建/编辑
 * @remark 非snake写法的属性字段都是与服务端无关的
 */

(function ($) {
    "use strict";

    /**
     * 通用工具类
     */
    var commonTool = {
        /**
         * 获取时间的time值
         *
         * @param dateStr
         * @returns {number}
         */
        getDataTime: function (dateStr) {
            return new Date(viewModel._toJSTime(dateStr).replace(/-/g, '/')).getTime();
        }
    };

    var store = {
        /**
         * 获取报名设置对象
         *
         * @returns {JQueryXHR|*}
         */
        get: function () {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/register_rule",
                dataType: "json",
                cache: false
            });
        },
        /**
         * 保存报名设置对象
         *
         * @param data
         * @returns {JQueryXHR|*}
         */
        save: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/trains/" + trainId + "/register_rule",
                type: 'put',
                dataType: "json",
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data),
                cache: false
            });
        },
        /**
         * 获取培训基本信息
         *
         * @returns {JQueryXHR|*}
         */
        getTrainDetail: function () {
            var url = "/" + projectCode + "/trains/" + trainId + "/detail";
            return $.ajax({
                url: url,
                cache: false
            });
        }
    };

    var viewModel = {
        /**
         * viewModel的数据对象
         *
         * @property info 报名设置对象
         */
        model: {
            head: {
                cover_url: '',
                enabled: false,
                title: '',
                course_count: '',
                exam_count: '',
                user_count: '',
                course_hour: 0,
                description: ''
            },
            info: {
                train_id: trainId,
                regist_type: "",
                regist_time_type: "",
                regist_start_time: "",
                regist_end_time: "",
                study_time_limit_type: "2",
                study_start_time: "",
                study_end_time: "",
                study_days: "",
                regist_num_limit: "0",
                regist_attention: ""
            }
        },
        /**
         * 表单数据的验证
         */
        observableValidate: function () {
            var that = this;
            ko.validation.rules["registEndTime"] = {
                validator: function (val) {
                    var start = that.model.info.regist_start_time(), end = that.model.info.regist_end_time();
                    if (end && start) {
                        return commonTool.getDataTime(end) - commonTool.getDataTime(start) >= 0;
                    } else {
                        return true;
                    }
                },
                message: "数据验证错误"
            };
            ko.validation.rules["studyEndTime"] = {
                validator: function (val) {
                    var start = that.model.info.study_start_time(), end = that.model.info.study_end_time();
                    if (end && start) {
                        return commonTool.getDataTime(end) - commonTool.getDataTime(start) >= 0;
                    } else {
                        return true;
                    }
                },
                message: "数据验证错误"
            };
            ko.validation.rules["everytimeStudyMins"] = {
                validator: function (val, length) {
                    if (!val)
                        return true;
                    return val <= length;
                },
                message: "数据验证错误"
            };
            ko.validation.registerExtenders();

            that.model.info.regist_start_time.extend({
                required: {
                    params: true,
                    message: "请输入报名开始时间",
                    onlyIf: function () {
                        return (that.model.info.regist_type() == 1 || that.model.info.regist_type() == 2) && that.model.info.regist_time_type() == 2;
                    }
                },
                registEndTime: {message: "报名结束时间不能小于开始时间"}
            });
            that.model.info.regist_end_time.extend({
                required: {
                    params: true,
                    message: "请输入报名结束时间",
                    onlyIf: function () {
                        return (that.model.info.regist_type() == 1 || that.model.info.regist_type() == 2) && that.model.info.regist_time_type() == 2;
                    }
                },
                registEndTime: {message: "报名结束时间不能小于开始时间"}
            });

            //regist_time group
            that.model.info.regist_time = ko.validatedObservable([that.model.info.regist_start_time, that.model.info.regist_end_time]);

            that.model.info.study_start_time.extend({
                required: {
                    params: true,
                    message: "请输入开课开始时间",
                    onlyIf: function () {
                        return that.model.info.study_time_limit_type() == 0;
                    }
                },
                studyEndTime: {message: "开课结束时间不能小于开始时间"}
            });
            that.model.info.study_end_time.extend({
                required: {
                    params: true,
                    message: "请输入开课结束时间",
                    onlyIf: function () {
                        return that.model.info.study_time_limit_type() == 0;
                    }
                },
                studyEndTime: {message: "开课结束时间不能小于开始时间"}
            });

            that.model.info.study_time = ko.validatedObservable([that.model.info.study_start_time, that.model.info.study_end_time]);

            that.model.info.study_days.extend({
                required: {
                    params: true,
                    message: "请输入天数",
                    onlyIf: function () {
                        return that.model.info.study_time_limit_type() == 1;
                    }
                },
                pattern: {
                    params: '^[1-9]*[1-9][0-9]*$',
                    message: "请输入正整数",
                    onlyIf: function () {
                        return that.model.info.study_time_limit_type() == 1;
                    }
                },
                max: {
                    params: 100000,
                    message: "天数不能大于十万",
                    onlyIf: function () {
                        return that.model.info.study_time_limit_type() == 1;
                    }
                }
            });
            that.model.info.regist_num_limit.extend({
                required: {
                    params: true,
                    message: "请输入报名人数",
                    onlyIf: function () {
                        return that.model.info.regist_type() != 0 && that.model.info.regist_type() != 3;
                    }

                },
                pattern: {
                    params: '^\\d+$',
                    message: "请输入非负整数",
                    onlyIf: function () {
                        return that.model.info.regist_type() != 0 && that.model.info.regist_type() != 3;
                    }
                },
                min: {
                    params: 0,
                    message: "报名人数不小于{0}",
                    onlyIf: function () {
                        return that.model.info.regist_type() != 0 && that.model.info.regist_type() != 3;
                    }
                },
                max: {
                    params: 100000,
                    message: "报名人数不能大于十万",
                    onlyIf: function () {
                        return that.model.info.regist_type() != 0 && that.model.info.regist_type() != 3;
                    }
                }
            });
            that.model.info.regist_attention.extend({
                //required: {params: true, message: "请输入报名注意事项"},
                maxLength: {
                    params: 2000,
                    message: "报名注意事项不能大于{0}字",
                    onlyIf: function () {
                        return that.model.info.regist_type() != 0;
                    }
                }
            });

            that.model.validatedInfo = ko.validatedObservable(that.model.info, {
                observable: true,
                live: true,
                deep: true
            });
        },
        /**
         * 数据与视图初始化
         */
        init: function () {
            //ko.options.deferUpdates = true;//启用全局延更
            var that = this;
            $("#js_registstarttime, #js_registendtime, #js_studystarttime, #js_studyendtime").datetimepicker({
                language: 'zh-CN',
                autoclose: true,
                // changeMonth: true,
                // changeYear: true,
                'data-date-format': "yyyy-mm-dd hh:ii"
            });
            that.model = ko.mapping.fromJS(that.model);
            that.model.info.regist_type.subscribe(function (val) {
                if (val == 0 || val == 3) {
                    this.model.info.regist_time_type("1");
                    this.model.info.regist_num_limit(0);
                } else {
                    var regist_time_type = this.model.info.regist_time_type();
                    if (regist_time_type && regist_time_type != 2) {
                        this.model.info.regist_start_time("");
                        this.model.info.regist_end_time("");
                        if ((this.model.info.regist_type() == 1 || this.model.info.regist_type() == 2) && this.model.info.study_time_limit_type() != 1) {
                            this.model.info.study_time_limit_type("2");
                        }
                    }
                }
            }, that);
            that.model.info.regist_time_type.subscribe(function (val) {
                if (val != 2) {
                    this.model.info.regist_start_time("");
                    this.model.info.regist_end_time("");
                    if ((this.model.info.regist_type() == 1 || this.model.info.regist_type() == 2) && this.model.info.study_time_limit_type() != 1) {
                        this.model.info.study_time_limit_type("2");
                    }
                }
            }, that);
            that.model.info.study_time_limit_type.subscribe(function (val) {
                if (val != 0) {
                    this.model.info.study_start_time("");
                    this.model.info.study_end_time("");
                }
                if (val == 1) {
                    this.model.info.study_days(0);
                }
                else {
                    this.model.info.study_days("");
                }
            }, that);
            that.observableValidate();
            ko.applyBindings(this, $("#js_enrollsetting")[0]);
            if (that.model.info.train_id.peek().length > 0) {
                that.getHead();
                that.getInfo();
            }
        },

        getHead: function () {
            var koHead = this.model.head,
                head = ko.mapping.toJS(koHead);
            store.getTrainDetail().done(function (data) {
                for (var key in head) {
                    if (head.hasOwnProperty(key)) {
                        koHead[key](data[key]);
                    }
                }
            });
        },

        /**
         * 获取任务对象。id不为空时
         */
        getInfo: function () {
            var _this = this;
            store.get().done(function (data) {
                if (!data) {
                    return;
                }

                if (!data.regist_start_time || !data.regist_end_time) {
                    data.regist_time_type = "1";
                } else {
                    data.regist_time_type = "2";
                    data.regist_start_time = _this._toJSTime(data.regist_start_time);
                    data.regist_end_time = _this._toJSTime(data.regist_end_time);
                }

                if (!!data.study_start_time && !!data.study_end_time) {
                    data.study_start_time = _this._toJSTime(data.study_start_time);
                    data.study_end_time = _this._toJSTime(data.study_end_time);
                }

                if (data.study_time_limit_type == null)
                    data.study_time_limit_type = "2";
                else
                    data.study_time_limit_type = data.study_time_limit_type.toString();
                data.regist_type = (data.regist_type != null && data.regist_type != undefined) ? data.regist_type.toString() : "1";
                ko.mapping.fromJS({info: data}, viewModel.model);
            });
        },
        _getTimeZone: function (dt) {
            var _self = this;
            var t = new Date(), gmt, date;
            date = _self._toJavaTime(dt);
            gmt = t.getTimezoneOffset() / 60 * (-100);
            if (dt) {
                return date + '.000+0' + gmt;
            }

        },
        _toJavaTime: function (dt) {
            if (dt) return dt.replace(" ", "T") + ":00";
            return dt;
        },
        _toJSTime: function (dt) {
            if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
            return dt;
        },
        save: function (mode) {
            var that = viewModel, modelInfo = that.model.info;
            if (!that.model.validatedInfo.isValid()) {
                that.model.validatedInfo.errors.showAllMessages();
                return;
            }
            if (modelInfo.regist_start_time() && modelInfo.regist_end_time() && modelInfo.study_start_time() && modelInfo.study_end_time()) {
                var regist_start_time = new Date(modelInfo.regist_start_time().replace(/-/g, '\/')).getTime();
                var regist_end_time = new Date(modelInfo.regist_end_time().replace(/-/g, '\/')).getTime();
                var study_start_time = new Date(modelInfo.study_start_time().replace(/-/g, '\/')).getTime();
                var study_end_time = new Date(modelInfo.study_end_time().replace(/-/g, '\/')).getTime();
                if (regist_start_time > study_start_time || regist_end_time > study_end_time) {
                    $.fn.dialog2.helpers.alert(regist_start_time > study_start_time ? '报名开始时间必须小于开课开始时间' : '报名结束时间必须小于开课结束时间');
                    return;
                }
            }
            var jsonInfo = ko.mapping.toJS(that.model.info);
            jsonInfo.regist_start_time = this._getTimeZone(jsonInfo.regist_start_time);
            jsonInfo.regist_end_time = this._getTimeZone(jsonInfo.regist_end_time);
            jsonInfo.study_start_time = this._getTimeZone(jsonInfo.study_start_time);
            jsonInfo.study_end_time = this._getTimeZone(jsonInfo.study_end_time);
            delete jsonInfo.regist_time_type;
            delete jsonInfo.train_id;
            store.save(jsonInfo).done(function () {
                if (mode == 1) {
                    location.href = "/" + projectCode + "/train/" + trainId + "/course";
                }
                else {
                    $.fn.dialog2.helpers.alert('保存成功');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery);
