;(function($) {
    var store = {
        getMessage: function() {
            var url = '/' + projectCode + '/recommends/messages/' + messageId;
            return commonJS._ajaxHandler(url);
        },
        getOrgList: function() {
            var url = '/'+projectCode+'/recommends/organizations';
            return commonJS._ajaxHandler(url);
        }
    };
    var viewModel = {
        allOrgs: null,
        zTreeObject: null,
        selectedOrgs: [],
        model: {
            message: {
                title: '',
                content: '',
                jump_type: '',
                url:'',
                receive_object: [], //接收人
                receive_object_type: '1',
                start_time: '',
                send_type: 2,
                sendTimeType: 'now',
                org_num: 0,
                jump_title: '',
                users: '',
                messageSendMethodName: '',
                jumPageTypeName: ''
            }
        },
        loadOrgTree: function() {
            var treeData = this.allOrgs;
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
                    enable: true
                }
            };
            var ztreeObject = this.zTreeObject = $.fn.zTree.init($("#orgTree"), setting, treeData);
            ztreeObject.checkAllNodes(false);
            $.each(this.selectedOrgs, function(index, id) {
                var node = ztreeObject.getNodeByParam("node_id", id);
                if (node){
                    ztreeObject.checkNode(node, true, true);
                    ztreeObject.expandNode(node.getParentNode(), true, false, true);
                }
            });
            $.each(ztreeObject.getNodes(), function(index, singlenode) {
                var node = ztreeObject.getNodeByParam("node_id", singlenode.node_id);
                ztreeObject.setChkDisabled(node, true);
            });
        },
        showOrg: function() {
            var me = this;
            if (this.allOrgs !== null) {
                $('#orgTreeModal').modal('show');
            } else {
                store.getOrgList()
                    .done(function(data) {
                        me.allOrgs = data;
                        me.loadOrgTree();
                        $('#orgTreeModal').modal('show');
                    });
            }
        },
        init: function() {
            var me = this;
            this.model = ko.mapping.fromJS(this.model);

            if (messageId && messageId != '0') {
                store.getMessage()
                    .done(function(data) {
                        if (data) {
                            var typesArray = jumpPageTypes;
                            for (var i = 0, len = typesArray.length; i < len; i++) {
                                if (typesArray[i].value == data.jump_type) {
                                    me.model.message.jumPageTypeName(typesArray[i].text);
                                    break;
                                }
                            }
                            var messageSendMethodArray = messageSendMethod;
                            for (var i = 0, length = messageSendMethodArray.length; i < length; i++) {
                                if(data.channels[0]){
                                    if (messageSendMethodArray[i].code == data.channels[0].channel_id) {
                                        me.model.message.messageSendMethodName(messageSendMethodArray[i].name);
                                        break;
                                    }
                                }
                            }
                            me.model.message.title(data.title);
                            me.model.message.content(data.content);
                            me.model.message.jump_type(data.jump_type);
                            me.model.message.receive_object_type(data.receive_object_type + '');
                            if(data.channels[0]) me.model.message.send_type(data.channels[0].channel_id);

                            if (data.receive_object_type == 2) {
                                me.selectedOrgs = data.receive_object.split(',');
                                me.model.message.org_num(me.selectedOrgs.length);
                            } else if (data.receive_object_type == 1) {
                                me.model.message.users(data.receive_object);
                            }
                            if (data.start_time) {
                                me.model.message.sendTimeType('later');
                                me.model.message.start_time(data.start_time.replace('T',' ').substring(0,16));
                            } else {
                                me.model.message.sendTimeType('now');
                            }
                            if (data.jump_type == 'web-page') {
                                me.model.message.url(data.jump_param.url);
                            } else {
                                me.model.message.jump_title(data.jump_title);
                            }
                        }
                    });
            }
            ko.applyBindings(this, document.getElementById('messageDetail'));
        }
    };
    $(function() {
        viewModel.init();
    });
})(jQuery);
