(function () {
'use strict';

var tmpl = "<div class=\"x-tree-selector\">\r\n    <!--ko if:model.orgId-->\r\n    <div class=\"well form-inline\" data-bind=\"visible:!model.readonly()\">\r\n         <input type=\"text\" class=\"input-small\" placeholder=\"输入搜索关键字\" data-bind=\"value:model.text\">\r\n         <button type=\"button\" class=\"btn\" data-bind=\"click:search\">搜索</button>\r\n    </div>\r\n    <div class=\"x-tree-selector-list\">\r\n        <ul data-bind=\"foreach:model.selectedNodes\">\r\n            <!--ko if: $data.title-->\r\n            <li data-bind=\"attr:{ title: $data.path }\">\r\n                <!--ko if:!$parent.model.readonly()-->\r\n                <a class=\"x-tree-selector-list-close\" href=\"javascript:;\" data-bind=\"click:$parent.removeNode.bind($parent)\" >&times;</a>\r\n                <!--/ko-->\r\n                <span data-bind=\"text:$data.title\"></span>\r\n            </li>\r\n            <!--/ko-->\r\n        </ul>\r\n    </div>\r\n    <div class=\"x-tree-selector-component\" data-bind=\"visible:!model.readonly()\">\r\n        <ul class=\"ztree\"></ul>\r\n    </div>\r\n    <!--/ko-->\r\n    <!--ko if:!model.orgId-->\r\n    <p class=\"x-tree-notfound\">请在项目上配置该组织</p>\r\n    <!--/ko-->\r\n</div>";

function ViewModel(params, componentInfo) {

    this.element = $(componentInfo.element);
    this.model = {
        readonly: params.readonly || ko.observable(false),
        multiple: Boolean(params.multiple) || false,
        orgId: Number(ko.unwrap(params.orgId)) || 0,
        projectCode: ko.unwrap(params.projectCode),
        visible: ko.observable(true),
        inited: false,
        managerNodes: ko.unwrap(params.managerNodes) || [],
        root: [],
        selectedNodes: params.nodesObj || ko.observableArray([]),
        selectedNodeIds: params.nodeIds || ko.observableArray([]),
        host1: params.host1 || '',
        host2: params.host2 || '',
        text: '',
        hasManager: params.hasManager === void 0 ? true : params.hasManager,
        initData: params.initData,
        uri: params.uri || ""
    };
    if (!this.model.orgId) return;
    this.treeComponent = null;
    var that = this,
        defer,
        prm;
    var data = this.model.initData;
    if (data && data.length) {
        defer = new $.Deferred();
        defer.resolve({ org_tree: this.model.initData });
        prm = defer.promise();
    } else {
        prm = this.store.getMixOrgTree.call(this);
    }
    prm.then(function (res) {
        if (res.manager) {
            that.model.managerNodes = res.manager.manager_nodes;
            that.model.hasManager = res.manager.has_manage_project;
        }
        if (!that.model.readonly()) that.initTree(res.org_tree);
    });
    var v = this.model.value;
    this.remoteNodePath(this.model.selectedNodeIds);
}

ViewModel.prototype.uuid = function v4(options, buf, offset) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

ViewModel.prototype.store = {
    getMixOrgTree: function getMixOrgTree() {
        return $.ajax({
            url: this.model.host1 + '/manage_orgs',
            data: {
                org_id: this.model.orgId

            },
            cache: false,
            dataType: 'json'
        });
    },
    getParentsByIds: function getParentsByIds(node_ids) {
        var model = this.model;
        return $.ajax({
            url: model.host2 + '/v1/mix_organizations/' + model.orgId + '/parents',
            data: JSON.stringify(node_ids),
            type: 'POST',
            dataType: 'json',
            headers: {
                'X-Gaea-Authorization': undefined,
                'Authorization': undefined
            }
        });
    }
};

ViewModel.prototype.transform = function (data) {
    return $.map(data, function (item) {
        item.isParent = item.isParent || item.is_parent;
        delete item.children;
        return item;
    });
};

ViewModel.prototype.initTree = function (data) {
    var model = this.model,
        that = this;
    function uri(treeId, treeNode) {
        return model.host1 + '/manage_orgs/' + treeNode.node_id + '/nodes';
    }

    var managerIds = $.map(this.model.managerNodes, function (node) {
        return node.node_id;
    });

    var settings = {
        async: {
            enable: true,
            url: model.uri || uri,
            type: 'get',
            dataType: 'json',
            contentType: 'applictaion/json',
            dataFilter: function dataFilter(treeId, parentNode, responseData) {
                if (!responseData) return null;
                return that.transform(responseData);
            }
        },
        data: {
            key: {
                name: 'node_name',
                title: 'node_name'
            },
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "parent_id",
                rootPId: '0'
            }
        },
        check: {
            enable: true,
            chkboxType: { "Y": "", "N": "" },
            chkStyle: model.multiple ? 'checkbox' : 'radio',
            chkDisabledInherit: false,
            radioType: "all"
        },
        callback: {
            onCheck: function onCheck(event, treeId, treeNode) {
                if (treeNode.checked) {
                    if (!model.multiple) {
                        var ids = model.selectedNodeIds;
                        $.each([].concat(ids()), function (i, v) {
                            var node = that.treeComponent.getNodeByParam('node_id', v) || { node_id: v };
                            if (node) {
                                that.removeNode(node, 1);
                            }
                        });
                        that.pushNode(treeNode, that.treeComponent);
                        model.selectedNodeIds(treeNode.node_id);
                    } else {
                        if (~$.inArray(treeNode.node_id, model.selectedNodeIds())) return;
                        that.pushNode(treeNode, that.treeComponent);
                        model.selectedNodeIds.push(treeNode.node_id);
                    }
                } else {
                    that.removeNode(treeNode, 1);
                }
            },
            onAsyncSuccess: function onAsyncSuccess(event, treeId, treeNode, msg) {
                if (!model.hasManager) {
                    var children = treeNode.children;
                    if (treeNode.chkDisabled) {
                        $.each(children, function (i, v) {
                            that.treeComponent.setChkDisabled(v, !~$.inArray(v.node_id, managerIds), false, true);
                        });
                    }
                }
            }
        },
        view: {
            fontCss: function fontCss(treeId, treeNode) {
                if (treeNode.highlight) {
                    return { color: "#38adff", "font-weight": "bold" };
                } else if (treeNode.node_type === 1) {
                    return { color: "#767cf3", "font-weight": "normal" };
                } else if (treeNode.node_type === 2) {
                    return { color: "#000", "font-weight": "normal" };
                } else if (treeNode.node_type === 3) {
                    return { color: "#6c6d76", "font-weight": "normal" };
                }
            },
            expandSpeed: ''
        }
    };
    var tree = this.element.find('.ztree');
    tree.attr('id', 'tree-' + this.uuid());
    var orgTreeObj = this.treeComponent = $.fn.zTree.init(tree, settings, this.transform(data));
    if (!this.model.hasManager) {
        var allNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()),
            rootNode = allNodes[0];
        orgTreeObj.setChkDisabled(rootNode, true, false, true);
        if (managerIds.length) {
            $.each(managerIds, function (index, nodeId) {
                if (!nodeId) return;
                var aNode = orgTreeObj.getNodeByParam("node_id", nodeId);
                aNode && orgTreeObj.setChkDisabled(aNode, false, false, true);
            });
        }
    }
};

