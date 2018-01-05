(function (ko) {
'use strict';

ko = ko && ko.hasOwnProperty('default') ? ko['default'] : ko;

var template = "<div class=\"x-course-org-tree\">\r\n    <span class=\"org-tree-block\">\r\n        <input type=\"radio\" value=\"public\" data-bind=\"attr: { name: model.radioId }, checked: model.orgMode\"> 公开\r\n    </span>\r\n    <span class=\"org-tree-block\">\r\n        <input type=\"radio\" value=\"private\" data-bind=\"attr: { name: model.radioId }, checked: model.orgMode\"> 组织内部\r\n    </span>\r\n    <!-- ko if: ko.unwrap(model.orgMode) === 'private' -->\r\n    <span class=\"org-tree-block\" data-bind=\"click:methods.toggleModal\">\r\n        <input type=\"text\" readonly=\"readonly\" data-bind=\"value: model.text\">\r\n    </span>  \r\n    <!-- /ko -->\r\n    <div class=\"modal hide\" data-bind=\"attr: { id: model.modalId }\" data-backdrop=\"static\" tabindex=\"-1\" role=\"modal\">\r\n        <div class=\"modal-header\">\r\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" data-bind=\"click:methods.toggleModal\">×</button>\r\n            <h3>选择组织</h3>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <!-- ko if: model.isShowSearchBox -->\r\n            <div class=\"seach-box\">\r\n                <span><input type=\"text\" data-bind=\"value: model.searchText\" placeholder=\"请输入组织名称\"></span>\r\n                <span><div class=\"btn btn-default\" data-bind=\"click: methods.seachBox\">搜索</div></span>\r\n            </div>\r\n            <!-- /ko -->\r\n            <div data-bind=\"attr: { id: model.orgTreeId }\" class=\"ztree\">\r\n                请在项目中配置项目的UC组织\r\n            </div>\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n            <div class=\"btn btn-primary\" data-bind=\"click:methods.toggleModal\">确定</div>\r\n        </div>\r\n    </div>\r\n</div>";

/*
*  组织树上传文件
*  @params orgRootId 组织树根节点
*  @params orgNodeId 组织树当前节点
*  @params url 获取组织树的URL路径
*  @params isShowSearchBox 是否显示搜索框
*  !!!注意本组件 依赖一次性获取全部组织树的接口 url: http://elearning-onlineexam-gateway.debug.web.nd/ndu/online_exam/manage_orgs
*/

var _orgTreeId = 0;
function orgTreeId() {
    return _orgTreeId++;
}

var viewModel = function viewModel(params) {
    var orgTreeComplete = false; // 树结构初始化完成
    var self = this;
    var modal = null;
    var orgTree = null;
    var url = params.url;
    var lastNode = ko.observable();
    var node = ko.observable();
    var orgRootId = ko.isObservable(params.orgRootId) ? params.orgRootId : ko.observable(params.orgRootId);
    var orgNodeId = ko.isObservable(params.orgNodeId) ? params.orgNodeId : ko.observable(params.orgNodeId);

    orgRootId.subscribe(function (newValue) {
        var _orgNodeId = ko.unwrap(orgNodeId);
        newValue && _orgNodeId ? self.model.orgMode('private') : '';
    });
    orgNodeId.subscribe(function (newValue) {
        var _orgRootId = ko.unwrap(orgRootId);
        newValue && _orgRootId ? self.model.orgMode('private') : '';
    });
    var subscription = orgNodeId.subscribe(function (newValue) {
        if (newValue && !orgTreeComplete && orgTree) {
            var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
            ko.utils.arrayForEach(orgTreeArr, function (item, index) {
                if (item.node_id === newValue) {
                    subscription.dispose(); // 必须先执行，不然会无限循环调用
                    node(item);
                    orgTree && orgTree.checkNode(item, true);
                    orgTree.expandNode(item, true, false, false, false);
                }
            });
            orgTreeComplete = true;
        }
    });

    this.model = {
        modalId: Date.now() + '' + orgTreeId(),
        orgTreeId: Date.now() + '' + orgTreeId(),
        radioId: Date.now() + '' + orgTreeId(),
        isShowSearchBox: ko.observable(params.isShowSearchBox === true), // 是否显示搜索框
        showModal: ko.observable(false),
        searchText: ko.observable(''),
        orgMode: ko.observable(ko.unwrap(orgRootId) && ko.unwrap(orgNodeId) ? 'private' : 'public'),
        text: ko.computed(function () {
            var n = ko.unwrap(node);
            return n ? n.node_name : '点击查看或选择所属组织';
        })
    };
    this.methods = {
        toggleModal: function toggleModal() {
            this.model.showModal(!ko.unwrap(this.model.showModal));
        },
        seachBox: function seachBox() {
            var text = ko.unwrap(this.model.searchText);
            if (!text) return;
            var reg = new RegExp(text);
            if (!orgTree) return;
            orgTree.refresh();
            var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
            ko.utils.arrayForEach(orgTreeArr, function (item, index) {
                if (reg.test(item.node_name)) {
                    console.log('seach find');
                    orgTree.selectNode(item, true, false);
                }
            });
            orgTreeComplete = true;
        }
    };
    this.model.showModal.subscribe(function (newValue) {
        if (!modal) return;
        newValue ? modal.modal('show') : modal.modal('hide');
    }, this);
    node.subscribe(function (newNode) {
        if (newNode) {
            orgNodeId(newNode.node_id);
            orgRootId(newNode.root_id);
        } else {
            orgNodeId('');
            orgRootId('');
        }
    });
    this.model.orgMode.subscribe(function (newValue) {
        if (newValue === 'public') {
            lastNode(ko.unwrap(node));
            node(false);
        } else if (newValue === 'private') {
            var _lastNode = ko.unwrap(lastNode);
            _lastNode ? node(_lastNode) : '';
        }
    });

    ko.tasks.schedule(function () {
        modal = $('#' + ko.unwrap(self.model.modalId));
    });

    var defer = $.Deferred();
    var promise = defer.promise();
    promise.then(function (orgTreeData) {
        orgTree = $.fn.zTree.init($("#" + ko.unwrap(self.model.orgTreeId)), {
            data: {
                key: {
                    name: 'node_name',
                    title: 'node_name'
                }
            },
            check: {
                enable: true,
                chkStyle: "radio",
                radioType: "all"
            },
            callback: {
                onCheck: function onCheck(event, treeId, treeNode) {
                    treeNode.checked ? node(treeNode) : node(false);
                }
            }
        }, orgTreeData);
        orgTree.expandNode(orgTree.getNodes()[0], true, false, false, false);
        var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
        var node_id = ko.unwrap(orgNodeId);
        if (!node_id) return;
        var nodes = [];
        ko.utils.arrayForEach(orgTreeArr, function (item, index) {
            if (item.node_id === node_id) {
                node(item);
                orgTree && orgTree.checkNode(item, true);
                orgTree.expandNode(item, true, false, false, false);
            }
        });
    });

    if (typeof url === 'string') {
        $.ajax({
            url: url,
            type: 'GET',
            cache: false
        }).done(function (res) {
            defer.resolve(res.org_tree);
        });
    } else if (typeof url === 'function') {
        var _ = url();
        if (typeof _.done === 'function') {
            _.done(function (res) {
                defer.resolve(res.org_tree);
            });
        } else {
            defer.resolve(_);
        }
    }
};

ko.components.register('x-course-org-tree', {
    viewModel: viewModel,
    template: template
});

var template$1 = "<div class=\"x-course-visible-tree\">\r\n    <span class=\"org-tree-block\">\r\n        <input type=\"radio\" data-bind=\"checked: model.visibleType, checkedValue: 0, attr: { name: model.radioId }\"> 公开\r\n    </span>\r\n    <span class=\"org-tree-block\">\r\n        <input type=\"radio\" data-bind=\"checked: model.visibleType, checkedValue: 1, attr: { name: model.radioId }\"> 组织内部\r\n    </span>\r\n    <!-- ko if: +ko.unwrap(model.visibleType) === 1 -->\r\n    <span class=\"org-tree-block\" data-bind=\"click:methods.toggleModal\">\r\n        <input type=\"text\" readonly=\"readonly\" data-bind=\"value: model.text\">\r\n    </span>  \r\n    <!-- /ko -->\r\n    <div class=\"modal hide\" data-bind=\"attr: { id: model.modalId }\" data-backdrop=\"static\" tabindex=\"-1\" role=\"modal\">\r\n        <div class=\"modal-header\">\r\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" data-bind=\"click:methods.toggleModal\">×</button>\r\n            <h3>选择组织</h3>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <!-- ko if: model.isShowSearchBox -->\r\n            <div class=\"seach-box\">\r\n                <span><input type=\"text\" data-bind=\"value: model.searchText\" placeholder=\"请输入组织名称\"></span>\r\n                <span><div class=\"btn btn-default\" data-bind=\"click: methods.seachBox\">搜索</div></span>\r\n            </div>\r\n            <!-- /ko -->\r\n            <div data-bind=\"attr: { id: model.orgTreeId }\" class=\"ztree\">\r\n                请在项目中配置项目的UC组织\r\n            </div>\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n            <div class=\"btn btn-primary\" data-bind=\"click:methods.toggleModal\">确定</div>\r\n        </div>\r\n    </div>\r\n</div>";

/*
*  可见树上传文件
*  @params visibleType 可见树类型 0：全部可见 1： 组织内部可见 2. 不可见
*  @params visibleOrgNodes 可见树节点列表
*  @params url 获取组织树的URL路径
*  @params isShowSearchBox 是否显示搜索框
*  !!!注意本组件 依赖一次性获取全部组织树的接口 url: http://elearning-onlineexam-gateway.debug.web.nd/ndu/online_exam/manage_orgs
*/

var _orgTreeId$1 = 0;
function orgTreeId$1() {
    return _orgTreeId$1++;
}

var viewModel$1 = function viewModel(params) {
    var self = this;
    var modal = null;
    var orgTree = null;
    var url = params.url;
    // TODO 强校验确保visibleOrgNodes是Array对象
    var visibleType = ko.isObservable(params.visibleType) ? params.visibleType : ko.observable(params.visibleType);
    var visibleOrgNodes = ko.isObservable(params.visibleOrgNodes) ? params.visibleOrgNodes : ko.observableArray(params.visibleOrgNodes);

    var visibleTypeSubscription = visibleType.subscribe(function (newValue) {
        var nodes = ko.unwrap(visibleOrgNodes);
        if (newValue == 1 && nodes.length > 0 && orgTree) {
            var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
            ko.utils.arrayForEach(orgTreeArr, function (item, index) {
                if (ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
                    visibleTypeSubscription.dispose();
                    orgTree && orgTree.checkNode(item, true);
                    orgTree.expandNode(item, true, false, false, false);
                }
            });
        }
    });

    var visibleOrgNodesSubscription = visibleOrgNodes.subscribe(function (nodes) {
        var visibleType = ko.unwrap(visibleOrgNodes);
        if (visibleType == 1 && nodes.length > 0 && orgTree) {
            var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
            ko.utils.arrayForEach(orgTreeArr, function (item, index) {
                if (ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
                    visibleOrgNodesSubscription.dispose();
                    orgTree && orgTree.checkNode(item, true);
                    orgTree.expandNode(item, true, false, false, false);
                }
            });
        }
    });

    this.model = {
        modalId: Date.now() + '' + orgTreeId$1(),
        orgTreeId: Date.now() + '' + orgTreeId$1(),
        radioId: Date.now() + '' + orgTreeId$1(),
        isShowSearchBox: ko.observable(params.isShowSearchBox === true), // 是否显示搜索框
        visibleOrgNodes: visibleOrgNodes,
        visibleType: visibleType,
        showModel: ko.observable(false),
        text: ko.computed(function () {
            var n = ko.unwrap(visibleOrgNodes);
            return n.length > 0 ? '已经选择' + n.length + '个组织' : '点击查看或选择组织';
        })
    };
    this.methods = {
        toggleModal: function toggleModal() {
            this.model.showModel(!ko.unwrap(this.model.showModel));
        },
        seachBox: function seachBox() {
            var text = ko.unwrap(this.model.searchText);
            if (!text) return;
            var reg = new RegExp(text);
            if (!orgTree) return;
            orgTree.refresh();
            var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
            ko.utils.arrayForEach(orgTreeArr, function (item, index) {
                if (reg.test(item.node_name)) {
                    console.log('seach find');
                    orgTree.selectNode(item, true, false);
                }
            });
        }
    };
    this.model.showModel.subscribe(function (newValue) {
        if (!modal) return;
        newValue ? modal.modal('show') : modal.modal('hide');
    }, this);

    // Init
    ko.tasks.schedule(function () {
        modal = $('#' + ko.unwrap(self.model.modalId));
    });

    var defer = $.Deferred();
    var promise = defer.promise();
    promise.then(function (orgTreeData) {
        orgTree = $.fn.zTree.init($("#" + ko.unwrap(self.model.orgTreeId)), {
            data: {
                key: {
                    name: 'node_name',
                    title: 'node_name'
                }
            },
            check: {
                enable: true,
                chkboxType: { "Y": "", "N": "" },
                chkStyle: "checkbox",
                chkDisabledInherit: false
            },
            callback: {
                onCheck: function onCheck(event, treeId, treeNode) {
                    treeNode.checked ? visibleOrgNodes.push(treeNode.node_id) : visibleOrgNodes.remove(treeNode.node_id);
                }
            }
        }, orgTreeData);
        orgTree.expandNode(orgTree.getNodes()[0], true, false, false, false);
        var orgTreeArr = orgTree.transformToArray(orgTree.getNodes());
        var nodes = ko.unwrap(visibleOrgNodes);
        var type = ko.unwrap(visibleType);
        if (nodes.length <= 0 || type != 1) return;
        ko.utils.arrayForEach(orgTreeArr, function (item, index) {
            if (ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
                orgTree && orgTree.checkNode(item, true);
                orgTree.expandNode(item, true, false, false, false);
            }
        });
    });

    if (typeof url === 'string') {
        $.ajax({
            url: url,
            type: 'GET',
            cache: false
        }).done(function (res) {
            defer.resolve(res.org_tree);
        });
    } else if (typeof url === 'function') {
        var _ = url();
        if (typeof _.done === 'function') {
            _.done(function (res) {
                defer.resolve(res.org_tree);
            });
        } else {
            defer.resolve(_);
        }
    }
};

ko.components.register('x-course-visible-tree', {
    viewModel: viewModel$1,
    template: template$1
});

}(ko));
