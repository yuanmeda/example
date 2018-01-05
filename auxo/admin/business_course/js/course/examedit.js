(function (window, $) {
    'use strict';
    //课程考试数据模型
    var viewModel = {
        // model: {
        //     exam: {
        //         enable: false, //是否上线
        //         custom_id: '', //课程id
        //         custom_type: '', //创建来源
        //         title: '', //考试名称
        //         begin_time: '', //考试开始时间
        //         end_time: '', //考试结束时间
        //         duration: '', //考试时长(秒)
        //         passing_score: '', //考试合格分数
        //         description: '', //考试描述
        //         exam_chance: '', //考试机会
        //         analysis_cond_status: '0', //解析策略类型->[0: NotAllow 不允许查看, 1: AfterSubmit 交卷后立即查看, 2: NoneExamChance 考试机会用完后查看, 3: TimeLimit 固定时间段查看]
        //         analysis_cond_data: '' //查看解析条件策略
        //     },
        //     enable: true, //是否可编辑
        //     //查看时间段
        //     analysisTime: {
        //         begin_time: '', //开始时间
        //         end_time: '' //结束时间
        //     },
        //     wordcount: 0 //介绍输入剩余字数
        // },
        // maxLen: 200, //详情最大输入
        _init: function () {
            // //ko监听数据
            // this.model = ko.mapping.fromJS(this.model);
            // //发布详情信息变化事件
            // this.model.exam.description.subscribe(function (val) {
            //     var _maxLen = this.maxLen;
            //     this.model.exam.description(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
            // }, this);
            // //获取输入字数计算值
            // this.model.wordcount = ko.computed(function () {
            //     var _maxLen = this.maxLen,
            //         _description = this.model.exam.description();
            //     return _description ? _maxLen - _description.length : _maxLen;
            // }, this);
            // //监听解析策略类型字段
            // this.model.exam.analysis_cond_status.subscribe(function (val) {
            //     var _model = this.model,
            //         _analysisTime = _model.analysisTime;
            //     if (+val !== 3) {
            //         _analysisTime.begin_time('');
            //         _analysisTime.end_time('');
            //     }
            // }, this);
            // //监听解析策略字段
            // this.model.exam.analysis_cond_data.subscribe(function (val) {
            //     var _model = this.model,
            //         _analysisTime = _model.analysisTime,
            //         _analysisRule = JSON.parse(this.model.exam.analysis_cond_data() || JSON.stringify(ko.mapping.toJS(this.model.analysisTime)));
            //     _analysisTime.begin_time(timeZoneTrans(_analysisRule.begin_time));
            //     _analysisTime.end_time(timeZoneTrans(_analysisRule.end_time));
            // }, this);
            // //监听是否可编辑
            // this.model.enable.extend({
            //     'notify': 'always'
            // }).subscribe(function (val) {
            //     if (val) {
            //         $('#formValidate :input').prop('disabled', true);
            //     }
            // }, this);
            //ko绑定作用域
            ko.applyBindings(this, LACALDATA.contentBind);
            // //获取考试基本信息及课程信息
            // this._examInfo().done(function () {
            //     $(document).trigger('showContent');
            // });
            // // $.when([this._examInfo(), this._courseInfo()])
            // //     .done(function() {
            // //         $(document).trigger('showContent');
            // //     });

            // //初始化laydate插件
            // this._layDateInit();
            // //开启表单验证
            // this._validator();

            /*跨域接受消息跳转*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_createExam = "open_course.course.exam.create_edit_exam";
            var message_key_paperList = "open_course.course.exam.paperList";
            n.addEventListener(message_key_createExam, function (receiveData) {
                if (receiveData.event_type == 'create_edit_exam') {
                    window.location.href = receiveData.data.returnUrl;
                }
            });
            n.addEventListener(message_key_paperList, function (receiveData) {
                if (receiveData.event_type == 'paperList') {
                    window.location.href = receiveData.data.returnUrl;
                }
            });
        },
        // /**
        //  * 初始化时间插件
        //  * @return {null} null
        //  */
        // _layDateInit: function () {
        //     var _self = this;
        //     $('#beginTime').datetimepicker({
        //         changeMonth: true,
        //         changeYear: true,
        //         language: 'zh-CN',
        //         showAnim: 'slideDown',
        //         dateFormat: "yy/mm/dd",
        //         timeFormat: "hh:mm:ss",
        //         showSecond: true
        //     });
        //     $('#endTime').datetimepicker({
        //         changeMonth: true,
        //         changeYear: true,
        //         language: 'zh-CN',
        //         showAnim: 'slideDown',
        //         dateFormat: "yy/mm/dd",
        //         timeFormat: "hh:mm:ss",
        //         showSecond: true
        //     });
        //     $('#acBeginTime').datetimepicker({
        //         changeMonth: true,
        //         changeYear: true,
        //         language: 'zh-CN',
        //         showAnim: 'slideDown',
        //         dateFormat: "yy/mm/dd",
        //         timeFormat: "hh:mm:ss",
        //         showSecond: true
        //     });
        //     $('#acEndTime').datetimepicker({
        //         changeMonth: true,
        //         changeYear: true,
        //         language: 'zh-CN',
        //         showAnim: 'slideDown',
        //         dateFormat: "yy/mm/dd",
        //         timeFormat: "hh:mm:ss",
        //         showSecond: true
        //     });
        // },
        // /**
        //  * 获取考试基本信息
        //  * @return {[type]} [description]
        //  */
        // _examInfo: function () {
        //     var _self = this,
        //         _defer = $.Deferred();
        //     _self.model.exam.custom_id(courseId);
        //     _self.model.exam.custom_type("business_course");
        //     if (examId) {
        //         store.examInfo(examId)
        //             .done(function (data) {
        //                 //赋值enable
        //                 _self.model.enable(data.enable);
        //                 //转换radio数据类型duration
        //                 data.analysis_cond_status = data.analysis_cond_status.toString();
        //                 data.duration = data.duration && data.duration / 60;
        //                 data.begin_time = data.begin_time && timeZoneTrans(data.begin_time);
        //                 data.end_time = data.end_time && timeZoneTrans(data.end_time);
        //                 //exam
        //                 ko.mapping.fromJS(data, {}, _self.model.exam);
        //             })
        //             .always(function () {
        //                 _defer.resolve();
        //             });
        //     } else {
        //         _self.model.enable(false);
        //         _defer.resolve();
        //     }
        //     return _defer.promise();
        // },
        // /**
        //  * 清除考试结束时间
        //  * @return {null} null
        //  */
        // clearDate: function () {
        //     this.model.exam.end_time('');
        // },
        // /**
        //  * 返回考试列表
        //  * @return {null} null
        //  */
        // doBack: function () {
        //     window.parentModel._setFullPath('1.2.4');
        // },
        // /**
        //  * 考试设置下一步
        //  * @return {null} null
        //  */
        // doNext: function () {
        //     window.parentModel._setFullPath('1.2.96');
        // },
        // /**
        //  * 保存操作事件
        //  * @return {null}            null
        //  */
        // doSave: function () {
        //     var _self = this,
        //         _postData = ko.mapping.toJS(viewModel.model.exam);
        //     if (!$('#formValidate').valid()) {
        //         return;
        //     }
        //     if (_postData.duration !== null && _postData.duration !== "") {
        //         _postData.duration = _postData.duration * 60;
        //     }
        //     if (_postData.analysis_cond_status === '3') {
        //         var _analysisDate = ko.mapping.toJS(_self.model.analysisTime);
        //         _analysisDate.begin_time = (_analysisDate.begin_time) && timeZoneTrans(_analysisDate.begin_time);
        //         _analysisDate.end_time = (_analysisDate.end_time) && timeZoneTrans(_analysisDate.end_time);
        //         if (!_analysisDate.begin_time) {
        //             Utils.alertTip('请填写时间段开始时间!', {
        //                 icon: 7
        //             });
        //             return;
        //         }
        //         if (!_analysisDate.end_time) {
        //             Utils.alertTip('请填写时间段结束时间!', {
        //                 icon: 7
        //             });
        //             return;
        //         }
        //         if (new Date(_analysisDate.begin_time).getTime() >= new Date(_analysisDate.end_time).getTime()) {
        //             Utils.alertTip('时间段结束时间必须大于开始时间!', {
        //                 icon: 7
        //             });
        //             return;
        //         }
        //         if (new Date(_analysisDate.begin_time).getTime() <= new Date(_postData.begin_time).getTime()) {
        //             Utils.alertTip('查卷时间段，开始时间要求在考试开始时间之后!', {
        //                 icon: 7
        //             });
        //             return;
        //         }
        //         _postData.analysis_cond_data = JSON.stringify(_analysisDate);
        //     } else {
        //         _postData.analysis_cond_data = "";
        //     }
        //     if (_postData.duration && _postData.end_time && (new Date(_postData.end_time).getTime() - new Date(_postData.begin_time).getTime()) / 1000 < _postData.duration) {
        //         Utils.alertTip('考试时长不得超过考试时间!', {
        //             icon: 7
        //         });
        //         return;
        //     }
        //     //时间格式转换
        //     _postData.begin_time = (_postData.begin_time) && timeZoneTrans(_postData.begin_time);
        //     _postData.end_time = (_postData.end_time) && timeZoneTrans(_postData.end_time);
        //     _postData.passing_score = +_postData.passing_score;
        //     if (examId) {
        //         _self._updateExam(_postData, examId);
        //     } else {
        //         _self._createExam(_postData);
        //     }
        // },
        // /**
        //  * 创建考试(成功后创建开考条件)
        //  * @param  {object} data 考试对象
        //  * @return {promise}      promise对象
        //  */
        // _createExam: function (data) {
        //     var _self = this;
        //     store.createExam(data)
        //         .done(function (data) {
        //             window.examId = data.id;
        //             $.when(Utils.msgTip('创建成功!'), _self._saveExamInfo(data.id))
        //                 .then(function () {
        //                     _self.doNext();
        //                 });
        //         });
        // },
        // /**
        //  * 创建考试开考条件
        //  * @return {promise}      promise对象
        //  */
        // _saveExamInfo: function (examId) {
        //     var _self = this,
        //         _postData = {
        //             exam_id: examId,
        //             progress_percent_condition: 0
        //         };
        //     return store.saveExamInfo(_postData);
        // },
        // /**
        //  * 更新考试
        //  * @param  {object} data 考试对象
        //  * @param  {string} id   考试id
        //  * @return {promise}      promise对象
        //  */
        // _updateExam: function (data, id) {
        //     var _self = this;
        //     store.updateExam(data, id)
        //         .done(function (data) {
        //             Utils.msgTip('更新成功!')
        //                 .done(function () {
        //                     _self.doNext();
        //                 });
        //         });
        // },
        // /**
        //  * 页面表单验证器
        //  * @return {null} null
        //  */
        // _validator: function () {
        //     $.validator.addMethod("title", function (value, element) {
        //         var reg = "^[a-zA-Z0-9 _\u4e00-\u9fa5]*$";
        //         return this.optional(element) || (new RegExp(reg, 'i').test(value));
        //     }, "你的命名含有非法字符，请改正");
        //     $.validator.addMethod("duration", function (val, element) {
        //         var re = /^([1-9]\d*)?$/;
        //         return this.optional(element) || (re.test(val));
        //     }, "考试时长必须为整数，请重新输入");
        //     $.validator.addMethod("durationLeTimeRange", function (val, element) {
        //         var beginTime = Date.parse($("#beginTime").val());
        //         var endTime = Date.parse($("#endTime").val());
        //         if (isNaN(beginTime) || isNaN(endTime))
        //             return true;
        //         var timeRangeInMilliS = new Date(endTime) - new Date(beginTime);
        //         if (val * 60 * 1000 > timeRangeInMilliS) {
        //             return false;
        //         }
        //         return true;
        //     }, "考试时长不能超过考试的时间范围");
        //     $.validator.addMethod("passingScore", function (val, element) {
        //         var re = /^\d+(\d{1})?$/;
        //         return this.optional(element) || (re.test(val));
        //     }, "请输入整数！");
        //     $.validator.addMethod("examChance", function (val, element) {
        //         var re = /^[1-9]\d*$/;
        //         return this.optional(element) || (re.test(val));
        //     }, "考试机会必须为整数，请重新输入");
        //     $.validator.addMethod("acBeginTime", function (value, element) {
        //         if (viewModel.model.exam.analysis_cond_status() != '3') {
        //             return true;
        //         }
        //         var beginTime = Date.parse($("#acBeginTime").val());
        //         if (isNaN(beginTime))
        //             return false;
        //         return true;
        //     }, "开始时间不能为空");
        //     $.validator.addMethod("acBeginTimeLtBeginTime", function (value, element) {
        //         if (viewModel.model.exam.analysis_cond_status() != '3') {
        //             return true;
        //         }
        //         var acBeginTime = Date.parse($("#acBeginTime").val());
        //         var beginTime = Date.parse($("#beginTime").val());
        //         if (isNaN(acBeginTime) || isNaN(beginTime))
        //             return false;
        //         return new Date(acBeginTime) >= new Date(beginTime);
        //     }, "开始时间不能小于考试开始时间");
        //     $.validator.addMethod("acBeginTimeLtEndTime", function (value, element) {
        //         if (viewModel.model.exam.analysis_cond_status() != '3') {
        //             return true;
        //         }
        //         var acBeginTime = Date.parse($("#acBeginTime").val());
        //         var endTime = Date.parse($("#endTime").val());
        //         if (isNaN(acBeginTime) || isNaN(endTime))
        //             return false;
        //         return new Date(acBeginTime) >= new Date(endTime);
        //     }, "开始时间不能小于考试结束时间");
        //     $.validator.addMethod("acEndTime", function (value, element) {
        //         if (viewModel.model.exam.analysis_cond_status() != '3') {
        //             return true;
        //         }
        //         var endTime = Date.parse($("#acEndTime").val());
        //         if (isNaN(endTime))
        //             return false;
        //         return true;
        //     }, "结束时间不能为空");
        //     $.validator.addMethod("acEndTimeLeAcBeginTime", function (value, element) {
        //         if (viewModel.model.exam.analysis_cond_status() != '3') {
        //             return true;
        //         }
        //         var beginTime = Date.parse($("#acBeginTime").val());
        //         var endTime = Date.parse($("#acEndTime").val());
        //         if (isNaN(beginTime) || isNaN(endTime))
        //             return false;
        //         return new Date(beginTime) < new Date(endTime);
        //     }, "结束时间需大于开始时间");
        //     $.validator.addMethod("script", function (value, element) {
        //         var re = /<script.*?>.*?<\/script>/ig;
        //         return !re.test(value);
        //     }, "考试介绍中包含危险信息");
        //     $("#formValidate").validate({
        //         rules: {
        //             title: {
        //                 required: true,
        //                 maxlength: 50
        //             },
        //             beginTime: {
        //                 required: true
        //             },
        //             duration: {
        //                 required: false,
        //                 maxlength: 7,
        //                 duration: ""
        //             },
        //             passingScore: {
        //                 required: true,
        //                 maxlength: 9,
        //                 passingScore: ""
        //             },
        //             examChance: {
        //                 required: true,
        //                 maxlength: 9,
        //                 examChance: ""
        //             }
        //         },
        //         messages: {
        //             title: {
        //                 required: "考试名称不能为空",
        //                 maxlength: $.validator.format("考试名称长度必须小于{0}字符"),
        //                 minlength: $.validator.format("考试名称长度必须大于{0}字符")
        //             },
        //             beginTime: {
        //                 required: "考试开始时间不能为空"
        //             },
        //             endTime: {
        //                 required: "考试结束时间不能为空"
        //             },
        //             duration: {
        //                 required: "考试时长不能为空",
        //                 maxlength: $.validator.format("考试时长必须小于{0}位数")
        //             },
        //             passingScore: {
        //                 required: "及格线不能为空",
        //                 maxlength: $.validator.format("及格线必须小于{0}位数")
        //             },
        //             examChance: {
        //                 required: "考试机会不能为空",
        //                 maxlength: $.validator.format("考试机会必须小于{0}位数")
        //             }
        //         },
        //         errorPlacement: function (erorr, element) {
        //             if (element.parent().find('p.help-inline.vm').length !== 0) {
        //                 element.parent().find('p.help-inline.vm').remove();
        //             }
        //             erorr.appendTo(element.parent());
        //         },
        //         errorElement: 'p',
        //         errorClass: 'help-inline vm',
        //         highlight: function (label) {
        //             $(label).closest('.c-group').addClass('error').removeClass('success');
        //         },
        //         success: function (label) {
        //             label.addClass('valid').closest('.c-group').removeClass('error').addClass('success');
        //         }
        //     });
        // },

        getIframeUrl: function (isCreate) {
            var url = "";
            if(isCreate) 
                url = examWebpage + '/' + projectCode + '/exam/create?__custom_id=' + courseId + '&__context_id=' + __context_id + '&__custom_type=businesscourse_2&sub_type=0&__parent_return_url=' + encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam') + '&__parent_prev_url=' + encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam') + '&__parent_next_url=' + encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam/' + examId + '/paper_setting');
            else 
                url = examWebpage + '/' + projectCode + '/exam/edit?id=' + examId + '&sub_type=0&__parent_return_url=' + encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam') + '&__parent_prev_url=' + encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam')+'&__parent_next_url='+encodeURIComponent(courseWebpage + '/' + projectCode + '/admin/course/' + courseId + '/exam/' + examId + '/paper_setting')
            var mac = Nova.getMacToB64(url)
            return url + "&__mac=" + mac;
        }

    };

    viewModel._init();

})(window, jQuery);
