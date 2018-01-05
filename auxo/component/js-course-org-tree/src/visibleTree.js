/*
*  可见树上传文件
*  @params visibleType 可见树类型 0：全部可见 1： 组织内部可见 2. 不可见
*  @params visibleOrgNodes 可见树节点列表
*  @params url 获取组织树的URL路径
*  @params isShowSearchBox 是否显示搜索框
*  !!!注意本组件 依赖一次性获取全部组织树的接口 url: http://elearning-onlineexam-gateway.debug.web.nd/ndu/online_exam/manage_orgs
*/ 


import ko from 'knockout';
import template from './visibleTree.html';

let _orgTreeId = 0;
function orgTreeId(){
    return _orgTreeId++;
}

const viewModel = function(params){
    const self = this;
    let modal = null;
    let orgTree = null;
    const url = params.url;
    // TODO 强校验确保visibleOrgNodes是Array对象
    const visibleType = ko.isObservable(params.visibleType)?params.visibleType:ko.observable(params.visibleType);
    const visibleOrgNodes = ko.isObservable(params.visibleOrgNodes)?params.visibleOrgNodes:ko.observableArray(params.visibleOrgNodes);

    const visibleTypeSubscription = visibleType.subscribe(function(newValue){
        let nodes = ko.unwrap(visibleOrgNodes);
        if(newValue == 1&&nodes.length>0&&orgTree) {
            let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
            ko.utils.arrayForEach(orgTreeArr, function(item, index){
                if(ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
                    visibleTypeSubscription.dispose();
                    orgTree&&orgTree.checkNode(item, true)
                    orgTree.expandNode(item, true, false, false, false)
                }
            })
        }
    })

    const visibleOrgNodesSubscription = visibleOrgNodes.subscribe(function(nodes) {
        let visibleType = ko.unwrap(visibleOrgNodes);
        if(visibleType==1&&nodes.length>0&&orgTree) {
            let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
            ko.utils.arrayForEach(orgTreeArr, function(item, index){
                if(ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
                    visibleOrgNodesSubscription.dispose();
                    orgTree&&orgTree.checkNode(item, true)
                    orgTree.expandNode(item, true, false, false, false)
                }
            })
        }
    })

    this.model = {
        modalId: Date.now()+''+orgTreeId(),
        orgTreeId: Date.now()+''+orgTreeId(),
        radioId: Date.now()+''+orgTreeId(),
        isShowSearchBox: ko.observable(params.isShowSearchBox === true), // 是否显示搜索框
        visibleOrgNodes:visibleOrgNodes,
        visibleType: visibleType,
        showModel: ko.observable(false),
        text: ko.computed(function(){
            let n = ko.unwrap(visibleOrgNodes);
            return n.length > 0 ? '已经选择'+ n.length + '个组织': '点击查看或选择组织'
        })
    }
    this.methods = {
        toggleModal: function(){
            this.model.showModel(!ko.unwrap(this.model.showModel));
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

        }
    }
    this.model.showModel.subscribe(function(newValue){
        if(!modal) return;
        newValue?modal.modal('show'):modal.modal('hide');
    }, this)

    // Init
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
                chkboxType: { "Y": "", "N": "" },
                chkStyle: "checkbox",
                chkDisabledInherit: false
            },
            callback: {
                onCheck: function(event, treeId, treeNode) {
                    treeNode.checked?visibleOrgNodes.push(treeNode.node_id):visibleOrgNodes.remove(treeNode.node_id)
                }
            }
        }, orgTreeData);
        orgTree.expandNode(orgTree.getNodes()[0], true, false, false, false)
        let orgTreeArr = orgTree.transformToArray(orgTree.getNodes())
        let nodes = ko.unwrap(visibleOrgNodes)
        let type = ko.unwrap(visibleType)
        if(nodes.length<=0||type!=1) return;
        ko.utils.arrayForEach(orgTreeArr, function(item, index){
            if(ko.utils.arrayIndexOf(nodes, item.node_id) >= 0) {
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


ko.components.register('x-course-visible-tree', {
    viewModel: viewModel,
    template: template
})