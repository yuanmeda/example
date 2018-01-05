window.tree = (function(window, $){
  function Tree(){
    this.treeSetting = {
      data: {
        key: {
          children: "children",
          name: "title",
          title: "title"
        },
        simpleData: {
          idKey: "id"
        }
      },
      check: {
        enable: true,
        chkboxType: {
          "Y": "",
          "N": ""
        },
        chkStyle: 'radio',
        radioType: 'all'
      },
      callback: {
        onClick: $.proxy(this._onClick, this),
        onCheck: $.proxy(this._onCheck, this)
      }
    };
    this.treeInstance = null;
  }

  Tree.prototype = {
    _init: function(){},
    _show: function(checkId, target, hideRoot){
      var t = this;
      checkId = checkId || -1;
      this.$target = $(target);
      if (!this.treeInstance) {
        Tree.loadTags()
          .then(function(d){
            if (!d) {
              t.$target.html('暂无节点');
              return;
            }
            var _tree = [d];
            delete d.id;
            if (hideRoot) {
              _tree = d.children
            }
            if (_tree.length) {
              t.treeInstance = $.fn.zTree.init(t.$target, t.treeSetting, _tree);
              t.rootNode = d;
              t.treeInstance.expandAll(true);
              t._checkNode(checkId);
            }
          });
      } else {
        t.treeInstance.checkAllNodes(false);
        t.treeInstance.expandAll(true);
        t._checkNode(checkId);
      }
    },
    _checkNode: function(id){
      var node = this.treeInstance.getNodesByParam("id", id, null)[0];
      if (!node) {
        node = this.treeInstance.getNodes()[0];
      }
      this.treeInstance.checkNode(node, true, true, false);
    },
    _onClick: function(evt, treeId, treeNode){
      this._checkNode(treeNode.id);
    },
    _onCheck: function(evt, treeId, treeNode){

    },
    _node: function(){
      if (!this.treeInstance) {
        return [{title: '全部'}];
      }
      var nodes = this.treeInstance.getCheckedNodes(true);
      return nodes;
    }
  };
  Tree.loadTags = function(){
    return $.ajax({
      url: window.certificate_webpage_host + '/' + window.project_code + '/tags/tree',
      data: {
        custom_type: 'e-certificate'
      }
    });

  };
  var tree = new Tree();
  return {
    show: $.proxy(tree._show, tree),
    clazz: Tree,
    instance: tree,
    node: $.proxy(tree._node, tree)
  };
})(window, jQuery);
