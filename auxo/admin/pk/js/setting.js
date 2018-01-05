var QUESTION_TYPE_MAP = [
    {
        type: 10,
        name: "基础平台单选题"
    }, {
        type: 15,
        name: "基础平台多选题"
    }, {
        type: 18,
        name: "基础平台不定项选择题"
    }, {
        type: 20,
        name: "基础平台填空题"
    }, {
        type: 25,
        name: "基础平台主观题"
    }, {
        type: 30,
        name: "基础平台判断题"
    }, {
        type: 40,
        name: "基础平台连线题"
    }, {
        type: 50,
        name: "基础平台套题"
    }, {
        type: 201,
        name: "单选题"
    }, {
        type: 202,
        name: "多选题"
    }, {
        type: 203,
        name: "判断题"
    }, {
        type: 204,
        name: "排序题"
    }, {
        type: 205,
        name: "连线题"
    }, {
        type: 206,
        name: "问答题"
    }, {
        type: 207,
        name: "拼图题"
    }, {
        type: 208,
        name: "复合题"
    }, {
        type: 209,
        name: "填空题"
    }, {
        type: 210,
        name: "手写题"
    }, {
        type: 211,
        name: "作文题"
    }, {
        type: 212,
        name: "所见即所得填空题"
    }, {
        type: 213,
        name: "阅读题"
    }, {
        type: 214,
        name: "实验与探究题"
    }, {
        type: 215,
        name: "分类表格题"
    }, {
        type: 216,
        name: "多空填空题"
    }, {
        type: 217,
        name: "文本选择题"
    }, {
        type: 218,
        name: "综合学习题"
    }, {
        type: 219,
        name: "应用题"
    }, {
        type: 220,
        name: "计算题"
    }, {
        type: 221,
        name: "解答题"
    }, {
        type: 222,
        name: "阅读理解"
    }, {
        type: 223,
        name: "证明题"
    }, {
        type: 224,
        name: "推断题"
    }, {
        type: 225,
        name: "投票题"
    }, {
        type: 226,
        name: "基础应用题"
    }, {
        type: 227,
        name: "基础证明题"
    }, {
        type: 228,
        name: "基础计算题"
    }, {
        type: 229,
        name: "基础解答题"
    }, {
        type: 230,
        name: "基础阅读题"
    }, {
        type: 231,
        name: "基础阅读与理解题"
    }, {
        type: 232,
        name: "主观基础题"
    }, {
        type: 233,
        name: "主观指令题型"
    }, {
        type: 234,
        name: "NewCompositeQuestion"
    }, {
        type: 401,
        name: "连连看"
    }, {
        type: 402,
        name: " 排序题"
    }, {
        type: 403,
        name: "表格题"
    }, {
        type: 404,
        name: "H5游戏"
    }, {
        type: 405,
        name: "Native游戏"
    }, {
        type: 406,
        name: "字谜游戏题"
    }, {
        type: 407,
        name: "记忆卡片题"
    }, {
        type: 408,
        name: "竖式计算题"
    }, {
        type: 409,
        name: "比大小题"
    }, {
        type: 410,
        name: "猜词题"
    }, {
        type: 411,
        name: "魔方盒题型"
    }, {
        type: 412,
        name: "有理数乘法法则"
    }, {
        type: 413,
        name: "书写化学反应方程式"
    }, {
        type: 414,
        name: "文本选择"
    }, {
        type: 415,
        name: "分类题型"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 417,
        name: "标签题型"
    }, {
        type: 418,
        name: "点连线"
    }, {
        type: 419,
        name: "逻辑题型"
    }, {
        type: 420,
        name: "游戏"
    }, {
        type: 421,
        name: "选词填空"
    }, {
        type: 422,
        name: "数独"
    }, {
        type: 423,
        name: "连环填空题"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }, {
        type: 416,
        name: "分式加减"
    }];
