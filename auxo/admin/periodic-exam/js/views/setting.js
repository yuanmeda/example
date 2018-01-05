
(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        get: function () {
            var url = service_domain + '/v1/periodic_exam_details/' + periodic_exam_id;
            return $.ajax({
                url: url,
                type: 'get',
                error: this.errorCallback
            });
        },
        create: function (data) {
            var url = service_domain + '/v1/periodic_exam_edits';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            var url = service_domain + '/v1/periodic_exam_edits/' + periodic_exam_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        getTagsTree: function () {
            var url = tagServiceDomain + '/v2/tags/tree';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false,
                data:{
                	custom_type: ''
                }
            });
        },
    };

    var viewModel = {
        model: {
            cover_url: '',
            exam: {
                name: ' ',		//考试名称
                cover: '',			//考试封面
                cover_url: '',		//封面地址
                description: '',	//考试说明
                pass_score: 0,		//及格分
                start_time: '',		//开始时间
                end_time: '',		//结束时间
                answer_time: 60,	//考试时长
                chance: 1,			//机会0  -1不限
                next_session_start_time: '',	//下一场开始时间
				retraining_strategy: {			//重练策略 [0: CHANGE 智能换题, 1: SAME_AGAIN 原题重练]
					type: 0
				},
                answer_strategy: {	//作答策略
                    model: 0 		//0: SINGLE_QUESTION_MODEL 单题模式, 1: PAPER_MODEL 整卷模式 *固定0*
                },
                analysis_strategy:{	//解析设置  [0: NOT_ALLOWED 不允许查看, 1: AFTER_SUBMIT 交卷后立即查看, 2: CHANCE_RUN_OUT 考试机会用完后查看, 3: TIME_LIMIT 固定时间段查看, 4: DURATION_LIMIT 考试截止后查看]
				    strategy: 0
				},
                period_config: {	//考试周期 type:[0: ONE_TIME 一次性, 1: PER_WEEK 每周, 2: PER_MONTH 每月, 3: CUSTOM 自定义时间]	
			        type: 0,
			        month: [],
			        week: [],
			        time_frames: []
			    },
        		enabled: true,		//启用

                tags: [],			//标签 

            },

            time_frames: [
                {
                    start_time: '',
                    end_time: ''
                }
            ],

            week_time_frames: [],
            month_time_frames: [],

            show: false,
            tagTree: null,
            showTagsViewFlag: false,
            checkAllWeeks: false,
            days: []
        },
        validatorRowCount: 0,
        init: function () {
            var _self = this;

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
            for(var i=1; i<32; i++){
            	viewModel.model.days.push(i);
            }

            viewModel.model = ko.mapping.fromJS(viewModel.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this, document.getElementById('periodic_exam_setting'));
            this._restore();

            this.datePickerInit();

			this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
 			this._validateInit();
            this._bindingsExtend();
            //this._initTagTree();获取标签，此功能暂不开放

            this.model.checkAllWeeks.subscribe(function (val) {
                var week = this.model.exam.period_config.week()
            	val ?
            		this.model.exam.period_config.week([2,3,4,5,6,7,1]) :
            		(week.length == 7 ? this.model.exam.period_config.week([]) : true)
            }, this);
            this.model.exam.period_config.week.subscribe(function (val) {
                this.model.checkAllWeeks(val.length == 7)
            }, this);
            this.model.exam.period_config.type.subscribe(function (val) {
                val == 0 ?
                    (this.model.exam.start_time(Date.toJSTime3(this.model.exam.start_time(), 0)), this.model.exam.end_time(Date.toJSTime3(this.model.exam.end_time(), 1))) :
                    (this.model.exam.start_time(Date.toJSDate(this.model.exam.start_time())), this.model.exam.end_time(Date.toJSDate(this.model.exam.end_time())))
            }, this);
            // this.model.exam.period_config.type.subscribe(function (val) {
            //     _self.model.exam.period_config.time_frames([])
            // })


        },
        _restore: function(){
        	var _self = this;
			if (periodic_exam_id) {
                store.get()
                    .done(function (data) {
                    	data = data.periodic_exam;
                        data.answer_time = data.answer_time / 60;
                        //data.visible_config = data.visible_config + "";
                        this.model.cover_url(data.cover_url);

                        var time_frames = data.period_config.time_frames || [];
                        var type = data.period_config.type;
                        if (time_frames.length) {
                            for(var i = 0, len = time_frames.length;i<len;i++){
                                time_frames[i].start_time = type == 3 ?
                                                                Date.toJSTime(time_frames[i].start_time) :
                                                                Date.toJSTime2(time_frames[i].start_time);
                                time_frames[i].end_time = type == 3 ?
                                                                Date.toJSTime(time_frames[i].end_time) :
                                                                Date.toJSTime2(time_frames[i].end_time);
                            }
                        }
                        if (time_frames.length && type == 3) {
                            _self.model.time_frames(time_frames)
                        }
                        if (time_frames.length) {
                            type == 1 && _self.model.week_time_frames(time_frames);
                            type == 2 && _self.model.month_time_frames(time_frames)
                        }

                        if (data.start_time) {
                            type == 0 ?
                                data.start_time = Date.toJSTime(data.start_time) :
                                data.start_time = Date.toJSDate(data.start_time)
                        }
                        if (data.end_time) {
                            type == 0 ?
                                data.end_time = Date.toJSTime(data.end_time) :
                                data.end_time = Date.toJSDate(data.end_time)
                        }


                        data.period_config.month = data.period_config.month || []
                        data.period_config.week = data.period_config.week || []

                        ko.mapping.fromJS(data, {}, this.model.exam);
                    }.bind(this));
            }
        },

        _initTagTree: function(){
        	var self = this;
            store.getTagsTree().done(function (data) {
            	ko.mapping.fromJS(data.children, {}, self.model.tagTree);
            });
        },
        addTimeFrame: function(){

            var type = this.model.exam.period_config.type()

            if(type == 1) {
                this.model.week_time_frames.push({
                    start_time: ' 00:00:00',
                    end_time: ' 23:59:59'
                });
            }

            if(type == 2) {
                this.model.month_time_frames.push({
                    start_time: ' 00:00:00',
                    end_time: ' 23:59:59'
                });
            }

            if(type == 3){
                this.model.time_frames.push({
                    start_time: '',
                    end_time: ''
                });
            }

        },

        datePickerInit: function () {

            $(document).on('mouseover', 'input[id^=datepicker-start]', function () {
                $(this).datetimepicker({
                    changeMonth: true,
                    changeYear: true,
                    language: 'zh-CN',
                    showAnim: 'slideDown',
                    dateFormat: "yy-mm-dd",
                    timeFormat: "",
                    showTime: false,
                    showHour: false,
                    showMinute: false,
                    showSecond: false,
                    minDate: (new Date()).format("yyyy-MM-dd")
                });
            })

            $(document).on('mouseover', 'input[id^=datepicker-end]', function () {
                $(this).datetimepicker({
                    changeMonth: true,
                    changeYear: true,
                    language: 'zh-CN',
                    showAnim: 'slideDown',
                    dateFormat: "yy-mm-dd",
                    timeFormat: "",
                    showTime: false,
                    showHour: false,
                    showMinute: false,
                    showSecond: false,
                    minDate: (new Date()).format("yyyy-MM-dd")
                });
            })

            $(document).on('mouseover', 'input[id^=timepicker]', function () {
                $(this).datetimepicker({
                    changeMonth: true,
                    changeYear: true,
                    language: 'zh-CN',
                    showAnim: 'slideDown',
                    dateFormat: "",
                    timeFormat: "hh:mm:ss",
                    showTime: true,
                    showHour: true,
                    showMinute: true,
                    showSecond: true,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    minDate: (new Date()).format("yyyy-MM-dd")
                });
            })

            $(document).on('mouseover', 'input[id^=datetimepicker]', function () {
                $(this).datetimepicker({
                    changeMonth: true,
                    changeYear: true,
                    language: 'zh-CN',
                    showAnim: 'slideDown',
                    dateFormat: "yy-mm-dd",
                    timeFormat: "hh:mm:ss",
                    showTime: true,
                    showHour: true,
                    showMinute: true,
                    showSecond: true,
                    hour: 0,
                    minute: 0,
                    second: 0,
                    minDate: (new Date()).format("yyyy-MM-dd")
                });
            })
        },

        removeTimeFrame: function(item){
            var type = this.model.exam.period_config.type()
            type == 1 && this.model.week_time_frames.remove(item)
            type == 2 && this.model.month_time_frames.remove(item)
            type == 3 && this.model.time_frames.remove(item)
        },

        chooseDay: function(item){
            this.model.exam.period_config.month.indexOf(item) == -1 ?
                this.model.exam.period_config.month.push(item) :
                this.model.exam.period_config.month.remove(item);
        },
        chooseTag: function(item){
        	this.model.exam.tags.remove(item)
        	this.model.exam.tags.push(item)
        },
        removeChoseTag: function(item){
        	this.model.exam.tags.remove(item)
        },
        showTagsView: function () {
        	this.model.showTagsViewFlag(!this.model.showTagsViewFlag())
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
                    var beginTime = new Date(params).getTime() ? params :  params + '00:00:00';
                    var endTime = new Date(obj).getTime() ? obj : obj + '23:59:59';
                    if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) {
                        return false;
                    } else {
                        return true;
                    }
                }.bind(this),
                message: '结束时间不能早于开始时间'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            var exam = this.model.exam;
            exam.name.extend({
                required: {
                    params: true,
                    message: '考试名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '考试名称最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5()（）《》.-]*$",
                    message: '不可含有非法字符'
                }
            });
            exam.start_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空',
                    onlyIf: function () {
                        return exam.period_config.type() != 3;
                    }
                }
            });
            exam.end_time.extend({
                required: {
                    value: true,
                    message: '结束时间不能为空',
                    onlyIf: function () {
                        return exam.period_config.type() != 3;
                    }
                },
                endTimeRules: {
                    params: exam.start_time,
                    onlyIf: $.proxy(function () {
                        return exam.start_time();
                    }, this)
                }
            });
            exam.answer_time.extend({
                required: {
                    value: true,
                    message: '考试时长不能为空'
                },
                maxLength: {
                    params: 7,
                    message: '考试时长最大{0}位'
                },
                pattern: {
                    params: "^([1-9][0-9]*)$",
                    message: '考试时长格式有误，请重新输入'
                }
            });
            exam.chance.extend({
                required: {
                    value: true,
                    message: '考试机会不能为空'
                },
                maxLength: {
                    params: 9,
                    message: '最大长度为{0}'
                },
                pattern: {
                    params: "^(-1|0|[1-9][0-9]*)$",
                    message: '考试机会格式有误，请重新输入'
                }
            });
        },
        _initUpload: function (uc, ue) {
            var _self = this,
                _swf = new SWFImageUpload({
                    flashUrl: static_url + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
                    width: 1024,
                    height: 1200,
                    htmlId: 'J_UploadImg',
                    pSize: '600|400|360|240|270|180',
                    uploadUrl: escape(storeUrl),
                    // uploadUrl: storeUrl,
                    imgUrl: this.model.cover_url || '',
                    showCancel: false,
                    limit: 1,
                    upload_complete: uc,
                    upload_error: ue
                });
            return _swf;
        },
        _uploadComplete: function (data) {
        	console.log('_uploadComplete');
            var _self = this;
            if (!data.Code) {
                // var _imgData = data.shift();
                this.model.exam.cover(data.store_object_id);
                this.model.cover_url(data.absolute_url);
                this.model.show(!this.model.show());
            } else {
                Utils.alertTip(data.Message, {
                    title: '警告',
                    icon: 7
                });
            }
        },
        _uploadError: function (code) {

        	console.log('_uploadError');
            var _msg;
            switch (code) {
                case 120:
                    _msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
                    break;
                case 110:
                    _msg = '上传文件超过规定大小';
                    break;
                default:
                    _msg = '上传失败，请稍后再试';
                    break;
            }
            Utils.alertTip(_msg);
        },
        _toggle: function () {
            this.model.show(!this.model.show());
            if (this.model.show()) {
                $('#hiddenTool').css('display', 'block');
            } else {
                $('#hiddenTool').css('display', 'none');
            }
        },
        getDayBetweenDate:function(start_time, end_time) {
            var st = new Date(start_time + '00:00:00'), et = new Date(end_time + '23:59:59'), arr = [], obj = {};
            var st_time = st.getTime(), et_time = et.getTime(), diff_time = et_time - st_time;
            for(var i = 0; i < diff_time; i += 86400000){
                var dt = new Date(st_time+i);
                var day = dt.getDate();
                if(!obj[day]){
                    arr.push(day)
                    obj[day] = 1;
                }
            }
            return arr;
        },
        checkDayIsInDateBetween: function (checked_date_arr, between_date_arr) {
            for(var i = 0, len = checked_date_arr.length;i<len;i++){
                if($.inArray(checked_date_arr[i], between_date_arr) == -1){
                    return false
                }
            }
            return true;
        },
        checkEndTimeIsAfterStartTime: function (start_time, end_time) {
            if (new Date(start_time).getTime() >= new Date(end_time).getTime()) {
                return false;
            } else {
                return true;
            }
        },
        checkTimeRangeIsOverlap: function (timeArray) {
            var type = this.model.exam.period_config.type()
            timeArray = ko.mapping.toJS(timeArray)
            var startTimeArr = [];
            var endTimeArr = [];

            for(var i = 0,len = timeArray.length; i < len; i++) {
                var start_time = type == 1 || type == 2 ? '2015-01-01' + timeArray[i].start_time: timeArray[i].start_time
                var end_time = type == 1 || type == 2 ? '2015-01-01' + timeArray[i].end_time: timeArray[i].end_time
                startTimeArr.push(start_time)
                endTimeArr.push(end_time)
            }
            var begin = startTimeArr.sort();
            var over = endTimeArr.sort();
            for(var k=1;k<begin.length;k++){
                if (begin[k] <= over[k-1]){
                    return false;
                }
            }
            return true;
        },
        /*保存*/
        prepareData: function (callBack) {
            var exam = this.model.exam,
                start_time = exam.start_time(),
                end_time = exam.end_time()
                type = exam.period_config.type(),
                month = exam.period_config.month(),
                week = exam.period_config.week(),
                time_frames = exam.period_config.time_frames(),
                pass_score = exam.pass_score();
            if(time_frames && time_frames.length > 0) {
                for(var i=0,len=time_frames.length;i<len;i++){
                    if(!time_frames[i].start_time || !time_frames[i].end_time){
                        $.fn.dialog2.helpers.alert("选择的时段中开始时间或结束时间不能为空");
                        return;
                    }
                    if(!this.checkEndTimeIsAfterStartTime('2015-01-01 '+time_frames[i].start_time, '2015-01-01 '+time_frames[i].end_time)){
                        $.fn.dialog2.helpers.alert("选择的时段中结束时间不能早于开始时间");
                        return;
                    }
                }
            }

            if(type == 1) {
                time_frames = this.model.week_time_frames()
                if(!this.checkTimeRangeIsOverlap(time_frames)){
                    $.fn.dialog2.helpers.alert("选择的时段中存在重叠");
                    return;
                }
                if(week.length == 0) {
                    $.fn.dialog2.helpers.alert("每周的日期选择不能为空");
                    return;
                }
            }

            if(type == 2) {
                time_frames = this.model.month_time_frames()
                if(!this.checkTimeRangeIsOverlap(time_frames)){
                    $.fn.dialog2.helpers.alert("选择的时段中存在重叠");
                    return;
                }
                if(start_time && end_time){
                    var between_date_arr = this.getDayBetweenDate(start_time, end_time);
                    if(!this.checkDayIsInDateBetween(month, between_date_arr)){
                        $.fn.dialog2.helpers.alert("选择的每月日期中含有不在起止时间范围内的日期");
                        return;
                    }
                }else {
                    $.fn.dialog2.helpers.alert("开始时间或结束时间不能为空");
                    return;
                }

                if(month.length == 0) {
                    $.fn.dialog2.helpers.alert("每月的日期选择不能为空");
                    return;
                }
            }

            if(type == 3) {
                var time_frames = ko.mapping.toJS(this.model.time_frames), times = [], max = '', min = '';
                if(time_frames.length == 0){
                    $.fn.dialog2.helpers.alert("自定义时间的起止时间不能为空");
                    return;
                }else {
                    for(var i=0,len=time_frames.length;i<len;i++){
                        if(!time_frames[i].start_time || !time_frames[i].end_time) {
                            $.fn.dialog2.helpers.alert("自定义时间的开始时间或结束时间不能为空");
                            return;
                        }

                        if(!this.checkEndTimeIsAfterStartTime(time_frames[i].start_time, time_frames[i].end_time)) {
                            $.fn.dialog2.helpers.alert("选择的时段中结束时间不能早于开始时间");
                            return;
                        }

                        times.push(time_frames[i].start_time)
                        times.push(time_frames[i].end_time)
                    }

                    if(!this.checkTimeRangeIsOverlap(time_frames)){
                        $.fn.dialog2.helpers.alert("选择的时段中存在重叠");
                        return;
                    }

                    max = times[0];
                    min = times[0];
                    for(var i=1,len=times.length;i<len;i++){
                        if(new Date(times[i]).getTime() >= new Date(max).getTime()){
                            max = times[i]
                        }
                        if(new Date(times[i]).getTime() <= new Date(min).getTime()){
                            min = times[i]
                        }
                    }
                    this.model.exam.start_time(Date.toJSDate(min));
                    this.model.exam.end_time(Date.toJSDate(max));
                }
            }

            if(!/^[1-9]\d*$/.test(pass_score)){
                $.fn.dialog2.helpers.alert("及格分必须为正整数");
                return;
            }

            var _self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }

            var data = ko.mapping.toJS(this.model.exam);
            data.name = data.name;
            data.answer_time = data.answer_time * 60;
            data.chance = data.chance;
            data.cover = data.cover;
            data.pass_score = data.pass_score * 1;

            var type = this.model.exam.period_config.type();

            if(type == 1 || type == 2) {
                var time_frames = type == 1 ?
                    ko.mapping.toJS(this.model.week_time_frames) :
                    ko.mapping.toJS(this.model.month_time_frames)
                for(var i = 0, len = time_frames.length;i<len;i++){
                    time_frames[i].start_time = '2015-01-01T' + $.trim(time_frames[i].start_time);
                    time_frames[i].end_time = '2015-01-01T' + $.trim(time_frames[i].end_time);
                }
                data.period_config.time_frames = time_frames
            }

            if(type == 3){
                var time_frames = ko.mapping.toJS(this.model.time_frames)
                for(var i = 0, len = time_frames.length;i<len;i++){
                    time_frames[i].start_time = time_frames[i].start_time.replace(' ', 'T');
                    time_frames[i].end_time = time_frames[i].end_time.replace(' ', 'T');
                }

                data.period_config.time_frames = time_frames

            }
            if(type == 0){
                data.start_time = data.start_time && data.start_time.replace(' ', 'T');
                data.end_time = data.end_time && data.end_time.replace(' ', 'T');
                data.period_config.time_frames = []
            }else {
                data.start_time = data.start_time && data.start_time.replace(' ', 'T00:00:00');
                data.end_time = data.end_time && data.end_time.replace(' ', 'T23:59:59');
            }

            var postData = {periodic_exam_param:data, tag_ids:[]};

           	ko.mapping.toJS(this.model.exam.tags).map(function(item){
           		postData.tag_ids.push(item.id)
           	});

            console.log(postData)

            if (periodic_exam_id) {
                store.update(postData).done(function (resData) {
                    $.fn.dialog2.helpers.alert("更新成功");
                    callBack && callBack();
                });
            } else {
                store.create(postData).done(function (resData) {
                    $.fn.dialog2.helpers.alert("创建成功");
                    periodic_exam_id = resData.periodic_exam.id;
                    callBack && callBack();
                    /*if (return_url) {
                    	//console.log(return_url.indexOf('?') != -1 ? return_url + '&id=' + resData.periodic_exam.id : return_url + '?id=' + resData.periodic_exam.id)
                        window.location.href = return_url.indexOf('?') != -1 ? return_url + '&id=' + resData.periodic_exam.id : return_url + '?id=' + resData.periodic_exam.id;
                    }*/
                });
            }
        },
        save: function () {
            this.prepareData.call(this);
        },
        saveThenNext: function () {
            this.prepareData.call(this, this.toNext);
        },
        cancel: function () {
            window.location.href = return_url;
        },
        toNext: function () {
            window.location.href = window.location.protocol + '//' + window.location.host + '/' + projectCode + '/admin/periodic_exam/bank?periodic_exam_id=' + periodic_exam_id;
        }
    };
    $(function () {
        viewModel.init();
    });

    window.model = viewModel;
    window.logModel = function(){
    	console.log(JSON.stringify(ko.toJSON(viewModel.model.exam)))
    }

}(jQuery));

Date.toJSTime = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5:$6");
    return dt;
};

Date.toJSTime2 = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, " $4:$5:$6");
    return dt;
};

Date.toJSTime3 = function (dt, bool) {
    if (dt) {
        dt = !bool ? dt + '00:00:00' : dt + '23:59:59'
        return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5:$6");
    }
    return dt;
};

Date.toJSDate = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 ");
    return dt;
};

Date.prototype.Format = function(fmt){
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}