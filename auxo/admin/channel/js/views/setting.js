(function () {
    var PREFIX = '/' + projectCode;
    var CHANNELHOST = channelUrl;

    var store = {
        findone: function (id) {
            return $.ajax({
                url: PREFIX + '/channels/' + id,
                cache: false
            })
        },
        update: function (id, data) {
            return $.ajax({
                url: PREFIX + '/channels/' + id,
                data: JSON.stringify(data),
                contentType: 'appliction/json',
                type: 'PUT'
            })
        },
        manage: function (id) {
            return $.ajax({
                url: PREFIX + '/manage_orgs',
                cache: false,
                data: {
                    org_id: id
                }
            })
        }
    };

    var viewModel = {
        model: {
            item: {
                id: id,
                title: '',
                status: 2,
                web_enabled: false,
                mobile_enabled: false,
                source_type: 1,
                web_url: '',
                mobile_url: '',
                url_redirect_mode: 1,
                is_visible: false,
                affiliated_config: 1,
                affiliated_org_node: '',
                visible_config: 1,
                visible_org_node_ids: [],
                role_config: true, //反向数字
                role_codes: [],
                is_need_login: false,
                resource_config: true, //反向数字
                resource_types: []
            },
            thirdUrl: {
                items: [],
                checked: -1
            },
            group: [],
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.group.push(ko.observable(true),ko.observable(true),ko.observable(true));
            this.model.thirdUrl.items(thirdUrls);
            this.validateBind();
            this.findone().pipe($.proxy(ko.applyBindingsWithValidation, this, this, {
                errorMessageClass: 'text-danger'
            }));
        },
        findOrgManage: function () {
            var item = this.model.item,
                orgId = window.orgId,
                that = this;
            return store.manage(orgId).then(function (res) {
                var settings = {
                    orgId: orgId,
                    projectCode: window.projectCode,
                    managerNodes: res.manager && res.manager.manager_nodes,
                    hasManager: res.manager && res.manager.has_manage_project,
                    initData: res.org_tree,
                    nodeIds: item.visible_org_node_ids,
                    host1: '/',
                    host2: elearningService,
                    uri: that.getNodeByUri,
                    multiple: 1
                }
                $.extend(true, that, { visible_config_params: settings })
                $.extend(true, that, { affiliated_config_params: $.extend(true, settings, { multiple: false, nodeIds: item.affiliated_org_node }) })
            })
        },

        getNodeByUri: function (treeId, treeNode) {
            return '/' + window.projectCode + '/manage_orgs/' + window.orgId + '?cid=' + treeNode.node_id
        },

        validateBind: function () {
            var item = this.model.item;
            item.title.extend({
                required: {
                    params: true,
                    message: '请输入频道名'
                },
                maxLength: {
                    params: 20,
                    message: '频道名长度不能超过20个字符'
                }
            });
            item.web_url.extend({
                required: {
                    params: true,
                    message: '请输入WEB端地址',
                    onlyIf: function () {
                        return item.source_type() == 2
                    }
                },
                maxLength: {
                    params: 100,
                    message: 'WEB端地址长度不能超过100个字符'
                },
                url: {
                    params: true,
                    message: '请输入合法的WEB端地址'
                }

            });
            item.mobile_url.extend({
                required: {
                    params: true,
                    message: '请输入移动端地址',
                    onlyIf: function () {
                        return item.source_type() == 2
                    }
                },
                maxLength: {
                    params: 100,
                    message: '移动端地址长度不能超过100个字符'
                },
                url: {
                    params: true,
                    message: '请输入合法的移动端地址'
                }
            })
        },

        findone: function () {
            var that = this,
                id = this.model.item.id();
            return store.findone(id).pipe(function (res) {
                res.resource_config = !res.resource_config;
                res.role_config = !res.role_config;
                ko.mapping.fromJS(res, {}, that.model.item);
                that.model.init(true);
                return that.findOrgManage();
            })
        },
        save: function () {
            var ref = ko.validation.group(this.model.item,{  deep: true, live: true  });
            if (ref().length) {
                ref.showAllMessages();
                return;
            }
            var data = ko.toJS(this.model.item);
            if (data.web_enabled == false && data.mobile_enabled == false) {
                $.simplyToast('请选择频道启用范围！','danger');
                return
            }
            if (!data.affiliated_config) data.affiliated_org_node = null;
            data.resource_config = Number(!data.resource_config);
            data.role_config = Number(!data.role_config);
            if(data.affiliated_config === 1 && !data.affiliated_org_node){
                $.simplyToast('请选择管理员权限', 'danger');
                return
            }
            if(data.visible_config === 1 && data.visible_org_node_ids.length == 0){
                $.simplyToast('请选择用户权限', 'danger');
                return
            }
            if (data.role_config == 1 && data.role_codes.length == 0) {
                $.simplyToast('请选择频道角色范围！', 'danger');
                return
            }
            if (data.resource_config == 1 && data.resource_types.length == 0) {
                $.simplyToast('请选择频道支持资源类型范围！', 'danger');
                return
            }
            store.update(data.id, data).then(function () {
                $.simplyToast('保存成功');
            });
        },
        showModal: function (type) {
            var modal;
            switch (type) {
                case 0:
                    modal = $('#js_affiliated_modal');
                    break;
                case 1:
                    modal = $('#js_visible_modal');
                    break;
            }
            modal.modal('show');
            return true;
        },
        insert: function () {
            var value = this.model.thirdUrl.checked(),
                item = this.model.thirdUrl.items()[value];
            if (item) {
                this.model.item.web_url(item.web_url);
                this.model.item.mobile_url(item.mobile_url);
            }

        },

        toggle:function($data){
            $data(!$data())
        }
    }
    $(function () {
        viewModel.init();
    });
})()