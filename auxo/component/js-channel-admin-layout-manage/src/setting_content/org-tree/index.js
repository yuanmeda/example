import ko from 'knockout'
import tpl from './template.html'

function ViewModel(params) {
    this.model = {
        org_nodes: params.org_nodes || ko.observableArray([]),
        org_node_type: params.org_node_type || ko.observable(0),
        org_text: params.org_text || ko.observable(''),
        updateNodes: ko.observableArray([]),
        selectedNodeIds: params.selectedNodeIds || ko.observableArray([]),
        showSelect: params.showSelect || false,
        search: {
            keywords: ko.observable(''),
            result: ko.observable('')
        },
        hasTree: ko.observable(false)
    };
    var t = this;
    ko.tasks.schedule(function () {
        t._initOrgTree(params.managerData, params.treeData);
        t.remoteNodePath(t.model.selectedNodeIds);
    });
}

ViewModel.prototype.store = {
    getParentsByIds: function (node_ids) {
        return $.ajax({
            url: elearningService + '/v1/mix_organizations/' + window.projectOrgId + '/parents',
            data: JSON.stringify(node_ids),
            type: 'POST',
            dataType: 'json',
            headers: {
                'X-Gaea-Authorization': undefined,
                'Authorization': undefined
            }
        })
    }
};
ViewModel.prototype._initOrgTree = function (managerData, treeData) {
    var managerIds = managerData ? ($.map(managerData.manager_nodes || [], function (node) {
        return node.node_id;
    })) : [];
    var _this = this, orgTreeObj, setting = {
        async: {
            enable: true,
            url: "/" + projectCode + "/manage_orgs/" + window.projectOrgId,
            autoParam: ["node_id=cid"],
            type: 'get',
            dataType: 'json',
            contentType: "application/json"
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
            chkboxType: {"Y": "", "N": ""},
            chkStyle: "checkbox",
            chkDisabledInherit: false,
            radioType: "all"
        },
        callback: {
            onCheck: function (event, treeId, treeNode) {
                if (treeNode.checked) {
                    if (~$.inArray(treeNode.node_id, _this.model.selectedNodeIds())) return;
                    _this.pushNode(treeNode, orgTreeObj);
                    _this.model.selectedNodeIds.push(treeNode.node_id);

                } else {
                    _this.removeNode(treeNode, 1);
                }
            },
            onAsyncSuccess: function (event, treeId, treeNode, msg) {
                if (!managerData.has_manage_project) {
                    var children = treeNode.children;
                    $.each(children, function (i, v) {
                        orgTreeObj.setChkDisabled(v, !~$.inArray(v.node_id, managerIds), false, true);
                    });
                }
            }
        },
        view: {
            fontCss: function (treeId, treeNode) {
                if (treeNode.highlight) {
                    return {color: "#38adff", "font-weight": "bold"};
                } else if (treeNode.node_type === 1) {
                    return {color: "#767cf3", "font-weight": "normal"};
                } else if (treeNode.node_type === 2) {
                    return {color: "#000", "font-weight": "normal"};
                } else if (treeNode.node_type === 3) {
                    return {color: "#6c6d76", "font-weight": "normal"};
                }
            },
            expandSpeed: ''
        }
    };
    if (treeData && treeData.length) {
        orgTreeObj = _this.orgTreeObj = $.fn.zTree.init((_this.$orgTree = $("#ch-lo-orgtree")), setting, treeData);
        orgTreeObj.checkAllNodes(false);
        if (!managerData.has_manage_project) {
            var nodes = orgTreeObj.getNodes(),
                root = nodes && nodes[0];
            orgTreeObj.setChkDisabled(root, !~$.inArray(root.node_id, managerIds), false, true);
        }
        _this.model.hasTree(true);
    } else {
        _this.model.hasTree(false);
    }
};
ViewModel.prototype._initTreeChkDisabled = function (treeData, disabledNodes) {
    disabledNodes = $.map(disabledNodes, function (v) {
        return v.node_id;
    });
    $.each(treeData, function (i, v) {
        if (!~$.inArray(v.node_id, disabledNodes)) v.chkDisabled = true;
    });
    return treeData;
};
ViewModel.prototype.saveOrg = function () {
    if (this.model.updateNodes().length > 0) {
        var nodeIds = $.map(this.model.updateNodes(), function (v) {
            return v.node_id;
        });
        this.model.org_nodes(nodeIds);
        this.model.org_node_type(1);
        this.model.org_text('已选' + this.model.updateNodes()[0].node_name + '等' + this.model.updateNodes().length + '个部门');
    } else {
        this.model.org_nodes([]);
        this.model.org_node_type(0);
        this.model.org_text('点击查看或选择组织');
    }
    $("#zT-orgTreeModal").modal('hide');
};
ViewModel.prototype.removeNode = function ($data, isNative) {
    var c = this.orgTreeObj,
        model = this.model;
    if (!c) return;
    if (isNative !== 1) {
        var node = c.getNodeByParam('node_id', $data.node_id);
        if (node) {
            c.checkNode(node, false, false);
        }
    }
    model.updateNodes.remove(function (item) {
        return item.node_id == $data.node_id;
    });
    var value = model.selectedNodeIds();
    if (value && typeof value !== 'number') model.selectedNodeIds.remove($data.node_id); else model.selectedNodeIds(-1);
};
ViewModel.prototype.pushNode = function (treeNode, treeObj) {
    var nodeList = [],
        id = treeNode.node_id
    if (!id) return;
    while (treeNode != null) {
        nodeList.splice(0, 0, treeNode);
        treeNode = treeNode.getParentNode();
    }
    var nodeIds = [].concat(this.model.selectedNodeIds());
    if (!!~$.inArray(id, nodeIds)) return;
    this.model.updateNodes.push(this.generateNodePath({
        child_mix_node_id: id,
        mix_nodes: nodeList
    }));
};
ViewModel.prototype.remoteNodePath = function (nodeIds) {
    var that = this, ids = nodeIds();
    if (!~ids) return;
    ids = ko.utils.arrayFilter([].concat(ids), function (id) {
        return id != -1 && id;
    });
    if (!ids.length) return;
    window.notShowCover = true;
    this.store.getParentsByIds.call(this, ids)
        .then(function (data) {
            window.notShowCover = false;
            if (data && data.length) {
                that.model.updateNodes($.map(data, function (item) {
                    return that.generateNodePath(item)
                }));
            }
        })
}
ViewModel.prototype.generateNodePath = function (item) {
    var len = item.mix_nodes.length,
        result = {node_id: item.child_mix_node_id};
    if (!len) return "";
    var mixNodes = item.mix_nodes,
        lastNode = mixNodes[len - 1]
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
                return item.node_name
            }).join(' - ');
            break;
    }
    return result;
};
ViewModel.prototype.orgTreeSearch = function () {
    this.changeColor("node_name", this.model.search.keywords());
};
ViewModel.prototype.changeColor = function (key, value) {
    var _this = this, orgTreeObj = _this.orgTreeObj;
    if (orgTreeObj) {
        value = String(value).toLowerCase();
        var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), matchNode = null;
        for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
            var node = orgTreeNodes[i];
            if (value !== '' && _this._matchValue(node[key], value)) {
                node.highlight = true;
                !matchNode && (matchNode = node);
            } else {
                node.highlight = false;
            }
            orgTreeObj.expandNode(node.getParentNode(), true, false, false);
            orgTreeObj.updateNode(node);
        }
        matchNode && this._setBodyScrollTop(matchNode.tId);
        this.model.search.result(matchNode ? '' : '未搜索到结果');
    }
};
ViewModel.prototype.cancelAllNodes = function () {
    var self = this;
    this.model.updateNodes([]);
    this.model.org_text('点击查看或选择组织');
    this.model.org_node_type(0);
    this.model.org_nodes([]);
    this.model.search.keywords('');
    this.model.search.result('');
    if (this.orgTreeObj) {
        $.each(this.orgTreeObj.getCheckedNodes(), function (i, v) {
            self.orgTreeObj.checkNode(v, false, false, false);
        });
    }
    $('#zT-orgTreeModal').modal('hide');
};
ViewModel.prototype._matchValue = function (match, value) {
    return String(match).toLowerCase().indexOf(value) > -1;
};
ViewModel.prototype._setBodyScrollTop = function (id) {
    var orgTreem = $('#orgTreeModelBody');
    orgTreem.scrollTop(0);
    orgTreem.scrollTop($('#' + id).position().top - orgTreem.offset().top - this._getSearchFormH()());
};
ViewModel.prototype._getSearchFormH = function () {
    var height = null;
    return function () {
        if (!height) {
            height = $('#zT-searchForm').outerHeight(true);
        }
        return height + 10;
    }
};
ko.components.register('x-channel-admin-layout-content-organizeTree', {
    synchronous: true,
    template: tpl,
    viewModel: ViewModel
});
