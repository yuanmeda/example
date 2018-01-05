import tpl from './template.html'
import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue,
    _ = ko.utils;

class ViewModel {
    constructor(params, componentInfo) {
        this.element = $(componentInfo.element);
        this.model = {
            readonly: params.readonly || ko.observable(false),
            selectedList: params.selectedList || ko.observableArray([]),
            selectedShowList: ko.observableArray([]),
            userList: ko.observableArray([]),
            orgId: Number(ko.unwrap(params.orgId)) || 0,
            orgType: ko.unwrap(params.orgType || ''),
            userKeyword: ko.observable(''),
            selectedKeyword: ko.observable(''),
            focusIndex: ko.observable(-1),
            focusSelectedIndex: ko.observable(-1),
            height: ko.observable(params.config.height || '690px'),
            avatarPath: ko.observable(params.config.avatarPath),
            isRadio: ko.observable(params.config.isRadio || false),
        };

        this.model.selectedShowList(this.model.selectedList());

        this.config = $.extend({
            initialData: [],
            host: '',
            userHost: '',
            version: '',
            userVersion: '',
            projectCode: '',
            limit: 100
        }, params.config);

        this.curNode = null;
        this.page = 1;
        this.callbacks = params.callbacks;
        this.isLoding = false;
        this.hasMore = true;
        this.treeComponent = null;

        this.store = {
            getNodes: (nodeId = '0') => {
                return $.ajax({
                    url: `${this.config.host}/${this.config.projectCode}/${this.config.version}/mix_organizations/${this.model.orgId}/mix_nodes/${nodeId}/children`,
                    dataType: 'json',
                    cache: false
                });
            },
            getUser: (orgId, nodeId, name, page = 1) => {
                const limit = this.config.limit;
                const offset = (page - 1) * limit;
                const host = this.config.userHost || this.config.host;
                const version = this.config.userVersion || this.config.version
                let url = (name && name.length > 0) ?
                    `${host}/${this.config.projectCode}/${version}/organizations/${orgId}/orgnodes/${nodeId}/users/actions/search?name=${name}&$offset=${offset}&$limit=${limit}` :
                    `${host}/${this.config.projectCode}/${version}/organizations/${orgId}/orgnodes/${nodeId}/users?$offset=${offset}&$limit=${limit}`;
                return $.ajax({
                    url: url,
                    dataType: 'json',
                    cache: false
                })
            }
        };
        this.init();
    }

    init() {
        if (!this.model.orgId) return;
        let _this = this;
        this.initData(this.config.initialData).then(function (res) {
            if (!_this.model.readonly()) _this.initTree(res);
        });
        this.initObservable();
    }

    initData(initialData) {
        let defer = new $.Deferred();
        if (initialData && initialData.length) {
            defer.resolve({
                org_tree: initialData
            });
            return defer.promise();
        } else {
            return this.store.getNodes();
        }
    }

    initObservable() {
        var _this = this;
        _this.model.selectedList.subscribe(function (selectedList) {
            if (_this.model.selectedKeyword().length === 0) {
                _this.model.selectedShowList(selectedList);
            } else {
                if (selectedList.length !== _this.model.selectedShowList().length) {
                    _this.querySelected();
                }
            }
        });
    }

    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    transform(data) {
        return $.map(data, function (item) {
            item.isParent = item.isParent || item.is_parent;
            delete item.children;
            return item;
        });
    };

    querySelected(keyword = this.model.selectedKeyword()) {
        let list = this.model.selectedList();
        let reg = new RegExp(keyword);
        let newList = list.filter(function (item) {
            return !!(item['org.real_name'].match(reg) || item['user_id'].toString().match(reg))
        })
        this.model.selectedShowList(newList);
    }

    addAll() {
        if (this.model.isRadio()) {
            return;
        }
        let selectedList = this.concatList(this.model.selectedList(), this.model.userList());
        this.model.selectedList(selectedList);
        let selectedShowList = this.concatList(this.model.selectedShowList(), this.model.userList());
        this.model.selectedShowList(selectedShowList);
    }

    concatList(selectedList, userList) {
        let newArr = userList.filter(function (user) {
            let index = selectedList.findIndex(function (item) {
                return item.user_id === user.user_id;
            })
            return index === -1;
        })
        return selectedList.concat(newArr);
    }


    removeAllShow() {
        let selectedShowList = this.model.selectedShowList();
        let selectedList = this.model.selectedList();
        let newSelected = selectedList.filter(function (item) {
            let index = selectedShowList.findIndex(function (show) {
                return item.user_id === show.user_id;
            })
            return index === -1;
        });
        this.model.selectedList(newSelected);
        this.model.selectedShowList([]);
        this.model.focusSelectedIndex(-1);
    }

    removeAll() {
        this.model.selectedList([]);
        this.model.selectedShowList([]);
        this.model.focusSelectedIndex(-1);
    }

