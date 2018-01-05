import ko from 'knockout'
import template from './template.html'

var course_config_map = {
    'teaching_course': {
        alias: "教学课",
        create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_manage?business_type=teaching_course&source=channel&__mac=${mac}",
        title: "教学课",
        update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
    },
    'exercise_course': {
        alias: "练习课",
        create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_for_channel?business_type=exercise_course&source=channel&__mac=${mac}",
        title: "练习课",
        update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
    },
    'offline_course': {
        alias: "线下课",
        create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_for_channel?business_type=offline_course&source=channel&__mac=${mac}",
        title: "线下课",
        update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
    }
};
var RESOURCE_CONFIG_MAP = (function () {
    var map = {}, g = window.allGroupNames;
    for (var i = 0; i < g.length; i++) {
        map[g[i].type] = g[i];
    }
    return $.extend(map, course_config_map);
}());
var _ = ko.utils;
var radioTower = new ko.subscribable();
var subscriptions = [];
ko.subscribable.fn.pub = function (topic) {
    this.subscribe(function (newValue) {
        radioTower.notifySubscribers(newValue, topic);
    });
    return this; //support chaining
};
ko.subscribable.fn.sub = function (topic, call, vm) {
    var target = vm || null;
    var cb = call || this; //如果没有call，那么直接捆绑原始数据
    for (var i in subscriptions) {
        subscriptions[i].dispose(); //no longer want notifications
    }
    subscriptions.push(radioTower.subscribe(cb, target, topic));

    return this;  //support chaining
};

function ViewModel(params) {
    var model = {
        channelList: [],
        clist: ko.observable({
            filter: null,
            flag: -1
        }).pub("clist"),
        items: [],
        catalogs: [],
        filter: {
            page_size: 20, //分页大小
            page_no: 0, //分页索引
            online_status: '',
            status: '', //状态：0下线，1上线
            name: '',//搜索关键字
            no_tag_resource: false,//是否查询未贴标签的资源, 默认为false
            tag_ids: [],//标签ID(多值)
            is_top: false,//置顶标识
            sort_type: 3,//排序类型：3综合 1最新 2最热
            time_status: '',//1即将开始 2正在开课 3已结束
            audit_status: '',
            group_names: [],//学习单元分组列表
            catalogs: [],
            flag: -1,
            affiliated_org_nodes: [],
            affiliated_org_node_filter_type: 0
        },
        status: [],
        group_names: [],
        selectedItems: [],
        style: 'pic', //列表显示风格
        tips: false, //是否显示提示信息,
        defaultImage: defaultImage,
        stages: {
            '$PRIMARY': '小学',
            '$MIDDLE': '初中',
            '$HIGH': '高中'
        }
    };
    this.filterObj = {};
    this.clist = ko.observable({});
    this.model = ko.mapping.fromJS(model);
    this.params = params;
    this.init();
}

