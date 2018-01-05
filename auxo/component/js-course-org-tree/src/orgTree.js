/*
*  组织树上传文件
*  @params orgRootId 组织树根节点
*  @params orgNodeId 组织树当前节点
*  @params url 获取组织树的URL路径
*  @params isShowSearchBox 是否显示搜索框
*  !!!注意本组件 依赖一次性获取全部组织树的接口 url: http://elearning-onlineexam-gateway.debug.web.nd/ndu/online_exam/manage_orgs
*/ 

import ko from 'knockout';
import template from './orgTree.html';

let _orgTreeId = 0;
function orgTreeId(){
    return _orgTreeId++;
}

const viewModel = function(params){
    let orgTreeComplete = false; // 树结构初始化完成
    const self = this;
    let modal = null;
    let orgTree = null;
    const url = params.url;
    const lastNode = ko.observable();
    const node = ko.observable();
    const orgRootId = ko.isObservable(params.orgRootId)?params.orgRootId:ko.observable(params.orgRootId);
    const orgNodeId = ko.isObservable(params.orgNodeId)?params.orgNodeId:ko.observable(params.orgNodeId);


    orgRootId.subscribe(function(newValue){
        let _orgNodeId =ko.unwrap(orgNodeId)
        newValue&&_orgNodeId?self.model.orgMode('private'):''
    })
    orgNodeId.subscribe(function(newValue){
        let _orgRootId =ko.unwrap(orgRootId)
        newValue&&_orgRootId?self.model.orgMode('private'):''
    })
    const subscription = orgNodeId.subscribe(function(newValue){
        if(newValue&&!orgTreeComplete&&orgTree) {
            let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
            ko.utils.arrayForEach(orgTreeArr, function(item, index){
                if(item.node_id === newValue) {
                    subscription.dispose(); // 必须先执行，不然会无限循环调用
                    node(item);
                    orgTree&&orgTree.checkNode(item, true)
                    orgTree.expandNode(item, true, false, false, false)
                }
            })
            orgTreeComplete = true;
        }
    })

    this.model = {
        modalId: Date.now()+''+orgTreeId(),
        orgTreeId: Date.now()+''+orgTreeId(),
        radioId: Date.now()+''+orgTreeId(),
        isShowSearchBox: ko.observable(params.isShowSearchBox === true), // 是否显示搜索框
        showModal: ko.observable(false),
        searchText: ko.observable(''),
        orgMode: ko.observable(ko.unwrap(orgRootId)&&ko.unwrap(orgNodeId)?'private':'public'),
        text: ko.computed(function(){
            let n = ko.unwrap(node);
            return n? n.node_name: '点击查看或选择所属组织'
        })
    }
    this.methods = {
        toggleModal: function(){
            this.model.showModal(!ko.unwrap(this.model.showModal));
        },
        seachBox: function(){
            let text  = ko.unwrap(this.model.searchText);
            if(!text) return;
            let reg = new RegExp(text);
            if(!orgTree) return;
            orgTree.refresh();
            let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
            ko.utils.arrayForEach(orgTreeArr, function(item, index){
                if(reg.test(item.node_name)) {
                    console.log('seach find');
                    orgTree.selectNode(item, true, false);
                }
            })
            orgTreeComplete = true;
        }
    }
    this.model.showModal.subscribe(function(newValue){
        if(!modal) return;
        newValue?modal.modal('show'):modal.modal('hide');
    }, this)
    node.subscribe(function(newNode){
        if(newNode){
            orgNodeId(newNode.node_id);
            orgRootId(newNode.root_id);
        } else {
            orgNodeId('');
            orgRootId('');
        }
    })
    this.model.orgMode.subscribe(function(newValue){
        if(newValue === 'public') {
            lastNode(ko.unwrap(node));
            node(false);
        } else if(newValue === 'private') {
            let _lastNode = ko.unwrap(lastNode);
            _lastNode?node(_lastNode):'';
        }
    })

    ko.tasks.schedule(function(){
        modal = $('#'+ko.unwrap(self.model.modalId));
    })
    
    var defer = $.Deferred();
    var promise = defer.promise();
    promise.then(function(orgTreeData){
        orgTree = $.fn.zTree.init($("#"+ ko.unwrap(self.model.orgTreeId)), {
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
                onCheck: function(event, treeId, treeNode) {
                    treeNode.checked?node(treeNode):node(false)
                }
            }
        }, orgTreeData);
        orgTree.expandNode(orgTree.getNodes()[0], true, false, false, false)
        let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
        let node_id = ko.unwrap(orgNodeId)
        if(!node_id) return;
        let nodes = [];
        ko.utils.arrayForEach(orgTreeArr, function(item, index){
            if(item.node_id === node_id) {
                node(item);
                orgTree&&orgTree.checkNode(item, true)
                orgTree.expandNode(item, true, false, false, false)
            }
        })
    })

    if(typeof url === 'string') {
        $.ajax({
            url: url,
            type: 'GET',
            cache: false
        }).done(function(res) {
            defer.resolve(res.org_tree)
        })
    } else if (typeof url === 'function') {
        var _ = url();
        if(typeof _.done === 'function') {
            _.done(function(res){
                defer.resolve(res.org_tree)
            })
        } else {
            defer.resolve(_);
        }
    }
}


ko.components.register('x-course-org-tree', {
    viewModel: viewModel,
    template: template
})