    addUser() {
        if (this.model.isRadio() && this.model.selectedList().length > 0) {
            return;
        }
        let index = this.model.focusIndex();
        if (index > -1) {
            let selectedList = this.concatList(this.model.selectedList(), [this.model.userList()[index]]);
            this.model.selectedList(selectedList);
            let selectedShowList = this.concatList(this.model.selectedShowList(), [this.model.userList()[index]]);
            this.model.selectedShowList(selectedShowList);
        }
    }

    removeUser() {
        let index = this.model.focusSelectedIndex();
        if (index > -1) {
            let selectedList = this.model.selectedList();
            let selectedShowList = this.model.selectedShowList();
            let remove = selectedShowList.splice(index, 1);
            let newSelectedList = selectedList.filter(function (item) {
                return item.user_id !== remove[0].user_id;
            })
            this.model.selectedShowList(selectedShowList);
            this.model.selectedList(newSelectedList);
        }
    }

    clickItem(index, type) {
        if (!type) {
            this.model.focusIndex(index());
        } else {
            this.model.focusSelectedIndex(index());
        }
    }

    onEnterKeydown(event, type) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 13) {
            this.onQuery(type, e.target.value);
        }
    }

    onQuery(type, keyword) {
        if (type === 0) {
            if (keyword === void 0) {
                keyword = this.model.userKeyword();
            }
            this.clearUserFilter();
            this.curNode && this.getUserList(this.curNode, 1, keyword);
        } else {
            if (keyword === void 0) {
                keyword = this.model.selectedKeyword();
            }
            this.querySelected(keyword);
        }
    }

    clearUserFilter() {
        this.model.userList([]);
        this.page = 1;
        this.isLoding = false;
        this.hasMore = true;
    }

    getUserList(treeNode, page = 1, keyword = this.model.userKeyword()) {
        var _this = this;
        this.page = page;
        this.curNode = treeNode;
        var node_id = treeNode.node_type === 2 ? 0 : treeNode.node_id;
        this.store.getUser(treeNode.org_id, node_id, keyword, page).then(function (res) {
            _this.isLoding = false;
            if (res.items.length > 0) {
                let userList = _this.model.userList();
                _this.model.userList(userList.concat(res.items || []));
            } else {
                _this.hasMore = false;
            }
        })
    }

    onScrollEvent(data, e) {
        let $target = $(e.target);
        let viewH = $target.height(); //可见高度
        let contentH = $target.get(0).scrollHeight; //内容高度
        let scrollTop = $target.scrollTop(); //滚动高度
        if (
            scrollTop / (contentH - viewH) >= 0.85 &&
            !this.isLoding &&
            this.hasMore
        ) {
            this.isLoding = true;
            this.getUserList(this.curNode, this.page + 1)
        }
    }

    initTree(data) {
        let model = this.model,
            _this = this;

        function uri(treeId, treeNode) {
            return `${_this.config.host}/${_this.config.projectCode}/${_this.config.version}/mix_organizations/${_this.model.orgId}/mix_nodes/${treeNode.node_id}/children`
        }

        let settings = {
            async: {
                enable: true,
                url: uri,
                type: 'get',
                dataType: 'json',
                contentType: 'applictaion/json',
                dataFilter: function dataFilter(treeId, parentNode, responseData) {
                    if (!responseData) return null;
                    return _this.transform(responseData);
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
            callback: {
                onClick: function onClick(event, treeId, treeNode) {
                    if (!+treeNode.parent_id) {
                        return true;
                    }
                    _this.clearUserFilter();
                    _this.getUserList(treeNode);
                },
                onAsyncSuccess: function onAsyncSuccess(event, treeId, treeNode, msg) {
                    if (!model.hasManager) {
                        var children = treeNode.children;
                        $.each(children, function (i, v) {
                            _this.treeComponent.setChkDisabled(v, true, false, true);
                        });
                    }
                },
                beforeClick: function beforeClick(event, treeNode) {
                    if (!+treeNode.parent_id) {
                        return false;
                    }

                },
            },
            view: {
                fontCss: function fontCss(treeId, treeNode) {
                    if (treeNode.highlight) {
                        return {
                            color: "#38adff",
                            "font-weight": "bold"
                        };
                    } else if (treeNode.node_type === 1) {
                        return {
                            color: "#767cf3",
                            "font-weight": "normal"
                        };
                    } else if (treeNode.node_type === 2) {
                        return {
                            color: "#000",
                            "font-weight": "normal"
                        };
                    } else if (treeNode.node_type === 3) {
                        return {
                            color: "#6c6d76",
                            "font-weight": "normal"
                        };
                    }
                },
                expandSpeed: 'normal'
            }
        };
        let tree = this.element.find('.ztree');
        tree.attr('id', 'tree-' + this.uuid());
        let orgTreeObj = this.treeComponent = $.fn.zTree.init(tree, settings, this.transform(data));
    };
}
ko.components.register('x-userTree-selector', {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new ViewModel(params, componentInfo);
        }
    },
    template: tpl
});