ViewModel.prototype.generateNodePath = function (item) {
    var len = item.mix_nodes.length,
        result = { node_id: item.child_mix_node_id };
    if (!len) return "";
    var mixNodes = item.mix_nodes,
        lastNode = mixNodes[len - 1];
    result.node_name = lastNode.node_name;
    result.type = lastNode.node_type;
    result.root_id = lastNode.root_id;
    switch (len) {
        case 1:
            result.path = result.title = result.node_name;
            break;
        case 2:
            result.path = result.title = mixNodes[0].node_name + ' - ' + result.node_name;
            break;
        default:
            result.title = [mixNodes[0].node_name, '……', mixNodes[len - 2].node_name, ' - ', result.node_name].join('');
            result.path = $.map(mixNodes, function (item) {
                return item.node_name;
            }).join(' - ');
            break;
    }
    return result;
};

ViewModel.prototype.pushNode = function (treeNode, treeObj) {
    var nodeList = [],
        id = treeNode.node_id;
    if (!id) return;
    while (treeNode != null) {
        nodeList.splice(0, 0, treeNode);
        treeNode = treeNode.getParentNode();
    }
    var nodeIds = [].concat(this.model.selectedNodeIds());
    if (!!~$.inArray(id, nodeIds)) return;
    this.model.selectedNodes.push(this.generateNodePath({
        child_mix_node_id: id,
        mix_nodes: nodeList
    }));
};

ViewModel.prototype.remoteNodePath = function (nodeIds) {
    var that = this,
        ids = nodeIds();
    if (!~ids) return;
    ids = ko.utils.arrayFilter([].concat(ids), function (id) {
        return id != -1 && id;
    });
    if (!ids.length) return;
    this.store.getParentsByIds.call(this, ids).then(function (data) {
        if (data && data.length) {
            that.model.selectedNodes($.map(data, function (item) {
                return that.generateNodePath(item);
            }));
        }
    });
};

ViewModel.prototype.removeNode = function ($data, isNative) {
    var c = this.treeComponent,
        model = this.model;
    if (!c) return;
    if (isNative !== 1) {
        var node = c.getNodeByParam('node_id', $data.node_id);
        if (node) {
            c.checkNode(node, false, false);
        }
    }
    model.selectedNodes.remove(function (item) {
        return item.node_id == $data.node_id;
    });
    var value = model.selectedNodeIds();
    if (value && typeof value !== 'number') model.selectedNodeIds.remove($data.node_id);else model.selectedNodeIds(-1);
};
ViewModel.prototype.search = function () {
    var text = this.model.text,
        c = this.treeComponent;
    var nodeIds = text ? $.map(c.getNodesByParamFuzzy('node_name', text), function (item) {
        return item.id;
    }) : [];
    var allNodes = c.transformToArray(c.getNodes());
    $.each(allNodes, function (index, node) {
        if (~$.inArray(node.id, nodeIds)) {
            node.highlight = true;
        } else {
            node.highlight = false;
        }
        c.expandNode(node.getParentNode(), true, false, false);
        c.updateNode(node);
    });
};

ko.components.register('x-orgTree-selector', {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new ViewModel(params, componentInfo);
        }
    },
    template: tmpl
});

}());
