(function () {
    var tree = function (data, dom, setting) {
        this.treeObj = null;
        this.target = dom||$('#J_Tree');
        this.setting = {
            data: {
                key: {
                    children: "children",
                    name: "title",
                    title: "title",
                },
                simpleData: {
                    idKey: "id"
                }
            },
            check: {
                enable: true,
                chkboxType: { "Y": "", "N": "" },
                radioType:'all'
            },
            callback: {
                onClick:this.defaultClick.bind(this)
            }
        };
        this.init(setting,data);
    };
    tree.prototype = {
        init: function (_s, _d) {
            this.setting = $.extend(true,this.setting, _s || {});
            this.treeObj = $.fn.zTree.init(this.target, this.setting, _d);
            return this.treeObj;
        },
        defaultClick:function(e,tid,tnode){
            var tree=this.treeObj;
            tree.checkNode(tnode,!tnode.checked,true,false);
        }
    };

    window.ZTREE = tree;

})()