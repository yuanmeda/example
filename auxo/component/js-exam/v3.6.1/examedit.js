(function(w, $) {
    function Model(params) {
        this.model = params.exam;
        this.model.description.subscribe(function(val) {
            this.desEditor.html(val);
        }, this);
        this._init();
    };

    Model.prototype = {
        /**
         * 初始化
         */
        _init: function() {
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
            // $('#beginTime', '#endTime', '#acBeginTime', '#acEndTime').datetimepicker({
            //     changeMonth: true,
            //     changeYear: true,
            //     dateFormat: 'yy-mm-dd'
            // })

            this._validator();
            this._editor();
        },
        //富文本编辑器
        _editor: function() {
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
                afterChange: function() {
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
        /**
         * 验证规则
         * @return {[type]} [description]
         */
        _validator: function() {
            var self = this;
            jQuery.validator.addMethod("title", function(value, element) {
                var reg = "^[a-zA-Z0-9 _\u4e00-\u9fa5]*$";
                return this.optional(element) || (new RegExp(reg, 'i').test(value));
            }, "你的命名含有非法字符，请改正");
            $.validator.addMethod("endTime", function(value, element) {
                var beginTime = Date.parse($("#beginTime").val().replace(/-/g, "/"));
                var endTime = Date.parse($("#endTime").val().replace(/-/g, "/"));
                if (isNaN(beginTime) || isNaN(endTime))
                    return true;
                return new Date(beginTime) < new Date(endTime);
            }, "结束时间需大于开始时间");
            $.validator.addMethod("duration", function(val, element) {
                var re = /^([1-9]\d*)?$/;
                return this.optional(element) || (re.test(val));
            }, "考试时长格式有误，请重新输入");
            $.validator.addMethod("durationLeTimeRange", function(val, element) {
                var beginTime = Date.parse($("#beginTime").val().replace(/-/g, "/"));
                var endTime = Date.parse($("#endTime").val().replace(/-/g, "/"));
                if (isNaN(beginTime) || isNaN(endTime))
                    return true;
                var timeRangeInMilliS = new Date(endTime) - new Date(beginTime);
                if (val * 60 * 1000 > timeRangeInMilliS) {
                    return false;
                }
                return true;
            }, "考试时长不能超过考试的时间范围");
            $.validator.addMethod("passingScore", function(val, element) {
                var re = /^\d+$/;
                return this.optional(element) || (re.test(val));
            }, "及格线格式有误，请重新输入");
            $.validator.addMethod("examChance", function(val, element) {
                var re = /^[1-9]\d*$/;
                return this.optional(element) || (re.test(val));
            }, "考试机会格式有误，请重新输入");
            $.validator.addMethod("acBeginTime", function(value, element) {
                if (self.model.analysis_cond_status() != '3') {
                    return true;
                }
                var beginTime = Date.parse($("#acBeginTime").val().replace(/-/g, "/"));
                if (isNaN(beginTime))
                    return false;
                return true;
            }, "开始时间不能为空");
            $.validator.addMethod("acBeginTimeLtBeginTime", function(value, element) {
                if (self.model.analysis_cond_status() != '3') {
                    return true;
                }
                var acBeginTime = Date.parse($("#acBeginTime").val().replace(/-/g, "/"));
                var beginTime = Date.parse($("#beginTime").val().replace(/-/g, "/"));
                if (isNaN(acBeginTime) || isNaN(beginTime))
                    return false;
                return new Date(acBeginTime) >= new Date(beginTime);
            }, "开始时间不能小于考试开始时间");
            $.validator.addMethod("acBeginTimeLtEndTime", function(value, element) {
                if (self.model.analysis_cond_status() != '3') {
                    return true;
                }
                var acBeginTime = Date.parse($("#acBeginTime").val().replace(/-/g, "/"));
                var endTime = Date.parse($("#endTime").val().replace(/-/g, "/"));
                if (isNaN(acBeginTime) || isNaN(endTime))
                    return false;
                return new Date(acBeginTime) >= new Date(endTime);
            }, "开始时间不能小于考试结束时间");
            $.validator.addMethod("acEndTime", function(value, element) {
                if (self.model.analysis_cond_status() != '3') {
                    return true;
                }
                var endTime = Date.parse($("#acEndTime").val().replace(/-/g, "/"));
                if (isNaN(endTime))
                    return false;
                return true;
            }, "结束时间不能为空");
            $.validator.addMethod("acEndTimeLeAcBeginTime", function(value, element) {
                if (self.model.analysis_cond_status() != '3') {
                    return true;
                }
                var beginTime = Date.parse($("#acBeginTime").val().replace(/-/g, "/"));
                var endTime = Date.parse($("#acEndTime").val().replace(/-/g, "/"));
                if (isNaN(beginTime) || isNaN(endTime))
                    return false;
                return new Date(beginTime) < new Date(endTime);
            }, "结束时间需大于开始时间");
            $.validator.addMethod("script", function(value, element) {
                var re = /<script.*?>.*?<\/script>/ig;
                return !re.test(value);
            }, "考试介绍中包含危险信息");
            $("#edit").validate({
                rules: {
                    title: {
                        required: true,
                        maxlength: 50
                    },
                    beginTime: {
                        required: true
                    },
                    endTime: {
                        required: false,
                        endTime: ""
                    },
                    duration: {
                        required: false,
                        maxlength: 7,
                        duration: ""
                    },
                    passingScore: {
                        required: true,
                        maxlength: 9,
                        passingScore: ""
                    },
                    examChance: {
                        required: true,
                        maxlength: 9,
                        examChance: ""
                    },
                    acStatus: {
                        required: true
                    },
                    acBeginTime: {
                        acBeginTime: "",
                        acBeginTimeLtBeginTime: ""
                    },
                    acEndTime: {
                        acEndTime: "",
                        acEndTimeLeAcBeginTime: ""
                    },
                    description: {
                        required: false,
                        maxlength: 1000,
                        script: ""
                    },
                    dayPeopleLimit: {
                        required: true,
                        digits: true,
                        min: 0
                    },
                    maxPeopleLimit: {
                        required: true,
                        digits: true,
                        min: 0
                    }
                },
                messages: {
                    title: {
                        required: "考试名称不能为空",
                        maxlength: $.validator.format("考试名称长度最多{0}字符"),
                        minlength: $.validator.format("考试名称长度最低{0}字符")
                    },
                    beginTime: {
                        required: "考试开始时间不能为空"
                    },
                    endTime: {
                        required: "考试结束时间不能为空"
                    },
                    duration: {
                        required: "考试时长不能为空",
                        maxlength: $.validator.format("考试时长最多{0}位数")
                    },
                    passingScore: {
                        required: "及格线不能为空",
                        maxlength: $.validator.format("及格线必须最多{0}位数")
                    },
                    examChance: {
                        required: "考试机会不能为空",
                        maxlength: $.validator.format("考试机会最多{0}位数")
                    },
                    acStatus: {
                        required: "查看解析设置不能为空"
                    },
                    description: {
                        required: "考试介绍不能为空",
                        maxlength: $.validator.format("考试介绍最多{0}个字")
                    },
                    dayPeopleLimit: {
                        required: "输入值不能为空",
                        digits: "输入值必须为整数",
                        min: "输入值不能小于0"
                    },
                    maxPeopleLimit: {
                        required: "输入值不能为空",
                        digits: "输入值必须为整数",
                        min: "输入值不能小于0"
                    }
                },
                // onkeyup: function (element) {
                //     $(element).valid();
                // },
                errorPlacement: function(erorr, element) {
                    erorr.appendTo(element.parent());
                },
                errorElement: 'p',
                errorClass: 'help-inline',
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function(label) {
                    label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                }
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
            createViewModel: function(params, tplInfo) {
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