;(function ($) {
    var store = {
        getMessage: function () {
            var url = '/' + projectCode + '/recommends/messages/' + messageId;
            return commonJS._ajaxHandler(url);
        },
        getOrgList: function () {
            var url = '/' + projectCode + '/recommends/organizations';
            return commonJS._ajaxHandler(url);
        },
        saveNewMessage: function (data) {
            var url = '/' + projectCode + '/recommends/messages';
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'POST');
        },
        saveEditMessage: function (data) {
            var url = '/' + projectCode + '/recommends/messages/' + messageId;
            return commonJS._ajaxHandler(url, JSON.stringify(data), 'PUT');
        }
    };
    var viewModel = {
        allOrgs: null,
        zTreeObject: null,
        selectedOrgs: [],
        model: {
            sendWays: messageSendMethod, //code,name 发送方式
            types: jumpPageTypes, //text,value 跳转页面类型
            message: {
                title: '',
                content: '',
                jump_type: 'auxo-open-course',
                link_id: '',
                receive_object: [], //接收人
                receive_object_type: '1',
                image_url: '',
                start_time: '',
                send_type: 2,
                //extra
                sendTimeType: 'now',
                org_num: 0,
                link_name: '',
                users: '',
                url: 'http://'
            }
        },
        init: function () {
            var me = this, js_date = $("#sendTime");
            this.model = ko.mapping.fromJS(this.model);

            js_date.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                autoclose: true
            }).on('changeDate',function(){
                $('input[name="sendTime"]').valid();
            });

            js_date.click(function(){js_date.datetimepicker('show')});
            this._validator();

            this.model.message.sendTimeType.subscribe(function(nv){
                if(nv == 'now'){
                    $('input[name="sendTime"]').next().hide().parent().removeClass('error');
                }
            }, this);
            this.model.message.jump_type.subscribe(function (nv) {
                if (nv) {
                    this.model.message.link_id('');
                    this.model.message.link_name('');
                }
            }, this);

            if (messageId && messageId != '0') {
                store.getMessage()
                    .done(function (data) {
                        if (data) {
                            me.model.message.title(data.title);
                            me.model.message.content(data.content);
                            me.model.message.jump_type(data.jump_type);
                            me.model.message.link_id(data.jump_param.id);
                            me.model.message.image_url(data.image_url);
                            me.model.message.receive_object_type(data.receive_object_type + '');
                            if (data.channels[0]) me.model.message.send_type(data.channels[0].channel_id);
                            if (data.receive_object_type == 1) {
                                me.model.message.users(data.receive_object);
                            } else if (data.receive_object_type == 2) {
                                var tempArray = data.receive_object.split(',');
                                me.selectedOrgs = tempArray;
                                me.model.message.org_num(tempArray.length);
                            }
                            if (data.start_time && !isCopy) {
                                me.model.message.sendTimeType('later');
                                me.model.message.start_time(data.start_time.replace('T', ' ').substring(0, 16));
                            } else {
                                me.model.message.sendTimeType('now');
                            }
                            if (data.jump_type == 'web-page') {
                                me.model.message.url(data.jump_param.url);
                            } else {
                                me.model.message.link_name(data.jump_title);
                            }
                        }
                    });
            }
            ko.applyBindings(this, document.getElementById('messageEdit'));
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
                this.model.message.org_num(this.selectedOrgs.length);
                $('input[name="org_num"]').valid();
            }
            $('#orgTreeModal').modal('hide');
        },
        selectOrg: function () {
            var me = this;
            if (this.model.message.receive_object_type() === '2') {
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
            window.selectedCourse = [{id: this.model.message.link_id(), title: this.model.message.link_name()}];
            var type = this.model.message.jump_type();
            $.recommend({
                type: type, success: function (data) {
                    if (data) {
                        me.model.message.link_name(data.title);
                        me.model.message.link_id(data.id);
                        me.model.message.image_url(data.image_url);
                        $('input[name="jump_title"]').valid();
                    }
                }
            });
        },
        createMessage: function () {
            if (!$("#messageForm").valid())
                return;
            var data = ko.mapping.toJS(this.model.message);
            data.users = $("#out").val();
            var sendData = {
                title: data.title,
                content: data.content,
                channels: [{channel_id: data.send_type}],
                receive_object_type: data.receive_object_type,
                jump_type: data.jump_type,
                image_url: data.image_url,
                jump_param: {},
                custom_type: 'auxo-operate-manage'
            };
            if (data.sendTimeType === 'later') {
                sendData.start_time = (data.start_time + ':00').replace(' ', 'T');
            } else {
                sendData.start_time = '';
            }
            if (data.jump_type === 'web-page') {
                sendData.jump_param['url'] = data.url;
            } else {
                sendData.jump_param['id'] = data.link_id;
            }
            if (data.receive_object_type === "1") {
                //自动去重
                var userArray = data.users.split(/[/,,/，\n]/);
                sendData.receive_object = [];
                $.each(userArray, function (i, el) {
                    var trimEL = $.trim(el);
                    if (trimEL && $.inArray(trimEL, sendData.receive_object) === -1) sendData.receive_object.push(trimEL);
                });
                sendData.receive_object = sendData.receive_object.join(',');
            } else if (data.receive_object_type === '2') {
                sendData.receive_object = this.selectedOrgs.join(',');
            }
            var eidtmsg = sendData.start_time ? '编辑成功，确认发送？' : '已改为即时发送，消息发送后无法撤销，确认发送？';
            var createmsg = sendData.start_time ? '确认发送？' : '消息发送后无法撤销，确认发送？';
            if (messageId && messageId !== '0' && !isCopy) { //编辑
                $.fn.dialog2.helpers.confirm(eidtmsg, {
                    "confirm": function () {
                        store.saveEditMessage(sendData)
                            .done(function () {
                                location.href = '/' + projectCode + '/recommend/message';
                            });
                    },
                    buttonLabelYes: '是',
                    buttonLabelNo: '否'
                });
            } else { //新建
                $.fn.dialog2.helpers.confirm(createmsg, {
                    "confirm": function () {
                        store.saveNewMessage(sendData)
                            .done(function () {
                                location.href = '/' + projectCode + '/recommend/message';
                            });
                    },
                    buttonLabelYes: '是',
                    buttonLabelNo: '否'
                });
            }

        },
        //表单验证
        _validator: function () {
            $.validator.addMethod("sendTime", function (value, element) {
                var sendTime = new Date(value.replace(/-/g, "/"));
                var nowTime = new Date();
                var minutes = (sendTime - nowTime) / 60000;
                var result;
                if (minutes < 5) {
                    result = false;
                } else {
                    result = true;
                }
                return result;
            }, "定时发送至少5分钟后");
            $.validator.addMethod("org_num", function (value, element) {
                var result;
                if (value > 0) {
                    result = true;
                } else {
                    result = false;
                }
                return result;
            }, "至少选择一个组织");
            $.validator.addMethod("user_format", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var newArray = [];
                $.each(array,function(i,v){
                    if($.trim(v)) newArray.push(v);
                });
                var reg = /.+@.+/;
                var result = true;
                $.each(newArray, function (i, v) {
                    result = reg.test(v) && result;
                });
                return result;
            }, "账号格式不对");
            $.validator.addMethod("users", function (value, element) {
                var array = value.split(/[/,,/，\n]/);
                var newArray = [];
                $.each(array,function(i,v){
                   if($.trim(v)) newArray.push(v);
                });
                var result;
                if (newArray.length > 500) {
                    result = false;
                } else {
                    result = true;
                }
                return result;
            }, "用户账号不能超过500个");
            $.validator.addMethod("url", function (value, element) {
                return $.trim(value) === "" || this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            }, "您输入的网址格式不正确");
            //表单验证
            $('#messageForm').validate({
                rules: {
                    url: {
                        required: true,
                        url: ''
                    },
                    sendTime: {
                        required: true,
                        sendTime: ''
                    },
                    users: {
                        required: true,
                        users: '',
                        user_format: ''
                    },
                    org_num: {
                        required: true,
                        org_num: ''
                    },
                    jump_title: {
                        required: true
                    },
                    title: {
                        required: true,
                        maxlength: 45,
                        minlength: 2
                    },
                    content: {
                        required: true,
                        maxlength: 100,
                        minlength: 2
                    }

                },
                messages: {
                    url: {
                        required: "跳转网址不可为空"
                    },
                    sendTime: {
                        required: '请选择发送时间'
                    },
                    users: {
                        required: "发送用户不可为空"
                    },
                    org_num: {
                        required: "请选择至少一个组织"
                    },
                    jump_title: {
                        required: "请选择跳转的具体项目"
                    },
                    title: {
                        required: "消息标题不可以为空！",
                        maxlength: $.validator.format("消息标题长度必须小于{0}字符"),
                        minlength: $.validator.format("消息标题长度必须大于{0}字符")
                    },
                    content: {
                        required: "内容不可以为空！",
                        maxlength: $.validator.format("内容长度必须小于{0}字符"),
                        minlength: $.validator.format("内容长度必须大于{0}字符")
                    }
                },
                onkeyup: function (element) {
                    $(element).valid()
                },
                onsubmit: true,
                errorElement: 'p',
                errorClass: 'help-inline',
                errorPlacement: function (erorr, element) {
                    erorr.appendTo(element.parent());
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
