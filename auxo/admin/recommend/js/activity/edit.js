;(function ($) {
    var store = {
        get: function () {
            var url = '/' + projectCode + '/recommends/activities/' + activityId;
            return commonJS._ajaxHandler(url);
        },
        getOrgList: function () {
            var url = '/' + projectCode + '/recommends/organizations';
            return commonJS._ajaxHandler(url);
        },
        create: function (data) {
            var url = '/' + projectCode + '/v1/recommends/activities';
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'POST');
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/recommends/activities/' + activityId;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        }
    };
    var viewModel = {
        allOrgs: null,
        zTreeObject: null,
        selectedOrgs: [],
        model: {
            types: [{"text": "公开课", "value": "auxo-open-course"}, {"text": "培训认证", "value": "auxo-train"}],
            activity: {
                id: activityId || 0,
                title: '',
                start_time: '',
                end_time: '',
                target_cmp_url: 'cmp://com.nd.hy.elearning/eexam?examId={examId}&custom_data={custom_data}&egoPageName=ELExamPrepareViewController',
                reward_points: 0,
                reward_experience: 0,
                custom_type: 'auxo-open-course',
                custom_id: '',
                custom_id_title: '',
                join_object: '', //接收人
                join_object_type: '0',
                jump_cmp_url: '',
                task_type: taskType,
                enabled: 'false',
                description: '',
                activity_finish_type: '1',
                activity_type: 0,
                project_code: projectCode,
                org_num: 0,
                users: '',
                pc_link_url:""
            }
        },
        init: function () {
            var me = this, js_start =  $("#startTime"), js_end= $("#endTime");
            this.model = ko.mapping.fromJS(this.model);

            js_start.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_end.datetimepicker('setStartDate', me.model.activity.start_time());
                if (me.model.activity.end_time()) $('input[name="startTime"]').valid();
            });

            js_end.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate', function (ev) {
                js_start.datetimepicker('setEndDate', me.model.activity.end_time());
                $('input[name="startTime"]').valid();
            });

            js_end.click(function(){js_end.datetimepicker('show')});
            js_start.click(function(){js_start.datetimepicker('show')});

            this._validator();

            this.model.activity.custom_type.subscribe(function (nv) {
                if (nv) {
                    this.model.activity.custom_id('');
                    this.model.activity.custom_id_title('');
                }
            }, this);


            if (activityId) {
                store.get()
                    .done(function (data) {
                        if (data) {
                            data.start_time = data.start_time ? $.format.date(data.start_time, 'yyyy-MM-dd HH:mm') : '';
                            data.end_time = data.end_time ? $.format.date(data.end_time, 'yyyy-MM-dd HH:mm') : '';
                            data.reward_points = data.reward_points ? data.reward_points : 0;
                            data.reward_experience = data.reward_experience ? data.reward_experience : 0;

                            data.join_object_type = data.join_object_type.toString();
                            data.activity_finish_type = data.activity_finish_type.toString();
                            data.enabled = data.enabled.toString();
                            data.users ='';
                            data.org_num = 0;
                            if (data.join_object_type == 1) {
                                data.users = data.join_object;
                            }
                            else if (data.join_object_type == 2) {
                                var tempArray = data.join_object.split(',');
                                me.selectedOrgs = tempArray;
                                data.org_num = tempArray.length;
                            }
                            ko.mapping.fromJS(data, {}, me.model.activity);
                        }
                    });
            }
            ko.applyBindings(this, document.getElementById('activityEdit'));
        },
        loadOrgTree: function () {
            var treeData = Array.isArray(this.allOrgs) ? this.allOrgs : [this.allOrgs];
            var setting = {
                data: {
                    key: {
                        name: 'node_name',
                        title: 'node_name'
                    },
                    simpleData: {
                        enable: true,
                        idKey: "node_id",
                        pIdKey: "parent_id",
                        rootPId: '0'
                    }
                },
                check: {
                    enable: true,
                    chkboxType: {
                        "Y": "s",
                        "N": "s"
                    }
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {

                    }
                }
            };
            if (treeData.length > 0) {
                var ztreeObject = this.zTreeObject = $.fn.zTree.init($("#orgTree"), setting, treeData);
                var allNodes = ztreeObject.transformToArray(ztreeObject.getNodes()), rootNode = allNodes[0];
                ztreeObject.expandNode(rootNode, true, false, false, false);
                ztreeObject.checkAllNodes(false);
                $.each(this.selectedOrgs, function (index, id) {
                    var node = ztreeObject.getNodeByParam("node_id", id);
                    if (node) {
                        ztreeObject.checkNode(node, true, false);
                        ztreeObject.expandNode(node.getParentNode(), true, false, true);
                    }
                });
            } else {
                $("#orgTree").text("此项目没有组织，请选择手工输入用户或前往项目配置中设置");
            }
        },
        saveSelectedOrg: function () {
            this.selectedOrgs = [];
            if (this.zTreeObject) {
                var testArray = this.zTreeObject.getCheckedNodes(true);
                for (var i = 0; i < testArray.length; i++) {
                    if (!testArray[i].isParent) {
                        this.selectedOrgs.push(testArray[i].node_id);
                    }
                }
                this.model.activity.org_num(this.selectedOrgs.length);
                $('input[name="org_num"]').valid();
            }
            $('#orgTreeModal').modal('hide');
        },
        selectOrg: function () {
            var me = this;
            if (this.model.activity.join_object_type() === '2') {
                if (this.allOrgs !== null) {
                    $('#orgTreeModal').modal('show');
                } else {
                    store.getOrgList()
                        .done(function (data) {
                            if (data) {
                                me.allOrgs = data;
                            } else {
                                me.allOrgs = [];
                            }
                            me.loadOrgTree();
                            $('#orgTreeModal').modal('show');
                        });
                }
            } else {
                $.fn.dialog2.helpers.alert('请先选择组织为发送对象');
            }
        },
        selectJumpObject: function () {
            var me = this;
            var type = this.model.activity.custom_type();
            var registType = '';
            if (type == 'auxo-train') {
                registType = 0;
            } else if (type == 'auxo-open-course') {
                registType = 1;
            }
            window.selectedCourse = [{id: this.model.activity.custom_id(), title: this.model.activity.custom_id_title()}];
            $.recommend({
                type: type, regist: registType, success: function (data) {
                    if (data) {
                        me.model.activity.custom_id_title(data.title);
                        me.model.activity.custom_id(data.id);
                        $('input[name="custom_id_title"]').valid();
                    }
                }
            });
        },
        create: function () {
            if (!$("#activityForm").valid()) {
                return;
            }
            var data = ko.mapping.toJS(this.model.activity);
            if(data.task_type == 0){
                data.join_object_type = 0;
                data.join_object = '';
                data.reward_experience = undefined;
                data.reward_points = undefined;

            }else{
                if (data.join_object_type === "1") {
                    //自动去重
                    var userArray = data.users.split(/[/,,/，\n]/);
                    data.join_object = [];
                    $.each(userArray, function (i, el) {
                        var trimEL = $.trim(el);
                        if (trimEL && $.inArray(trimEL, data.join_object) === -1) data.join_object.push(trimEL);
                    });
                    data.join_object = data.join_object.join(',');
                }
                else if (data.join_object_type === "2") {
                    data.join_object = this.selectedOrgs.join(',');
                }
                else if (data.join_object_type === "0"){
                    data.join_object = '';
                }
            }
            data.start_time = data.start_time.replace(' ', 'T') + ':00';
            data.end_time = data.end_time.replace(' ', 'T') + ':00';
            data.title = $.trim(data.title);
            data.description = $.trim(data.description);
            data.org_num = undefined;
            data.users = undefined;
            data.id = undefined;
            if (activityId) { //编辑
                store.update(data)
                    .done(function () {
                        location.href = '/' + projectCode + '/recommend/activity';
                    });
            } else { //新建
                data.task_type = taskType;
                store.create(data)
                    .done(function () {
                        location.href = '/' + projectCode + '/recommend/activity';
                    });
            }

        },
        //表单验证
        _validator: function () {
            var self = this;
            $.validator.addMethod("endTime", function (value, element) {
                var startTime = new Date(value.replace(/-/g, "/"));
                var endTime = self.model.activity.end_time() ? new Date(self.model.activity.end_time().replace(/-/g, "/")) : '';
                return !(!endTime || startTime > endTime)
            }, "活动时间必填，且开始时间不应大于结束时间");
            $.validator.addMethod("org_num", function (value, element) {
                return (value > 0)
            }, "至少选择一个组织");
            $.validator.addMethod("user_format", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var reg = /.+@.+/;
                var result = true;
                $.each(array, function (i, v) {
                    if ($.trim(v)) {
                        result = reg.test(v) && result;
                    }
                });
                return result;
            }, "账号格式不对");
            $.validator.addMethod("users", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var newArray = [];
                var org = {};
                var count = 0;
                $.each(array, function (i, v) {
                    if ($.trim(v)) {
                        newArray.push(v);
                        if(!org[v.split('@')[1]]){
                            org[v.split('@')[1]] = true;
                            count++;
                        }
                    }
                });
                return (newArray.length <= 5000) && (count == 1);
            }, '用户账号不能超过5000个, 且用户必须同属一个组织下');
            $.validator.addMethod("cmp", function (value, element) {
                return $.trim(value) === "" || this.optional(element) || /^(cmp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[\{}!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[\{}!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[\{}!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[\{}!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[\{}!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            }, "您输入的网址格式不正确");

            $.validator.addMethod('zero', function (value, element) {
                return ($.trim(value) === "" || $.trim(value));
            }, "格式不正确");
            //表单验证
            $('#activityForm').validate({
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
                },
                rules: {
                    url: {
                        required: true,
                        cmp: true,
                        maxlength: 500
                    },
                    startTime: {
                        required: true,
                        endTime: true
                    },
                    users: {
                        required: true,
                        user_format: '',
                        users: ''
                    },
                    org_num: {
                        required: true,
                        org_num: ''
                    },
                    custom_id_title: {
                        required: true
                    },
                    title: {
                        required: true,
                        maxlength: 20,
                        minlength: 2
                    },
                    score: {
                        digits: true,
                        range: [0, 10000],
                        zero: true
                    },
                    experience: {
                        digits: true,
                        range: [0, 10000],
                        zero: true
                    },
                    description: {
                        maxlength: 200
                    }

                },
                messages: {
                    url: {
                        required: "跳转网址不可为空",
                        maxlength: "网址不必须小于500字符"
                    },
                    startTime: {
                        required: '请选择活动时间'
                    },
                    users: {
                        required: "参与人员不可为空"
                    },
                    org_num: {
                        required: "请选择至少一个组织"
                    },
                    custom_id_title: {
                        required: "请选择活动的具体内容"
                    },
                    title: {
                        required: "活动标题不可为空！",
                        maxlength: $.validator.format("活动标题长度必须小于{0}字符"),
                        minlength: $.validator.format("活动标题长度必须大于{0}字符")
                    },
                    score: {
                        digits: "积分为正整数",
                        range: "积分应在0-10000之间"
                    },
                    experience: {
                        digits: "经验为正整数",
                        range: "经验应在0-10000之间"
                    },
                    description: {
                        maxlength: $.validator.format("描述内容长度必须小于{0}字符")
                    }
                },

                highlight: function (label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                success: function (label) {
                    label.addClass('valid');
                    if (label.closest('.control-group').find('p').length != label.closest('.control-group').find('p.valid').length)
                        return;
                    label.closest('.control-group').addClass('success');
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
