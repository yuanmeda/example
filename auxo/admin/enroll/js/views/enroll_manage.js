/**
 * Created by Administrator on 2016/11/2 0002.
 */
void function () {
    var store = {
        reporting: function (data) {
            return $.ajax({
                url: '/v1/user/enrollment/reporting'+'?pic_show_way='+data.pic_show_way,
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8'
            });
        },
        getAuditType: function () {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enrolls',
                dataType: 'json',
                type: 'GET',
                contentType: 'application/json;charset=utf8'
            });
        },
        getSelectFieldItems: function () {
            return $.ajax({
                url: service_domain + '/v1/learning_units/' + unit_id + '/enroll_forms',
                dataType: 'json',
                type: 'GET',
                contentType: 'application/json;charset=utf8',
                cache: false
            });
        },
        getStudentItems: function (data) {
            return $.ajax({
                url: '/v1/user/enrollments/search',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                cache: false
            });
        },
        pass: function (data) {
            return $.ajax({
                url: service_domain + '/v1/user/enrollments/actions/pass',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                cache: false
            });
        },
        refuse: function (data) {
            return $.ajax({
                url: service_domain + '/v1/user/enrollments/actions/refuse',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                cache: false
            });
        }
    };

    var viewModel = {
        allHaveInput: [],
        model: {
            filter: {
                unit_id: unit_id,
                settings: {},
                status: null,
                create_start_time: "",
                create_end_time: "",
                page_no: 0,
                page_size: 10,
                audit_start_time: "",
                audit_end_time: "",
                method: "0",
                methodType: "0"
            },
            total: 0,
            studentItems: [],
            selectFieldItems: [],
            inputTypeAndName: [],
            // inputTypeAndNameModel: [],
            allChecked: false,
            verify: {
                comment: "",
                user_enroll_ids: []
            },
            export: {
                checkedAll: false,
                choseItems: [],
                allItems: [],
                exportItems: [],
                exportData: []
            },
            enroll_audit_type: 0,
            enroll_form_type: 0,
            addFields: [], //添加字段
            disabled: true,
            methodType: ""
        },
        init: function () {
            $('#createStartTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#createEndTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#auditStartTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#auditEndTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });

            this.model = ko.mapping.fromJS(this.model);
            this._validateInit();
            this._bindingsExtend();
            this.validationsInfo = ko.validatedObservable(this.model.verify, {
                deep: true
            });
            ko.applyBindings(this);
            this.model.allChecked.subscribe($.proxy(function (newValue) {
                var items = this.model.studentItems(), choseItems = [];
                if (newValue) {
                    for (var i = 0; i < this.model.studentItems().length; i++) {
                        if (items[i].status != 2 && items[i].status != 3 && items[i].status != 5) {
                            choseItems.push(items[i].id);  //old
                        }
                    }
                    this.model.verify.user_enroll_ids(choseItems);  //old
                } else if (newValue !== '') {
                    this.model.verify.user_enroll_ids([]);
                }
            }, this));
            this.model.export.checkedAll.subscribe($.proxy(function (newValue) {
                if (newValue) {
                    this.model.export.exportItems(ko.mapping.toJS(this.model.export.allItems));
                } else if (newValue !== '') {
                    this.model.export.exportItems([]);
                }
            }, this));
            this.model.export.exportItems.subscribe($.proxy(function (newValue) {
                if (newValue.length == this.model.export.choseItems().length) {
                    this.model.export.checkedAll(true);
                } else {
                    this.model.export.checkedAll('');
                }
            }, this));
            this.model.verify.user_enroll_ids.subscribe($.proxy(function (newValue) {
                if (newValue.length == this.allHaveInput.length) {
                    this.model.allChecked(true);
                } else {
                    this.model.allChecked('');
                }
            }, this));
            this.model.filter.methodType.subscribe($.proxy(function (newValue) {
                var status = "";
                if(this.model.filter.method() == "0"){
                    this.model.filter.create_start_time("");
                    this.model.filter.create_end_time("");
                    this.model.filter.method("1");
                }else{
                    this.model.filter.audit_start_time("");
                    this.model.filter.audit_end_time("");
                    this.model.filter.method("0");
                }
            }, this));

            if (unit_id) {
                store.getAuditType().done($.proxy(function (returnData) {
                    if (returnData ) {
                        this.model.enroll_audit_type(returnData.enroll_audit_type != null ? returnData.enroll_audit_type : 0);
                        this.model.enroll_form_type(returnData.enroll_form_type != null ? returnData.enroll_form_type : 0);
                        this._updateItems(ko.mapping.toJS(this.model.filter));
                    }
                }, this));
            }
        },
        _pagination: function (count, offset, limit) {  //分页
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.filter.page_no(index);
                        this._updateItems(ko.mapping.toJS(this.model.filter));
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page_no(0);
                    this.model.filter.page_size(size);
                    this._updateItems(ko.mapping.toJS(this.model.filter));
                }, this)
            });
        },
        _updateItems: function (data) {    // 更新baday
            var _this = this;
            this.allHaveInput = [];
            data.status = data.status == "全部" ? [0, 1, 2, 3, 4, 5] : [+data.status];
            data.create_start_time = data.create_start_time ? timeZoneTrans(data.create_start_time) : "";
            data.create_end_time = data.create_end_time ? timeZoneTrans(data.create_end_time) : "";
            data.audit_start_time = data.audit_start_time ? timeZoneTrans(data.audit_start_time) : "";
            data.audit_end_time = data.audit_end_time ? timeZoneTrans(data.audit_end_time) : "";
            store.getStudentItems(data).done($.proxy(function (returnData) {
                this.model.studentItems(returnData && returnData.items && returnData.items.length > 0 ? returnData.items : []);
                $.each(this.model.studentItems(), function (index, item) {
                    if (item.status != 2 && item.status != 3 && item.status != 5) {
                        _this.model.disabled(false);
                        _this.allHaveInput.push(item.id);
                    }
                });
                this.model.total(returnData && returnData.items ? returnData.total : 0);
                this._pagination(this.model.total(), this.model.filter.page_no(), this.model.filter.page_size());
            }, this));
        },
        queryAction: function () {         //提交
            viewModel.model.filter.page_no(0);
            this.model.verify.user_enroll_ids([]);
            var params = ko.mapping.toJS(this.model.filter);
            var arr = this.model.addFields();
            for (var i = 0; i < arr.length; i++) {
                switch (arr[i].input_type) {
                    case "radio":
                        params.settings[arr[i].code] = arr[i].extra.split(',')[+arr[i].answer()];
                        break;
                    case "select":
                        params.settings[arr[i].code] = arr[i].answer();
                        break;
                    case "date":
                        params.settings[arr[i].code] = arr[i].answer() && arr[i].endTime() ? "start_time#" + arr[i].answer().split(' ').join('T') + ":&end_time#" + arr[i].endTime().split(' ').join('T') + ":00Z" : "";
                        break;
                    case "e-mail":
                        params.settings[arr[i].code] = arr[i].answer;
                        break;
                    case "checkbox":
                        arr[i].answer = this.selected();
                        params.settings[arr[i].code] = arr[i].answer;
                        break;
                    case "text":
                        params.settings[arr[i].code] = arr[i].answer;
                        break;
                    case "number":
                        params.settings[arr[i].code] = parseInt(arr[i].answer);
                        break;
                    case "address":
                        params.settings[arr[i].code] = arr[i].answer();
                        break;
                    default:
                }
            }
            viewModel._updateItems(params);
        },
        enrolldetail: function (item) {
            var w = window.open();
            w.location.href = '/' + project_code + '/admin/enroll/enroll_detail?unit_id=' + item.unit_id + '&user_enroll_id=' + item.id + '&__return_url=' + encodeURIComponent(__return_url);
        },
        // timeTranslate: function (odlTime) {
        //     if(odlTime == ""){
        //         return "";
        //     }
        //     var newTime = "";
        //     var one = odlTime.split(" ");
        //     var two = one[0].split("/");
        //     for(var j=0;j<two.length;j++){
        //         if(j == two.length-1){
        //             newTime += two[j]
        //         }else{
        //             newTime += two[j] + "-";
        //         }
        //     }
        //     newTime += " "+one[1]+".0000"
        //     return newTime;
        // },
        exportListAction: function () {
            var settings = {};
            var status = this.model.filter.status() == "全部" ? [0, 1, 2, 3, 4, 5] : [parseInt(this.model.filter.status())];
            var choseitems = this.model.export.choseItems();
            var addfedlds = this.model.addFields();
            var studentitems = this.model.studentItems();
            var params = {};
            if ((this.model.export.choseItems().length > 0 && this.model.export.exportItems().length < 1) || (this.model.export.choseItems().length == 0 && !this.model.export.checkedAll())) {
                $.fn.dialog2.helpers.alert("请选择要导出的字段!");
                return;
            };
            var param = {
                unit_id: unit_id,
                selects: this.model.export.exportItems(),
                status: status,
                settings: {},
                pic_show_way:null,
            };
             for (var i = 0; i < addfedlds.length; i++) {
                switch (addfedlds[i].input_type) {
                    case "radio":
                        param.settings[addfedlds[i].code] = addfedlds[i].extra.split(',')[+addfedlds[i].answer()];
                        break;
                    case "select":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer();
                        break;
                    case "date":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer() && addfedlds[i].endTime() ? "start_time#" + addfedlds[i].answer().split(' ').join('T') + ":&end_time#" + addfedlds[i].endTime().split(' ').join('T') + ":00Z" : "";
                        break;
                    case "e-mail":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer;
                        break;
                    case "checkbox":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer;
                        break;
                    case "text":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer;
                        break;
                    case "number":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer;
                        break;
                    case "address":
                        param.settings[addfedlds[i].code] = addfedlds[i].answer;
                        break;
                    default:
                }
            }
            if(this.model.verify.user_enroll_ids().length > 0){
                param.user_enroll_ids = this.model.verify.user_enroll_ids();
                param.pic_show_way = 1;
            }else {
                param.pic_show_way = 0;
            }
            param = this.addTime(param);
            store.reporting(param).done($.proxy(function (returnData) {
                location.href = '/' + project_code + '/admin/enroll/downloads/' + returnData.download_param;
                this.model.export.checkedAll(false);
                this.model.export.exportItems([]);
                $('#export').modal('hide');
            }, this));
        },
        addTime: function (param) {
            param.audit_start_time = this.model.filter.audit_start_time()?timeZoneTrans(this.model.filter.audit_start_time()):"";
            param.audit_end_time = this.model.filter.audit_end_time()?timeZoneTrans(this.model.filter.audit_end_time()):"";
            param.create_start_time = this.model.filter.create_start_time()?timeZoneTrans(this.model.filter.create_start_time()):"";
            param.create_end_time = this.model.filter.create_end_time()?timeZoneTrans(this.model.filter.create_end_time()):"";
            return param;
        },
        selected: function () {
            var arr = new Array();
            var list = [];                
            var items = document.getElementsByName("enroll_checkbox");
            for (i = 0; i < items.length; i++) {
                if (items[i].checked) {
                    list.push(items[i].value);
                }
            }
            return list;
        },
        processField: function () {
            if (this.model.inputTypeAndName().length > 3) {
                $.fn.dialog2.helpers.alert("最多只能选择3个!");
                return;
            }
            var arrFields = [], arrInput = this.model.inputTypeAndName();
            var obj = {};
            for (var i = 0; i < arrInput.length; i++) {
                if(arrInput[i].indexOf("checkbox")>-1){
                    obj = {
                    "name": arrInput[i].split(" ")[0],
                    "input_type": arrInput[i].split(" ")[1],
                    "code": arrInput[i].split(" ")[2],
                    "extra": arrInput[i].split(" ")[3].split(","),
                    "answer": '',
                    "endTime": ''
                    }
                }else{
                    obj = {
                    "name": arrInput[i].split(" ")[0],
                    "input_type": arrInput[i].split(" ")[1],
                    "code": arrInput[i].split(" ")[2],
                    "extra": arrInput[i].split(" ")[3],
                    "answer": '',
                    "endTime": ''
                    }
                }
                arrFields.push(obj);
            }
            for (var j = 0; j < arrFields.length; j++) {
                if (arrFields[j].input_type == 'radio') {
                    arrFields[j].answer = ko.observable('0');
                } else if (arrFields[j].input_type == 'select') {
                    arrFields[j].answer = ko.observable();
                } else if (arrFields[j].input_type == 'e-mail'){
                    
                } else if (arrFields[j].input_type == 'checkbox') {
                    
                } else if (arrFields[j].input_type == 'text') {
                    
                } else if (arrFields[j].input_type == 'number') {
                    
                } else if (arrFields[j].input_type == 'data') {
                    
                } else {
                    arrFields[j].answer = ko.observable();
                    arrFields[j].endTime = ko.observable();
                }
            }
            this.model.addFields(arrFields);
            $('.extraTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                autoclose: true,
                showAnim:'slideDown'
            });
            $('#selectfield').modal('hide');
            this.model.inputTypeAndNameModel = $.extend(true, [], ko.unwrap(this.model.inputTypeAndName));
        },
        clearCase: function () {
            $('#selectfield').modal('hide');
            this.model.inputTypeAndName($.extend(true, [], this.model.inputTypeAndNameModel));
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
                    if (new Date(beginTime).getTime() > new Date(endTime).getTime()) {
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
            var filter = this.model.filter;
            filter.create_end_time.extend({
                endTimeRules: {
                    params: filter.create_start_time,
                    onlyIf: $.proxy(function () {
                        return filter.create_start_time() != null && filter.create_start_time();
                    }, this)
                }
            });
            this.model.verify.comment.extend({
                required: {
                    value: true,
                    message: '必须填写审核意见'
                }
            })
        },
        exportFields: function () {
            if (this.model.studentItems().length < 1) {
                $.fn.dialog2.helpers.alert("没有学员，不能导出!");
                return;
            }
            $('#export').modal('show');
            store.getSelectFieldItems().done($.proxy(function (data) {
                var settings = data && data.settings && data.settings.length > 0 ? data.settings : [], fieldItems = [], codeItems = [], mustChose = [],mustData = [];
                for (var i = 0; i < settings.length; i++) {
                    if (settings[i].input_type != "attachment") {
                        fieldItems.push(settings[i]);
                        codeItems.push(settings[i].code);
                        if (settings[i].required) {
                            mustChose.push(settings[i].code);
                            mustData.push(settings[i]);
                        }
                    }
                }
                this.model.export.exportData(mustData);
                this.model.export.choseItems(fieldItems);
                this.model.export.allItems(codeItems);
                this.model.export.exportItems(mustChose);
                if (this.model.export.choseItems().length < 1 || (fieldItems.length == mustChose.length)) {
                    this.model.export.checkedAll(true);
                }
            }, this));
        },
        selectFields: function () {
            $('#selectfield').modal('show');
            store.getSelectFieldItems().done($.proxy(function (data) {
                var settings = data && data.settings && data.settings.length > 0 ? data.settings : [], fieldItems = [], haveToChose = [];
                for (var i = 0; i < settings.length; i++) {
                    if (settings[i].input_type == "radio" || settings[i].input_type == "select" || settings[i].input_type == "date") {
                    //    viewModel.model.filter.settings=viewModel.model.filter; //设置接口setting字段
                    }
                    if (settings[i].input_type != "picture" && settings[i].input_type != "attachment"&& settings[i].input_type != "textarea") {
                        fieldItems.push(settings[i]);
                        if (settings[i].required && haveToChose.length < 3) {
                            haveToChose.push(settings[i].name + ' ' + settings[i].input_type + ' ' + settings[i].code + ' ' + settings[i].extra.options);
                        }
                    }
                }
                this.model.selectFieldItems(fieldItems);
                if (this.model.inputTypeAndName().length < 1) {
                    this.model.inputTypeAndName(haveToChose);
                }
            }, this));
        },
        batchAudit: function () {
            if ( this.model.verify.user_enroll_ids().length < 1) {
                $.fn.dialog2.helpers.alert("请选择学员!");
                return;
            }
            $('#enrollVerify').modal('show');
            this.model.inputTypeAndName([]);
        },
        choseVerify: function (item) {
            var middle = [item.id];
            this.model.verify.comment('');
            $('#enrollVerify').modal('show');
            this.model.verify.user_enroll_ids(middle);
        },
        pass: function () {
            var user_enroll_ids = this.model.verify.user_enroll_ids;
            for (var i = 0; i < user_enroll_ids().length; i++) {
                if (user_enroll_ids()[i] == "0") {
                    $('#enrollVerify').modal('hide');
                    this.model.allChecked(false);
                    $.fn.dialog2.helpers.alert("存在ID为空的用户，无法审核!");
                    return;
                }
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                return;
            }
            var params = ko.mapping.toJS(this.model.verify);
            store.pass(params).done($.proxy(function () {
                this._updateItems(ko.mapping.toJS(this.model.filter));
            }, this));
            $('#enrollVerify').modal('hide');
            $.fn.dialog2.helpers.alert("审核成功，通过!");
            this.model.verify.comment('');
            this.model.verify.user_enroll_ids([]);
            this.model.allChecked(false);
        },
        refuse: function () {
            var user_enroll_ids = this.model.verify.user_enroll_ids;
            for (var i = 0; i < user_enroll_ids().length; i++) {
                if (user_enroll_ids()[i] == "0") {
                    $('#enrollVerify').modal('hide');
                    this.model.allChecked(false);
                    $.fn.dialog2.helpers.alert("存在ID为空的用户，无法审核!");
                    return;
                }
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                return;
            }
            // var params = ko.mapping.toJS(this.model.verify);
            var params = ko.mapping.toJS(this.model.verify);
            store.refuse(params).done($.proxy(function () {
                this._updateItems(ko.mapping.toJS(this.model.filter));
            }, this));
            $('#enrollVerify').modal('hide');
            $.fn.dialog2.helpers.alert("审核成功，拒绝!");
            this.model.verify.comment('');
            this.model.verify.user_enroll_ids([]);
            this.model.allChecked(false);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);