(function ($) {
    var store = {
        getUploadSession: function() {
            var url = pkGatewayUrl + '/v1/users/upload_sessions';
            return $.ajax({
                url: url,
                type: 'get',
                cache: false
            });
        },
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
            var url = service_domain + '/v1/pks/' + pk_id;
            return $.ajax({
                url: url,
                type: 'get',
                error: this.errorCallback
            });
        },
        create: function (data) {
            var url = service_domain + '/v1/pks';
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
            var url = service_domain + '/v1/pks/' + pk_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        getOrgTree: function () {
            var url = '/' + projectCode + '/pks/manage_orgs';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                cache: false
            });
        },
    };

    var viewModel = {
        flag: '',
        $searchOrg: null,
        $orgTreeModalBody: null,
        orgTreeObj: null,
        $orgTree: null,
        store: store,
        model: {
            ruleModalSrc: '',
            cover_url: "",
            exam: {
                name: "",
                cover: "",
                cover_url:"",
                description: "",//知识范围
                // pass_score: 60, //页面上无
                // total_score: 0, //页面上无
                start_time: "",
                end_time: "",
                answer_time: 60,
                chance: 0, //默认为0，-1代表不限
                answer_strategy: {
                    model: 0 //0: SINGLE_QUESTION_MODEL 单题模式, 1: PAPER_MODEL 整卷模式 *固定0*
                },
                analysis_strategy: {
                    strategy: 0  //不允许查看 *固定0*
                    // start_time: "",
                    // end_time: ""
                },
                mark_strategy: {
                    subjective_mark_strategy: 0 //0: MANUAL_MARK 主观题人工批改, 1: AUTO_MARK 主观题自动批改 *固定0*
                },
                affiliated_org_node: null,//所属组织节点
                affiliated_org_root: null, //所属组织根节点
                visible_config: 0, //0: VISIBLE 全可见, 1: ORG_VISIBLE 组织可见, 2: INVISIBLE 不可见
                visible_org_nodes: [], //可见组织
                // action_rule_url: "" //行为控制Url,限长255 页面无
                rule_id: ""

            },
            orgTextRadio: '点击查看或选择所属组织',
            orgTextCheckbox: '点击查看或选择组织',
            updateNodesRadio: [],
            updateNodesCheckbox: [],
            searchText: '',
            belong_config: "0",//所属配置

            show: false,
            treePattern: 0

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
            viewModel.model = ko.mapping.fromJS(viewModel.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });

            var message_key = "elearning.pk.gateway.rulelist";
            var self = this;
            var z = document.getElementById('ruleIframe');
            var n = new Nova.Notification(z.contentWindow, "*");
            n.addEventListener(message_key, function (receiveData) {
                if (receiveData.event_type == 'elearning_pk_gateway_rulelist') {
                    if (receiveData.data.flag == 1) {
                        var selectedRuleId = receiveData.data.rule_id;
                        self.model.exam.rule_id(selectedRuleId);
                    }
                    $("#ruleModal").modal('hide');
                }
            });

            var defer, queue = [store.getOrgTree(), false];

            function mapping(data) {
                data.answer_time = data.answer_time / 60;
                //data.visible_config = data.visible_config + "";
                this.model.belong_config(data.affiliated_org_node != null ? '1' : '0');
                this.model.cover_url(data.cover_url);

                ko.mapping.fromJS(data, {}, this.model.exam);
                if (data.start_time) {
                    this.model.exam.start_time(Date.format(new Date(Date.formatTimezone(data.start_time)), 'yyyy/MM/dd HH:mm:ss'));
                }
                if (data.end_time) {
                    this.model.exam.end_time(Date.format(new Date(Date.formatTimezone(data.end_time)), 'yyyy/MM/dd HH:mm:ss'));
                }
            }

            pk_id && queue.splice(1, 1, store.get());
            $.when.apply($, queue).then(function (d1, d2) {
                d1 = d1[0];
                var manager = d1.manager || {};
                _self.mTreeOpts = {
                    nodeIds: _self.model.exam.visible_org_nodes,
                    orgId: orgId,
                    multiple: true,
                    projectCode: projectCode,
                    host1: '/' + projectCode + '/pks',
                    host2: elearningServiceUri,
                    managerNodes: manager.manager_nodes,
                    hasManager: manager.has_manage_project,
                    initData: d1.org_tree
                }
                _self.sTreeOpts = $.extend({}, _self.mTreeOpts, {
                    nodeIds: _self.model.exam.affiliated_org_node,
                    multiple: false
                })
                if (d2) {
                    d2 = d2[0];
                    mapping.call(_self, d2)
                }
                ko.applyBindings(_self, document.getElementById('pk_setting'));
            });

            $('#startTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            $('#endTime').datetimepicker({
                changeMonth: true,
                changeYear: true,
                language: 'zh-CN',
                showAnim: 'slideDown',
                dateFormat: "yy/mm/dd",
                timeFormat: "hh:mm:ss",
                showSecond: true
            });
            this._initUpload($.proxy(this._uploadComplete, this), $.proxy(this._uploadError, this));
            this._validateInit();
            this._bindingsExtend();
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
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5()（）.-]*$",
                    message: '不可含有非法字符'
                }
            });
            exam.start_time.extend({
                required: {
                    value: true,
                    message: '开始时间不能为空'
                }
            });
            exam.end_time.extend({
                required: {
                    value: true,
                    message: '结束时间不能为空'
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
                    message: '最大长度为{0}'
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
                    imgUrl: this.model.cover_url || '',
                    showCancel: false,
                    limit: 1,
                    upload_complete: uc,
                    upload_error: ue
                });
            return _swf;
        },
        _uploadComplete: function (data) {
            var _self = this;
            if (!data.Code) {
                // var _imgData = data.shift();
                this.model.exam.cover(data.store_object_id);
                this.model.cover_url(data.absolute_url + "!m300x200.jpg");
                this.model.show(!this.model.show());
            } else {
                Utils.alertTip(data.Message, {
                    title: '警告',
                    icon: 7
                });
            }
        },
        _uploadError: function (code) {
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
        /*权限设置*/
        showOrgTree: function (type) {
            this.model.treePattern(type);
            $("#zT-orgTreeModal").modal('show');
        },
        _matchValue: function (match, value) {
            return String(match).toLowerCase().indexOf(value) > -1;
        },
        /*保存PK赛*/
        savePk: function () {
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
            data.start_time = timeZoneTrans(data.start_time).split(".")[0];
            data.end_time = timeZoneTrans(data.end_time).split(".")[0];
            // data.visible_config = +data.visible_config;
            /*权限设置*/
            // data.affiliated_org_node = this.model.belong_config() == '1' ? data.affiliated_org_node : null;
            // data.affiliated_org_root = this.model.belong_config() == '1' ? orgId : null;
            // data.visible_org_nodes = data.visible_config == 1 ? data.visible_org_nodes : [];
            if (pk_id) {
                store.update(data).done(function (resData) {
                    $.fn.dialog2.helpers.alert("更新成功");
                    window.location.href = 'http://' + window.location.host + '/' + projectCode + '/admin/pk/bank?pk_id=' + pk_id + '&return_url=' + encodeURIComponent(return_url);
                    /*if (return_url) {
                     window.location.href = return_url;
                     }*/
                });
            } else {
                store.create(data).done(function (resData) {
                    $.fn.dialog2.helpers.alert("创建成功");
                    pk_id = resData.id;
                    window.location.href = 'http://' + window.location.host + '/' + projectCode + '/admin/pk/bank?pk_id=' + pk_id + '&return_url=' + encodeURIComponent(return_url);
                    /*if (return_url) {
                     window.location.href = return_url.indexOf('?') != -1 ? return_url + '&id=' + resData.id : return_url + '?id=' + resData.id;
                     }*/
                });
            }
        },
        cancel: function () {
            if (pk_id) {
                window.location.href = return_url.indexOf('?') != -1 ? return_url + '&id=' + pk_id : return_url + '?id=' + pk_id;
            } else {
                window.location.href = return_url;
            }

        },
        openRuleModal: function () {
            $("#ruleIframe").attr('src', "/" + projectCode + "/admin/pk/rulelist?rule_id=" + this.model.exam.rule_id());
            $('#ruleModal').modal('show');
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));