(function ($) {

    "use strict";

    var limit_number;
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
    //数据仓库
    var store = {
        errorHandler: function (jqXHR) {
            var txt = JSON.parse(jqXHR.responseText);
            if (txt.cause) {
                $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
            } else {
                $.fn.dialog2.helpers.alert(txt.message);
            }
        },
        //获取培训列表
        getTrainList: function () {
            var url = '/' + projectCode + "/coin_certificates/trains";
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //获取课程列表
        getCourseList: function (data) {
            var url = '/' + projectCode + "/coin_certificates/trains/" + data.train_id + '/courses';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //获取章节列表
        getChapterList: function (data) {
            var url = '/' + projectCode + "/coin_certificates/courses/" + data.course_id + '/chapters';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //获取兑换券
        getCoinCertificate: function () {
            var url = '/' + projectCode + "/coin_certificates/" + coin_certificate_id;
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                cache: false
            });
        },
        //保存兑换券
        save: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/coin_certificates",
                type: 'POST',
                dataType: "json",
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data),
                cache: false
            });
        },
        //保存兑换券
        edit: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/coin_certificates/" + coin_certificate_id,
                type: 'PUT',
                contentType: 'application/json;charset=utf8',
                data: JSON.stringify(data),
                cache: false
            });
        }
    };
    //数据模型
    var viewModel = {
        model: {
            coinCertificate: {
                id: null,
                "name": "",
                "allow_receive_start_time": "",
                "allow_receive_end_time": "",
                "allow_receive_number": null,
                "allow_use_start_time": "",
                "allow_use_end_time": "",
                "remark": "string",
                "limit_object_type": "train",
                "limit_train_id": "",
                "limit_course_id": "",
                "limit_chapter_id": "",
                "limit_train_name": "全部培训",
                "limit_course_name": "全部课程",
                "limit_chapter_name": "全部章节",
                "customs": '',
                "unlockPurpose": ''
            },
            trainList: [],
            courseList: [],
            chapterList: [],
            readonly: false,
            modalTitle: ''
        },
        init: function () {
            var _self = viewModel;
            _self.model = ko.mapping.fromJS(_self.model);
            ko.applyBindings(_self, document.getElementById('coin-certificate-content'));
            viewModel.initComponents();
            if (coin_certificate_id) {
                viewModel.model.readonly(true);
                store.getCoinCertificate().done(function (data) {
                    limit_number = data.allow_receive_number;
                    var remark;
                    try {
                        remark = JSON.parse(data.remark);
                    } catch (e) {
                        remark = data.remark;
                    }
                    data.customs = remark.customs;
                    data.unlockPurpose = remark.unlockPurpose;
                    data.allow_receive_start_time = viewModel._toJSTime(data.allow_receive_start_time);
                    data.allow_receive_end_time = viewModel._toJSTime(data.allow_receive_end_time);
                    data.allow_use_start_time = viewModel._toJSTime(data.allow_use_start_time);
                    data.allow_use_end_time = viewModel._toJSTime(data.allow_use_end_time);
                    ko.mapping.fromJS(data, {}, viewModel.model.coinCertificate);
                    $('select[name=limit_train_id]').trigger('chosen:updated');
                    if (data.limit_course_name) {
                        $('select[name=limit_course_id]').trigger('chosen:updated');
                    }
                    if (data.limit_chapter_name) {
                        $('select[name=limit_chapter_id]').trigger('chosen:updated');
                    }
                    viewModel._validator();
                });
            } else {
                limit_number = 0;
                store.getTrainList().done(function (data) {
//                    data.unshift({train_id:0,train_name:'全部培训'});
                    ko.mapping.fromJS(data, {}, viewModel.model.trainList);
                    $('select[name=limit_train_id]').trigger('chosen:updated');
                    viewModel._validator();
                });
            }

        },
        changeType: function () {
            var type = viewModel.model.coinCertificate.limit_object_type();
            if (type == 'train') {
                viewModel.model.courseList([]);
                viewModel.model.chapterList([]);
//                viewModel.model.courseList([{course_id:null,course_name:'全部课程'}]);
//                viewModel.model.chapterList([{chapter_id:null,chapter_name:'全部章节'}]);
            } else if (type == 'course') {
                viewModel.model.chapterList([]);
//                viewModel.model.chapterList([{chapter_id:null,chapter_name:'全部章节'}]);
            }
            $('select[name=limit_course_id]').trigger('chosen:updated');
            $('select[name=limit_chapter_id]').trigger('chosen:updated');
        },
        changeTrain: function () {
//            console.log($('select[name=limit_train_id]').find("option:selected").text());
            if (viewModel.model.coinCertificate.limit_train_id()) {
                store.getCourseList({train_id: viewModel.model.coinCertificate.limit_train_id()}).done(function (data) {
//                    data.unshift({course_id:null,course_name:'全部课程'});
                    ko.mapping.fromJS(data, {}, viewModel.model.courseList);
                    $('select[name=limit_course_id]').trigger('chosen:updated');
                    viewModel.model.chapterList([
                        {chapter_id: null, chapter_name: '全部章节'}
                    ]);
                    $('select[name=limit_chapter_id]').trigger('chosen:updated');
                });
            } else {
                viewModel.model.courseList([]);
                viewModel.model.chapterList([]);
                viewModel.model.coinCertificate.limit_course_id('');
                viewModel.model.coinCertificate.limit_chapter_id('');
                $('select[name=limit_course_id]').trigger('chosen:updated');
                $('select[name=limit_chapter_id]').trigger('chosen:updated');
            }
        },
        changeCourse: function () {
            if (viewModel.model.coinCertificate.limit_course_id()) {
                store.getChapterList({course_id: viewModel.model.coinCertificate.limit_course_id()}).done(function (data) {
//                    data.unshift({chapter_id:null,chapter_name:'全部章节'});
                    ko.mapping.fromJS(data, {}, viewModel.model.chapterList);
                    $('select[name=limit_chapter_id]').trigger('chosen:updated');
                });
            } else {
                viewModel.model.chapterList([]);
                viewModel.model.coinCertificate.limit_chapter_id('');
                $('select[name=limit_chapter_id]').trigger('chosen:updated');
            }
        },
        initComponents: function () {
            $("#allow_receive_start_time, #allow_receive_end_time, #allow_use_start_time, #allow_use_end_time").datetimepicker({
                language: 'zh-CN',
                autoclose: true,
                'data-date-format': "yyyy-mm-dd hh:ii"
            });
//            $('select[name=limit_object_type]').chosen();
            $('select[name=limit_train_id]').chosen({
                no_results_text: '全部培训',
                width: '200px'
            }).trigger('chosen:updated');
            $('select[name=limit_course_id]').chosen({
                no_results_text: '全部课程',
                width: '200px'
            }).trigger('chosen:updated');
            $('select[name=limit_chapter_id]').chosen({
                no_results_text: '全部章节',
                width: '200px'
            }).trigger('chosen:updated');
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
        openSaveRemindTip: function () {
            viewModel.model.modalTitle('保存成功');
            $('#save_remind_tip').modal('show');
        },
        //保存
        save: function () {
            if (!$("#js-validateForm").valid())
                return;
            var jsonInfo = ko.mapping.toJS(viewModel.model.coinCertificate);
            if (coin_certificate_id) {
                var data = {
                    name: jsonInfo.name,
                    allow_receive_number: jsonInfo.allow_receive_number,
                    remark: JSON.stringify({customs: jsonInfo.customs, unlockPurpose: jsonInfo.unlockPurpose})
                };
                store.edit(data).done(function () {
                    viewModel.openSaveRemindTip();
                    window.location = '/' + projectCode + '/admin/coin_certificate';
                });
            } else {
                viewModel.model.coinCertificate.limit_train_name($('select[name=limit_train_id]').find("option:selected").text());
                viewModel.model.coinCertificate.limit_course_name($('select[name=limit_course_id]').find("option:selected").text());
                viewModel.model.coinCertificate.limit_chapter_name($('select[name=limit_chapter_id]').find("option:selected").text());
                jsonInfo.limit_train_name = $('select[name=limit_train_id]').find("option:selected").text();
                jsonInfo.limit_course_name = $('select[name=limit_course_id]').find("option:selected").text();
                jsonInfo.limit_chapter_name = $('select[name=limit_chapter_id]').find("option:selected").text();
                jsonInfo.allow_receive_start_time = this._getTimeZone(jsonInfo.allow_receive_start_time);
                jsonInfo.allow_receive_end_time = this._getTimeZone(jsonInfo.allow_receive_end_time);
                jsonInfo.allow_use_start_time = this._getTimeZone(jsonInfo.allow_use_start_time);
                jsonInfo.allow_use_end_time = this._getTimeZone(jsonInfo.allow_use_end_time);
                jsonInfo.remark = JSON.stringify({customs: jsonInfo.customs, unlockPurpose: jsonInfo.unlockPurpose});

//                console.log(jsonInfo);
//                return;
                delete jsonInfo.customs;
                delete jsonInfo.unlockPurpose;
                store.save(jsonInfo).done(function () {
                    viewModel.openSaveRemindTip();
                    window.location = '/' + projectCode + '/admin/coin_certificate'
                });
            }
        },
        _validator: function () {
            jQuery.validator.addMethod("receiveEndTime", function (value, element) {
                var start = viewModel.model.coinCertificate.allow_receive_start_time();
                if (!value || !start)
                    return true;
                return commonTool.getDataTime(value) - commonTool.getDataTime(start) >= 0;
            }, "领用结束时间不得早于领用开始时间");
            jQuery.validator.addMethod("useEndTime", function (value, element) {
                var start = viewModel.model.coinCertificate.allow_use_start_time();
                if (!value || !start)
                    return true;
                return commonTool.getDataTime(value) - commonTool.getDataTime(start) >= 0;
            }, "使用结束时间不得早于使用开始时间");
            jQuery.validator.addMethod("userEndTimeBigger", function (value, element) {
                var start = viewModel.model.coinCertificate.allow_receive_end_time();
                if (!value || !start)
                    return true;
                return commonTool.getDataTime(value) - commonTool.getDataTime(start) >= 0;
            }, "领用结束时间不得晚于使用结束时间");
            jQuery.validator.addMethod("receiveStartTimeSmaller", function (value, element) {
                var start = viewModel.model.coinCertificate.allow_receive_start_time();
                if (!value || !start)
                    return true;
                return commonTool.getDataTime(value) - commonTool.getDataTime(start) >= 0;
            }, "领用开始时间不得晚于使用结束时间");
            jQuery.validator.addMethod("userStartTimeBigger", function (value, element) {
                var start = viewModel.model.coinCertificate.allow_receive_start_time();
                if (!value || !start)
                    return true;
                return commonTool.getDataTime(value) - commonTool.getDataTime(start) >= 0;
            }, "使用开始时间不得早于领用开始时间");
            jQuery.validator.addMethod("checkLimitNumber", function (value, element) {
                if (limit_number) {
                    return value - limit_number >= 0;
                }
                return true;
            }, ("发放数量只能大等于" + limit_number + "(原兑换券发放数量)，不能减少"));
            $('#js-validateForm').validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: 50
                    },
                    limitCount: {
                        required: true,
                        min: 1,
                        digits: true,
                        maxlength: 50,
                        checkLimitNumber: true
                    },
                    allow_receive_start_time: {
                        required: true
                    },
                    allow_receive_end_time: {
                        required: true,
                        receiveEndTime: true
                    },
                    allow_use_start_time: {
                        required: true,
                        userStartTimeBigger: true
                    },
                    allow_use_end_time: {
                        required: true,
                        useEndTime: true,
                        userEndTimeBigger: true,
                        receiveStartTimeSmaller: true
                    },
                    unlockPurpose: {
                        required: false,
                        maxlength: 200
                    },
                    customs: {
                        required: false,
                        maxlength: 200
                    }
                },
                messages: {
                    title: {
                        required: '请输入兑换券方案',
                        maxlength: $.validator.format('兑换券方案不能多于50个字')
                    },
                    limitCount: {
                        required: '请输入发放数量',
                        min: '发放数量必须是正整数',
                        digits: '发放数量必须是正整数'
//                        maxlength: $.validator.format('培训摘要不能多于{50}个字')
                    },
                    allow_receive_start_time: {
                        required: '请输入领用开始时间'
                    },
                    allow_receive_end_time: {
                        required: '请输入领用结束时间'
                    },
                    allow_use_start_time: {
                        required: '请输入使用开始时间'
                    },
                    allow_use_end_time: {
                        required: '请输入使用结束时间'
                    },
                    unlockPurpose: {
                        maxlength: $.validator.format('解锁用途不能多于200个字')
                    },
                    customs: {
                        maxlength: $.validator.format('目标客户不能多于200个字')
                    }
                },
                onkeyup: function (element) {
                    $(element).valid();
                },
                onsubmit: true,
                errorElement: 'p',
                errorClass: 'help-line',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                highlight: function (label) {
                    $(label).closest('.form-group').addClass('text-danger has-error').removeClass('text-success');
                },
                success: function (label) {
                    $(label).closest('.form-group').removeClass('has-error').removeClass('text-danger');
                    label.addClass('valid');
                    if (label.closest('.form-group').find('p').length != label.closest('.form-group').find('p.valid').length) {
                        (label).closest('.form-group').addClass('text-danger has-error').removeClass('text-success');
                        return;
                    }

                    label.closest('.form-group').addClass('text-success');
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery);