;(function () {
    "use strict";
    var _ = ko.utils;

    var groupNames = (function () {
        return $.map(window.allGroupNames, function (v) {
            return v.name;
        })
    })();

    function ViewModel(params) {
        var model = {
            selectedItem: {
                id: '',
                title: '',
                channel_id: ''
            },
            resource_group: [],
            order_type: 3,//排序类型 3：综合 1：最新 2：最热
            group_names: groupNames
        };
        this.params = params;
        this.parent = params.parent;
        this.model = ko.mapping.fromJS(model);
        this.init();
    }

    ViewModel.prototype.store = {
        getChannelTag: function () {
            return $.ajax({
                url: '/' + projectCode + '/channels/tags/tree',
                cache: false,
                dataType: 'json'
            });
        },
        getResTag: function () {
            return $.ajax({
                url: '/' + projectCode + '/resource_pool/tags/tree',
                cache: false,
                dataType: 'json'
            });
        },
        getTreeById: function () {
            return $.ajax({
                url: '/' + projectCode + '/channels/' + channelId + '/tags/tree',
                cache: false,
                data: {custom_type: customType}
            })
        }
    };
    ViewModel.prototype.init = function () {
        var selected_tag = ko.mapping.toJS(this.params.selected_tag),
            selected_id = '';

        if (selected_tag.channel_id) {
            this.model.selectedItem.id('');
            this.model.selectedItem.channel_id(selected_tag.channel_id);
            selected_id = selected_tag.channel_id;
        }
        if (selected_tag.tag_id) {
            this.model.selectedItem.id(selected_tag.tag_id);
            selected_id = selected_tag.tag_id;
        }

        this.model.order_type(selected_tag.order_type || 3);
        this.model.group_names(selected_tag.group_names.length ? selected_tag.group_names : groupNames);

        this.getResourceGroup();
        this.getTree(selected_id);

        this.model.isAllGroupNames = ko.computed({
            read: function () {
                var list = this.model.resource_group(), selected = this.model.group_names();
                return list.length && selected.length === list.length;
            },
            write: function (value) {
                var list = this.model.resource_group(), selected = this.model.group_names;
                if (value) {
                    selected($.map(list, function (v) {
                        return v.name;
                    }));
                } else {
                    selected([])
                }
            },
            owner: this
        });
    };
    ViewModel.prototype.save = function () {
        if (!this.model.group_names().length) {
            $.alert('请至少勾选一个资源类型！');
            return;
        }
        var selectedItem = this.model.selectedItem,
            selected_tag = this.params.selected_tag;
        if (!this.params.disable) {
            var selected_nodes = this.ztreeObject.getCheckedNodes(true);
            if (!selected_nodes.length) {
                $.alert('请选择标签');
                return;
            }

            var item = this.model.selectedItem;
            if (selected_nodes[0].level !== 0) {
                var parent = selected_nodes[0].getParentNode();
                while (parent.level != 0) {
                    parent = parent.getParentNode()
                }
                item.title(selected_nodes[0].title);
                item.channel_id(parent.id);
                item.id(selected_nodes[0].id);
            } else {
                var title = this.params.from === 'other' ? selected_nodes[0].title : selected_nodes[0].tag_name;
                item.title(title);
                item.channel_id(selected_nodes[0].id);
                item.id('');
            }

            if (~$.inArray(this.params.from, ['icon', 'window', 'banner'])) {
                if (this.params.from === 'icon') selected_tag.resource_name(selectedItem.title());
                if (!selected_tag.title()) selected_tag.title(selectedItem.title());
                selected_tag.channel_id(selectedItem.channel_id());
            }

            selected_tag.tag_id(selectedItem.id());
        }
        selected_tag.group_names(this.model.group_names());
        if (this.params.from !== 'other') selected_tag.order_type(this.model.order_type());

        if (~$.inArray(this.params.from, ['other', 'window'])) {
            this.parent.create.call(this.parent);
            this.parent.model.tag_name(selectedItem.title());
        }

        $('#' + this.params.id).modal('hide');
        $('body').removeClass('modal-open');
    };
    ViewModel.prototype.getResourceGroup = function () {
        this.model.resource_group(window.allGroupNames || []);
    };
    ViewModel.prototype.getTree = function (selected_id) {
        var that = this, tree_name = 'tree-' + this.params.id;
        var resTag, channelTag, resultTag = [], resRootTag = {}, channelRootTag = {};
        if (!this.params.type) {
            $.when(this.store.getResTag(), this.store.getChannelTag()).done(function (resTags, channelTags) {
                resTag = resTags[0];
                channelTag = that.formatChannelTree(channelTags[0]);
                if (resTag) {
                    resRootTag = {
                        id: 0,
                        title: '资源池标签',
                        "nocheck": true,
                        children: [resTag]
                    };
                }
                if (channelTag) {
                    channelRootTag = {
                        id: 0,
                        title: '频道的标签',
                        "nocheck": true,
                        children: channelTag
                    };
                }
                if (resTag) resultTag.push(resRootTag);
                if (channelTag) resultTag.push(channelRootTag);
                that.loadTree(resultTag, tree_name, selected_id);
            });
        } else if (this.params.type === 4) {
            if (this.params.all) {
                this.store.getChannelTag().done(function (channelTags) {
                    channelTag = that.formatChannelTree(channelTags);
                    if (channelTag) {
                        channelRootTag = {
                            id: 0,
                            title: '频道的标签',
                            "nocheck": true,
                            children: channelTag
                        };
                    }
                    if (channelTag) resultTag = channelTag;
                    that.loadTree(resultTag, tree_name, selected_id);
                });
            } else {
                this.store.getTreeById().done(function (channelTags) {
                    channelTag = channelTags;
                    if (channelTag) {
                        channelRootTag = {
                            id: 0,
                            title: '频道的标签',
                            "nocheck": true,
                            children: [channelTag]
                        };
                    }
                    if (channelTag) resultTag.push(channelTag);
                    that.loadTree(resultTag, tree_name, selected_id);
                });
            }

        } else if (this.params.type === 5) {
            this.store.getResTag().done(function (resTags) {
                resTag = resTags;
                if (resTag) {
                    resRootTag = {
                        id: 0,
                        title: '资源池标签',
                        "nocheck": true,
                        children: [resTag]
                    };
                }
                if (resTag) resultTag.push(resTag);
                that.loadTree(resultTag, tree_name, selected_id);
            });
        }

    };
    ViewModel.prototype.formatChannelTree = function (tree) {
        return _.arrayMap(tree, function (item) {
            return {
                id: item.channel_id,
                title: (item.status ? '频道：' + item.channel_name + '(启用)' : '频道：' + item.channel_name + '(停用)'),
                tag_name: item.channel_name,
                status: item.status,
                children: $.isArray(item.tag_tree_vo) ? item.tag_tree_vo : (item.tag_tree_vo.id ? [item.tag_tree_vo] : [])
            };
        });
    };
    ViewModel.prototype.loadTree = function (tag, treeId, selected_id) {
        var self = this;
        if (tag.length) {
            //if (tag.children instanceof Array) {
            var setting = {
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
                    chkStyle: "radio",
                    radioType: "all"
                },
                view: {
                    dblClickExpand: function dblClickExpand(treeId, treeNode) {
                        return treeNode.level > 0;
                    },
                    selectedMulti: false,

                    fontCss: function (treeId, treeNode) {
                        return treeNode.status ? {color: "#3c763d"} : {};
                    }

                }
            };
            var ztreeObj = {};
            ztreeObj[treeId] = this.ztreeObject = $.fn.zTree.init($('#' + treeId), setting, tag);
            ztreeObj[treeId].checkAllNodes(false);
            ztreeObj[treeId].expandAll(true);

            if (selected_id) {
                var node = ztreeObj[treeId].getNodeByParam("id", selected_id);
                if (node) {
                    ztreeObj[treeId].checkNode(node, true, false);
                }

            } else {
                if (this.params.auto_selected) {
                    ztreeObj[treeId].checkNode(ztreeObj[treeId].getNodes()[0], true, false);
                }
            }
            if (this.params.disable) {
                $.each(ztreeObj[treeId].getNodes(), function (index, singlenode) {
                    var node = ztreeObj[treeId].getNodeByParam("id", singlenode.id);
                    ztreeObj[treeId].setChkDisabled(node, true, true, true);
                });
            }
            //} else {
            //$('#' + treeId).text("无分类！");
            // }
        }
        else {
            $('#' + treeId).text("无分类！");
        }
    };
    ko.components.register('x-channel-tag', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})();
