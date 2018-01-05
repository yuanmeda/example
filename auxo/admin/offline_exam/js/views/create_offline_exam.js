
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
        getUploadSession: function() {
            var url = periodic_exam_gateway + '/v1/upload_session';
            return $.ajax({
                url: url,
                type: 'get',
                cache: false
            })
        },
        // 创建离线课程
        createOfflineExam: function(data) {
            var url = elearningServiceUri + '/v1/online_exam_edits'
            return $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                cache: false,
                data: JSON.stringify(data)
            })
        },

        getMixOrgTree: function () {
            var url = 'http://opencourse2-gateway.debug.web.nd/v1/open_courses/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
    };

    var viewModel = {
        model: {
            readonly: '',            // 配置是否可以修改
            treePattern: '',         // 显示哪一种树模型
            cover_url: '',           // 封面路由
            exam: {
                name: '',		     // 考试名称
                cover: '',			 // 考试封面url
                description: '',	 // 考试说明
                pass_score: 0,		 // 及格分
                start_time: '',		 // 开始时间
                end_time: '',		 // 结束时间
                address: '',         // 考试地点
                affiliation: '',     // 从属关系
                visible_config: '',  // 可见范围
                m_node_ids: [],      // 组织树ID列表
                s_node_ids: [],      // 可见范围的组织树ID列表
                isUploadAnswer: '',  // 是否上传答案
                period_config: {	 // 考试周期 type:[0: ONE_TIME 一次性, 1: PER_WEEK 每周, 2: PER_MONTH 每月, 3: CUSTOM 自定义时间]	
			        type: 0,
			        month: [],
			        week: [],
			        time_frames: []
			    },
                attachments: [],     // 附件 
                tags: [],			 // 标签 
            },
            time_frames: [
                {
                    start_time: '',
                    end_time: ''
                }
            ],
            week_time_frames: [],
            month_time_frames: [],
            days: [],
            checkAllWeeks: false,
            show: false,
            uploadTarget: ''
        },
        uploadSetting: {
            session: '',
            path: '',
            serverUrl: '',
            serviceId: ''
        },
        validatorRowCount: 0,
        init: function () {
            var _self = this;
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: { deep: true, live: true, observable: true }
            }, true);
            for(var i=1; i<32; i++){ viewModel.model.days.push(i); }

            viewModel.model = ko.mapping.fromJS(viewModel.model);

            // 初始化组织树
            $.when(store.getUploadSession(), store.getMixOrgTree())
            .then(function(uploadSession, mixOrgTree) {

                var treeData = mixOrgTree[0];
                var uploadSessionData = uploadSession[0];

                _self.uploadSetting.session = uploadSessionData.session;
                _self.uploadSetting.path = uploadSessionData.path;
                _self.uploadSetting.serverUrl = uploadSessionData.server_url;
                _self.uploadSetting.serviceId = uploadSessionData.server_id;

                console.log(_self.uploadSetting)

                var manager = treeData.manager || {};
                _self.mTreeOpts = {
                    readonly: _self.model.readonly,
                    nodeIds: _self.model.exam.m_node_ids,
                    orgId: orgId,
                    multiple: true,
                    projectCode: projectCode,
                    // host1: '/v1/open_courses',
                    host1: 'http://opencourse2-gateway.debug.web.nd/v1/open_courses', // mock-data
                    host2: elearningServiceUri,
                    visible: true,
                    managerNodes: manager.manager_nodes,
                    hasManager: manager.has_manage_project,
                    initData: treeData.org_tree
                }
                _self.sTreeOpts = $.extend({}, _self.mTreeOpts, {
                    nodeIds: _self.model.exam.s_node_ids,
                    multiple: true
                })
               
                _self.validationsInfo = ko.validatedObservable(this.model, {
                    deep: true
                });
                ko.applyBindings(_self, document.getElementById('create_offline_exam'));

                _self.datePickerInit();
                _self._initUpload();
                _self._validateInit();
                _self._bindingsExtend();

                // toggle 全选星期
                _self.model.checkAllWeeks.subscribe(function (val) {
                    var week = _self.model.exam.period_config.week();
                    val ? 
                        _self.model.exam.period_config.week([1,2,3,4,5,6,7]) : 
                        (week.length == 7 ? 
                            _self.model.exam.period_config.week([]) : true)
                }, _self);

                _self.model.exam.period_config.week.subscribe(function (val) {
                    _self.model.checkAllWeeks(val.length == 7)
                }, _self);

                _self.model.exam.period_config.type.subscribe(function (val) {
                    val == 0 ?
                        (_self.model.exam.start_time(Date.toJSTime3(_self.model.exam.start_time(), 0)), _self.model.exam.end_time(Date.toJSTime3(_self.model.exam.end_time(), 1))) :
                        (_self.model.exam.start_time(Date.toJSDate(_self.model.exam.start_time())), _self.model.exam.end_time(Date.toJSDate(_self.model.exam.end_time())))
                }, _self);
            })
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
        },

        _initUpload: function () {
            var _self = this;
            _self.uploader = new WebUploader.Uploader({
                swf: static_url  + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + this.uploadSetting.serverUrl + '/v0.1/upload?session=' + _self.uploadSetting.session,
                auto: true,
                duplicate: true,
                pick: {
                    id: '.file_uploader',
                    multiple: false,
                },
                formData: {
                    path: this.uploadSetting.path
                },
                fileSingleSizeLimit: 50 * 1024 *1024,
                accept: [{
                    title: 'Image',
                    extension: 'png, jpg',
                    mimeTypes: 'image/*'
                }]
            })
            this.uploader.on('beforeFileQueued', $.proxy(this._beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this._uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this._uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this._uploadSuccess, this)); 
        },

        _beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        _uploadError: function (file, reason) {
            $.fn.dialog2.helpers.alert("上传出错，错误信息：文件大小超过50MB！");
        },
        _uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        _uploadSuccess: function (file, response) {
            var uploadTarget = this.model.uploadTarget();
            if (uploadTarget === 'cover') {
                // 上传结果作为封面
                console.log('1')
                var url = this.uploadSetting.serverUrl + '/download?dentryId=' + response.dentry_id;  // 理论上是图片上传完成之后，图片的链接地址
                this.model.exam.cover(url);
            } else {
                console.log(2);
                // 上传结果作为附件
                this.model.exam.attachments.push({
                    id: response.dentry_id,
                    name: file.name,
                    size: file.size,
                    description: file.name,
                    url: 'http://' + this.uploadSetting.serverUrl + '/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name,
                    preview_id: response.dentry_id,
                    preview_url: 'http://' + this.uploadSetting.serverUrl + '/download?dentryId=' + response.dentry_id,
                })
            }
            console.log(ko.toJS(this.model));
        },
        setUploadTarget(target) {
            console.log(target);
            this.model.uploadTarget(target)
        },
        showOrgTree: function (type) {
            this.model.treePattern(type);
            $('#orgTreeModal').modal('show');
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
        removeChoseTag: function(item){
        	this.model.exam.tags.remove(item)
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
            var self = this;
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

            return;

            console.log(ko.unwrap(self.model.exam.cover))
            console.log(ko.unwrap(self.model))
            console.log(postData)

            var params = postData.periodic_exam_param

            store.createOfflineExam({
                online_exam_param: { 
                    name: params.name,
                    exam_area: params.address,
                    cover: ko.unwrap(self.model.exam.cover),
                    description: params.description,
                    start_time: params.start_time,
                    end_time: params.end_time,
                    business_type: 'offline_exam',
                    // sub_type: 1,
                }
            })
            .then(function(data) {
                console.log('ceate success');
                console.log(data);
            })

            // 添加上传数据服务
        },
        save: function () {
            this.prepareData.call(this);
        },
        cancel: function () {
            window.location.href = return_url;
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