ViewModel.prototype.store = {
    courseList: function (data, id) {
        return $.ajax({
            dataType: 'json',
            type: 'post',
            url: '/' + projectCode + '/channels/' + id + '/resources',
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8'
        });
    },
    //标签树
    getCatalogs: function (id) {
        return $.ajax({
            url: '/' + projectCode + '/channels/' + id + '/tags/tree',
            cache: false,
            dataType: 'json'
        });
    },
    getMixOrgTree: function () {
        return $.ajax({
            url: "/" + projectCode + "/manage_orgs",
            data: {org_id: window.projectOrgId},
            type: "get",
            dataType: "json",
            cache: false
        });
    },
};
ViewModel.prototype.init = function () {
    var that = this, _self = this;
    this.model.status([{
        title: '未贴标签',
        status: 1
    }, {
        title: '置顶',
        status: 2
    }, {
        title: '在线',
        status: 3
    }, {
        title: '下线',
        status: 4
    }, {
        title: '待审核',
        status: 5
    }, {
        title: '审核不通过',
        status: 6
    }, {
        title: '审核通过',
        status: 7
    }]);

    this.model.filter.name.subscribe(function (val) {
        if (val.length > 50) {
            this.model.tips(true);
        } else {
            this.model.tips(false);
        }
    }, this);


    this.getResourceGroup();
    var arg = this.params.selectedCourse() || [];
    this.model.selectedItems($.isArray(arg) ? arg : [arg]);
    this.params.count(this.model.selectedItems().length);
    this._eventHandler();
    this.getMixOrgTree();

    this.model.isAllGroupNames = ko.computed({
        read: function () {
            var list = this.model.group_names(), selected = this.model.filter.group_names();
            return list.length && selected.length === list.length;
        },
        write: function (value) {
            var list = this.model.group_names(), selected = this.model.filter.group_names;
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
ViewModel.prototype.formatResourceType = function ($data) {
    var type = $data.type;
    if ($data.type === 'opencourse_2') {
        type = $data.extra.business_type;
    }
    return RESOURCE_CONFIG_MAP[type] && RESOURCE_CONFIG_MAP[type].alias || RESOURCE_CONFIG_MAP[$data.type].alias;
};
ViewModel.prototype.getResourceGroup = function () {
    var that = this, res = $.map(window.allGroupNames || [], function (v) {
        return v.name;
    });
    that.model.group_names(window.allGroupNames || []);
    that.model.filter.group_names(res);
    that.model.filter.group_names.subscribe(function () {
        that.doSearch();
    }, that);
};
/**
 * dom操作事件定义
 * @return {null} null
 */
ViewModel.prototype._eventHandler = function () {
    var _self = this;
    $(document).off('keyup', '#keyword').on('keyup', '#keyword', function (e) {
        if (e.keyCode === 13) {
            _self.doSearch();
        }
    });
};
ViewModel.prototype.imgError = function ($data, event) {
    $(event.target).attr('src', window.default_img_base64);
};
ViewModel.prototype.toggleSelectedItem = function ($data) {
    var index = this.checkSelected($data);
    if (this.params.options) {
        if (~index) {
            this.model.selectedItems.splice(index, 1);
        } else {
            this.model.selectedItems.push(this.transferForParent($data));
        }
        this.params.count(this.model.selectedItems().length);
        this.params.selectedCourse(this.model.selectedItems());
    } else {
        if (~index) {
            this.model.selectedItems.splice(index, 1);
            this.params.count(0);
        } else {
            this.model.selectedItems([]);
            this.model.selectedItems([this.transferForParent($data)]);
            this.params.count(1);
        }
        this.params.selectedCourse(this.model.selectedItems() || []);

    }
};
ViewModel.prototype.transferForParent = function (data) {
    return {
        "resource_id": data.resource_id,
        "resource_name": data.title,
        "cover_url": data.cover_url,
        "enabled": data.enabled,
        channel_id: this.params.id
    };
};
ViewModel.prototype.checkSelected = function ($data) {
    var selectedItems = this.model.selectedItems(), index = -1;
    $.each(selectedItems, function (i, v) {
        if ($data.resource_id == v.resource_id) {
            index = i;
            return false;
        }
    });
    return index;
};
ViewModel.prototype.getMixOrgTree = function () {
    var that = this;
    this.store.getMixOrgTree().done($.proxy(function (data) {
        this.manager_nodes = [];
        if (data.manager && !data.manager.has_manage_project) {
            this.manager_nodes = $.map(data.manager.manager_nodes, function (v) {
                return v.node_id;
            }) || [];
            this.model.filter.affiliated_org_nodes(this.manager_nodes);
        }
        this.store.getCatalogs(this.params.id)
            .done(function (data) {
                if (data && data.children) {
                    that.initList(data);
                } else {
                    that.getParam();
                }
            });
        var selectMap = {
            '-1': {prop: 'all', val: ''},
            '1': {prop: 'no_tag_resource', val: true},
            '2': {prop: 'is_top', val: 1},
            '3': {prop: 'online_status', val: 1},
            '4': {prop: 'online_status', val: 0},
            '5': {prop: 'audit_status', val: 1},
            '6': {prop: 'audit_status', val: 2},
            '7': {prop: 'audit_status', val: 3}
        };
        this.clist.sub("clist", function (v) {
            var selected = selectMap[v.flag()];
            that._catalogSelect(selected.prop, selected.val);
            that.model.filter.tag_ids(v.catalogs());
            that.doSearch();
        });
    }, this));
};
ViewModel.prototype._list = function (flag) {
    var _self = this,
        _filter = this.model.filter,
        _search = this._filterParams(ko.mapping.toJS(_filter));
    if (!_search.group_names) {
        this.model.items([]);
        _filter.page_no(0);
        this._page(0, _filter.page_size(), _filter.page_no());
        return;
    }
    _search.flag = undefined;
    _search.catalogs = undefined;
    this.store.courseList(_search, this.params.id).done(function (returnData) {
        if (returnData.items) _self.model.items(returnData.items);
        _self._page(returnData.total, _filter.page_no(), _filter.page_size());
    });
};
/**
 * 过滤请求参数
 * @param  {object} params 入参
 * @return {object}        处理后的参数
 */
ViewModel.prototype._filterParams = function (params) {
    var _params = {};
    for (var key in params) {
        if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
            _params[key] = params[key];
        }
    }
    return _params;
};
ViewModel.prototype.styleChange = function (type) {
    this.model.style(type);
};
ViewModel.prototype.doSearch = function () {
    if (this.model.tips()) {
        return;
    }
    this.model.filter.page_no(0);
    this._list();
};
//项目item勾选事件
ViewModel.prototype.checkClick = function ($data) {
    // window.selectedCourse = {title: $data.name, id: $data.id, image_url: $data.cover_url};
    this.model.selected($data.id);
};
ViewModel.prototype._getArrayProp = function (array, prop) {
    return array.map(function (item) {
        return item[prop];
    });
};
//状态分类事件
ViewModel.prototype._catalogSelect = function (prop, val) {
    var filter = this.model.filter;
    ['no_tag_resource', 'is_top', 'online_status', 'time_status', 'audit_status'].forEach(function (name, i) {
        if (name === prop) {
            filter[prop](val)
        } else {
            filter[name]('')
        }
    });
};
ViewModel.prototype.initList = function (data) {
    function getChildren(array, target) {
        for (var i = 0; i < array.children.length; i++) {
            var root = $.extend(true, {}, array.children[i]);
            delete root.children;
            target.push(root);
            if (array.children[i].children.length) {
                getChildren(array.children[i], target);
            }
        }
    }

    for (var i = 0; i < data.children.length; i++) {
        //初始化选择条件
        data.children[i].all = [];
        getChildren(data.children[i], data.children[i].all);
        data.children[i].children = data.children[i].all;
        delete data.children[i].all;
    }
    //拼凑二级标签
    this.model.catalogs(data.children);
    this.getParam();
};
//标签分类选择事件
ViewModel.prototype.catalogOnClick = function (element) {
    if ($(element).hasClass('active')) {
        return;
    }
    $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
    $(element).addClass('active');
    if (this.model.filter.flag() === 0) {
        this.model.filter.flag(-1);
        var statusItems = $('.catalog-column').last();
        statusItems.find('.item-label').removeClass('active');
        statusItems.find('.item-label').eq(0).addClass('active');
    }
    var _this = $(element),
        _id = _this.data('id'),
        _type = _this.data('type');
    this.filterObj[_type] = _id || null;
    this.getParam();
};
//状态分类事件
ViewModel.prototype.selectFlag = function (flag, element) {
    if ($(element).hasClass('active')) {
        return;
    } else {
        if (flag === 1) {
            this.filterObj = {};
            $.each($(element).closest('.catalog-column').siblings(), function (i, e) {
                $(e).find('.item-label').removeClass('active');
                $(e).find('.item-label').eq(0).addClass('active');
            });
        }
        this.model.filter.flag(flag);
        $('.item-label', $(element).closest('.catalog-column')).removeClass('active');
        $(element).addClass('active');
    }
    this.getParam();
};
ViewModel.prototype.getParam = function () {
    var temp = [],
        filterObj = this.filterObj;
    //过滤选中标签
    for (var key in filterObj) {
        if (!filterObj[key]) {
            continue;
        }
        temp.push(filterObj[key]);
    }
    this.model.filter.catalogs(temp);
    this.model.clist(this.model.filter);

};
ViewModel.prototype._page = function (count, offset, limit) {
    var self = this;
    $('#pagination-' + this.params.id).pagination(count, {
        is_show_first_last: true,
        is_show_input: true,
        items_per_page: limit,
        num_display_entries: 5,
        current_page: offset,
        prev_text: "上一页",
        next_text: "下一页",
        callback: function (index) {
            if (index != offset) {
                self.model.filter.page_no(index);
                self._list();
            }
        }
    });
};
ViewModel.prototype.formatPrice = function (commodity) {
    return commodity ? commodity.price ? (function () {
        var price = '';
        _.objectForEach(commodity.price, function (k, v) {
            if (!price) price = v;
        });
        return price || '免费';
    })() : '免费' : ''
};

ko.components.register('x-channel-admin-layout-content-resource-list', {
    viewModel: ViewModel,
    template: template
});
