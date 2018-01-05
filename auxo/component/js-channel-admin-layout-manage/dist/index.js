(function (ko,$$1) {
'use strict';

ko = ko && ko.hasOwnProperty('default') ? ko['default'] : ko;
$$1 = $$1 && $$1.hasOwnProperty('default') ? $$1['default'] : $$1;

var groupNames = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();

var template = "<div class=\"manage-header\">\r\n    <a class=\"back\" data-bind=\"click:back\"></a>\r\n    <span class=\"manage-header-title\" data-bind=\"text:page_title\">布局管理</span>\r\n    <div class=\"btn-group manage-btn-group-header\">\r\n        <a data-bind=\"attr:{'href':preview_url}\"\r\n           target=\"_blank\"\r\n           class=\"btn btn-default manage-btn\">效果预览</a>\r\n        <!--ko if:$component.setting_type === 'layout'-->\r\n        <button class=\"btn btn-primary manage-btn\" data-bind=\"click:open_create_modal\">新增板块</button>\r\n        <!--/ko-->\r\n        <!--ko if:is_change() === 'true'-->\r\n        <button class=\"btn btn-default manage-btn\" data-bind=\"click:revert_layout\">还原</button>\r\n        <button class=\"btn btn-default manage-btn\" data-bind=\"click:save_layout\">保存</button>\r\n        <!--/ko-->\r\n    </div>\r\n</div>\r\n\r\n<div class=\"channel-container containe channel-manage-main \">\r\n    <!--ko if:sections().length>0-->\r\n    <div class=\"channel-sections\" data-bind=\"foreach:sections\">\r\n        <!--ko if:type !== 6-->\r\n        <div class=\"section\" data-id=\"section\">\r\n            <h1 class=\"title-handler\" data-bind=\"text:_name\"></h1>\r\n            <div class=\"main-area\">\r\n                <img data-bind=\"attr:{src:$component.cmp_url + '/images/section_thumb_' + type + '.png'}\"/>\r\n            </div>\r\n            <div class=\"side-bar\">\r\n                <!--ko if:$component.setting_type === 'layout'-->\r\n                <div class=\"actions-mid\">\r\n                    <!--ko if:!_is_fixed-->\r\n                    <!--ko if:_move_up_enable-->\r\n                    <span class=\"move-up\"\r\n                          data-bind=\"click:$component.move.bind($component, $index(), id, -1)\"><i></i>上移</span>\r\n                    <!--/ko-->\r\n                    <!--ko if:_move_down_enable-->\r\n                    <span class=\"move-down\"\r\n                          data-bind=\"click:$component.move.bind($component, $index(), id, 2)\"><i></i>下移</span>\r\n                    <!--/ko-->\r\n                    <!--/ko-->\r\n                </div>\r\n                <!--/ko-->\r\n                <div class=\"actions-btm\">\r\n                    <!--ko if:$component.setting_type === 'layout'-->\r\n                    <span class=\"btn btn-primary\" data-bind=\"click:$component.open_layout_setting\">设置</span>\r\n                    <span class=\"btn btn-default\" data-bind=\"click:$component.remove_section\">删除</span>\r\n                    <!--/ko-->\r\n                    <!--ko if:$component.setting_type === 'content'-->\r\n                    <span class=\"btn btn-primary\" data-bind=\"click:$component.open_content_setting\">设置</span>\r\n                    <!--/ko-->\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <!--/ko-->\r\n    </div>\r\n    <!--/ko-->\r\n    <!--ko if:sections().length===0-->\r\n    <div class=\"sections-empty\">暂无板块</div>\r\n    <!--/ko-->\r\n</div>\r\n\r\n\r\n<!--新增板块-->\r\n<div id=\"createSectionModal\" class=\"modal fade\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span\r\n                    aria-hidden=\"true\">×</span></button>\r\n                <h4 class=\"modal-title\">新增版块</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <div class=\"container-fluid\">\r\n                    <div class=\"row\"\r\n                         data-bind=\"visible: section_type_list.length, foreach: section_type_list\">\r\n                        <div class=\"col-md-4 plate\">\r\n                            <div class=\"thumbnail\">\r\n                                <i data-bind=\"attr: {'class': 'layout-icon layout-icon-'+type}\"></i>\r\n                                <div class=\"caption\">\r\n                                    <button class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"top\"\r\n                                            data-bind=\"text:section_name,\r\n                                            attr:{\r\n                                                'data-original-title': description,\r\n                                                disabled:(type === 4 || type == 5) && $component.has_bottom_section()\r\n                                            },\r\n                                            click:$component.select_section.bind($root, $data)\"></button>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n\r\n<!--ko if:$component.setting_type === 'layout'-->\r\n<!--Banner推荐-->\r\n<!--ko if: selected_section() && selected_section().type == 1 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-manage-banner', params: {'section': selected_section(),'parent': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n\r\n\r\n<!--橱窗推荐-->\r\n<!--ko if: selected_section() && selected_section().type == 2 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-manage-window', params: {'section': selected_section(),'parent': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n\r\n<!--图标导航区-->\r\n<!--ko if: selected_section() && selected_section().type == 3 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-manage-icon', params: {'section': selected_section(),'parent': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n\r\n<!--频道资源 || 全部资源-->\r\n<!--ko if: selected_section() && (selected_section().type == 4 || selected_section().type == 5) -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-manage-other', params: {'section': selected_section(),'parent': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n<!--/ko-->\r\n\r\n<!--ko if:$component.setting_type === 'content'-->\r\n<!--Banner推荐-->\r\n<!--ko if: selected_section() && selected_section().type == 1 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-content-banner', params: {'section': selected_section(),'layout_manager': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n<!--橱窗推荐-->\r\n<!--ko if: selected_section() && selected_section().type == 2 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-content-window', params: {'section': selected_section(),'layout_manager': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n<!--图标导航区-->\r\n<!--ko if: selected_section() && selected_section().type == 3 -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-content-icon', params: {'section': selected_section(),'layout_manager': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n<!--频道资源 || 全部资源-->\r\n<!--ko if: selected_section() && (selected_section().type == 4 || selected_section().type == 5) -->\r\n<!--ko component:{'name': 'x-channel-admin-layout-content-other', params: {'section': selected_section(),'layout_manager': $component}}--><!--/ko-->\r\n<!--/ko-->\r\n<!--/ko-->";

function ViewModel(_ref) {
    var setting_type = _ref.setting_type,
        static_host = _ref.static_host,
        channel_id = _ref.channel_id,
        channel_host = _ref.channel_host,
        project_code = _ref.project_code,
        portal_host = _ref.portal_host;

    var vm = this;
    var section_type_list = [{
        section_name: 'Banner推荐 ',
        description: '图片轮播',
        type: 1
    }, {
        section_name: '橱窗推荐',
        description: '资源标签下的几个资源，或者选定的某些资源',
        type: 2
    }, {
        section_name: '图标导航区',
        description: '以小图标/图文的方式进行排版，点击小图标可以跳转到推荐内容，图标导航区只在手机端展示，WEB端不显示图标导航区',
        type: 3
    }, {
        section_name: '资源列表',
        description: '该板块展示本频道下资源，或本频道中选定标签下的资源（频道资源板块的排版只能置底，不能往上或者往下移动）。',
        type: 4
    }, {
        section_name: '全部资源',
        description: '该板块展示资源池中的所有资源，或资源池中选定标签下的资源（全部资源板块的排版只能置底，不能往上或者往下移动），全部资源和频道资源只能二选一。',
        type: 5
    }];
    var section_names = function (list) {
        var map = {};
        list.forEach(function (item) {
            map[item.type] = item.section_name;
        });
        return map;
    }(section_type_list);
    var j_create_section_modal = $$1('#createSectionModal');
    var store = {
        get_channel_section: function get_channel_section() {
            return $$1.ajax({
                url: '/' + project_code + '/channels/' + channel_id + '/sections',
                data: { query_type: 1 },
                cache: false,
                dataType: 'json'
            });
        },
        create_section: function create_section(data) {
            return $$1.ajax({
                url: channel_host + '/v1/channels/' + channel_id + '/sections',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        remove: function remove(section_id) {
            return $$1.ajax({
                url: channel_host + '/v1/sections/' + section_id,
                type: 'DELETE'
            });
        },
        move: function move(id, next_section_id) {
            return $$1.ajax({
                url: channel_host + '/v1/sections/' + id + '/actions/move?next_section_id=' + next_section_id,
                type: 'PUT'
            });
        },
        get_change_state: function get_change_state() {
            return $$1.ajax({
                url: channel_host + '/v1/channels/' + channel_id + '/properties/sectionUpgrade',
                cache: false,
                dataType: 'json'
            });
        },
        save_layout: function save_layout() {
            return $$1.ajax({
                url: channel_host + '/v1/channels/' + channel_id + '/sections/actions/submit',
                type: 'POST'
            });
        },
        revert_layout: function revert_layout() {
            return $$1.ajax({
                url: channel_host + '/v1/channels/' + channel_id + '/sections/actions/recover',
                type: 'POST'
            });
        }
    };
    // add listener
    ko.observable().subscribeTo('GET_CHANGE_STATE', init, vm);
    ko.observable().subscribeTo('ON_LAYOUT_SET_SUCCESS', on_layout_set_success, vm);

    vm.preview_url = portal_host + '/' + project_code + '/channel/' + channel_id + '?query_type=1';
    vm.setting_type = setting_type;
    vm.static_host = static_host;
    vm.cmp_url = static_host + '/auxo/component/js-channel-admin-layout-manage';
    vm.section_type_list = section_type_list;
    vm.sections = ko.observableArray();
    vm.selected_section = ko.observable();
    vm.is_change = ko.observable('false');
    vm.has_bottom_section = ko.observable(); // 频道拥有4/5类型板块
    vm.page_title = setting_type === 'layout' ? '布局管理' : '内容设置';

    vm.open_create_modal = open_create_modal;
    vm.select_section = select_section;
    vm.get_channel_section = get_channel_section;
    vm.remove_section = remove_section;
    vm.move = move;
    vm.open_layout_setting = open_layout_setting;
    vm.open_content_setting = open_content_setting;
    vm.save_layout = save_layout;
    vm.revert_layout = revert_layout;
    vm.back = back;

    init();

    function init() {
        get_change_state().pipe(function () {
            return get_channel_section();
        });
    }

    function get_channel_section() {
        return store.get_channel_section().pipe(function (res) {
            res.forEach(function (section, i) {
                section._name = section_names[section.type];
                section._is_fixed = section.type === 4 || section.type === 5;
                section._move_down_enable = function () {
                    var next = res[i + 1];
                    // 没有下一个，不能向下
                    if (!next) {
                        return false;
                    }
                    if (next.type === 4 || next.type === 5) {
                        // 下一个是4、5类型，不能向下
                        return false;
                    }
                    return true;
                }();
                section._move_up_enable = function () {
                    var prev = res[i - 1];
                    return !!prev;
                }();
            });
            vm.has_bottom_section(false);
            for (var i = 0; i < res.length; i++) {
                if (res[i].type === 4 || res[i].type === 5) {
                    vm.has_bottom_section(true);
                    break;
                }
            }
            vm.sections(res);
        });
    }

    function open_create_modal() {
        j_create_section_modal.modal('show');
        j_create_section_modal.find('[data-toggle="tooltip"]').tooltip();
    }

    function select_section($data) {
        var type = $data.type;
        var data = {};
        switch (type) {
            case 1:
                data = {
                    setting: JSON.stringify({
                        "display": {
                            "show_tags": false, //是否显示标签
                            "banner_width": "center" //center居中，full全屏
                        }
                    })
                };
                break;
            case 2:
                data = {
                    setting: JSON.stringify({
                        "data": {
                            "title": "橱窗推荐",
                            "data_type": 1,
                            "order_type": 3,
                            "group_names": groupNames,
                            "tag_id": "",
                            "channel_id": "",
                            "resources": []
                        },
                        "display": {
                            "is_title_show": true,
                            "web": {
                                "row_num": 2,
                                "column_num": 4,
                                "ad_enable": false,
                                "show_num": 3,
                                "ad_logo": "",
                                "ad_url": ""
                            },
                            "mobile": {
                                "display_type": 1,
                                "display_num": 5,
                                "row_num": 2,
                                "column_num": 2,
                                "show_num": 3,
                                "ad_enable": false,
                                "ad_logo": "",
                                "ad_url": ""
                            }
                        }
                    })
                };
                break;
            case 3:
                data = {
                    setting: JSON.stringify({ "display": { "display_type": 1, "row_num": 2, "column_num": 4 } })
                };
                break;
            case 4:
                data = {
                    setting: JSON.stringify({
                        "data": { "title": "频道资源", "group_names": groupNames, "tag_id": "" },
                        "display": {
                            "is_title_show": false,
                            "is_tag_show": true,
                            "is_sort_enabled": true,
                            "order_type": 1,
                            "is_filter_enabled": true,
                            "filter_type": 2,
                            "is_show_price_filter": false
                        }
                    })
                };
                break;
            case 5:
                data = {
                    setting: JSON.stringify({
                        "data": { "title": "全部资源", "group_names": groupNames, "tag_id": "" },
                        "display": {
                            "is_title_show": false,
                            "is_tag_show": true,
                            "is_sort_enabled": true,
                            "order_type": 1,
                            "is_filter_enabled": true,
                            "filter_type": 2,
                            "is_show_price_filter": false
                        }
                    })
                };
                break;
            case 6:
                data = {
                    setting: JSON.stringify({
                        "data": {
                            "title": "为你推荐",
                            "rules": []
                        },
                        "display": {
                            "is_title_show": true,
                            "web": { "row_num": 3, "column_num": 4, "show_num": 3 },
                            "mobile": {
                                "display_type": 1,
                                "display_num": 5,
                                "row_num": 4,
                                "column_num": 2,
                                "show_num": 2
                            }
                        }
                    })
                };
                break;
        }
        $$1('.tooltip').remove();
        store.create_section($$1.extend({ type: type }, data)).pipe(function (res) {
            j_create_section_modal.modal('hide');
            vm.is_change('true');
            vm.get_channel_section().pipe(function () {
                scroll_to_bottom();
            });
        });
    }

    function remove_section() {
        var section = this;
        $$1.confirm({
            title: '系统提示',
            content: "确定删除吗？",
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: function action() {
                        store.remove(section.id).pipe(function () {
                            vm.is_change('true');
                            return vm.get_channel_section();
                        });
                    }
                },
                cancel: {
                    text: '取消',
                    action: $$1.noop()
                }
            }
        });
    }

    function move(index, section_id, next_idx) {
        var next_section = vm.sections()[index + next_idx];
        var next_section_id = next_section ? next_section.id : '';
        return store.move(section_id, next_section_id).then(function () {
            vm.is_change('true');
            return vm.get_channel_section();
        });
    }

    function get_change_state() {
        return store.get_change_state().pipe(function (res) {
            if (res) vm.is_change(res.property_value || 'false');
        });
    }

    function open_layout_setting() {
        var section = this;
        vm.selected_section(section);
        ko.tasks.schedule(function () {
            $$1('#sectionLayoutSetting' + Math.min(4, section.type)).modal('show');
        });
    }

    function open_content_setting() {
        var section = this;
        vm.selected_section(section);
        ko.tasks.schedule(function () {
            $$1('#sectionSetting' + Math.min(4, section.type)).modal('show');
        });
    }

    function save_layout() {
        store.save_layout().pipe(function () {
            vm.is_change('false');
            return get_channel_section();
        }).pipe(function () {
            $$1.simplyToast('保存成功！');
        });
    }

    function revert_layout() {
        $$1.confirm({
            title: '系统提示',
            content: "确定还原吗？",
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: function action() {
                        store.revert_layout().pipe(function () {
                            vm.is_change('false');
                            return get_channel_section();
                        }).pipe(function () {
                            $$1.simplyToast('还原成功！');
                        });
                    }
                },
                cancel: {
                    text: '取消'
                }
            }
        });
    }

    function back() {
        window.location.assign('/' + project_code + '/channel');
    }

    function on_layout_set_success(_ref2) {
        var id = _ref2.id,
            setting = _ref2.setting;

        var sections = vm.sections();
        var section = void 0;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].id === id) {
                section = sections[i];
                break;
            }
        }
        if (!section) {
            return;
        }
        section.setting = JSON.parse(setting);
        get_change_state().pipe(function () {
            $$1.simplyToast('保存成功！');
        });
    }

    function scroll_to_bottom() {
        var html = $$1('html,body');
        var list = $$1('[data-id="section"]');
        var index = vm.has_bottom_section() ? list.length - 2 : list.length - 1;
        var oft = list.eq(index).offset().top;
        html.stop().animate({
            scrollTop: oft + 'px'
        });
    }
}

ko.components.register('x-channel-admin-layout-manage', {
    viewModel: ViewModel,
    template: template
});

var template$1 = "<div class=\"section-block modal fade\" data-backdrop=\"static\" id=\"sectionSetting1\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">图片轮播</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <div style=\"margin-bottom: 20px;\">\r\n                    <a href=\"javascript:;\" class=\"btn btn-primary\" data-bind=\"click:create\">新增图片轮播</a>\r\n                </div>\r\n                <div>\r\n                    <table class=\"table table-bordered table-striped\">\r\n                        <thead>\r\n                        <tr>\r\n                            <th class=\"text-center\" style=\"width: 20%\">Banner标题</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">类型</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">最后修改时间</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">资源状态</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">操作</th>\r\n                        </tr>\r\n                        </thead>\r\n                        <tbody id=\"banner-drag\" class=\"table-format\"\r\n                               data-bind=\"attr:{id: 'banner-drag-'+params.id},foreach: model.items\">\r\n                        <tr class=\"text-center\" data-bind='attr: { id: id, name: title, sort_number: id }'>\r\n                            <td class=\"text-center\" data-bind=\"text: title\"\r\n                                style=\"max-width: 150px;word-wrap: break-word;\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: $component.data_type[data_type-1]\"></td>\r\n                            <td class=\"text-center\"\r\n                                data-bind=\"text: $.format.date(update_time,'yyyy-MM-dd HH:mm:ss')\"></td>\r\n                            <td class=\"text-center\"><span\r\n                                        data-bind=\"text: status == 0 ? '资源不可用，前台将不展示该banner' : '正常', css: status ? 'text-success':'text-danger' \"></span>\r\n                            </td>\r\n                            <td class=\"text-center\">\r\n                                <a href=\"javascript:;\" class=\"btn\"\r\n                                   data-bind=\"text:'编辑', click: $component.edit.bind($component)\"></a>\r\n                                <a class=\"btn\" href=\"javascript:;\"\r\n                                   data-bind=\"text:'删除',click: $component.del.bind($component, id)\"></a>\r\n                            </td>\r\n                        </tr>\r\n                        </tbody>\r\n                        <tbody data-bind=\"visible: !model.items().length\">\r\n                        <tr>\r\n                            <td class=\"text-center\" colspan=\"5\" style=\"text-align: center; padding:30px 0\">暂无相关数据</td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div data-bind=\"attr:{id: 'banner-modal-'+params.id}\" class=\"modal fade\" data-backdrop=\"static\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span\r\n                            aria-hidden=\"true\">×</span></button>\r\n                <h4 class=\"modal-title\" data-bind=\"text: model.info.id() ? '编辑Banner' : '新增Banner'\"></h4></div>\r\n            <div class=\"modal-body\" style=\"max-height: 500px;overflow-y:auto;overflow-x:hidden;\">\r\n                <form class=\"form-horizontal\" id=\"bannerForm\" onsubmit=\"return false;\">\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\">链接类型：</label>\r\n                        <div class=\"col-sm-10\"><label class=\"radio-inline\"><input name=\"linkType\" type=\"radio\"\r\n                                                                                  value=\"2\"\r\n                                                                                  data-bind=\"checkedValue:2,checked: model.info.data_type,attr:{disabled: !!model.info.id()}\">链接到资源</label><label\r\n                                    class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"1\"\r\n                                                                data-bind=\"checkedValue:1,checked: model.info.data_type,attr:{disabled: !!model.info.id()}\">链接到标签</label><label\r\n                                    class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"3\"\r\n                                                                data-bind=\"checkedValue:3,checked: model.info.data_type,attr:{disabled:!!model.info.id()}\">URL地址</label>\r\n                        </div>\r\n                    </div>\r\n                    <!-- ko if: model.info.data_type()!=3 -->\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em\r\n                                    class=\"required\">*</em>推荐内容：</label>\r\n                        <div class=\"col-sm-10\"><input type=\"text\" name=\"courseTitle\" readonly class=\"form-control\"\r\n                                                      data-bind=\"click:_openDialog, value:model.info.title\"\r\n                                                      placeholder=\"请选择\"/></div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                    <!--url地址-->\r\n                    <!-- ko if: model.info.data_type()==3 -->\r\n                    <div class=\"urlBlock\">\r\n                        <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>\r\n                                Banner标题：</label>\r\n                            <div class=\"col-sm-10\"><input maxlength=\"50\" type=\"text\" name=\"bannerTitle\"\r\n                                                          class=\"form-control\" data-bind=\"value:model.info.title\"\r\n                                                          placeholder=\"请输入Banner标题\"/></div>\r\n                        </div>\r\n                        <div class=\"form-group\"><label class=\"col-sm-2 control-label\">Web Url：</label>\r\n                            <div class=\"col-sm-10\"><input type=\"text\" name=\"webUrl\" class=\"form-control\"\r\n                                                          maxlength=\"1000\"\r\n                                                          data-bind=\"value:model.info.web_url\"\r\n                                                          placeholder=\"请输入Web Url\"/></div>\r\n                        </div>\r\n                        <div class=\"form-group\"><label class=\"col-sm-2 control-label\">App Url：</label>\r\n                            <div class=\"col-sm-10\"><input type=\"text\" name=\"AppUrl\" class=\"form-control\"\r\n                                                          maxlength=\"1000\"\r\n                                                          data-bind=\"value:model.info.mobile_url\"\r\n                                                          placeholder=\"请输入App Url\"/></div>\r\n                        </div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\">Banner图片：</label>\r\n                        <div class=\"col-sm-10 pic-area\">\r\n                            <!--ko if: model.upload.info -->\r\n                            <p class=\"text-warning\">仅支持JPG、PNG、GIF格式，且大小 2M 以下图片</p>\r\n                            <div data-bind=\"component:{'name': 'x-channel-upload', params: model.upload.web}\"></div>\r\n                            <p class=\"text-warning\">WEB尺寸：1920*400（全屏）、1200*400（居中）</p>\r\n                            <hr>\r\n                            <div data-bind=\"component:{'name': 'x-channel-upload', params: model.upload.mobile}\"></div>\r\n                            <p class=\"text-warning\">手机尺寸：750*300</p>\r\n                            <!--/ko-->\r\n                        </div>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n            <div class=\"modal-footer\"><a class=\"btn-primary btn\" data-bind=\"click: saveBanner\">推荐</a><a\r\n                        class=\"btn btn-default\" data-dismiss=\"modal\">取消</a></div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!--ko if: model.modal.tag -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-tag', params:{'selected_tag': model.info, disable: !!model.info.id(), from:'banner', type: 4, all: true, id: model.modal.tag_name()}}\"></div>\r\n<!--/ko-->\r\n<!--ko if: model.modal.tab -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-resource', params: {'selected_course': model.selected_course,'options': false, id: model.modal.tab_name()}}\"></div>\r\n<!--/ko-->";

var _ = ko.utils;
var EVENT_TYPE = 'GET_CHANGE_STATE';
var groupNames$2 = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();

function ViewModel$1(_ref) {
    var section = _ref.section;

    var model = {
        items: [],
        info: {
            id: 0,
            data_type: 2,
            title: '',
            web_picture: '',
            web_picture_url: '',
            mobile_picture: '',
            mobile_picture_url: '',
            resource_id: '',
            tag_id: '',
            order_type: 3,
            group_names: groupNames$2,
            channel_id: '',
            web_url: '',
            mobile_url: ''
        },
        selected_course: [],
        setting: {
            "display": {
                "show_tags": false, //是否显示标签
                "banner_width": "center" //center居中，full全屏
            }
        },
        selected_tag: {
            tag_id: '',
            title: '',
            channel_id: '',
            group_names: [],
            order_type: ''
        },
        modal: {
            tag_name: 'banner_tag-' + section.id,
            tag: false,
            tab: false,
            tab_name: 'banner_tab-' + section.id
        },
        upload: {
            web: null,
            mobile: null,
            info: null
        }

    };
    this.model = ko.mapping.fromJS(model);
    this.params = section;
    this.drag_name = '#banner-drag-' + section.id;
    this.bannel_modal = '#banner-modal-' + section.id;
    this.data_type = ['链接到标签', '链接到资源', 'URL地址'];
    this.init();
    this.validationsInfo = ko.validatedObservable(this.model, { deep: true });
    this._validator();
    var that = this;
    setTimeout(function () {
        $(that.drag_name).dragsort("destroy");
        that.drag();
    }, 0);
}

ViewModel$1.prototype.init = function () {
    this.model.items(this.params.section_data_list || []);
    if (this.params.setting.display && this.params.setting.display.banner_width) ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
    this.model.selected_course.subscribe(function (nv) {
        nv = $.isArray(nv) ? nv[0] : nv;
        if (nv) {
            this.model.info.title(nv.resource_name);
            this.model.info.resource_id(nv.resource_id);
            this.model.info.channel_id(nv.channel_id);
        }
    }, this);
    this.model.info.data_type.subscribe(function (nv) {
        this.model.info.title('');
        this.model.info.resource_id('');
        this.model.info.channel_id('');
        this.model.info.tag_id('');
    }, this);
    var display = this.model.setting.display;
    this.autoSave(display.show_tags);
    this.autoSave(display.banner_width);
};
ViewModel$1.prototype.autoSave = function (value, isGet) {
    value.extend({ deferred: true });
    value.subscribe(function (nv) {
        var data = ko.mapping.toJS(this.model.setting);
        this.store.update_section({ setting: JSON.stringify(data) }, this.params.id).done(function () {
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    }, this);
};
ViewModel$1.prototype.store = {
    del: function del(id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'delete'
        });
    },
    update: function update(id, data) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'put',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    create: function create(data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/section_data',
            type: 'POST',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    move: function move(section_data_id, next_section_data_id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
            type: 'put'
        });
    },
    getUploadUrl: function getUploadUrl() {
        return $.ajax({
            url: channelUrl + '/v1/users/photo_session',
            cache: false
        });
    },
    update_section: function update_section(data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/',
            type: 'put',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        });
    }
};
ViewModel$1.prototype.create = function () {
    if (this.model.items().length >= 8) {
        $.alert('Banner推荐最多8个，已到达上限。');
        return;
    }
    var info = this.model.info;
    for (var key in info) {
        switch (key) {
            case 'channel_id':
                break;
            case 'data_type':
                info[key](2);
                break;
            case 'status':
                info[key](1);
                break;
            case 'order_type':
                info[key](3);
                break;
            case 'group_names':
                info[key](groupNames$2);
                break;
            default:
                info[key]('');
        }
    }
    this.model.selected_course([]);
    this.validationsInfo.errors.showAllMessages(false);
    $(this.bannel_modal).modal('show');
    this.initUpload();
};
ViewModel$1.prototype.del = function (id, $data) {
    var that = this;
    $.confirm({
        content: "确定删除吗？",
        title: '系统提示',
        buttons: {
            confirm: {
                text: '确定',
                btnClass: 'btn-primary',
                action: function action() {
                    that.store.del(id).done(function () {
                        that.model.items.remove($data);
                        ko.observable().publishOn(EVENT_TYPE)(0);
                    });
                }
            },
            cancel: {
                text: '取消',
                action: function action() {}
            }
        }
    });
};
ViewModel$1.prototype.edit = function ($data) {
    var info = this.model.info;
    for (var i in this.model.info) {
        info[i]($data[i]);
    }
    $(this.bannel_modal).modal('show');
    this.initUpload(true);
};
ViewModel$1.prototype.initUpload = function (isEdit) {
    var that = this;

    function params(uploadInfo) {
        return {
            web: {
                image_width: 480,
                image_height: 100,
                default_image: isEdit ? that.model.info.web_picture_url() || 'http://p11.e.99.com/s/p/1/1de5f758106b4dfeaa8175e885d79b75.jpg' : '',
                id: that.model.info.web_picture,
                url: that.model.info.web_picture_url,
                api_url: channelUrl,
                upload_info: uploadInfo
            },
            mobile: {
                image_width: 250,
                image_height: 200,
                default_image: isEdit ? that.model.info.mobile_picture_url() || 'http://p11.e.99.com/s/p/1/8defa230276846ffb06706cebc0768ee.jpg' : '',
                id: that.model.info.mobile_picture,
                url: that.model.info.mobile_picture_url,
                api_url: channelUrl,
                upload_info: uploadInfo
            }
        };
    }

    if (this.model.upload.info()) {
        this.model.upload.web(params(this.model.upload.info()).web);
        this.model.upload.mobile(params(this.model.upload.info()).mobile);
    } else {
        this.store.getUploadUrl().done(function (data) {
            that.model.upload.web(params(data).web);
            that.model.upload.mobile(params(data).mobile);
            that.model.upload.info(data);
        });
    }
};
ViewModel$1.prototype.saveBanner = function () {
    var _this = this;

    if (!this.validationsInfo.isValid()) {
        this.validationsInfo.errors.showAllMessages();
        return false;
    }
    var data = ko.mapping.toJS(this.model.info),
        that = this;
    if (data.data_type === 3) {
        if (data.web_url && !data.web_url.match(/^(https?|cmp:\/\/)/)) {
            data.web_url = 'http://' + data.web_url;
        }
        if (data.mobile_url && !data.mobile_url.match(/^(https?|cmp:\/\/)/)) {
            data.mobile_url = 'http://' + data.mobile_url;
        }
    }
    if (data.web_picture) data.web_picture = !~data.web_picture.indexOf('CS') ? 'CS:' + data.web_picture : data.web_picture;
    if (data.mobile_picture) data.mobile_picture = !~data.mobile_picture.indexOf('CS') ? 'CS:' + data.mobile_picture : data.mobile_picture;
    if (data.id) {
        this.store.update(data.id, data).done(function (res) {
            $(that.bannel_modal).modal('hide');
            var old = _.arrayFirst(_this.model.items(), function (v) {
                return v.id === res.id;
            });
            _this.model.items.replace(old, $.extend(true, {}, old, res));
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    } else {
        data.id = undefined;
        this.store.create(data, this.params.id).done(function (res) {
            $(that.bannel_modal).modal('hide');
            _this.model.items.push(res);
            _this.drag();
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    }
    return true;
};
ViewModel$1.prototype._openDialog = function () {
    var _this2 = this;

    var data_type = this.model.info.data_type();
    if (this.model.info.id() && data_type === 2) return;
    this.model.modal.tag(false);
    this.model.modal.tab(false);
    if (data_type == 1) {
        this.model.modal.tag(true);
        ko.tasks.schedule(function () {
            $('#' + _this2.model.modal.tag_name()).modal('show');
        });
    } else if (data_type == 2) {
        this.model.modal.tab(true);
        ko.tasks.schedule(function () {
            $('#' + _this2.model.modal.tab_name()).modal('show');
        });
    }
};
//表单验证
ViewModel$1.prototype._validator = function () {
    this.model.info.title.extend({
        required: {
            params: true,
            message: '必填'
        }
    });
};
//拖拉组件初始化
ViewModel$1.prototype.drag = function () {
    var _self = this;
    $(this.drag_name).dragsort({
        dragSelector: "tr",
        dragBetween: true,
        dragSelectorExclude: "a",
        scrollContainer: _self.drag_name,
        dragEnd: function dragEnd() {
            var banner_id = this.attr("id");
            var sort_number = this.attr("sort_number");
            $(_self.drag_name).find("tr").each(function (index, element) {
                if (element.id == banner_id) {
                    var target_element = $(element).next();
                    if (target_element.length !== 0) {
                        sort_number = target_element.attr("sort_number");
                    } else {
                        sort_number = '';
                    }
                }
            });
            var param = {
                section_data_id: banner_id,
                next_section_data_id: sort_number
            };
            $(_self.drag_name).dragsort("destroy");
            _self.store.move(param.section_data_id, param.next_section_data_id).done(function (data) {
                ko.observable().publishOn(EVENT_TYPE)(0);
                _self.drag();
            });
        }

    });
};
ko.components.register('x-channel-admin-layout-content-banner', {
    synchronous: true,
    viewModel: ViewModel$1,
    template: template$1
});

var tpl = "<div class=\"section-block modal fade\" data-backdrop=\"static\" id=\"sectionSetting3\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">图标导航</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <div style=\"margin-bottom: 20px;\">\r\n                    <a href=\"javascript:;\" class=\"btn btn-primary\" data-bind=\"click:create\">新增图标导航</a>\r\n                </div>\r\n                <div>\r\n                    <table class=\"table table-bordered table-striped\">\r\n                        <thead>\r\n                        <tr>\r\n                            <th class=\"text-center\" style=\"width: 15%\">链接类型</th>\r\n                            <th class=\"text-center\" style=\"width: 25%\">推荐内容</th>\r\n                            <th class=\"text-center\" style=\"width: 10%\">图标</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">最后修改时间</th>\r\n                            <th class=\"text-center\" style=\"width: 15%\">资源状态</th>\r\n                            <th class=\"text-center\" style=\"width: 15%\">操作</th>\r\n                        </tr>\r\n                        </thead>\r\n                        <tbody class=\"table-format\" data-bind=\"foreach: model.items,attr:{id:'icon-drag-'+params.id}\">\r\n                        <tr class=\"text-center\" data-bind='attr: { id: id, name: title, sort_number: id }'>\r\n                            <td class=\"text-center\" data-bind=\"text: $component.data_type[data_type-1]\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: $component.getTitle($data)\"\r\n                                style=\"max-width: 150px;word-wrap: break-word;\"></td>\r\n                            <td class=\"text-center\"><img style=\"width:50px;height:50px;\"\r\n                                                         data-bind=\"attr:{'src':mobile_picture_url,'alt':title}\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: $.format.date(update_time,'yyyy-MM-dd HH:mm:ss')\"></td>\r\n                            <td class=\"text-center\"><span\r\n                                        data-bind=\"text: status == 0 ? '资源不可用，前台将不展示该图标' : '正常', css: status ? 'text-success':'text-danger' \"></span>\r\n                            </td>\r\n                            <td class=\"text-center\">\r\n                                <a href=\"javascript:;\" data-bind=\"text:'编辑', click: $component.edit.bind($component)\"></a>\r\n                                <a href=\"javascript:;\" data-bind=\"text:'删除',click: $component.del.bind($component, id)\"></a>\r\n                            </td>\r\n                        </tr>\r\n                        </tbody>\r\n                        <tbody class=\"table-format\" data-bind=\"visible: !model.items().length\" style=\"display: none;\">\r\n                        <tr>\r\n                            <td colspan=\"6\" style=\"text-align: center; padding:30px 0\">暂无相关数据</td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div data-bind=\"attr:{id: 'icon-modal-'+params.id}\" class=\"modal fade\" data-backdrop=\"static\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span\r\n                            aria-hidden=\"true\">×</span></button>\r\n                <h4 class=\"modal-title\" data-bind=\"text: model.info.id() ? '编辑图标导航' : '新增图标导航'\"></h4></div>\r\n            <div class=\"modal-body\" style=\"max-height: 500px;overflow-y:auto;overflow-x:hidden;\">\r\n                <form class=\"form-horizontal\" id=\"bannerForm\" onsubmit=\"return false;\">\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\">链接类型：</label>\r\n                        <div class=\"col-sm-10\"><label class=\"radio-inline\"><input name=\"linkType\" type=\"radio\"\r\n                                                                                  value=\"2\"\r\n                                                                                  data-bind=\"checkedValue:2, checked: model.info.data_type, attr:{disabled: !!model.info.id()}\">链接到资源</label><label\r\n                                    class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"1\"\r\n                                                                data-bind=\"checkedValue:1, checked: model.info.data_type, attr:{disabled: !!model.info.id()}\">链接到标签</label><label\r\n                                    class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"3\"\r\n                                                                data-bind=\"checkedValue:3, checked: model.info.data_type, attr:{disabled: !!model.info.id()}\">URL地址</label>\r\n                        </div>\r\n                    </div>\r\n                    <!-- ko if: model.info.data_type()!=3 -->\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em\r\n                                    class=\"required\">*</em>推荐内容：</label>\r\n                        <div class=\"col-sm-10\"><input type=\"text\" readonly class=\"form-control\"\r\n                                                      data-bind=\"click:_openDialog, value: model.info.resource_name\"\r\n                                                      placeholder=\"请选择\"/></div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                    <!--url地址-->\r\n                    <!-- ko if: model.info.data_type()==3 -->\r\n                    <div class=\"urlBlock\">\r\n                        <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>App\r\n                                Url：</label>\r\n                            <div class=\"col-sm-10\"><input type=\"text\" name=\"AppUrl\" class=\"form-control\"\r\n                                                          maxlength=\"1000\"\r\n                                                          data-bind=\"value:model.info.mobile_url\"\r\n                                                          placeholder=\"请输入App Url\"/></div>\r\n                        </div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em\r\n                                    class=\"required\">*</em>导航名称：</label>\r\n                        <div class=\"col-sm-10\"><input type=\"text\" maxlength=\"30\" class=\"form-control\"\r\n                                                      data-bind=\"value:model.info.title\"/></div>\r\n                    </div>\r\n                    <div class=\"form-group\"><label class=\"col-sm-2 control-label\"><em\r\n                                    class=\"required\">*</em>标签图片：</label>\r\n                        <div class=\"col-sm-10 pic-area\">\r\n                            <p class=\"text-warning\">仅支持JPG、PNG、GIF格式，且大小 2M 以下图片</p>\r\n                            <!-- ko if: model.upload -->\r\n                            <div data-bind=\"component:{'name': 'x-channel-upload', params: model.upload}\"></div>\r\n                            <!--/ko-->\r\n                            <p class=\"text-warning\">手机尺寸：116*116</p>\r\n                        </div>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n            <div class=\"modal-footer\"><a class=\"btn-primary btn\" data-bind=\"click: save\">保存</a><a\r\n                        class=\"btn btn-default\" data-dismiss=\"modal\">取消</a></div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!--ko if: model.modal.tag -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-tag', params:{'selected_tag': model.info, from: 'icon', disable: !!model.info.id(), type:4,all:true, id: model.modal.tag_name()}}\"></div>\r\n<!--/ko-->\r\n<!--ko if: model.modal.tab -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-resource', params: {'selected_course': model.selected_course, 'options': false, id: model.modal.tab_name()}}\"></div>\r\n<!--/ko-->";

var _$1 = ko.utils;
var EVENT_TYPE$1 = 'GET_CHANGE_STATE';

var groupNames$3 = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();

function ViewModel$2(_ref) {
    var section = _ref.section;

    var model = {
        modal: {
            tag: false,
            tag_name: 'icon_tag' + section.id,
            tab_name: 'icon_tab' + section.id,
            tab: false
        },
        items: [],
        info: {
            id: 0,
            data_type: 2,
            title: '',
            resource_name: '',
            tag_name: '',
            channel_name: '',
            web_picture: '',
            web_picture_url: '',
            mobile_picture: '',
            mobile_picture_url: '',
            resource_id: '',
            tag_id: '',
            order_type: 3,
            group_names: groupNames$3,
            channel_id: '',
            web_url: '',
            mobile_url: ''
        },
        setting: {
            "display": {
                "display_type": 1, //展示方式 1纯图片 2图片+文字 3纯文字
                "row_num": '1',
                "column_num": '4'
            }
        },
        selected_tag: {},
        selected_course: [],
        row_num: [{
            value: 1,
            text: '1行'
        }, {
            value: 2,
            text: '2行'
        }, {
            value: 3,
            text: '3行'
        }, {
            value: 4,
            text: '4行'
        }],
        column_num: [{
            value: 4,
            text: '4'
        }, {
            value: 5,
            text: '5'
        }],
        upload: null
    };
    this.model = ko.mapping.fromJS(model);
    this.params = section;
    this.data_type = ['链接到标签', '链接到资源', 'URL地址'];
    this.storeUrl = '';
    this.icon_modal = '#icon-modal-' + section.id;
    this.drag_name = '#icon-drag-' + section.id;
    this.init();
    this.validationsInfo = ko.validatedObservable(this.model, { deep: true });
    this._validator();
    var that = this;
    $("#drag").dragsort("destroy");
    setTimeout(function () {
        that.drag();
    }, 0);
}

ViewModel$2.prototype.store = {
    update_section: function update_section(data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/',
            type: 'put',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        });
    },
    del: function del(id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'delete'
        });
    },
    update: function update(id, data) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'put',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    create: function create(data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/section_data',
            type: 'POST',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    move: function move(section_data_id, next_section_data_id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
            type: 'put'
        });
    },
    getUploadUrl: function getUploadUrl() {
        return $.ajax({
            url: channelUrl + '/v1/users/photo_session',
            cache: false
        });
    }
};
ViewModel$2.prototype.init = function () {
    this.model.items(this.params.section_data_list || []);
    ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
    this.model.selected_course.subscribe(function (nv) {
        nv = $.isArray(nv) ? nv[0] : nv;
        if (nv) {
            this.model.info.title(nv.resource_name);
            this.model.info.resource_name(nv.resource_name);
            this.model.info.resource_id(nv.resource_id);
            this.model.info.channel_id(nv.channel_id);
        }
    }, this);
    this.model.info.data_type.subscribe(function (nv) {
        this.model.info.title('');
        this.model.info.resource_name('');
        this.model.info.resource_id('');
        this.model.info.channel_id('');
        this.model.info.tag_id('');
    }, this);
    var display = this.model.setting.display;
    this.autoSave(display.display_type);
    this.autoSave(display.row_num);
    this.autoSave(display.column_num);
};
ViewModel$2.prototype.autoSave = function (value, isGet) {
    value.extend({ deferred: true });
    value.subscribe(function (nv) {
        var data = ko.mapping.toJS(this.model.setting);
        this.store.update_section({ setting: JSON.stringify(data) }, this.params.id).done(function () {
            ko.observable().publishOn(EVENT_TYPE$1)(0);
        });
    }, this);
};
ViewModel$2.prototype.create = function () {
    var info = this.model.info;
    for (var key in info) {
        switch (key) {
            case 'channel_id':
                break;
            case 'data_type':
                info[key](2);
                break;
            case 'status':
                info[key](1);
                break;
            case 'order_type':
                info[key](3);
                break;
            case 'group_names':
                info[key](groupNames$3);
                break;
            default:
                info[key]('');
        }
    }
    this.model.selected_course([]);
    this.validationsInfo.errors.showAllMessages(false);
    $(this.icon_modal).modal('show');
    this.initUpload();
};
ViewModel$2.prototype.getTitle = function ($data) {
    switch ($data.data_type) {
        case 1:
            return $data.tag_name || $data.channel_name || $data.title;
        case 2:
            return $data.resource_name || $data.title;
        case 3:
            return $data.title;
        default:
            return $data.title;
    }
};
ViewModel$2.prototype.drag = function (col) {
    var _self = this;
    $(this.drag_name).dragsort({
        dragSelector: "tr",
        dragBetween: true,
        scrollContainer: _self.drag_name,
        dragSelectorExclude: "a",
        dragEnd: function dragEnd() {
            var icon_id = this.attr("id");
            var sort_number = this.attr("sort_number");
            $(_self.drag_name).find("tr").each(function (index, element) {
                if (element.id == icon_id) {
                    var target_element = $(element).next();
                    if (target_element.length !== 0) {
                        sort_number = target_element.attr("sort_number");
                    } else {
                        sort_number = '';
                    }
                }
            });
            var param = {
                section_data_id: icon_id,
                next_section_data_id: sort_number
            };
            $(_self.drag_name).dragsort("destroy");
            _self.store.move(param.section_data_id, param.next_section_data_id).done(function (data) {
                _self.drag();
                ko.observable().publishOn(EVENT_TYPE$1)(0);
            });
        }

    });
};

ViewModel$2.prototype.del = function (id, $data) {
    var that = this;
    $.confirm({
        content: "确定删除吗？",
        title: '系统提示',
        buttons: {
            confirm: {
                text: '确定',
                btnClass: 'btn-primary',
                action: function action() {
                    that.store.del(id).done(function () {
                        that.model.items.remove($data);
                        ko.observable().publishOn(EVENT_TYPE$1)(0);
                    });
                }
            },
            cancel: {
                text: '取消',
                action: function action() {}
            }
        }
    });
};

ViewModel$2.prototype.edit = function ($data) {
    var info = this.model.info;
    for (var i in this.model.info) {
        info[i]($data[i]);
    }
    if (this.model.info.data_type() === 1) {
        this.model.info.resource_name(this.model.info.tag_name() ? this.model.info.tag_name() : this.model.info.channel_name());
    }
    $(this.icon_modal).modal('show');
    this.initUpload(true);
};
ViewModel$2.prototype.initUpload = function (isEdit) {
    var that = this;

    function params(uploadInfo) {
        return {
            image_width: 116,
            image_height: 116,
            default_image: isEdit ? that.model.info.mobile_picture_url() : '',
            id: that.model.info.mobile_picture,
            url: that.model.info.mobile_picture_url,
            api_url: channelUrl,
            upload_info: uploadInfo
        };
    }

    if (this.uploadInfo) {
        this.model.upload(params(this.uploadInfo));
    } else {
        this.store.getUploadUrl().done(function (data) {
            that.uploadInfo = data;
            that.model.upload(params(data));
        });
    }
};
ViewModel$2.prototype.save = function () {
    var _this = this;

    if (!this.validationsInfo.isValid()) {
        this.validationsInfo.errors.showAllMessages();
        return false;
    }
    if (!this.model.info.mobile_picture()) {
        $.alert({
            title: "系统提示",
            content: "请上传标签图片",
            closeIcon: true,
            confirmButton: "确定"
        });
        return;
    }
    var data = ko.mapping.toJS(this.model.info),
        that = this;
    if (data.mobile_picture) data.mobile_picture = !~data.mobile_picture.indexOf('CS') ? 'CS:' + data.mobile_picture : data.mobile_picture;
    if (data.data_type === 3) {
        if (data.mobile_url && !data.mobile_url.match(/^(https?|cmp:\/\/)/)) {
            data.mobile_url = 'http://' + data.mobile_url;
        }
    }
    if (data.data_type == 1) {
        data.tag_name = data.resource_name;
    }
    if (data.id) {
        this.store.update(data.id, data).done(function (res) {
            $(that.icon_modal).modal('hide');
            var old = _$1.arrayFirst(_this.model.items(), function (v) {
                return v.id === res.id;
            });
            _this.model.items.replace(old, $.extend(true, {}, old, res));
            ko.observable().publishOn(EVENT_TYPE$1)(0);
        });
    } else {
        data.id = undefined;
        this.store.create(data, this.params.id).done(function (res) {
            $(that.icon_modal).modal('hide');
            _this.model.items.push($.extend(true, {}, data, res));
            _this.drag();
            ko.observable().publishOn(EVENT_TYPE$1)(0);
        });
    }
};

ViewModel$2.prototype._openDialog = function () {
    var _this2 = this;

    var data_type = this.model.info.data_type();
    if (this.model.info.id() && data_type === 2) return;
    this.model.modal.tag(false);
    this.model.modal.tab(false);
    if (data_type == 1) {
        this.model.modal.tag(true);
        ko.tasks.schedule(function () {
            $('#' + _this2.model.modal.tag_name()).modal('show');
        });
    } else if (data_type == 2) {
        this.model.modal.tab(true);
        ko.tasks.schedule(function () {
            $('#' + _this2.model.modal.tab_name()).modal('show');
        });
    }
};

ViewModel$2.prototype._validator = function () {
    ko.validation.init({
        errorMessageClass: 'text-danger'
    });
    var self = this;
    this.model.info.title.extend({
        required: {
            params: true,
            message: '必填项'
        }
    });
    this.model.info.resource_name.extend({
        required: {
            onlyIf: function onlyIf() {
                return self.model.info.data_type() !== 3;
            },
            message: '请选择推荐内容'
        }
    });
    this.model.info.mobile_url.extend({
        required: {
            onlyIf: function onlyIf() {
                return self.model.info.data_type() === 3;
            },
            message: '必填项'
        }
    });
};

ko.components.register('x-channel-admin-layout-content-icon', {
    synchronous: true,
    viewModel: ViewModel$2,
    template: tpl
});

var tpl$1 = "<div class=\"section-block modal fade\" data-backdrop=\"static\" id=\"sectionSetting4\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\" data-bind=\"text:params.type === 4?'资源列表':'全部资源'\">全部资源</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <div>\r\n                    <form>\r\n                        <div class=\"form-group\">\r\n                            <label class=\"control-label\">资源标签：</label>\r\n                            <a href=\"javascript:;\" class=\"form-control-static\"\r\n                               data-bind=\"click: _openDialog, text: model.tag_name\">请选择标签</a>\r\n                            <p data-bind=\"text: model.tip_text\"></p>\r\n                        </div>\r\n                    </form>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!--ko if: model.tag -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-tag', params:{'selected_tag': model.setting.data, from:'other', type: params.type, save: true, auto_selected: true, parent: $component, id: model.tag_id()}}\"></div>\r\n<!--/ko-->";

var EVENT_TYPE$2 = 'GET_CHANGE_STATE';
var groupNames$4 = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();

function ViewModel$3(_ref) {
    var section = _ref.section;

    var model = {
        tag: false,
        tag_id: 'other_tag' + section.id,
        tag_name: '请选择标签',
        tip_text: '（该板块展示本频道下资源，或本频道中选定标签下的资源，要维护本板块的资源，请到频道资源中维护）',
        setting: {
            data: {
                title: '',
                group_names: [], //学习单元分组列表 data_type为1时有效
                tag_id: "" //标签id（为空，表示显示所有资源）
            },
            display: {
                is_title_show: false,
                is_tag_show: true, //是否在资源上方显示标签
                tag_show_type: 1, //标签显示方式 1复选 2单选 3滑动
                is_sort_enabled: true, //是否开启排序功能
                order_type: 3, //排序方式 1最新 2最热 3推荐
                is_filter_enabled: true, //是否开启资源筛选
                filter_type: 2, //排序方式 0全部 2进行中 1即将开始 3已结束
                is_show_price_filter: false //是否显示付费筛选
            }
        },
        column_num: [{
            value: 4,
            text: '4'
        }, {
            value: 5,
            text: '5'
        }, {
            value: 6,
            text: '6'
        }],
        tag_show_type: [{
            value: 1,
            text: '标签复选'
        }, {
            value: 2,
            text: '标签单选'
        }, {
            value: 3,
            text: '标签滑动展示'
        }],
        order_type: [{
            value: 3,
            text: '综合'
        }, {
            value: 1,
            text: '最新'
        }, {
            value: 2,
            text: '最热'
        }],
        filter_type: [{
            value: 0,
            text: '全部'
        }, {
            value: 2,
            text: '进行中'
        }, {
            value: 1,
            text: '即将开始'
        }, {
            value: 3,
            text: '已结束'
        }]
    };

    this.model = ko.mapping.fromJS(model);
    this.params = section;
    this.init();
}

ViewModel$3.prototype.store = {
    create: function create(data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/',
            type: 'put',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        });
    }
};
ViewModel$3.prototype.init = function () {
    ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
    if (!this.model.setting.data.group_names().length) this.model.setting.data.group_names(groupNames$4);
    if (!this.model.setting.data.title()) this.model.setting.data.title(this.params.type === 4 ? '频道资源' : '全部资源');
    var tag_name = this.params.setting.data.tag_name ? this.params.setting.data.tag_name : this.params.type === 4 ? '频道标签' : '资源池标签';
    this.model.tag_name(tag_name);
    if (this.params.type === 5) this.model.tip_text('（该板块展示资源池中的所有资源，或资源池中选定标签下的资源，要维护本板块的资源，请到资源管理中维护）');
    var setting = this.model.setting;
    this.autoSave(setting.display.order_type);
    this.autoSave(setting.display.is_tag_show);
    this.autoSave(setting.display.tag_show_type);
    this.autoSave(setting.display.is_sort_enabled);
    this.autoSave(setting.display.is_filter_enabled);
    this.autoSave(setting.display.filter_type);
    this.autoSave(setting.display.is_title_show);
    this.autoSave(setting.display.is_show_price_filter);
    this.autoSave(setting.data.title, true);
};
ViewModel$3.prototype.autoSave = function (value, isInput) {
    var oldValue = '';
    if (isInput) {
        value.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 1000 } });
        value.subscribe(function (ov) {
            oldValue = $.trim(ov);
        }, null, 'beforeChange');
    } else {
        value.extend({ deferred: true });
    }
    value.subscribe(function (nv) {
        if (nv !== '') {
            if (isInput && $.trim(nv) === oldValue) {
                this.model.setting.data.title(oldValue);
                return;
            }
            this.create(true);
        }
    }, this);
};
ViewModel$3.prototype.create = function (showSuccess) {
    var s = this.model.setting;
    s.data.title($.trim(s.data.title()));
    var data = ko.mapping.toJS(this.model.setting);
    if (data.display.is_title_show && data.data.title === '') {
        $.alert('保存失败，请先输入板块标题。');
        return;
    } else if (!data.display.is_title_show) {
        data.data.title = this.params.type === 4 ? '频道资源' : '全部资源';
    }
    if (data.data.group_names.length === groupNames$4.length) data.data.group_names = [];
    this.store.create({ setting: JSON.stringify(data) }, this.params.id).done(function () {
        ko.observable().publishOn(EVENT_TYPE$2)(0);
        if (!showSuccess) {
            $.simplyToast('保存成功！');
        }
    });
};
ViewModel$3.prototype._openDialog = function () {
    var _this = this;

    this.model.tag(false);
    this.model.tag(true);
    ko.tasks.schedule(function () {
        $('#' + _this.model.tag_id()).modal('show');
    });
};
ko.components.register('x-channel-admin-layout-content-other', {
    synchronous: true,
    viewModel: ViewModel$3,
    template: tpl$1
});

var tpl$2 = "<div class=\"section-block modal fade\" data-backdrop=\"static\" id=\"sectionSetting2\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">橱窗推荐</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <!-- 橱窗推荐 -->\r\n                <div>\r\n                    <form>\r\n                        <div class=\"form-group\">\r\n                            <label class=\"control-label\">数据来源：</label>\r\n                            <label class=\"radio-inline\">\r\n                                <input type=\"radio\" name=\"data_type\" value=\"1\"\r\n                                       data-bind=\"checkedValue:1,checked: model.setting.data.data_type\">标签下的资源\r\n                            </label>\r\n                            <label class=\"radio-inline\">\r\n                                <input type=\"radio\" name=\"data_type\" value=\"2\"\r\n                                       data-bind=\"checkedValue:2,checked: model.setting.data.data_type\">选定的资源\r\n                            </label><label class=\"radio-inline\">\r\n                                <input type=\"radio\" name=\"data_type\" value=\"3\"\r\n                                       data-bind=\"checkedValue:3,checked: model.setting.data.data_type\">推荐规则\r\n                            </label>\r\n                        </div>\r\n                        <div class=\"form-group\" data-bind=\"visible: model.setting.data.data_type()===1\">\r\n                            <label class=\"control-label\">资源标签：</label>\r\n                            <a class=\"form-control-static\" href=\"javascript:;\"\r\n                               data-bind=\"click: _openDialog, text: model.tag_name\">请选择标签</a>\r\n                        </div>\r\n                        <div class=\"form-group\" data-bind=\"visible: model.setting.data.data_type()===2\">\r\n                            <button class=\"btn btn-default\"\r\n                                    data-bind=\"click: $component._openDialog.bind($component,model.items())\">\r\n                                选择资源\r\n                            </button>\r\n                            <span class=\"editable\">(资源列表可以拖动进行排序)</span>\r\n                        </div>\r\n                        <div class=\"form-group\" data-bind=\"visible: model.setting.data.data_type()===3\">\r\n                            <button class=\"btn btn-default\" data-bind=\"click: openRuleModal.bind($component, 0, -1, 0)\">\r\n                                新建推荐规则\r\n                            </button>\r\n                            <span class=\"editable\">(若未应用推荐规则，系统将进行智能推荐)</span>\r\n                        </div>\r\n                    </form>\r\n                    <table class=\"table table-bordered table-striped\"\r\n                           data-bind=\"visible: model.setting.data.data_type() === 2\">\r\n                        <thead>\r\n                        <tr>\r\n                            <th class=\"text-center\" style=\"width: 25%\">序号</th>\r\n                            <th class=\"text-center\" style=\"width: 25%\">资源名称</th>\r\n                            <th class=\"text-center\" style=\"width: 25%\">资源状态</th>\r\n                            <th class=\"text-center\" style=\"width: 25%\">操作</th>\r\n                        </tr>\r\n                        </thead>\r\n                        <tbody class=\"table-format\" data-bind=\"attr:{id: 'drag-'+model.id}, foreach: model.items\">\r\n                        <tr class=\"text-center\" data-bind=\"attr: { 'data-id': resource_id,'data-channel':channel_id }\">\r\n                            <td class=\"text-center\" data-bind=\"text: $index()+1\"\r\n                                style=\"max-width: 150px;word-wrap: break-word;\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: resource_name\"></td>\r\n                            <td class=\"text-center\"><span class=\"label\"\r\n                                                          data-bind=\"text: $component.formatStatus($data,1),css: $component.formatStatus($data,0)?'label-success':'label-default'\"></span>\r\n                            </td>\r\n                            <td class=\"text-center\">\r\n                                <a class=\"btn\" href=\"javascript:;\"\r\n                                   data-bind=\"text:'删除',click: $parent.remove.bind($component)\"></a>\r\n                            </td>\r\n                        </tr>\r\n                        </tbody>\r\n                        <tbody data-bind=\"visible: !model.items().length\">\r\n                        <tr>\r\n                            <td class=\"text-center\" colspan=\"5\" style=\"text-align: center; padding:30px 0\">暂无相关数据</td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </div>\r\n                <!-- 规则推荐 -->\r\n                <div data-bind=\"visible: model.setting.data.data_type() === 3\">\r\n                    <h5>推荐规则列表</h5>\r\n                    <table class=\"table table-bordered table-striped\">\r\n                        <thead>\r\n                        <tr>\r\n                            <th class=\"text-center\" style=\"width: 10%\">序号</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">规则名称</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">备注说明</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">创建时间</th>\r\n                            <th class=\"text-center\" style=\"width: 10%\">应用状态</th>\r\n                            <th class=\"text-center\" style=\"width: 20%\">操作</th>\r\n                        </tr>\r\n                        </thead>\r\n                        <tbody class=\"table-format\" data-bind=\"foreach: model.rules\">\r\n                        <tr class=\"text-center\">\r\n                            <td class=\"text-center\" data-bind=\"text: $index()+1\"\r\n                                style=\"max-width: 150px;word-wrap: break-word;\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: name\"></td>\r\n                            <td class=\"text-center\" data-bind=\"text: description\"></td>\r\n                            <td class=\"text-center\"\r\n                                data-bind=\"text: $.format.date(create_time,'yyyy-MM-dd HH:mm')\"></td>\r\n                            <td class=\"text-center\"><span class=\"label\"\r\n                                                          data-bind=\"text: status ? '已应用' : '未应用', css: status ?'label-success':'label-default'\"></span>\r\n                            </td>\r\n                            <td class=\"text-center\">\r\n                                <a href=\"javascript:;\"\r\n                                   data-bind=\"text: status ? '停用': '应用', click: $parent.updateRule.bind($component)\"></a>\r\n                                <a href=\"javascript:;\"\r\n                                   data-bind=\"text:'编辑',click: $parent.openRuleModal.bind($component, id, $index(), status)\"></a>\r\n                                <a href=\"javascript:;\"\r\n                                   data-bind=\"text:'删除',click: $parent.remove.bind($component)\"></a>\r\n                            </td>\r\n                        </tr>\r\n                        </tbody>\r\n                        <tbody data-bind=\"visible: !model.rules().length\">\r\n                        <tr>\r\n                            <td class=\"text-center\" colspan=\"6\" style=\"text-align: center; padding:30px 0\">暂无相关数据</td>\r\n                        </tr>\r\n                        </tbody>\r\n                    </table>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!--ko if: model.setting.data.data_type() == 3 && model.isShow() -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-rule', params: {id: model.modal.rule_name(), rule: model.rule, rule_list: model.rule_data_list,'selected_course':model.selected_course, openDialog: $component._openDialog.bind($component) }}\"></div>\r\n<!--/ko-->\r\n<!--ko if: model.modal.tag -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-tag', params:{'selected_tag': model.setting.data, type: 4,from:'window', all:true, save: true,  parent: $component,id: model.modal.tag_name()}}\"></div>\r\n<!--/ko-->\r\n<!--ko if: model.modal.tab -->\r\n<div data-bind=\"component:{'name': 'x-channel-admin-layout-content-resource', params: {'selected_course': model.selected_course, 'update_course': model.update_course, 'options': true,enableCount:model.enableCount(), parent: $data, id: model.modal.tab_name()}}\"></div>\r\n<!--/ko-->";

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _$2 = ko.utils;
var EVENT_TYPE$3 = 'GET_CHANGE_STATE';
var groupNames$5 = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();
var CARD_SIZE_MAP = { 4: { h: 314, w: 270, mb: 40 }, 5: { h: 256, w: 218, mb: 28 }, 6: { h: 206, w: 180, mb: 24 } };

var ViewModel$4 = function () {
    function ViewModel(params) {
        classCallCheck(this, ViewModel);

        var s = params.section.setting;
        this.model = {
            type: params.section.type || 2, // 2 橱窗推荐  6 推荐课程
            id: params.section.id || 0,
            modal: {
                tag_name: ko.observable('window_tag' + params.section.id),
                tag: ko.observable(false),
                tab: ko.observable(false),
                tab_name: ko.observable('window_tab' + params.section.id),
                rule_name: ko.observable('window_rule' + params.section.id)
            },
            items: ko.observableArray([]),
            rules: ko.observableArray([]),
            setting: {
                data: {
                    title: ko.observable(s.data.title || ""), //橱窗标题 ,
                    data_type: ko.observable(s.data.data_type || 1), //数据来源类型 1标签 2资源
                    order_type: ko.observable(s.data.order_type || 1), //排序方式 1最新 2最热 3推荐 data_type为1时有效
                    group_names: ko.observableArray(s.data.group_names || []), //学习单元分组列表 data_type为1时有效
                    tag_id: ko.observable(s.data.tag_id || ""), //标签id（为空，表示显示频道或者资源池下的所有资源）
                    tag_name: ko.observable(s.data.tag_name || ''),
                    channel_id: ko.observable(s.data.channel_id || ''), //标签所属的频道id（为空，表示资源池下的标签）
                    resources: ko.observableArray(s.data.resources || []), //"resource_id": "", //资源标识"channel_id": "" //资源来源频道标识
                    rules: ko.observableArray(s.data.rules || [])
                },
                display: {
                    is_title_show: ko.observable(s.display.is_title_show),
                    web: { //web端展示方式
                        row_num: ko.observable(s.display.web.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.web.column_num || 4), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.web.show_num || 3), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.web.ad_enable || false),
                        ad_logo: ko.observable(s.display.web.ad_logo || ""),
                        ad_url: ko.observable(s.display.web.ad_url || "")
                    },
                    mobile: { //移动端展示方式
                        display_type: ko.observable(s.display.mobile.display_type || 1), //展示方式 1左右滑动 2田字格
                        display_num: ko.observable(s.display.mobile.display_num || 5), //显示资源数 display_type为1时有效
                        row_num: ko.observable(s.display.mobile.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.mobile.column_num || 2), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.mobile.show_num || 2), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                        ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                        ad_url: ko.observable(s.display.mobile.ad_url || "")
                    }
                }
            },
            tag_name: ko.observable('请选择标签'),
            web_row_num: [{ value: 1, text: '1行' }, { value: 2, text: '2行' }, { value: 3, text: '3行' }, {
                value: 4,
                text: '4行'
            }], //和手机端展示方式共用
            web_col_num: [{ value: 4, text: '4' }, { value: 5, text: '5' }, { value: 6, text: '6' }],
            web_show_num: [{ value: 1, text: '1' }, { value: 2, text: '2' }, { value: 3, text: '3' }, { value: 4, text: '4' }], //和手机端展示方式共用
            m_display_num: [{ value: 5, text: '5' }, { value: 6, text: '6' }, { value: 7, text: '7' }, { value: 8, text: '8' }],
            m_col_num: [{ value: 1, text: '1' }, { value: 2, text: '2' }],
            selected_tag: {
                tag_id: ko.observable(''),
                title: ko.observable(''),
                channel_id: ko.observable(''),
                group_names: ko.observable(''),
                order_type: ko.observable('')
            },
            selected_course: ko.observableArray([]),
            update_course: ko.observableArray([]),
            enableCount: ko.observable(1),
            rule: {
                id: ko.observable(0),
                index: ko.observable(-1),
                status: ko.observable(0)
            },
            window_data_list: params.section.window_data_list,
            rule_data_list: ko.observableArray(params.section.rule_data_list || []),
            parent: params.parent,
            isShow: ko.observable(false),
            advertisement: {
                web: {
                    ad_enable: ko.observable(s.display.web.ad_enable || false),
                    ad_logo: ko.observable(s.display.web.ad_logo || ""),
                    ad_url: ko.observable(s.display.web.ad_url || "")
                },
                mobile: {
                    ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                    ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                    ad_url: ko.observable(s.display.mobile.ad_url || "")
                }
            },
            adUploadDialog: ko.observable(false)
        };
        this.model.sizeHint = ko.computed(function () {
            var display = this.model.setting.display;
            var size = CARD_SIZE_MAP[display.web.column_num()];
            return size.w + '*' + (size.h * display.web.row_num() + size.mb * (display.web.row_num() - 1));
        }, this);
        ViewModel.prototype.store = {
            create: function create(data, section_id) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + section_id,
                    type: 'put',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                });
            },
            get: function get$$1(section_id) {
                return $.ajax({
                    url: '/' + projectCode + '/sections/' + section_id + '/windows',
                    cache: false,
                    data: { query_type: 1 },
                    dataType: 'json'
                });
            },
            move: function move(section_data_id, next_section_data_id) {
                return $.ajax({
                    url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
                    type: 'put'
                });
            },
            getUploadUrl: function getUploadUrl() {
                return $.ajax({
                    url: channelUrl + '/v1/users/photo_session',
                    cache: false
                });
            }
        };
        this.init();
    }

    ViewModel.prototype.init = function init() {
        var _this = this;

        var setting = this.model.setting,
            model = this.model,
            that = this;
        model.items(model.window_data_list || []);
        model.selected_course(model.window_data_list || []);
        setting.data.tag_name() && model.tag_name(setting.data.tag_name());
        model.rules(ko.mapping.toJS(model.rule_data_list) || []);
        ko.tasks.schedule(function () {
            that.drag();
        });

        if (!setting.display.is_title_show()) {
            setting.data.title(model.type == 2 ? '橱窗推荐' : '为你推荐');
            setting.display.is_title_show(false);
        }

        model.update_course.subscribe(function () {
            _this.model.type == 2 && _this.create();
        });
        model.rule_data_list.subscribe(function (nv) {
            model.rules([]);
            model.rules(nv);
            model.rules.valueHasMutated();
            _this.create();
        });
        model.enableCount = ko.pureComputed(function () {
            return setting.display.web.column_num() * setting.display.web.row_num();
        }, this);
    };

    ViewModel.prototype.save = function save() {};

    // flag:1 返回文字; flag：0 返回bool


    ViewModel.prototype.formatStatus = function formatStatus($data, flag) {
        if ($data.resource_id) {
            var status = $data.enabled;
            if (flag) {
                return status ? '发布' : '禁用';
            } else {
                return status ? 1 : 0;
            }
        }
    };

    ViewModel.prototype.autoSave = function autoSave(value, isInput) {
        var oldValue = '';
        if (isInput) {
            value.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 1000 } });
            value.subscribe(function (ov) {
                oldValue = $.trim(ov);
            }, null, 'beforeChange');
        } else {
            value.extend({ deferred: true });
        }
        value.subscribe(function (nv) {
            var setting = this.model.setting;
            if (nv !== '') {
                if (isInput && $.trim(nv) === oldValue) {
                    setting.data.title(oldValue);
                    return;
                }
                this.create();
            }
        }, this);
    };

    ViewModel.prototype.create = function create(items) {
        var that = this,
            s = this.model.setting;
        s.data.title($.trim(s.data.title()));
        if (s.display.is_title_show() && $.trim(s.data.title()) === '') {
            $.alert('保存失败，请先输入板块标题。');
            return;
        }
        if (s.data.data_type() === 2) {
            s.data.order_type(3); //排序类型 3：综合 1：最新 2：最热
            s.data.group_names(groupNames$5);
            s.data.tag_id('');
            s.data.channel_id('');
            this.model.rules([]);
            this.model.tag_name('请选择标签');
        } else if (s.data.data_type() === 1) {
            s.data.resources([]);
            this.model.items([]);
            this.model.rules([]);
            if (s.data.group_names().length === groupNames$5.length) s.data.group_names([]);
            that.model.selected_course([]);
        } else if (s.data.data_type() === 3) {
            s.data.order_type(3); //排序类型 3：综合 1：最新 2：最热
            s.data.group_names(groupNames$5);
            s.data.tag_id('');
            s.data.channel_id('');
            this.model.tag_name('请选择标签');
            s.data.resources([]);
            this.model.items([]);
            if (s.data.group_names().length === groupNames$5.length) s.data.group_names([]);
        }
        var setting = ko.mapping.toJS(this.model.setting),
            selected_course = items || ko.mapping.toJS(this.model.selected_course),
            rules = items || ko.mapping.toJS(this.model.rule_data_list);
        if (setting.data.data_type == 2) {
            setting.data.resources = _$2.arrayMap(selected_course, function (item) {
                if (item.resource_id) {
                    return {
                        resource_id: item.resource_id,
                        channel_id: item.channel_id
                    };
                }
            });
            setting.data.rules = [];
        }
        if (setting.data.data_type == 3) {
            setting.data.rules = _$2.arrayMap(rules, function (item) {
                return {
                    rule_id: item.id,
                    status: item.status || 0
                };
            });
            setting.data.resources = [];
        }

        this.store.create({ setting: JSON.stringify(setting) }, this.model.id).done(function () {
            if (setting.data.data_type === 2) that.get();
            ko.observable().publishOn(EVENT_TYPE$3)(0);
            that.drag();
        });
    };

    ViewModel.prototype.get = function get$$1() {
        var that = this;
        this.store.get(this.model.id).done(function (res) {
            if (that.model.setting.data.data_type() === 2) {
                that.model.items(res || []);
                that.model.selected_course(res || []);
                that.drag();
            }
        });
    };

    ViewModel.prototype.remove = function remove($data) {
        var _this2 = this;

        $.confirm({
            content: "确定删除吗？",
            title: '系统提示',
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: function action() {
                        var items = _this2.model.setting.data.data_type() == 3 ? _this2.model.rules : _this2.model.items;
                        items.remove($data);
                        if (_this2.model.setting.data.data_type() == 2) {
                            _this2.model.rule_data_list.remove(function (item) {
                                return item.id == $data.id;
                            });
                        }
                        _this2.create(ko.mapping.toJS(items));
                    }
                },
                cancel: {
                    text: '取消',
                    action: function action() {}
                }
            }
        });
    };

    ViewModel.prototype.drag = function drag() {
        var that = this,
            dragDOM = $("#drag-" + this.model.id);
        dragDOM.dragsort("destroy");
        dragDOM.dragsort({
            dragSelector: "tr",
            dragBetween: true,
            dragSelectorExclude: "a",
            scrollContainer: "#drag-" + that.model.id,
            dragEnd: function dragEnd() {
                dragDOM.dragsort("destroy");
                var section_data_id = this.attr('data-id');
                if (section_data_id) {
                    var items = [];
                    $.each(dragDOM.children('tr'), function (i, v) {
                        if ($(v).attr('data-id')) {
                            items.push({
                                channel_id: $(v).attr('data-channel'),
                                resource_id: $(v).attr('data-id')
                            });
                        }
                    });
                    that.create(items);
                }
            }
        });
    };

    ViewModel.prototype._openDialog = function _openDialog(selectCourses) {
        var _this3 = this;

        var data_type = this.model.setting.data.data_type();
        this.model.modal.tag(false);
        this.model.modal.tab(false);
        if (data_type == 1) {
            this.model.modal.tag(true);
            ko.tasks.schedule(function () {
                $('#' + _this3.model.modal.tag_name()).modal('show');
            });
        } else if (data_type == 2 || data_type == 3) {
            this.model.modal.tab(true);
            this.model.selected_course(selectCourses);
            ko.tasks.schedule(function () {
                $('#' + _this3.model.modal.tab_name()).modal('show');
            });
        }
    };

    ViewModel.prototype.openRuleModal = function openRuleModal(id, index, status) {
        this.model.rule.id(id);
        this.model.rule.index(index);
        this.model.rule.status(status);
        this.model.isShow(false);
        this.model.isShow(true);
        $('#' + this.model.modal.rule_name()).modal('show');
    };

    ViewModel.prototype.updateRule = function updateRule($data) {
        var t = this,
            count = 0;

        function postAjax() {
            $.each(t.model.rule_data_list(), function (i, v) {
                if (v.id === $data.id) {
                    v.status = $data.status ? 0 : 1;
                    return false;
                }
            });
            t.create();
            t.model.rules([]);
            t.model.rules(ko.mapping.toJS(t.model.rule_data_list));
            $.simplyToast($data.status ? '停用成功！' : '应用成功！');
        }

        if (!$data.status) {
            $.each(this.model.rule_data_list(), function (i, v) {
                if (v.status) {
                    count = 1;
                    $.confirm({
                        content: t.htmlEscape("规则 “" + v.name + "” 正在应用中，是否替换？"),
                        title: '操作提示',
                        buttons: {
                            confirm: {
                                text: '替换',
                                btnClass: 'btn-primary',
                                action: function action() {
                                    v.status = 0;
                                    postAjax();
                                }
                            },
                            cancel: {
                                text: '取消'
                            }
                        }
                    });
                    return false;
                }
            });
            if (!count) postAjax();
        } else {
            postAjax();
        }
    };

    ViewModel.prototype.htmlEscape = function htmlEscape(text) {
        return text.replace(/[<>"'&]/g, function (match, pos, originalText) {
            switch (match) {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "\"":
                case "\'":
                    return "&quot;";
            }
        });
    };

    ViewModel.prototype.showAdDialog = function showAdDialog() {
        var self = this,
            display = this.model.setting.display;
        this.store.getUploadUrl().done($.proxy(function (res) {
            var size = CARD_SIZE_MAP[display.web.column_num()],
                ratio = 2;
            this.model.uploadParams = {
                web: {
                    image_width: size.w / ratio,
                    image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                    default_image: display.web.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo() : '',
                    id: this.model.advertisement.web.ad_logo,
                    url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo()),
                    api_url: channelUrl,
                    upload_info: res
                },
                mobile: {
                    image_width: size.w / ratio,
                    image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                    default_image: display.mobile.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo() : '',
                    id: this.model.advertisement.mobile.ad_logo,
                    url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo()),
                    api_url: channelUrl,
                    upload_info: res
                }
            };
            this.model.adUploadDialog(true);
            $('#window-modal-' + this.model.id).modal('show');
            $('#window-modal-' + this.model.id).one('hidden.bs.modal', function () {
                self.model.adUploadDialog(false);
            });
        }, this));
    };

    ViewModel.prototype.saveAd = function saveAd() {
        var web = this.model.setting.display.web,
            mobile = this.model.setting.display.mobile,
            webAd = this.model.advertisement.web,
            mobileAd = this.model.advertisement.mobile;
        web.ad_enable(webAd.ad_enable());
        webAd.ad_logo(webAd.ad_enable() ? webAd.ad_logo() : '');
        webAd.ad_url(webAd.ad_enable() ? webAd.ad_url() : '');
        web.ad_logo(webAd.ad_logo());
        web.ad_url(webAd.ad_url());
        mobile.ad_enable(mobileAd.ad_enable());
        mobileAd.ad_logo(mobileAd.ad_enable() ? mobileAd.ad_logo() : '');
        mobileAd.ad_url(mobileAd.ad_enable() ? mobileAd.ad_url() : '');
        mobile.ad_logo(mobileAd.ad_logo());
        mobile.ad_url(mobileAd.ad_url());
        this.create();
        $('#window-modal-' + this.model.id).modal('hide');
    };

    return ViewModel;
}();

ko.components.register('x-channel-admin-layout-content-window', {
    viewModel: ViewModel$4,
    template: tpl$2
});

var template$2 = "<div class=\"upload\">\r\n    <img class=\"upload-img\"\r\n         data-bind=\"attr:{src: model.img_url}, visible: model.load, style:{width: model.image_width + 'px', height: model.image_height +'px'},event:{load: load}\"\r\n         style=\"display: none;\">\r\n    <p data-bind=\"visible: model.img_url()&&!model.load()\">图片加载中，请稍后...</p>\r\n    <div class=\"progress\" data-bind=\"visible: model.progress() && !model.load()\"\r\n         style=\"display: none;width:400px;margin-top:10px;\">\r\n        <div class=\"progress-bar progress-bar-striped active\"\r\n             data-bind=\"style:{width: model.progress()+'%'},text: model.progress()+'%'\"></div>\r\n    </div>\r\n    <p class=\"text-danger\" data-bind=\"text: model.message\"></p>\r\n    <div style=\"color: #fff;height: 40px;\">\r\n        <div data-bind=\"attr:{id: model.upload_id}\"><span class=\"glyphicon glyphicon-cloud-upload\"></span>\r\n            <!--ko text: model.picture.id() ? '重新上传':'选择图片' --><!--/ko--></div>\r\n    </div>\r\n</div>";

function ViewModel$5(params) {
    this.model = {
        upload_id: +new Date() + Math.floor(Math.random() * 1000 + 1),
        picture: {
            id: params.id || ko.observable(''),
            url: params.url || ko.observable('')
        },
        img_url: ko.observable(params.default_image || ''),
        image_width: params.image_width || 400,
        image_height: params.image_height || 400,
        api_url: params.api_url || '',
        progress: ko.observable(0),
        message: ko.observable(''),
        load: ko.observable(false)
    };
    this.upload_info = ko.unwrap(params.upload_info);
    var t = this;
    if (t.upload_info) {
        setTimeout(function () {
            t.initPicturePlugin(t.model.upload_id, t.upload_info);
        }, 300);
    }
}

ViewModel$5.prototype.store = {
    getUploadInfo: function getUploadInfo(api_url) {
        return $.ajax({
            url: api_url + '/v1/users/photo_session',
            cache: false
        });
    }
};
ViewModel$5.prototype.load = function () {
    this.model.load(true);
};
ViewModel$5.prototype.initPicturePlugin = function (domId, uploadInfo) {
    var uploader = this.uploader = new WebUploader.Uploader({
        swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
        server: uploadInfo.upload_path + '?session=' + uploadInfo.session + '&path=' + uploadInfo.path + '&scope=1',
        auto: true,
        fileVal: 'Filedata',
        duplicate: true,
        pick: {
            id: '#' + domId
        },
        fileSingleSizeLimit: 2 * 1024 * 1024,
        accept: [{
            title: "Images",
            extensions: "png,jpg",
            mimeTypes: 'image/png,image/jpeg,image/gif'
        }]
    });
    uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
    uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
    uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
    uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
    uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
    uploader.on('error', $.proxy(this.selectError, this, 'picture'));
};
ViewModel$5.prototype.selectError = function (type, error) {
    if (error === "Q_TYPE_DENIED") {
        if (type === 'picture') {
            this.model.message('仅支持png,jpg,gif格式');
        }
    } else if (error === "F_EXCEED_SIZE") {
        this.model.message('大小不能超过2M');
    }
};
ViewModel$5.prototype.uploadProgress = function (selector, file, percentage) {
    this.model.progress(Math.floor(percentage * 100));
};
ViewModel$5.prototype.beforeFileQueued = function (file) {
    if (!file.size) this.model.message('请重新选择图片');
};
ViewModel$5.prototype.uploadError = function (uploader, domId, file, reason) {
    this.uploaderMap = this.uploaderMap || {};
    this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
    if (++this.uploaderMap[domId] <= 1) {
        this.store.getUploadInfo(this.model.api_url).done($.proxy(function (uploadInfo) {
            uploader.option("server", uploadInfo.upload_path + "?session=" + uploadInfo.session + '&path=' + uploadInfo.path + '&scope=1');
            uploader.retry();
        }, this));
    } else {
        this.model.message('上传失败');
    }
};
ViewModel$5.prototype.uploadBeforeSend = function (obj, file, headers) {
    file.type = undefined;
    file.scope = 1;
    headers.Accept = "*/*";
    this.model.message('');
    this.model.progress(0);
    this.model.load(false);
    this.model.img_url('');
};
ViewModel$5.prototype.uploadSuccess = function (domId, file, response) {
    if (!response.code) {
        this.model.picture.id(response.dentry_id);
        this.model.picture.url(response.path);
        this.model.img_url(csUrl + '/v0.1/download?dentryId=' + response.dentry_id);
    } else {
        this.model.message('上传失败');
    }
};
ko.components.register('x-channel-upload', {
    synchronous: true,
    viewModel: ViewModel$5,
    template: template$2
});

var template$3 = "<div class=\"x-channel-tag\">\r\n    <div data-bind=\"attr:{id: params.id}\" class=\"modal fade\">\r\n        <div class=\"modal-dialog modal-lg\">\r\n            <div class=\"modal-content\">\r\n                <div class=\"modal-header\">\r\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\r\n                        <span aria-hidden=\"true\">×</span>\r\n                    </button>\r\n                    <h4 class=\"modal-title\">选择标签</h4></div>\r\n                <div class=\"modal-body\"  style=\"max-height: 500px;overflow-y:auto;overflow-x:hidden;\">\r\n                    <form class=\"form-horizontal\" id=\"tagForm\" onsubmit=\"return false;\">\r\n                        <div class=\"form-group\" data-bind=\"if: params.from !=='other'\">\r\n                            <label class=\"col-sm-3 control-label\">排序：</label>\r\n                            <div class=\"col-sm-9\">\r\n                                <label class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"3\" data-bind=\"checkedValue:3,checked: model.order_type\">综合</label>\r\n                                <label class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"2\" data-bind=\"checkedValue:2,checked: model.order_type\">最热</label>\r\n                                <label class=\"radio-inline\"><input name=\"linkType\" type=\"radio\" value=\"1\" data-bind=\"checkedValue:1,checked: model.order_type\">最新</label>\r\n                            </div>\r\n                        </div>\r\n                        <div class=\"form-group\"><label class=\"col-sm-3 control-label\">资源类型：</label>\r\n                            <div class=\"col-sm-9\">\r\n                                <label class=\"checkbox-inline\"><input type=\"checkbox\" data-bind=\"checked: model.isAllGroupNames\">全部</label>\r\n                                <!--ko foreach: model.resource_group -->\r\n                                <label class=\"checkbox-inline\">\r\n                                    <input type=\"checkbox\" data-bind=\"checked: $parent.model.group_names,checkedValue: name\"><!-- ko text: title --><!--/ko-->\r\n                                </label>\r\n                                <!--/ko-->\r\n                            </div>\r\n                        </div>\r\n                        <div class=\"form-group\">\r\n                            <div class=\"col-sm-offset-3 col-sm-9\">\r\n                                <ul data-bind=\"attr:{id: 'tree-'+params.id}\" class=\"ztree tagtree\"></ul>\r\n                            </div>\r\n                        </div>\r\n                    </form>\r\n                </div>\r\n                <div class=\"modal-footer\">\r\n                    <a class=\"btn-primary btn\" data-bind=\"click: save\">保存</a>\r\n                    <a class=\"btn btn-default\" data-dismiss=\"modal\">取消</a>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

var _$3 = ko.utils;
var groupNames$6 = function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    });
}();

function ViewModel$6(params) {
    var model = {
        selectedItem: {
            id: '',
            title: '',
            channel_id: ''
        },
        resource_group: [],
        order_type: 3, //排序类型 3：综合 1：最新 2：最热
        group_names: groupNames$6
    };
    this.params = params;
    this.parent = params.parent;
    this.model = ko.mapping.fromJS(model);
    this.init();
}

ViewModel$6.prototype.store = {
    getChannelTag: function getChannelTag() {
        return $.ajax({
            url: '/' + projectCode + '/channels/tags/tree',
            cache: false,
            dataType: 'json'
        });
    },
    getResTag: function getResTag() {
        return $.ajax({
            url: '/' + projectCode + '/resource_pool/tags/tree',
            cache: false,
            dataType: 'json'
        });
    },
    getTreeById: function getTreeById() {
        return $.ajax({
            url: '/' + projectCode + '/channels/' + channelId + '/tags/tree',
            cache: false,
            data: { custom_type: customType }
        });
    }
};
ViewModel$6.prototype.init = function () {
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
    this.model.group_names(selected_tag.group_names.length ? selected_tag.group_names : groupNames$6);

    this.getResourceGroup();
    this.getTree(selected_id);

    this.model.isAllGroupNames = ko.computed({
        read: function read() {
            var list = this.model.resource_group(),
                selected = this.model.group_names();
            return list.length && selected.length === list.length;
        },
        write: function write(value) {
            var list = this.model.resource_group(),
                selected = this.model.group_names;
            if (value) {
                selected($.map(list, function (v) {
                    return v.name;
                }));
            } else {
                selected([]);
            }
        },
        owner: this
    });
};
ViewModel$6.prototype.save = function () {
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
                parent = parent.getParentNode();
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
ViewModel$6.prototype.getResourceGroup = function () {
    this.model.resource_group(window.allGroupNames || []);
};
ViewModel$6.prototype.getTree = function (selected_id) {
    var that = this,
        tree_name = 'tree-' + this.params.id;
    var resTag,
        channelTag,
        resultTag = [],
        resRootTag = {},
        channelRootTag = {};
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
ViewModel$6.prototype.formatChannelTree = function (tree) {
    return _$3.arrayMap(tree, function (item) {
        return {
            id: item.channel_id,
            title: item.status ? '频道：' + item.channel_name + '(启用)' : '频道：' + item.channel_name + '(停用)',
            tag_name: item.channel_name,
            status: item.status,
            children: $.isArray(item.tag_tree_vo) ? item.tag_tree_vo : item.tag_tree_vo.id ? [item.tag_tree_vo] : []
        };
    });
};
ViewModel$6.prototype.loadTree = function (tag, treeId, selected_id) {
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

                fontCss: function fontCss(treeId, treeNode) {
                    return treeNode.status ? { color: "#3c763d" } : {};
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
    } else {
        $('#' + treeId).text("无分类！");
    }
};
ko.components.register('x-channel-admin-layout-content-tag', {
    viewModel: ViewModel$6,
    template: template$3
});

var template$4 = "<div data-bind=\"attr:{id: params.id}\" class=\"modal fade\" data-backdrop=\"static\">\r\n    <div class=\"modal-dialog modal-lg\" style=\"width: 1000px;\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"\" style=\"border-bottom: none; padding-top: 30px;\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span\r\n                            aria-hidden=\"true\">×</span></button>\r\n                <span class=\"text-danger tip\" data-bind=\"text: model.tip\"></span>\r\n                <ul class=\"nav nav-tabs\" role=\"tablist\" id=\"tabList\">\r\n                    <!--ko foreach: model.channelList -->\r\n                    <!-- ko if: $index()<3 -->\r\n                    <li role=\"presentation\"\r\n                        data-bind=\"click: $component.changeTab.bind($component,$index()),attr:{'class': !$index() ? 'active':''}\">\r\n                        <a role=\"tab\" data-toggle=\"tab\"\r\n                           data-bind=\"attr:{'href':'#' + id + $component.params.id}, css:{'text-success': status}\">\r\n                            <!--ko text: title +'('+ (status ? '启用' : '停用')+')'--><!--/ko--><span\r\n                                    data-bind=\"text: '(已选'+selected()+'个)', css:{'text-danger':selected()}\"></span></a>\r\n                    </li>\r\n                    <!--/ko-->\r\n                    <!--/ko -->\r\n                    <!-- ko if: model.channelList().length>=4-->\r\n                    <li role=\"presentation\" class=\"dropdown\">\r\n                        <a href=\"#\" class=\"dropdown-toggle\" data-bind=\"attr: {id : 'myTabDrop1'+ $component.params.id}\"\r\n                           data-toggle=\"dropdown\"\r\n                           aria-expanded=\"false\">更多<span class=\"caret\"></span></a>\r\n                        <ul class=\"dropdown-menu\" data-bind=\"attr: {id : 'myTabDrop1-contents'+ $component.params.id}\">\r\n                            <!--ko foreach: model.channelList -->\r\n                            <!-- ko ifnot: $index()<3 -->\r\n                            <li data-bind=\"click: $component.changeTab.bind($component,$index()),attr:{'class': !$index() ? 'active':''}\">\r\n                                <a role=\"tab\" data-toggle=\"tab\"\r\n                                   data-bind=\"attr:{'href':'#'+id+$component.params.id},css:{'text-success': status}\">\r\n                                    <!--ko text: title +'('+ (status ? '启用' : '停用')+')'--><!--/ko--><span\r\n                                            data-bind=\"text: '(已选'+selected()+'个)', css:{'text-danger':selected()}\"></span></a>\r\n                            </li>\r\n                            <!--/ko-->\r\n                            <!--/ko -->\r\n                        </ul>\r\n                    </li>\r\n                    <!--/ko -->\r\n                </ul>\r\n            </div>\r\n            <div class=\"modal-body tab-content\" style=\"max-height: 500px;overflow-y:auto;overflow-x:hidden;\"\r\n                 data-bind=\"foreach: model.channelList\">\r\n                <div role=\"tabpanel\" class=\"tab-pane\"\r\n                     data-bind=\"attr:{'class': $index() ? 'tab-pane' : 'tab-pane active', id: ''+id+$component.params.id}\">\r\n                    <!-- ko if: $index() == $component.model.current() && clicked() -->\r\n                    <div data-bind=\"component: {name: 'x-channel-admin-layout-content-resource-list',params: { options: $component.params.options, id: id, count: selected, selectedCourse : selectedItems}}\"></div>\r\n                    <!--/ko-->\r\n                </div>\r\n            </div>\r\n            <div class=\"modal-footer\" style=\"border-top: none;\">\r\n                <a class=\"btn-primary btn\" data-bind=\"click: save\">保存</a>\r\n                <a class=\"btn btn-default\" data-dismiss=\"modal\">取消</a>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

var _$4 = ko.utils;

function ViewModel$7(params) {
    var model = {
        current: 0,
        channelList: [],
        enableCount: params.enableCount || 1, //可以选择的资源数
        totalCount: 0,
        tip: ''
    };
    this.model = ko.mapping.fromJS(model);
    this.params = params;
    this.parent = params.parent;
    this.init();
}

ViewModel$7.prototype.store = {
    getChannel: function getChannel() {
        return $.ajax({
            url: '/' + projectCode + '/channels/actions/query',
            data: {
                size: 9999
            },
            cache: false
        });
    }
};
ViewModel$7.prototype.init = function () {
    var selected_course = $.isArray(this.params.selected_course()) ? this.params.selected_course() : [this.params.selected_course()];
    this.model.totalCount(this.model.totalCount() + selected_course.length);
    this.getTip();
    this.getChannel();
};
ViewModel$7.prototype.count = function () {
    this.model.totalCount = ko.computed(function () {
        var total = 0;
        _$4.arrayForEach(this.model.channelList(), function (item) {
            var v = item.selected && item.selected();
            if (v) {
                total += v;
            }
        });
        return total;
    }, this);
    this.getTip();
};
ViewModel$7.prototype.getTip = function () {
    var enable = this.model.enableCount,
        total = this.model.totalCount,
        txt = total() <= enable() ? '你还可以选择' + (enable() - total()) + '个资源' : '你可以选择' + enable() + '个资源，已多选' + (total() - enable()) + '个资源';
    this.model.tip(txt);
};
ViewModel$7.prototype.getChannel = function () {
    var that = this;
    this.store.getChannel().done(function (res) {
        _$4.arrayForEach(res.items, function (item) {
            var count = 0;
            item.selectedItems = ko.observableArray([]);
            _$4.arrayForEach(that.params.selected_course(), function (selected) {
                if (item.id === selected.channel_id) {
                    count++;
                    item.selectedItems.push(selected);
                }
            });
            item.clicked = ko.observable(false);
            item.selected = ko.observable(count);
            item.selected.subscribe(function (nv) {
                that.count();
            });
            res.items[0].clicked(true);
        });
        that.model.channelList(res.items || []);
    });
};
ViewModel$7.prototype.save = function () {
    if (this.model.totalCount() > this.model.enableCount()) return;
    var that = this,
        result = [];
    _$4.arrayForEach(this.model.channelList(), function (item) {
        var v = item.selectedItems && item.selectedItems();
        if (v && v.length) {
            result = result.concat(v);
        }
    });
    if (!result.length) {
        $.alert('请选择资源');
        return false;
    }
    var repetitionMsg = '',
        uniqueObj = {};
    _$4.arrayForEach(result, function (item) {
        if (uniqueObj[item.resource_id]) {
            if (!~repetitionMsg.indexOf(item.resource_name) || !repetitionMsg) {
                repetitionMsg += item.resource_name + '<br />';
            }
        } else {
            uniqueObj[item.resource_id] = item.resource_id;
        }
    });
    if (repetitionMsg) {
        $.alert('以下资源被重复推荐，请重新选择：<br />' + repetitionMsg);
        return;
    }
    that.params.selected_course(result);
    that.params.update_course && that.params.update_course(result);
    $('#' + this.params.id).modal('hide');
};
ViewModel$7.prototype.changeTab = function (index, $data) {
    $data.clicked(true);
    this.model.current(index);
};
ko.components.register('x-channel-admin-layout-content-resource', {
    viewModel: ViewModel$7,
    template: template$4
});

var template$5 = "<div class=\"x-channel-resource section-block\" data-bind=\"attr:{id: params.id}\">\r\n    <div class=\"catalogs\" id=\"catalogs\">\r\n        <!--ko foreach:model.catalogs-->\r\n        <div class=\"catalog-column clearfix\" data-bind=\"attr: { 'data-id': id}\"><span class=\"column-title\"\r\n                                                                                      data-bind=\"text: title\"></span><span\r\n                    class=\"item-all item-label active\"\r\n                    data-bind=\"click: $component.catalogOnClick.bind($component, $element), attr:{'data-type':id}\"><a\r\n                        href=\"javascript:;\">全部</a></span>\r\n            <ul class=\"column-list\">\r\n                <!-- ko foreach: children -->\r\n                <li class=\"item-label\"\r\n                    data-bind=\"attr: { title: title, 'data-id': id, 'data-type':$parent.id},click: $component.catalogOnClick.bind($component, $element)\">\r\n                    <a href=\"javascript:;\" data-bind=\"text: title\"></a></li>\r\n                <!--/ko-->\r\n            </ul>\r\n        </div>\r\n        <!--/ko-->\r\n        <div class=\"catalog-column clearfix\">\r\n            <span class=\"column-title\">状态</span>\r\n            <span class=\"item-all item-label active\"\r\n                  data-bind=\"click:$component.selectFlag.bind($component,-1,$element)\"><a\r\n                        href=\"javascript:;\">全部</a></span>\r\n            <ul class=\"column-list\" data-bind=\"foreach: model.status\">\r\n                <li class=\"item-label\" data-bind=\"click:$component.selectFlag.bind($component,status, $element)\">\r\n                    <a href=\"javascript:;\" data-bind=\"text: title\"></a>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n        <div class=\"catalog-column clearfix\" style=\"display: none\" data-bind=\"visible: model.group_names().length \">\r\n            <span class=\"column-title\">资源类型</span>\r\n            <ul class=\"column-list\">\r\n                <li class=\"item-label\"><label class=\"checkbox-inline\"><input type=\"checkbox\" data-bind=\"checked: $component.model.isAllGroupNames\">全部</label></li>\r\n                <!--ko foreach: model.group_names-->\r\n                <li class=\"item-label\">\r\n                    <label class=\"checkbox-inline\">\r\n                        <input type=\"checkbox\"\r\n                               data-bind=\"checked: $component.model.filter.group_names, checkedValue: name\">\r\n                        <!-- ko text: title--><!--/ko-->\r\n                    </label>\r\n                </li>\r\n                <!--/ko-->\r\n            </ul>\r\n        </div>\r\n    </div>\r\n    <div class=\"block col-sm-12\" id=\"opencourseContent\">\r\n        <div class=\"block-tit cf\">\r\n            <div class=\"tit-tab-box\">\r\n                <div class=\"tit-search fl\">\r\n                    <input type=\"text\" placeholder=\"输入关键词\" data-bind=\"value: model.filter.name\" id=\"keyword\" autocomplete=\"off\"\r\n                           name=\"keyword\"/>\r\n                    <a class=\"vm\" href=\"javascript:;\" data-bind=\"click: doSearch,css:{'disabled':model.tips}\">\r\n                        <i class=\"glyphicon glyphicon-search\"></i>\r\n                    </a>\r\n                    <!--ko if:model.tips-->\r\n                    <span class=\"tips\">关键词不能多于50个字</span>\r\n                    <!--/ko-->\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"block-content\" id=\"layout-content\" data-bind=\"visible: model.items().length > 0\">\r\n            <div class=\"item-list cf\" data-bind=\"foreach: model.items, visible:model.style()=='pic'\" data-type=\"item\">\r\n                <a class=\"item cf\" href=\"javascript:;\"\r\n                   data-bind=\"click:$component.toggleSelectedItem.bind($component),css: {'selected': ~$component.checkSelected.call($component,$data)}\">\r\n                    <span class=\"resource-type\"\r\n                          data-bind=\"text:$component.formatResourceType($data),visible:$component.formatResourceType($data)\"></span>\r\n                    <div class=\"item-img pos_r\">\r\n                        <image-loader params=\"original:(cover && cover_url) ? cover_url +(~cover.indexOf('CLOUD')?'!m300x200.jpg':''): ' ',\r\n                                            element:$element,\r\n                                            hasRule:!(/default/.test(cover)),\r\n                                            container:'#layout-content',\r\n                                            imgRule:''\">\r\n                        </image-loader>\r\n                    </div>\r\n                    <div class=\"item-dl fl\">\r\n                        <!-- ko ifnot: type == 'famous_teacher'-->\r\n                        <div class=\"item-name ellipsis\" data-bind=\"text: title, attr: { title: title }\"></div>\r\n                        <!--/ko-->\r\n                        <!-- ko if: type == 'famous_teacher'-->\r\n                        <div class=\"item-name ellipsis\" data-bind=\"text: title + (extra ? ' '+extra.teacher_id : ''), attr: { title: title + (extra ? ' '+extra.teacher_id : '') }\"></div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='auxo-train'-->\r\n                        <div class=\"item-dd\"><span><i\r\n                                        data-bind=\"text: +extra.option_course_count + (+extra.require_course_count)\"></i> 门课程<em></em></span><span><i\r\n                                        data-bind=\"text: extra.exam_count\"></i> 个考试<em></em></span><span><i\r\n                                        data-bind=\"text: extra.total_period \"></i> 学时</span></div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='open-course'|| type=='opencourse_2'|| type=='offline_course'-->\r\n                        <div class=\"item-dd\"><span><i data-bind=\"text:extra.video_count \"></i> 视频<em></em></span><span><i\r\n                                        data-bind=\"text: extra.document_count\"></i> 文档<em></em></span><span><i\r\n                                        data-bind=\"text: extra.exercise_count \"></i> 练习</span></div>\r\n                        <!--/ko-->\r\n                        <!--ko if: ~$.inArray(type,['standard_exam','custom_exam','competition','design_methodlogy_exam','design_methodlogy_exercise','pk','online_exam','offline_exam'])-->\r\n                        <div class=\"item-dd\"><span data-bind=\"visible:extra.duration\">时长：<i\r\n                                        data-bind=\"text: extra.duration ? ~~(extra.duration/60) : 0\"></i>\r\n                                <em></em></span><span>考试机会：<i\r\n                                        data-bind=\"text: extra.exam_chance? extra.exam_chance:'不限'\"></i></span>\r\n                        </div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='barrier'-->\r\n                        <div class=\"item-dd\">\r\n                            <span>共 <i data-bind=\"text: extra.barrier_num\"></i> 关</span>\r\n                        </div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='e-certificate'-->\r\n                        <div class=\"item-dd\">\r\n                            <span><i data-bind=\"text: extra.relation_course_count\"></i> 公开课<em></em></span>\r\n                            <span><i data-bind=\"text: extra.relation_train_count\"></i> 培训</span>\r\n                        </div>\r\n                        <!--/ko-->\r\n                        <!-- ko if: type == 'website'-->\r\n                        <div class=\"item-dd ellipsis\"\r\n                             data-bind=\"text: description, attr: { title: description }\"></div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='famous_teacher'-->\r\n                        <div class=\"item-time\" data-bind=\"if: extra\">\r\n                            <!--ko foreach: extra.stages -->\r\n                            <span data-bind=\"text: $component.model.stages[$data]\"></span>&nbsp;\r\n                            <!--/ko-->\r\n                            <!--ko foreach: extra.subjects -->\r\n                            <span data-bind=\"text: subject_name\"></span>&nbsp;\r\n                            <!--/ko-->\r\n                            <span data-bind=\"text: extra.school_full_name\"></span>\r\n                        </div>\r\n                        <div class=\"item-dd\">\r\n                            <span>浏览量<i data-bind=\"text: user_count\"></i><em></em></span>\r\n                            <span data-bind=\"if:extra\">资源量<i data-bind=\"text: extra.resource_count\"></i></span>\r\n                        </div>\r\n                        <!--/ko-->\r\n                        <!--ko if: type=='famous_school'-->\r\n                        <div class=\"item-time\" data-bind=\"if: extra\">\r\n                            <!--ko foreach: extra.stages -->\r\n                            <span data-bind=\"text: $component.model.stages[$data]\"></span>&nbsp;\r\n                            <!--/ko-->\r\n                            <span data-bind=\"text: extra.area\"></span>\r\n                        </div>\r\n                        <div class=\"item-dd\" data-bind=\"if: extra\">\r\n                            <span>浏览量<i data-bind=\"text: user_count\"></i><em></em></span>\r\n                            <span data-bind=\"if:extra\">资源量<i data-bind=\"text: extra.resource_count\"></i></span>\r\n                        </div>\r\n                        <!--/ko-->\r\n                        <div class=\"item-time\">\r\n                            <!-- ko if: !~$.inArray(type,['lecturer','lecturer_new','famous_teacher','famous_school','website']) -->\r\n                            <span class=\"item-user\"><i data-bind=\"text:user_count\"></i> 人学习</span>\r\n                            <!-- /ko -->\r\n                            <span class=\"item-price\"><i data-bind=\"text:$component.formatPrice(commodity)\"></i></span>\r\n                        </div>\r\n                    </div>\r\n                    <span class=\"item-check-left\" style=\"left:auto;right:2px;\"><i\r\n                                class=\"glyphicon glyphicon-ok\"></i></span>\r\n                    <div class=\"mask\"></div>\r\n                    <div class=\"item-label-box\">\r\n                        <i class=\"item-label on\" data-bind=\"text: visible_config==1 ? '内部' : '',visible:visible_config==1\"></i>\r\n                        <i class=\"item-label\" data-bind=\"text: online_status == 0 ? '下线' : '在线',css: { 'on': online_status == 1, 'off': online_status == 0 }\"></i>\r\n                        <i class=\"item-label\" data-bind=\"text: !enabled ? '禁用' : '发布',css: { 'on': enabled, 'off': !enabled }\"></i>\r\n                        <i class=\"item-label zd\" data-bind=\"visible: is_top != 0 \">置顶</i>\r\n                    </div>\r\n                </a>\r\n            </div>\r\n        </div>\r\n        <div data-bind=\"attr:{id: 'pagination-'+params.id}\"></div>\r\n        <div data-bind=\"visible: model.items().length<= 0\">\r\n            <div class=\"item-nodata\">暂无相关资源</div>\r\n        </div>\r\n    </div>\r\n</div>";

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
var RESOURCE_CONFIG_MAP = function () {
    var map = {},
        g = window.allGroupNames;
    for (var i = 0; i < g.length; i++) {
        map[g[i].type] = g[i];
    }
    return $.extend(map, course_config_map);
}();
var _$5 = ko.utils;
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

    return this; //support chaining
};

function ViewModel$8(params) {
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
            name: '', //搜索关键字
            no_tag_resource: false, //是否查询未贴标签的资源, 默认为false
            tag_ids: [], //标签ID(多值)
            is_top: false, //置顶标识
            sort_type: 3, //排序类型：3综合 1最新 2最热
            time_status: '', //1即将开始 2正在开课 3已结束
            audit_status: '',
            group_names: [], //学习单元分组列表
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

ViewModel$8.prototype.store = {
    courseList: function courseList(data, id) {
        return $.ajax({
            dataType: 'json',
            type: 'post',
            url: '/' + projectCode + '/channels/' + id + '/resources',
            data: JSON.stringify(data),
            contentType: 'application/json;charset=utf-8'
        });
    },
    //标签树
    getCatalogs: function getCatalogs(id) {
        return $.ajax({
            url: '/' + projectCode + '/channels/' + id + '/tags/tree',
            cache: false,
            dataType: 'json'
        });
    },
    getMixOrgTree: function getMixOrgTree() {
        return $.ajax({
            url: "/" + projectCode + "/manage_orgs",
            data: { org_id: window.projectOrgId },
            type: "get",
            dataType: "json",
            cache: false
        });
    }
};
ViewModel$8.prototype.init = function () {
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
        read: function read() {
            var list = this.model.group_names(),
                selected = this.model.filter.group_names();
            return list.length && selected.length === list.length;
        },
        write: function write(value) {
            var list = this.model.group_names(),
                selected = this.model.filter.group_names;
            if (value) {
                selected($.map(list, function (v) {
                    return v.name;
                }));
            } else {
                selected([]);
            }
        },
        owner: this
    });
};
ViewModel$8.prototype.formatResourceType = function ($data) {
    var type = $data.type;
    if ($data.type === 'opencourse_2') {
        type = $data.extra.business_type;
    }
    return RESOURCE_CONFIG_MAP[type] && RESOURCE_CONFIG_MAP[type].alias || RESOURCE_CONFIG_MAP[$data.type].alias;
};
ViewModel$8.prototype.getResourceGroup = function () {
    var that = this,
        res = $.map(window.allGroupNames || [], function (v) {
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
ViewModel$8.prototype._eventHandler = function () {
    var _self = this;
    $(document).off('keyup', '#keyword').on('keyup', '#keyword', function (e) {
        if (e.keyCode === 13) {
            _self.doSearch();
        }
    });
};
ViewModel$8.prototype.imgError = function ($data, event) {
    $(event.target).attr('src', window.default_img_base64);
};
ViewModel$8.prototype.toggleSelectedItem = function ($data) {
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
ViewModel$8.prototype.transferForParent = function (data) {
    return {
        "resource_id": data.resource_id,
        "resource_name": data.title,
        "cover_url": data.cover_url,
        "enabled": data.enabled,
        channel_id: this.params.id
    };
};
ViewModel$8.prototype.checkSelected = function ($data) {
    var selectedItems = this.model.selectedItems(),
        index = -1;
    $.each(selectedItems, function (i, v) {
        if ($data.resource_id == v.resource_id) {
            index = i;
            return false;
        }
    });
    return index;
};
ViewModel$8.prototype.getMixOrgTree = function () {
    var that = this;
    this.store.getMixOrgTree().done($.proxy(function (data) {
        this.manager_nodes = [];
        if (data.manager && !data.manager.has_manage_project) {
            this.manager_nodes = $.map(data.manager.manager_nodes, function (v) {
                return v.node_id;
            }) || [];
            this.model.filter.affiliated_org_nodes(this.manager_nodes);
        }
        this.store.getCatalogs(this.params.id).done(function (data) {
            if (data && data.children) {
                that.initList(data);
            } else {
                that.getParam();
            }
        });
        var selectMap = {
            '-1': { prop: 'all', val: '' },
            '1': { prop: 'no_tag_resource', val: true },
            '2': { prop: 'is_top', val: 1 },
            '3': { prop: 'online_status', val: 1 },
            '4': { prop: 'online_status', val: 0 },
            '5': { prop: 'audit_status', val: 1 },
            '6': { prop: 'audit_status', val: 2 },
            '7': { prop: 'audit_status', val: 3 }
        };
        this.clist.sub("clist", function (v) {
            var selected = selectMap[v.flag()];
            that._catalogSelect(selected.prop, selected.val);
            that.model.filter.tag_ids(v.catalogs());
            that.doSearch();
        });
    }, this));
};
ViewModel$8.prototype._list = function (flag) {
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
ViewModel$8.prototype._filterParams = function (params) {
    var _params = {};
    for (var key in params) {
        if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
            _params[key] = params[key];
        }
    }
    return _params;
};
ViewModel$8.prototype.styleChange = function (type) {
    this.model.style(type);
};
ViewModel$8.prototype.doSearch = function () {
    if (this.model.tips()) {
        return;
    }
    this.model.filter.page_no(0);
    this._list();
};
//项目item勾选事件
ViewModel$8.prototype.checkClick = function ($data) {
    // window.selectedCourse = {title: $data.name, id: $data.id, image_url: $data.cover_url};
    this.model.selected($data.id);
};
ViewModel$8.prototype._getArrayProp = function (array, prop) {
    return array.map(function (item) {
        return item[prop];
    });
};
//状态分类事件
ViewModel$8.prototype._catalogSelect = function (prop, val) {
    var filter = this.model.filter;
    ['no_tag_resource', 'is_top', 'online_status', 'time_status', 'audit_status'].forEach(function (name, i) {
        if (name === prop) {
            filter[prop](val);
        } else {
            filter[name]('');
        }
    });
};
ViewModel$8.prototype.initList = function (data) {
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
ViewModel$8.prototype.catalogOnClick = function (element) {
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
ViewModel$8.prototype.selectFlag = function (flag, element) {
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
ViewModel$8.prototype.getParam = function () {
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
ViewModel$8.prototype._page = function (count, offset, limit) {
    var self = this;
    $('#pagination-' + this.params.id).pagination(count, {
        is_show_first_last: true,
        is_show_input: true,
        items_per_page: limit,
        num_display_entries: 5,
        current_page: offset,
        prev_text: "上一页",
        next_text: "下一页",
        callback: function callback(index) {
            if (index != offset) {
                self.model.filter.page_no(index);
                self._list();
            }
        }
    });
};
ViewModel$8.prototype.formatPrice = function (commodity) {
    return commodity ? commodity.price ? function () {
        var price = '';
        _$5.objectForEach(commodity.price, function (k, v) {
            if (!price) price = v;
        });
        return price || '免费';
    }() : '免费' : '';
};

ko.components.register('x-channel-admin-layout-content-resource-list', {
    viewModel: ViewModel$8,
    template: template$5
});

var tpl$3 = "<div class=\"x-channel-rule\">\r\n    <div data-bind=\"attr:{id: model.modal_id}\" class=\"modal fade\" data-backdrop=\"static\">\r\n        <div class=\"modal-dialog modal-lg\">\r\n            <div class=\"modal-content\">\r\n                <div class=\"modal-header\">\r\n                    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\r\n                        <span aria-hidden=\"true\">×</span>\r\n                    </button>\r\n                    <h4 class=\"modal-title\" data-bind=\"text: model.rule.id() ? '编辑推荐规则' : '新建推荐规则'\">新建推荐规则</h4></div>\r\n                <div class=\"modal-body\" id=\"js_rule_body\"\r\n                     style=\"min-height:400px;max-height: 475px;overflow-y:scroll;overflow-x:hidden;\">\r\n                    <ul class=\"step-bar\">\r\n                        <li data-bind=\"click: switchStep.bind($component, 1), css:{active: model.step() == 1}\">\r\n                            <i>1</i><span>推荐课程</span></li>\r\n                        <li data-bind=\"click: switchStep.bind($component, 2), css:{active: model.step() == 2}\">\r\n                            <i>2</i><span>推荐对象</span></li>\r\n                        <li data-bind=\"click: switchStep.bind($component, 3), css:{active: model.step() == 3}\">\r\n                            <i>3</i><span>推荐时间</span></li>\r\n                        <li data-bind=\"click: switchStep.bind($component, 4), css:{active: model.step() == 4}\">\r\n                            <i>4</i><span>保存及应用</span></li>\r\n                    </ul>\r\n                    <p class=\"bg-danger text-danger\" style=\"margin:0 40px 10px;padding: 10px;border-radius: 5px;\"\r\n                       data-bind=\"visible:model.error.message, html: model.error.message\"></p>\r\n                    <form id=\"ruleForm\" class=\"form-horizontal\" onsubmit=\"return false;\">\r\n                        <!-- 第一步 -->\r\n                        <div data-bind=\"visible: model.step() == 1\">\r\n                            <div class=\"form-group\">\r\n                                <label class=\"control-label col-sm-2\"><em class=\"required\">*</em>推荐方式：</label>\r\n                                <label class=\"radio-inline\"><input name=\"recommend_way\" type=\"radio\" value=\"0\"\r\n                                                                   data-bind=\"checkedValue:0,checked: model.rule.recommend_way\">按条件推荐</label>\r\n                                <label class=\"radio-inline\"><input name=\"recommend_way\" type=\"radio\" value=\"1\"\r\n                                                                   data-bind=\"checkedValue:1,checked: model.rule.recommend_way\">直接推荐课程</label>\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <span class=\"editable col-sm-offset-2\" style=\"margin-top: 0;\"\r\n                                      data-bind=\"text: model.rule.recommend_way()==1?'可直接从课程列表中选择所需的课程':'请选择合适的条件，最多添加10个，系统将匹配符合条件的课程并生成推荐列表'\"></span>\r\n                            </div>\r\n                            <!-- ko ifnot: model.rule.recommend_way -->\r\n                            <div class=\"form-group\">\r\n                                <label class=\"control-label\" style=\"margin-left: 58px;\">符合\r\n                                    <select class=\"select-inline\"\r\n                                            data-bind=\"value: model.rule.condition_relation\">\r\n                                        <option value=\"1\">全部</option>\r\n                                        <option value=\"0\">任何</option>\r\n                                    </select>\r\n                                    以下推荐条件</label>\r\n                            </div>\r\n                            <table class=\"table table-bordered\">\r\n                                <thead>\r\n                                <tr>\r\n                                    <th class=\"text-center\" style=\"width: 10%\">序号</th>\r\n                                    <th class=\"text-center\" style=\"width: 20%\">条件规则</th>\r\n                                    <th class=\"text-center\" style=\"width: 60%\">规则属性</th>\r\n                                    <th class=\"text-center\" style=\"width: 10%\">操作</th>\r\n                                </tr>\r\n                                </thead>\r\n                                <tbody class=\"table-format\"\r\n                                       data-bind=\"foreach: model.rule.rule_items, visible: model.rule.rule_items().length\">\r\n                                <tr class=\"text-center\">\r\n                                    <td class=\"text-center\" data-bind=\"text: $index()+1\">1</td>\r\n                                    <td class=\"text-center\">\r\n                                        <select class=\"form-control select-inline\"\r\n                                                data-bind=\"value: item_key, enable: enable\">\r\n                                            <option value=\"tags_content\">根据课程标签/内容匹配</option>\r\n                                            <option value=\"study_count\">根据课程学习人数</option>\r\n                                            <option value=\"online_time\">根据课程上线时间</option>\r\n                                            <option value=\"course_relation\">根据课程关联性</option>\r\n                                        </select>\r\n                                    </td>\r\n                                    <!--ko if: item_key() == 'tags_content' -->\r\n                                    <td class=\"text-center form-inline\">\r\n                                        <div class=\"form-group\">\r\n                                            <label>包含：</label>\r\n                                            <input type=\"text\" data-bind=\"value: item_value.value\" class=\"form-control\"\r\n                                                   maxlength=\"100\"\r\n                                                   style=\"width:420px;\" placeholder=\"用空格分隔不同的关键词\">\r\n                                        </div>\r\n                                    </td>\r\n                                    <!-- /ko -->\r\n                                    <!-- ko if: item_key() == 'study_count'-->\r\n                                    <td class=\"text-center form-inline\">\r\n                                        <div class=\"form-group\">\r\n                                            <select class=\"form-control select-inline\"\r\n                                                    data-bind=\"value: item_value.condintion\">\r\n                                                <option value=\"0\">&gt;=</option>\r\n                                                <option value=\"1\">&lt;=</option>\r\n                                            </select>\r\n                                            <input type=\"text\" data-bind=\"value: item_value.value\" class=\"form-control\"\r\n                                                   style=\"width:392px;\" maxlength=\"8\" placeholder=\"请输入非负整数\">\r\n                                        </div>\r\n                                    </td>\r\n                                    <!-- /ko -->\r\n                                    <!-- ko if: item_key() == 'online_time'-->\r\n                                    <td class=\"text-center form-inline\">\r\n                                        <div class=\"form-group\">\r\n                                            <select class=\"form-control select-inline\"\r\n                                                    data-bind=\"value: item_value.condintion,event:{change: $component.initDateTimePicker.bind($component)}\">\r\n                                                <option value=\"0\">最近</option>\r\n                                                <option value=\"1\">时间</option>\r\n                                            </select>\r\n                                            <!-- ko if: item_value.condintion() == 0 -->\r\n                                            <input type=\"text\"\r\n                                                   data-bind=\"value: item_value.value\"\r\n                                                   maxlength=\"8\"\r\n                                                   class=\"form-control\"\r\n                                                   style=\"width:369px;\"\r\n                                                   placeholder=\"请输入非负整数\"> 天\r\n                                            <!--/ko-->\r\n                                            <input type=\"text\"\r\n                                                   data-bind=\"visible: item_value.condintion()==1,value: item_value.start_time\"\r\n                                                   class=\"form-control datepicker_js\" style=\"width: 189px\" readonly=\"\"\r\n                                                   placeholder=\"开始时间\">\r\n                                            <input type=\"text\"\r\n                                                   data-bind=\"visible: item_value.condintion()==1,value: item_value.end_time\"\r\n                                                   class=\"form-control datepicker_js\" style=\"width: 189px\" readonly=\"\"\r\n                                                   placeholder=\"结束时间\">\r\n                                        </div>\r\n                                    </td>\r\n                                    <!-- /ko -->\r\n                                    <!-- ko if: item_key() == 'course_relation' -->\r\n                                    <td class=\"text-center form-inline\">\r\n                                        <div class=\"checkbox\" style=\"width: 48%; text-align: left\">\r\n                                            <label>\r\n                                                <input type=\"checkbox\" value=\"1\"\r\n                                                       data-bind=\"checkedValue:1,checked: item_value.group\">\r\n                                                已学课程的课程标签\r\n                                            </label>\r\n                                        </div>\r\n                                        <div class=\"checkbox\" style=\"width: 48%; text-align: left\">\r\n                                            <label>\r\n                                                <input type=\"checkbox\" value=\"2\"\r\n                                                       data-bind=\"checkedValue:2,checked: item_value.group\">\r\n                                                在学课程的课程标签\r\n                                            </label>\r\n                                        </div>\r\n                                    </td>\r\n                                    <!-- /ko -->\r\n                                    <td class=\"text-center\">\r\n                                        <button data-bind=\"click: $component.delRule.bind($component)\"\r\n                                                class=\"btn btn-warning\" type=\"button\">删除\r\n                                        </button>\r\n                                    </td>\r\n                                </tr>\r\n                                </tbody>\r\n                                <tbody class=\"table-format\" data-bind=\"visible: !model.rule.rule_items().length\">\r\n                                <tr>\r\n                                    <td class=\"text-center\" colspan=\"4\" style=\"text-align: center; padding:30px 0\">\r\n                                        暂无规则\r\n                                    </td>\r\n                                </tr>\r\n                                </tbody>\r\n                            </table>\r\n                            <div class=\"form-group\" style=\"text-align: center;\">\r\n                                <button type=\"button\"\r\n                                        data-bind=\"click: addRule, disable: model.rule.rule_items().length==10\"\r\n                                        class=\"btn btn-primary\">\r\n                                    添加条件\r\n                                </button>\r\n                                <span class=\"editable\"\r\n                                      data-bind=\"visible: model.rule.rule_items().length==10\">最多添加10条规则</span>\r\n                            </div>\r\n                            <!-- /ko -->\r\n                            <!-- ko if: model.rule.recommend_way -->\r\n                            <div class=\"form-group\">\r\n                                <label class=\"control-label col-sm-2\"><em class=\"required\">*</em>课程列表：</label>\r\n                                <a data-bind=\"click: openDialog\" href=\"javascript:;\" class=\"btn btn-default\">选择课程</a>\r\n                                <span class=\"editable\">(资源列表可以拖动进行排序)</span>\r\n                            </div>\r\n                            <div data-bind=\"attr:{id: 'dragwrap-'+model.modal_id}\"\r\n                                 style=\"max-height: 230px; overflow-y:scroll; \">\r\n                                <table class=\"table table-bordered table-striped\" style=\"margin-bottom: 0;\">\r\n                                    <thead>\r\n                                    <tr>\r\n                                        <th class=\"text-center\" style=\"width: 25%\">序号</th>\r\n                                        <th class=\"text-center\" style=\"width: 25%\">资源名称</th>\r\n                                        <th class=\"text-center\" style=\"width: 25%\">资源状态</th>\r\n                                        <th class=\"text-center\" style=\"width: 25%\">操作</th>\r\n                                    </tr>\r\n                                    </thead>\r\n                                    <tbody class=\"table-format\"\r\n                                           data-bind=\"attr:{id: 'drag-'+model.modal_id}, foreach: model.course\">\r\n                                    <tr class=\"text-center\" data-bind=\"attr: { 'data-info': JSON.stringify($data) }\">\r\n                                        <td class=\"text-center\" data-bind=\"text: $index()+1\"></td>\r\n                                        <td class=\"text-center\" data-bind=\"text: resource_name\"></td>\r\n                                        <td class=\"text-center\"><span class=\"label\"\r\n                                                                      data-bind=\"text: enabled?'发布':'禁用', css:enabled?'label-success':'label-default'\"></span>\r\n                                        </td>\r\n                                        <td class=\"text-center\">\r\n                                            <a class=\"btn\" href=\"javascript:;\"\r\n                                               data-bind=\"click: $component.delCourse.bind($component)\">删除</a>\r\n                                        </td>\r\n                                    </tr>\r\n                                    </tbody>\r\n                                    <tbody data-bind=\"visible: !model.course().length\">\r\n                                    <tr>\r\n                                        <td class=\"text-center\" colspan=\"5\" style=\"text-align: center; padding:30px 0\">\r\n                                            暂无相关数据\r\n                                        </td>\r\n                                    </tr>\r\n                                    </tbody>\r\n                                </table>\r\n                            </div>\r\n                            <!-- /ko -->\r\n                        </div>\r\n                        <!-- 第二步 -->\r\n                        <div data-bind=\"visible: model.step() == 2\">\r\n                            <div class=\"form-group\">\r\n                                <label class=\"control-label col-sm-2\">可见范围：</label>\r\n                                <label class=\"radio-inline\"\r\n                                       data-bind=\"style:{paddingTop:model.rule.disable_config.type()?'0px':'7px' }\">\r\n                                    <input type=\"radio\" name=\"visible\" value=\"0\"\r\n                                           data-bind=\"checkedValue: 0, checked: model.rule.disable_config.type\"> 公开\r\n                                </label>\r\n                                <label class=\"radio-inline\"\r\n                                       data-bind=\"style:{paddingTop:model.rule.disable_config.type()?'0px':'7px' }\">\r\n                                    <input type=\"radio\" name=\"visible\" value=\"1\"\r\n                                           data-bind=\"checkedValue: 1, checked: model.rule.disable_config.type\"> 组织内部\r\n                                </label>\r\n                                <button type=\"button\" class=\"btn btn-default\"\r\n                                        data-bind=\"visible: model.rule.disable_config.type, click: showOrgTree\">选择组织\r\n                                </button>\r\n                            </div>\r\n                            <div class=\"from-group\" data-bind=\"\">\r\n                                <div class=\"col-sm-offset-2\" data-bind=\"\"></div>\r\n                            </div>\r\n                        </div>\r\n                        <!-- 第3步 -->\r\n                        <div data-bind=\"visible: model.step() == 3\">\r\n                            <div class=\"form-group\">\r\n                                <label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>推荐时间：</label>\r\n                                <!-- ko foreach: model.week -->\r\n                                <label class=\"checkbox-inline\">\r\n                                    <input type=\"checkbox\"\r\n                                           data-bind=\"checkedValue: value, checked: $component.model.rule.week_group\">\r\n                                    <!-- ko text: name --><!--/ko-->\r\n                                </label>\r\n                                <!--/ko-->\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <span class=\"col-sm-offset-2 editable\"\r\n                                      style=\"margin-top: 0;\">默认为全选，即每天推荐；用户加载页面时自动推荐列表；</span>\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <div class=\"form-inline\">\r\n                                    <label class=\"col-sm-2 control-label\">生效日期：</label>\r\n                                    <input type=\"text\" data-bind=\"value: model.rule.begin_time\"\r\n                                           class=\"form-control datepicker_js\" style=\"width: 189px\" readonly\r\n                                           placeholder=\"开始时间\">\r\n                                    <input type=\"text\" data-bind=\"value: model.rule.end_time\"\r\n                                           class=\"form-control datepicker_js\" style=\"width: 189px\" readonly\r\n                                           placeholder=\"结束时间\">\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <span class=\"col-sm-offset-2 editable\"\r\n                                      style=\"margin-top: 0;\">若未设置日期，则以应用状态和停用状态为准；</span>\r\n                            </div>\r\n                        </div>\r\n                        <!-- 第4步 -->\r\n                        <div data-bind=\"visible: model.step() == 4\">\r\n                            <div class=\"form-group\">\r\n                                <label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>规则名称：</label>\r\n                                <div class=\"col-sm-9\">\r\n                                    <input type=\"text\" data-bind=\"value: model.rule.name\" class=\"form-control\"\r\n                                           placeholder=\"最多50个字\"\r\n                                           maxlength=\"50\">\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>备注说明：</label>\r\n                                <div class=\"col-sm-9\">\r\n                                    <textarea data-bind=\"value: model.rule.description\" class=\"form-control\" rows=\"3\"\r\n                                              maxlength=\"100\" placeholder=\"最多100个字\"\r\n                                              style=\"resize: vertical;\"></textarea>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"form-group\">\r\n                                <label class=\"col-sm-2 control-label\"><em class=\"required\">*</em>应用设置：</label>\r\n                                <label class=\"radio-inline\">\r\n                                    <input type=\"radio\" name=\"application\" value=\"0\"\r\n                                           data-bind=\"checkedValue: 0, checked: model.rule.status\"> 暂不应用\r\n                                </label>\r\n                                <label class=\"radio-inline\">\r\n                                    <input type=\"radio\" name=\"application\" value=\"1\"\r\n                                           data-bind=\"checkedValue: 1, checked: model.rule.status\"> 现在应用\r\n                                </label>\r\n                            </div>\r\n                        </div>\r\n                    </form>\r\n                </div>\r\n                <div class=\"modal-footer\">\r\n                    <a data-bind=\"click: switchStep.bind($component,null,'prev'), visible: model.step() != 1\"\r\n                       class=\"btn-primary btn pull-left\">上一步</a>\r\n                    <a data-bind=\"click: switchStep.bind($component,null,'next'), visible: model.step() != 4\"\r\n                       class=\"btn-primary btn\">下一步</a>\r\n                    <!-- ko if: model.step() == 4-->\r\n                    <a class=\"btn-primary btn\" data-bind=\"click: createRule\">保存</a>\r\n                    <a class=\"btn btn-default\" data-dismiss=\"modal\">取消</a>\r\n                    <!--/ko-->\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <!--ko if: model.tree.init -->\r\n    <div data-bind=\"component:{'name': 'x-channel-admin-layout-content-organizeTree', params: {\r\n        'showSelect': true,\r\n        'selectedNodeIds': model.rule.disable_config.nodes,\r\n        'managerData': model.tree.manager,\r\n        'treeData': model.tree.org,\r\n        'org_nodes': model.rule.disable_config.nodes,\r\n        'org_text': model.tree.text}}\">\r\n    </div>\r\n    <!-- /ko -->\r\n</div>\r\n";

function ViewModel$9(params) {
    this.model = {
        modal_id: params.id,
        rule: {
            id: ko.observable(params.rule.id() || 0),
            recommend_way: ko.observable(0),
            condition_relation: ko.observable(1),
            rule_items: ko.observableArray([]),
            rule_course_for_creates: ko.observableArray([]),
            disable_config: {
                "type": ko.observable(1),
                "nodes": ko.observableArray([])
            },
            recommend_time: ko.observable('0000000'),
            week_group: ko.observableArray(['0', '1', '2', '3', '4', '5', '6']),
            begin_time: ko.observable(''),
            end_time: ko.observable(''),
            name: ko.observable(''),
            description: ko.observable(''),
            status: ko.observable(params.rule.status() || 0)
        },
        rule_index: params.rule.index(),
        rule_list: params.rule_list || ko.observableArray([]),
        step: ko.observable(1),
        course: ko.observableArray([]),
        week: [{ value: '0', name: '每周一' }, { value: '1', name: '每周二' }, { value: '2', name: '每周三' }, {
            value: '3',
            name: '每周四'
        }, { value: '4', name: '每周五' }, { value: '5', name: '每周六' }, { value: '6', name: '每周日' }],
        tree: {
            init: ko.observable(false),
            manager: null,
            org: null,
            text: ko.observable('')
        },
        error: {
            message: ko.observable(''),
            isValid: ko.observable(true)
        },
        openDialog: params.openDialog,
        selected_course: params.selected_course || ko.observableArray([])
    };
    this.init();
}

ViewModel$9.prototype.store = {
    get: function get(rule_id) {
        return $.ajax({
            url: window.ruleRecommendUrl + '/v1/recommend_rules/' + rule_id,
            cache: false,
            dataType: 'json'
        });
    },
    create: function create(data) {
        return $.ajax({
            url: window.ruleRecommendUrl + '/v1/recommend_rules',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        });
    },
    update: function update(rule_id, data) {
        return $.ajax({
            url: window.ruleRecommendUrl + '/v1/recommend_rules/' + rule_id,
            type: 'put',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        });
    },
    getMixOrgTree: function getMixOrgTree() {
        return $.ajax({
            url: "/" + projectCode + "/manage_orgs",
            data: { org_id: window.projectOrgId },
            dataType: "json",
            cache: false
        });
    }
};
ViewModel$9.prototype.init = function () {
    this.getRuleInfo(this.model.rule.id());
    this.subscribe();
};
ViewModel$9.prototype.subscribe = function () {
    this.model.selected_course.subscribe(function (nv) {
        this.model.course(nv);
        this.drag();
    }, this);
    this.model.rule.recommend_way.subscribe(function (nv) {
        this.model.error.message('');
        this.model.error.isValid(true);
        if (nv) {
            var t = this;
            ko.tasks.schedule(function () {
                t.drag();
            });
        }
    }, this);
    this.model.step.subscribe(function (nv) {
        if (nv == 3) {
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN'
            });
        }
    }, this);
};
ViewModel$9.prototype.getRuleInfo = function (rule_id) {
    if (!rule_id) return;
    var t = this;
    this.store.get(rule_id).done(function (res) {
        var week_group = res.recommend_time.split(''),
            rule = t.model.rule;
        res.week_group = [];
        $.each(week_group, function (i, v) {
            if (v !== '1') {
                res.week_group.push(i.toString());
            }
        });
        if (res.rule_items && res.rule_items.length) {
            res.rule_items = t.formatRuleItem(res.rule_items);
        }
        if (res.begin_time) res.begin_time = $.format.date(res.begin_time, 'yyyy-MM-dd');
        if (res.end_time) res.end_time = $.format.date(res.end_time, 'yyyy-MM-dd');
        t.model.selected_course(res.rule_relation_object_vos || []);
        t.model.course(res.rule_relation_object_vos || []);
        res.status = rule.status();
        ko.mapping.fromJS(res, {}, rule);
        ko.tasks.schedule(function () {
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN'
            });
        });
    });
};
ViewModel$9.prototype.formatRuleItem = function (ruleItems) {
    $.each(ruleItems, function (i, v) {
        v.enable = false;
        v.item_value = JSON.parse(v.item_value || '{}');
        if (v.item_key == 'online_time') {
            v.item_value.start_time = '';
            v.item_value.end_time = '';
            if (v.item_value.condintion == 1) {
                v.item_value.start_time = v.item_value.value.split(' ')[0];
                v.item_value.end_time = v.item_value.value.split(' ')[1];
            }
        } else if (v.item_key == 'course_relation') {
            v.item_value.group = [];
            if (v.item_value.value == 0) {
                v.item_value.group = [1, 2];
            } else {
                v.item_value.group = [v.item_value.value];
            }
        }
    });
    return ruleItems;
};
ViewModel$9.prototype.addRule = function () {
    var item = ko.mapping.fromJS({
        item_key: '',
        item_value: { "condintion": "", "value": "", start_time: '', end_time: '', group: [] },
        enable: true
    });
    this.model.rule.rule_items.push(item);
};
ViewModel$9.prototype.delRule = function ($data) {
    var t = this;
    $.confirm({
        content: "确定删除吗？",
        title: '系统提示',
        buttons: {
            confirm: {
                text: '确定',
                btnClass: 'btn-primary',
                action: function action() {
                    t.model.rule.rule_items.remove($data);
                }
            },
            cancel: {
                text: '取消',
                action: function action() {}
            }
        }
    });
};
ViewModel$9.prototype.createRule = function () {
    var valid = true;
    for (var i = 1; i < 5; i++) {
        this.validateStep(i);
        if (!this.model.error.isValid()) {
            valid = false;
            this.model.step(i);
            break;
        }
    }
    if (!valid) return;
    var rule = ko.mapping.toJS(this.model.rule);
    if (!rule.recommend_way) {
        rule.rule_course_for_creates = [];
        $.each(rule.rule_items, function (i, v) {
            v.enable = undefined;
            if (v.item_key == 'online_time') {
                if (v.item_value.condintion == '1') {
                    v.item_value.value = v.item_value.start_time + ' ' + v.item_value.end_time;
                }
            } else if (v.item_key == 'course_relation') {
                v.item_value.value = v.item_value.group.length == 2 ? 0 : v.item_value.group[0];
                v.item_value.condintion = undefined;
            }
            v.item_value.end_time = v.item_value.start_time = undefined;
            v.item_value.group = undefined;
            v.item_value = JSON.stringify(v.item_value);
        });
    } else {
        rule.rule_items = [];
        rule.rule_course_for_creates = ko.utils.arrayMap(this.model.course(), function (v) {
            return {
                resource_id: v.resource_id,
                channel_id: v.channel_id
            };
        });
    }

    if (!rule.disable_config.type) rule.disable_config.nodes = [];
    var week = [1, 1, 1, 1, 1, 1, 1];
    $.each(rule.week_group, function (i, v) {
        week[+v] = 0;
    });
    rule.recommend_time = week.join('');
    rule.week_group = undefined;
    var t = this,
        count = 0;

    function postAjax() {
        if (rule.id) {
            t.store.update(rule.id, rule).done(function (res) {
                t.model.rule_list.splice(t.model.rule_index, 1, res);
                $.simplyToast('保存成功！');
                $('#' + t.model.modal_id).modal('hide');
            });
        } else {
            t.store.create(rule).done(function (res) {
                t.model.rule_list.push(res);
                $.simplyToast('保存成功！');
                $('#' + t.model.modal_id).modal('hide');
            });
        }
    }

    if (rule.status) {
        $.each(t.model.rule_list(), function (i, v) {
            if (v.status && v.id !== rule.id) {
                count = 1;
                $.confirm({
                    content: t.htmlEscape("规则 “" + v.name + "” 正在应用中，是否替换？"),
                    title: '操作提示',
                    buttons: {
                        confirm: {
                            text: '替换',
                            btnClass: 'btn-primary',
                            action: function action() {
                                v.status = 0;
                                postAjax();
                            }
                        },
                        cancel: {
                            text: '取消'
                        }
                    }
                });
                return false;
            }
        });
        if (!count) postAjax();
    } else {
        postAjax();
    }
};
ViewModel$9.prototype.delCourse = function ($data) {
    this.model.course.remove($data);
};
ViewModel$9.prototype.switchStep = function (num, type) {
    var step = this.model.step;
    if (num > step() || type === 'next') {
        this.validateStep(step());
    } else {
        this.model.error.message('');
        this.model.error.isValid(true);
    }
    if (!this.model.error.isValid()) return;
    if (type == 'next') {
        if (step() < 4) step(step() + 1);
    } else if (type == 'prev') {
        if (step() > 1) step(step() - 1);
    } else {
        step(num);
    }
};
ViewModel$9.prototype._initMixOrgs = function () {
    this.store.getMixOrgTree().done($.proxy(function (data) {
        this.model.tree.manager = data.manager;
        this.model.tree.org = data.org_tree;
        this.model.tree.init(true);
        ko.tasks.schedule(function () {
            $("#zT-orgTreeModal").modal('show');
        });
    }, this));
};
ViewModel$9.prototype.openDialog = function () {
    this.model.openDialog(this.model.course().concat());
};
ViewModel$9.prototype.showOrgTree = function () {
    if (!this.model.tree.init()) {
        this._initMixOrgs();
    } else {
        $("#zT-orgTreeModal").modal('show');
    }
};
ViewModel$9.prototype.validateStep = function (step) {
    var model = this.model,
        message = model.error.message;
    message('');
    if (step == 1) {
        if (model.rule.recommend_way() == 1) {
            if (!model.course().length) {
                message('请添加推荐课程。');
            }
        } else {
            $.each(model.rule.rule_items(), function (i, v) {
                var value = v.item_value.value ? $.trim(v.item_value.value()) : '',
                    condition = v.item_value.condintion ? v.item_value.condintion() : '',
                    index = i + 1;
                switch (v.item_key()) {
                    case 'tags_content':
                        if (value === '') {
                            message(message() + '第' + index + '条规则不能为空;<br/>');
                        }
                        break;
                    case 'study_count':
                        if (value === '' || !/^\d+$/.test(value)) {
                            message(message() + '第' + index + '条规则不能为空，且应为非负整数;<br/>');
                        }
                        break;
                    case 'online_time':
                        if (condition == '0') {
                            if (value === '' || !/^\d+$/.test(value)) {
                                message(message() + '第' + index + '条规则不能为空，且应为非负整数;<br/>');
                            }
                        } else {
                            var start = v.item_value.start_time() ? new Date(v.item_value.start_time().replace(/-/g, "/")).getTime() : 0,
                                end = v.item_value.end_time() ? new Date(v.item_value.end_time().replace(/-/g, "/")).getTime() : 0;
                            if (!end || !start || end < start) {
                                message(message() + '第' + index + '条规则时间为必填，且结束时间不应小于开始时间;<br/>');
                            }
                        }
                        break;
                    case 'course_relation':
                        if (!v.item_value.group().length) {
                            message(message() + '第' + index + '条规则应至少勾选一个选项;<br/>');
                        }
                        break;
                }
            });
        }
    } else if (step == 2) {
        if (model.rule.disable_config.type() && !model.rule.disable_config.nodes().length) {
            message('请选择组织');
        }
    } else if (step == 3) {
        if (!model.rule.week_group().length) {
            message('推荐时间请至少勾选一项;<br/>');
        }
        var begin_time = this.model.rule.begin_time(),
            end_time = this.model.rule.end_time();
        if (begin_time && end_time) {
            message(message() + (new Date(begin_time.replace(/-/g, "/")).getTime() > new Date(end_time.replace(/-/g, "/")).getTime() ? '结束时间不应小于开始时间' : ''));
        }
    } else if (step == 4) {
        var name = $.trim(model.rule.name()),
            description = $.trim(model.rule.description());
        if (name == '' || name.length > 50) {
            message('规则名称不能为空，且字数不应超过50<br/>');
        }
        if (description == '' || description.length > 100) {
            message(message() + '备注说明不能为空，且字数不应超过100');
        }
    }
    model.error.isValid(!message());
};
ViewModel$9.prototype.drag = function () {
    var that = this,
        dragDom = $("#drag-" + this.model.modal_id);
    dragDom.dragsort("destroy");
    dragDom.dragsort({
        dragSelector: "tr",
        dragBetween: true,
        dragSelectorExclude: "a",
        scrollContainer: "#dragwrap-" + that.model.modal_id,
        dragEnd: function dragEnd() {
            var items = [];
            $.each(dragDom.children('tr'), function (i, v) {
                items.push(JSON.parse($(v).attr('data-info')));
            });
            that.drag();
            that.model.course(items);
        }
    });
};
ViewModel$9.prototype.initDateTimePicker = function ($data) {
    if (!$data.item_value.condintion()) return;
    $('.datepicker_js').datetimepicker({
        autoclose: true,
        clearBtn: true,
        format: 'yyyy-mm-dd',
        minView: 2,
        todayHighlight: 1,
        language: 'zh-CN'
    });
};
ViewModel$9.prototype.htmlEscape = function (text) {
    return text.replace(/[<>"'&]/g, function (match, pos, originalText) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "\"":
            case "\'":
                return "&quot;";
        }
    });
};
ko.components.register('x-channel-admin-layout-content-rule', {
    synchronous: true,
    viewModel: ViewModel$9,
    template: tpl$3
});

var tpl$4 = "<div class=\"modal fade\" id=\"zT-orgTreeModal\" data-backdrop=\"static\">\r\n    <div class=\"modal-dialog\" style=\"min-width: 600px;\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\r\n                <h4 class=\"modal-title\">选择组织</h4>\r\n            </div>\r\n            <div class=\"modal-body\" id=\"zT-orgTreeModalBody\">\r\n                <div data-bind=\"visible: model.hasTree\">\r\n                    <form class=\"well form-inline\" id=\"zT-searchForm\" data-bind=\"event:{submit: orgTreeSearch}\">\r\n                        <div class=\"form-group\">\r\n                            <label>搜索：</label>\r\n                            <input data-bind=\"textInput: model.search.keywords\" autocomplete=\"off\" class=\"form-control\"\r\n                                   name=\"keyword\" placeholder=\"搜索部门关键字\"/>\r\n                            <a href=\"javascript:;\" class=\"btn btn-primary\" data-bind=\"click: orgTreeSearch\">搜索</a>\r\n                            <span style=\"color:red;\" data-bind=\"text: model.search.result\"></span>\r\n                        </div>\r\n                    </form>\r\n                    <div class=\"x-tree-selector-list\" data-bind=\"visible: model.showSelect\">\r\n                        <ul data-bind=\"foreach: model.updateNodes\">\r\n                            <!--ko if: $data.title-->\r\n                            <li data-bind=\"attr:{ title: $data.path }\">\r\n                                <a class=\"x-tree-selector-list-close\" href=\"javascript:;\"\r\n                                   data-bind=\"click: $component.removeNode.bind($component)\">&times;</a>\r\n                                <span data-bind=\"text:$data.title\"></span>\r\n                            </li>\r\n                            <!--/ko-->\r\n                        </ul>\r\n                    </div>\r\n                    <div id=\"orgTreeModelBody\" class=\"container-fluid\" style=\"max-height: 500px;overflow: auto;\">\r\n                        <ul class=\"ztree\" id=\"ch-lo-orgtree\"></ul>\r\n                    </div>\r\n                </div>\r\n                <div data-bind=\"visible: !model.hasTree()\"\r\n                     style=\"text-align: center; height: 100px; vertical-align: middle;line-height: 100px;display: none;\">\r\n                    请在项目中配置项目的UC组织\r\n                </div>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button class=\"btn\" aria-hidden=\"true\" data-dismiss=\"modal\" data-bind=\"click: cancelAllNodes\">\r\n                    清空\r\n                </button>\r\n                <button class=\"btn btn-primary\" data-bind=\"click:saveOrg\">确定</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

function ViewModel$10(params) {
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

ViewModel$10.prototype.store = {
    getParentsByIds: function getParentsByIds(node_ids) {
        return $.ajax({
            url: elearningService + '/v1/mix_organizations/' + window.projectOrgId + '/parents',
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
ViewModel$10.prototype._initOrgTree = function (managerData, treeData) {
    var managerIds = managerData ? $.map(managerData.manager_nodes || [], function (node) {
        return node.node_id;
    }) : [];
    var _this = this,
        orgTreeObj,
        setting = {
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
            chkboxType: { "Y": "", "N": "" },
            chkStyle: "checkbox",
            chkDisabledInherit: false,
            radioType: "all"
        },
        callback: {
            onCheck: function onCheck(event, treeId, treeNode) {
                if (treeNode.checked) {
                    if (~$.inArray(treeNode.node_id, _this.model.selectedNodeIds())) return;
                    _this.pushNode(treeNode, orgTreeObj);
                    _this.model.selectedNodeIds.push(treeNode.node_id);
                } else {
                    _this.removeNode(treeNode, 1);
                }
            },
            onAsyncSuccess: function onAsyncSuccess(event, treeId, treeNode, msg) {
                if (!managerData.has_manage_project) {
                    var children = treeNode.children;
                    $.each(children, function (i, v) {
                        orgTreeObj.setChkDisabled(v, !~$.inArray(v.node_id, managerIds), false, true);
                    });
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
    if (treeData && treeData.length) {
        orgTreeObj = _this.orgTreeObj = $.fn.zTree.init(_this.$orgTree = $("#ch-lo-orgtree"), setting, treeData);
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
ViewModel$10.prototype._initTreeChkDisabled = function (treeData, disabledNodes) {
    disabledNodes = $.map(disabledNodes, function (v) {
        return v.node_id;
    });
    $.each(treeData, function (i, v) {
        if (!~$.inArray(v.node_id, disabledNodes)) v.chkDisabled = true;
    });
    return treeData;
};
ViewModel$10.prototype.saveOrg = function () {
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
ViewModel$10.prototype.removeNode = function ($data, isNative) {
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
    if (value && typeof value !== 'number') model.selectedNodeIds.remove($data.node_id);else model.selectedNodeIds(-1);
};
ViewModel$10.prototype.pushNode = function (treeNode, treeObj) {
    var nodeList = [],
        id = treeNode.node_id;
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
ViewModel$10.prototype.remoteNodePath = function (nodeIds) {
    var that = this,
        ids = nodeIds();
    if (!~ids) return;
    ids = ko.utils.arrayFilter([].concat(ids), function (id) {
        return id != -1 && id;
    });
    if (!ids.length) return;
    window.notShowCover = true;
    this.store.getParentsByIds.call(this, ids).then(function (data) {
        window.notShowCover = false;
        if (data && data.length) {
            that.model.updateNodes($.map(data, function (item) {
                return that.generateNodePath(item);
            }));
        }
    });
};
ViewModel$10.prototype.generateNodePath = function (item) {
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
ViewModel$10.prototype.orgTreeSearch = function () {
    this.changeColor("node_name", this.model.search.keywords());
};
ViewModel$10.prototype.changeColor = function (key, value) {
    var _this = this,
        orgTreeObj = _this.orgTreeObj;
    if (orgTreeObj) {
        value = String(value).toLowerCase();
        var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()),
            matchNode = null;
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
ViewModel$10.prototype.cancelAllNodes = function () {
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
ViewModel$10.prototype._matchValue = function (match, value) {
    return String(match).toLowerCase().indexOf(value) > -1;
};
ViewModel$10.prototype._setBodyScrollTop = function (id) {
    var orgTreem = $('#orgTreeModelBody');
    orgTreem.scrollTop(0);
    orgTreem.scrollTop($('#' + id).position().top - orgTreem.offset().top - this._getSearchFormH()());
};
ViewModel$10.prototype._getSearchFormH = function () {
    var height = null;
    return function () {
        if (!height) {
            height = $('#zT-searchForm').outerHeight(true);
        }
        return height + 10;
    };
};
ko.components.register('x-channel-admin-layout-content-organizeTree', {
    synchronous: true,
    template: tpl$4,
    viewModel: ViewModel$10
});

var tpl$5 = "<div class=\"section-block modal fade\" data-backdrop=\"static\" id=\"sectionLayoutSetting1\">\r\n    <div class=\"modal-dialog\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                    class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">图片轮播</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <div class=\"form-group\">\r\n                    <label class=\"checkbox-inline\"><input type=\"checkbox\"\r\n                                                          data-bind=\"checked:model.setting.display.show_tags\">在轮播图上显示标签</label>\r\n                </div>\r\n                <div class=\"form-group\"><label class=\"control-label\">展示样式：</label>\r\n                    <label class=\"radio-inline\"><input type=\"radio\" name=\"banner_width\" value=\"center\"\r\n                                                       data-bind=\"checked: model.setting.display.banner_width\">居中</label>\r\n                    <label class=\"radio-inline\"><input type=\"radio\" name=\"banner_width\" value=\"full\"\r\n                                                       data-bind=\"checked: model.setting.display.banner_width\">全屏</label>\r\n                </div>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-primary\" data-bind=\"click:save\">保存</button>\r\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">取消</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

var ViewModel$11 = function () {
    function ViewModel(params) {
        classCallCheck(this, ViewModel);

        var s = params.section.setting;
        this.model = {
            setting: {
                "display": {
                    "show_tags": ko.observable(s.display.show_tags), //是否显示标签
                    "banner_width": ko.observable(s.display.banner_width) //center居中，full全屏
                }
            }
        };
        this.params = params.section;
        this.parent = params.parent;
        ViewModel.prototype.store = {
            update: function update(data) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + params.section.id,
                    type: 'put',
                    contentType: 'application/json;charset=uft-8',
                    data: JSON.stringify(data)
                });
            }
        };
    }

    ViewModel.prototype.save = function save() {
        var data = ko.mapping.toJS(this.model.setting);
        this.store.update({ setting: JSON.stringify(data) }).done(function (_ref) {
            var id = _ref.id,
                setting = _ref.setting;

            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({ id: id, setting: setting });
            $('#sectionLayoutSetting1').modal('hide');
        });
    };

    return ViewModel;
}();

ko.components.register('x-channel-admin-layout-manage-banner', {
    viewModel: ViewModel$11,
    template: tpl$5
});

var tpl$6 = "<div class=\"section-block modal fade layout-setting ls-icon\" data-backdrop=\"static\" id=\"sectionLayoutSetting3\">\r\n    <div class=\"modal-dialog\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">图标导航</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <table>\r\n                    <tbody>\r\n                    <tr>\r\n                        <td><label class=\"control-label\">展示样式：</label></td>\r\n                        <td>\r\n                            <div class=\"radio-group\">\r\n                                <div class=\"radio\"><label>\r\n                                    <input type=\"radio\"\r\n                                           name=\"data_type\"\r\n                                           value=\"1\"\r\n                                           data-bind=\"checkedValue:1,checked: model.setting.display.display_type\">\r\n                                    纯图片</label>\r\n                                </div>\r\n                                <div class=\"radio \">\r\n                                    <label>\r\n                                    <input type=\"radio\"\r\n                                           name=\"data_type\"\r\n                                           value=\"2\"\r\n                                           data-bind=\"checkedValue:2,checked: model.setting.display.display_type\">\r\n                                        图片+文字</label>\r\n                                </div>\r\n                                <div class=\"radio \"><label>\r\n                                    <input type=\"radio\"\r\n                                           name=\"data_type\"\r\n                                           value=\"3\"\r\n                                           data-bind=\"checkedValue:3,checked: model.setting.display.display_type\">\r\n                                    纯文字</label>\r\n                                </div>\r\n                            </div>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label class=\"control-label \">显示行数：</label>\r\n                        </td>\r\n                        <td>\r\n                            <div class=\"form-group\"><select\r\n                                class=\"form-control select-inline\"\r\n                                data-bind=\"options: model.row_num, optionsText:'text',optionsValue: 'value',value: model.setting.display.row_num\"></select>\r\n                            </div>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label class=\"control-label \">单行资源数：</label>\r\n                        </td>\r\n                        <td>\r\n                            <div class=\"form-group\">\r\n                                <select\r\n                                class=\"form-control select-inline\"\r\n                                data-bind=\"options: model.column_num, optionsText:'text',optionsValue: 'value',value: model.setting.display.column_num\"></select>\r\n                            </div>\r\n                        </td>\r\n                    </tr>\r\n                    </tbody>\r\n                </table>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-primary\" data-bind=\"click:save\">保存</button>\r\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">取消</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

var ViewModel$12 = function () {
    function ViewModel(params) {
        classCallCheck(this, ViewModel);

        var display = params.section.setting.display;
        var model = {
            setting: {
                "display": {
                    "display_type": display.display_type, //展示方式 1纯图片 2图片+文字 3纯文字
                    "row_num": display.row_num,
                    "column_num": display.column_num
                }
            },
            row_num: [{
                value: 1,
                text: '1行'
            }, {
                value: 2,
                text: '2行'
            }, {
                value: 3,
                text: '3行'
            }, {
                value: 4,
                text: '4行'
            }],
            column_num: [{
                value: 4,
                text: '4'
            }, {
                value: 5,
                text: '5'
            }]
        };
        this.model = ko.mapping.fromJS(model);
        this.params = params.section;
        ViewModel.prototype.store = {
            update: function update(data) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + params.section.id,
                    type: 'put',
                    contentType: 'application/json;charset=uft-8',
                    data: JSON.stringify(data)
                });
            }
        };
    }

    ViewModel.prototype.save = function save() {
        var data = ko.mapping.toJS(this.model.setting);
        this.store.update({ setting: JSON.stringify(data) }).done(function (_ref) {
            var id = _ref.id,
                setting = _ref.setting;

            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({ id: id, setting: setting });
            $('#sectionLayoutSetting3').modal('hide');
        });
    };

    return ViewModel;
}();

ko.components.register('x-channel-admin-layout-manage-icon', {
    viewModel: ViewModel$12,
    template: tpl$6
});

var tpl$7 = "<div class=\"section-block modal fade layout-setting ls-other\" data-backdrop=\"static\" id=\"sectionLayoutSetting4\">\r\n    <div class=\"modal-dialog\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                            class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\" data-bind=\"text:model.modal_title\">资源列表</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <table>\r\n                    <tr>\r\n                        <td width=\"1\">\r\n                            <label>\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_title_show\" />\r\n                                显示板块标题：\r\n                            </label>\r\n                        </td>\r\n                        <td>\r\n                            <input type=\"text\"\r\n                                   class=\"form-control\"\r\n                                   data-bind=\"textInput: model.setting.data.title\"\r\n                                   maxlength=30\r\n                                   placeholder=\"请输入板块标题...\"/>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td colspan=\"2\">\r\n                            <p class=\"remain\"><span data-bind=\"text:model.remain_title\">5</span>/30(可编辑)</p>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td><label>单行数量：</label></td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.column_num, optionsText:'text',optionsValue: 'value',value: model.setting.display.column_num\">\r\n                            </select>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label>\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_tag_show\" />\r\n                                标签显示方式：\r\n                            </label>\r\n                        </td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.tag_show_type, optionsText:'text',optionsValue: 'value',value: model.setting.display.tag_show_type\">\r\n                            </select>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label class=\"checkbox-inline\">\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_sort_enabled\"/>\r\n                                开启排序功能\r\n                            </label>\r\n                        </td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.order_type, optionsText:'text',optionsValue: 'value',value: model.setting.display.order_type\">\r\n                            </select>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label class=\"checkbox-inline\">\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_filter_enabled\"/>\r\n                                开启资源筛选\r\n                            </label>\r\n                        </td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.filter_type, optionsText:'text',optionsValue: 'value',value: model.setting.display.filter_type\"></select>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td>\r\n                            <label class=\"checkbox-inline\">\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_show_price_filter\">是否显示付费筛选\r\n                            </label>\r\n                        </td>\r\n                        <td></td>\r\n                    </tr>\r\n                </table>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-primary\" data-bind=\"click:create\">保存</button>\r\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">取消</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";

var ViewModel$13 = function () {
    function ViewModel(params) {
        classCallCheck(this, ViewModel);

        var model = {
            tag: false,
            tag_id: 'other_tag' + params.section.id,
            tag_name: '请选择标签',
            tip_text: '（该板块展示本频道下资源，或本频道中选定标签下的资源）',
            setting: {
                data: {
                    title: '',
                    group_names: [], //学习单元分组列表 data_type为1时有效
                    tag_id: "" //标签id（为空，表示显示所有资源）
                },
                display: {
                    is_title_show: false,
                    is_tag_show: true, //是否在资源上方显示标签
                    tag_show_type: 1, //标签显示方式 1复选 2单选 3滑动
                    is_sort_enabled: true, //是否开启排序功能
                    order_type: 3, //排序方式 1最新 2最热 3推荐
                    is_filter_enabled: true, //是否开启资源筛选
                    filter_type: 2, //排序方式 0全部 2进行中 1即将开始 3已结束
                    is_show_price_filter: false //是否显示付费筛选
                }
            },
            column_num: [{
                value: 4,
                text: '4'
            }, {
                value: 5,
                text: '5'
            }, {
                value: 6,
                text: '6'
            }],
            tag_show_type: [{
                value: 1,
                text: '标签复选'
            }, {
                value: 2,
                text: '标签单选'
            }, {
                value: 3,
                text: '标签滑动展示'
            }],
            order_type: [{
                value: 3,
                text: '综合'
            }, {
                value: 1,
                text: '最新'
            }, {
                value: 2,
                text: '最热'
            }],
            filter_type: [{
                value: 0,
                text: '全部'
            }, {
                value: 2,
                text: '进行中'
            }, {
                value: 1,
                text: '即将开始'
            }, {
                value: 3,
                text: '已结束'
            }]
        };

        this.model = ko.mapping.fromJS(model);
        this.params = params.section;

        ViewModel.prototype.store = {
            create: function create(data, section_id) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + section_id,
                    type: 'put',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                });
            },
            get: function get$$1(section_id) {
                return $.ajax({
                    url: '/' + projectCode + '/sections/' + section_id + '/windows',
                    cache: false,
                    data: { query_type: 1 },
                    dataType: 'json'
                });
            },
            move: function move(section_data_id, next_section_data_id) {
                return $.ajax({
                    url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
                    type: 'put'
                });
            },
            getUploadUrl: function getUploadUrl() {
                return $.ajax({
                    url: channelUrl + '/v1/users/photo_session',
                    cache: false
                });
            }
        };
        this.init();
    }

    ViewModel.prototype.init = function init() {
        var _this = this;

        ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
        if (!this.model.setting.data.group_names().length) this.model.setting.data.group_names(groupNames);
        if (!this.model.setting.data.title()) this.model.setting.data.title(this.params.type === 4 ? '频道资源' : '全部资源');
        var tag_name = this.params.setting.data.tag_name ? this.params.setting.data.tag_name : this.params.type === 4 ? '频道标签' : '资源池标签';
        this.model.tag_name(tag_name);
        if (this.params.type === 5) this.model.tip_text('（该板块展示资源池中的所有资源，或资源池中选定标签下的资源）');
        this.model.remain_title = ko.pureComputed(function () {
            return 30 - _this.model.setting.data.title().length;
        }, this);
        this.model.modal_title = this.params.type === 4 ? '资源列表' : '全部资源';
    };

    ViewModel.prototype.create = function create(showSuccess) {
        var s = this.model.setting;
        s.data.title($.trim(s.data.title()));
        var data = ko.mapping.toJS(this.model.setting);
        if (data.display.is_title_show && data.data.title === '') {
            $.alert('保存失败，请先输入板块标题。');
            return;
        } else if (!data.display.is_title_show) {
            data.data.title = this.params.type === 4 ? '频道资源' : '全部资源';
        }
        if (data.data.group_names.length === groupNames.length) data.data.group_names = [];
        this.store.create({ setting: JSON.stringify(data) }, this.params.id).pipe(function (_ref) {
            var id = _ref.id,
                setting = _ref.setting;

            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({ id: id, setting: setting });
            $('#sectionLayoutSetting4').modal('hide');
        });
    };

    return ViewModel;
}();

ko.components.register('x-channel-admin-layout-manage-other', {
    viewModel: ViewModel$13,
    template: tpl$7
});

var tpl$8 = "<div class=\"section-block modal fade layout-setting ls-window\" data-backdrop=\"static\" id=\"sectionLayoutSetting2\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span\r\n                    class=\"sr-only\">Close</span></button>\r\n                <h4 class=\"modal-title\">橱窗推荐</h4>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                <table class=\"set-section-title\">\r\n                    <tr>\r\n                        <td width=\"1\">\r\n                            <label>\r\n                                <input type=\"checkbox\" data-bind=\"checked: model.setting.display.is_title_show\">\r\n                                显示板块标题：\r\n                            </label>\r\n                        </td>\r\n                        <td>\r\n                            <input type=\"text\" data-bind=\"textInput: model.setting.data.title\"\r\n                                   class=\"form-control\"\r\n                                   maxlength=30\r\n                                   placeholder=\"请输入板块标题...\"/>\r\n                        </td>\r\n                    </tr>\r\n                    <tr>\r\n                        <td colspan=\"2\">\r\n                            <p class=\"remain\"><span data-bind=\"text:model.title_remain\"></span>/30(可编辑)</p>\r\n                        </td>\r\n                    </tr>\r\n                </table>\r\n                <!--ko if: model.type !== 6 -->\r\n                <div class=\"form-group\">\r\n                    <button class=\"btn btn-primary\"\r\n                            data-bind=\"click:$component.showAdDialog\">编辑橱窗广告位\r\n                    </button>\r\n                </div>\r\n                <!--/ko-->\r\n\r\n                <div class=\"sub-title\">WEB端展示方式：</div>\r\n                <table class=\"web-dis-type\">\r\n                    <tr>\r\n                        <td><label>显示行数：</label></td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.web_row_num,optionsText:'text',\r\n                                    optionsValue:'value',\r\n                                    value: model.setting.display.web.row_num\"></select>\r\n                        </td>\r\n                        <td><label>单行资源数：</label></td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.web_col_num,\r\n                                    optionsText:'text',\r\n                                    optionsValue:'value',\r\n                                    value: model.setting.display.web.column_num\"></select>\r\n                        </td>\r\n                        <!--ko if:model.type === 6-->\r\n                        <td><label>翻页数量：</label></td>\r\n                        <td>\r\n                            <select class=\"form-control select-inline\"\r\n                                    data-bind=\"options: model.web_show_num,optionsText:'text',\r\n                                    optionsValue:'value',\r\n                                    value: model.setting.display.web.show_num\"></select>\r\n                        </td>\r\n                        <!--/ko-->\r\n                    </tr>\r\n                </table>\r\n\r\n                <div class=\"sub-title\">手机端展示方式：</div>\r\n                <div class=\"mb-dis-type\">\r\n                    <div class=\"col slide pull-left\">\r\n                        <table>\r\n                            <tr>\r\n                                <td width=\"1\">\r\n                                    <label>\r\n                                        <input type=\"radio\"\r\n                                               id=\"mbDisplaySlide\"\r\n                                               name=\"display_type\"\r\n                                               value=\"1\"\r\n                                               data-bind=\"checkedValue:1,\r\n                                       checked: model.setting.display.mobile.display_type\">\r\n                                        左右滑动\r\n                                    </label>\r\n                                </td>\r\n                                <td>\r\n                                    <label for=\"mbDisplaySlide\"><img data-bind=\"attr:{src:model.cmp_url+'/images/slides.jpg'}\"/></label>\r\n                                </td>\r\n                            </tr>\r\n                            <tr>\r\n                                <td>显示数量： </td>\r\n                                <td>\r\n                                    <select class=\"form-control select-inline\"\r\n                                            data-bind=\"options:model.m_display_num,\r\n                                        optionsText:'text',\r\n                                        optionsValue:'value',\r\n                                        value: model.setting.display.mobile.display_num\"></select>\r\n                                </td>\r\n                            </tr>\r\n                        </table>\r\n                    </div>\r\n                    <div class=\"col matt pull-right\">\r\n                        <table>\r\n                            <tr>\r\n                                <td width=\"1\">\r\n                                    <label>\r\n                                        <input type=\"radio\"\r\n                                               id=\"mbDisplayMatt\"\r\n                                               name=\"display_type\"\r\n                                               value=\"2\"\r\n                                               data-bind=\"checkedValue:2,\r\n                                              checked: model.setting.display.mobile.display_type\">\r\n                                        田字格\r\n                                    </label>\r\n                                </td>\r\n                                <td>\r\n                                    <label for=\"mbDisplayMatt\"><img data-bind=\"attr:{src:model.cmp_url+'/images/matts.jpg'}\"/></label>\r\n                                </td>\r\n                            </tr>\r\n                            <tr>\r\n                                <td>显示行数：</td>\r\n                                <td>\r\n                                    <select class=\"form-control select-inline\"\r\n                                            data-bind=\"options:model.web_row_num,\r\n                                        optionsText:'text',\r\n                                        optionsValue:'value',\r\n                                        value: model.setting.display.mobile.row_num\"></select>\r\n                                </td>\r\n                            </tr>\r\n                            <tr>\r\n                                <td>单行资源数：</td>\r\n                                <td>\r\n                                    <select class=\"form-control select-inline\"\r\n                                            data-bind=\"options:model.m_col_num,\r\n                                        optionsText:'text',\r\n                                        optionsValue:'value',\r\n                                        value: model.setting.display.mobile.column_num\"></select>\r\n                                </td>\r\n                            </tr>\r\n                        </table>\r\n                    </div>\r\n                </div>\r\n\r\n                <form class=\"form-horizontal\" role=\"form\">\r\n                    <div class=\"form-group\" data-bind=\"visible: model.type == 6\" style=\"display:none;\"><label\r\n                        class=\"control-label \">翻页数量：</label><select\r\n                        class=\"form-control select-inline\"\r\n                        data-bind=\"options: model.web_show_num,optionsText:'text',optionsValue:'value', value: model.setting.display.mobile.show_num\"></select>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-primary\" data-bind=\"click:save\">保存</button>\r\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">取消</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<!--ko if: model.adUploadDialog -->\r\n<div data-bind=\"attr:{id: 'window-modal-'+$component.model.id}\" class=\"modal fade\" data-backdrop=\"static\">\r\n    <div class=\"modal-dialog modal-lg\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span\r\n                    aria-hidden=\"true\">×</span></button>\r\n                <h4 class=\"modal-title\">编辑橱窗广告位</h4>\r\n            </div>\r\n            <div class=\"modal-body\" style=\"max-height: 500px;overflow-y:auto;overflow-x:hidden;\">\r\n                <form class=\"form-horizontal\" onsubmit=\"return false;\">\r\n                    <div class=\"form-group\">\r\n                        <label class=\"col-sm-2 control-label\">广告开关：</label>\r\n                        <div class=\"col-sm-3\">\r\n                            <div class=\"checkbox\">\r\n                                <label>\r\n                                    <input type=\"checkbox\" data-bind=\"checked:model.advertisement.web.ad_enable\">WEB端\r\n                                </label>\r\n                            </div>\r\n                        </div>\r\n                        <div class=\"col-sm-3\">\r\n                            <div class=\"checkbox\">\r\n                                <label>\r\n                                    <input type=\"checkbox\" disabled\r\n                                           data-bind=\"checked:model.advertisement.mobile.ad_enable\">移动端\r\n                                </label>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <!--ko if: model.advertisement.web.ad_enable-->\r\n                    <div class=\"form-group\">\r\n                        <label class=\"col-sm-2 control-label\">WEB URL：</label>\r\n                        <div class=\"col-sm-10\">\r\n                            <input type=\"text\" name=\"webUrl\" class=\"form-control\" maxlength=\"1000\"\r\n                                   data-bind=\"value:model.advertisement.web.ad_url\" placeholder=\"请输入WEB URL\"/>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label class=\"col-sm-2 control-label\">WEB图片：</label>\r\n                        <div class=\"col-sm-10 pic-area\">\r\n                            <p class=\"text-warning\">仅支持JPG、PNG、GIF格式，且大小 2M 以下图片</p>\r\n                            <div data-bind=\"component:{'name': 'x-channel-upload', params:model.uploadParams.web}\">\r\n                                {% include \"../shared/_partialUpload.html\" %}\r\n                            </div>\r\n                            <p class=\"text-warning\">WEB尺寸：<!--ko text: model.sizeHint--><!--/ko-->（广告图片会占据一列）</p>\r\n                        </div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                    <!--ko if: model.advertisement.mobile.ad_enable-->\r\n                    <div class=\"form-group\">\r\n                        <label class=\"col-sm-2 control-label\">APP URL：</label>\r\n                        <div class=\"col-sm-10\">\r\n                            <input type=\"text\" name=\"AppUrl\" class=\"form-control\" maxlength=\"1000\"\r\n                                   data-bind=\"value:model.advertisement.mobile.ad_url\" placeholder=\"请输入APP URL\"/>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label class=\"col-sm-2 control-label\">APP图片：</label>\r\n                        <div class=\"col-sm-10 pic-area\">\r\n                            <p class=\"text-warning\">仅支持JPG、PNG、GIF格式，且大小 2M 以下图片</p>\r\n                            <div data-bind=\"component:{'name': 'x-channel-upload', params: model.uploadParams.mobile}\">\r\n                                {% include \"../shared/_partialUpload.html\" %}\r\n                            </div>\r\n                            <p class=\"text-warning\">手机尺寸：<!--ko text: model.sizeHint--><!--/ko-->（广告图片会占据一列）</p>\r\n                        </div>\r\n                    </div>\r\n                    <!--/ko-->\r\n                </form>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <a class=\"btn-primary btn\" href=\"javascript:;\"\r\n                   data-bind=\"click: $component.saveAd.bind($component)\">保存</a>\r\n                <a class=\"btn btn-default\" data-dismiss=\"modal\">取消</a>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!--/ko-->";

var CARD_SIZE_MAP$1 = { 4: { h: 314, w: 270, mb: 40 }, 5: { h: 256, w: 218, mb: 28 }, 6: { h: 206, w: 180, mb: 24 } };
var _$6 = ko.utils;

var ViewModel$14 = function () {
    function ViewModel(params) {
        classCallCheck(this, ViewModel);

        var s = params.section.setting;
        this.model = {
            type: params.section.type || 2, // 2 橱窗推荐  6 推荐课程
            id: params.section.id || 0,
            modal: {
                tag_name: ko.observable('window_tag' + params.section.id),
                tag: ko.observable(false),
                tab: ko.observable(false),
                tab_name: ko.observable('window_tab' + params.section.id),
                rule_name: ko.observable('window_rule' + params.section.id)
            },
            items: ko.observableArray([]),
            setting: {
                data: {
                    title: ko.observable(s.data.title || ""), //橱窗标题 ,
                    data_type: ko.observable(s.data.data_type || 1), //数据来源类型 1标签 2资源
                    order_type: ko.observable(s.data.order_type || 1), //排序方式 1最新 2最热 3推荐 data_type为1时有效
                    group_names: ko.observableArray(s.data.group_names || []), //学习单元分组列表 data_type为1时有效
                    tag_id: ko.observable(s.data.tag_id || ""), //标签id（为空，表示显示频道或者资源池下的所有资源）
                    tag_name: ko.observable(s.data.tag_name || ''),
                    channel_id: ko.observable(s.data.channel_id || ''), //标签所属的频道id（为空，表示资源池下的标签）
                    resources: ko.observableArray(s.data.resources || []), //"resource_id": "", //资源标识"channel_id": "" //资源来源频道标识
                    rules: ko.observableArray(s.data.rules || [])
                },
                display: {
                    is_title_show: ko.observable(s.display.is_title_show),
                    web: { //web端展示方式
                        row_num: ko.observable(s.display.web.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.web.column_num || 4), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.web.show_num || 3), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.web.ad_enable || false),
                        ad_logo: ko.observable(s.display.web.ad_logo || ""),
                        ad_url: ko.observable(s.display.web.ad_url || "")
                    },
                    mobile: { //移动端展示方式
                        display_type: ko.observable(s.display.mobile.display_type || 1), //展示方式 1左右滑动 2田字格
                        display_num: ko.observable(s.display.mobile.display_num || 5), //显示资源数 display_type为1时有效
                        row_num: ko.observable(s.display.mobile.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.mobile.column_num || 2), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.mobile.show_num || 2), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                        ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                        ad_url: ko.observable(s.display.mobile.ad_url || "")
                    }
                }
            },
            tag_name: ko.observable('请选择标签'),
            web_row_num: [{ value: 1, text: '1行' }, { value: 2, text: '2行' }, { value: 3, text: '3行' }, {
                value: 4,
                text: '4行'
            }], //和手机端展示方式共用
            web_col_num: [{ value: 4, text: '4' }, { value: 5, text: '5' }, { value: 6, text: '6' }],
            web_show_num: [{ value: 1, text: '1' }, { value: 2, text: '2' }, { value: 3, text: '3' }, { value: 4, text: '4' }], //和手机端展示方式共用
            m_display_num: [{ value: 5, text: '5' }, { value: 6, text: '6' }, { value: 7, text: '7' }, { value: 8, text: '8' }],
            m_col_num: [{ value: 1, text: '1' }, { value: 2, text: '2' }],
            selected_tag: {
                tag_id: ko.observable(''),
                title: ko.observable(''),
                channel_id: ko.observable(''),
                group_names: ko.observable(''),
                order_type: ko.observable('')
            },
            selected_course: ko.observableArray([]),
            update_course: ko.observableArray([]),
            enableCount: ko.observable(1),
            rule: {
                id: ko.observable(0),
                index: ko.observable(-1),
                status: ko.observable(0)
            },
            window_data_list: params.section.window_data_list,
            rule_data_list: ko.observableArray(params.section.rule_data_list || []),
            parent: params.parent,
            isShow: ko.observable(false),
            advertisement: {
                web: {
                    ad_enable: ko.observable(s.display.web.ad_enable || false),
                    ad_logo: ko.observable(s.display.web.ad_logo || ""),
                    ad_url: ko.observable(s.display.web.ad_url || "")
                },
                mobile: {
                    ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                    ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                    ad_url: ko.observable(s.display.mobile.ad_url || "")
                }
            },
            adUploadDialog: ko.observable(false)
        };
        this.model.cmp_url = staticUrl + '/auxo/component/js-channel-admin-layout-manage';
        this.model.sizeHint = ko.computed(function () {
            var display = this.model.setting.display;
            var size = CARD_SIZE_MAP$1[display.web.column_num()];
            return size.w + '*' + (size.h * display.web.row_num() + size.mb * (display.web.row_num() - 1));
        }, this);
        ViewModel.prototype.store = {
            create: function create(data, section_id) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + section_id,
                    type: 'put',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                });
            },
            get: function get$$1(section_id) {
                return $.ajax({
                    url: '/' + projectCode + '/sections/' + section_id + '/windows',
                    cache: false,
                    data: { query_type: 1 },
                    dataType: 'json'
                });
            },
            move: function move(section_data_id, next_section_data_id) {
                return $.ajax({
                    url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
                    type: 'put'
                });
            },
            getUploadUrl: function getUploadUrl() {
                return $.ajax({
                    url: channelUrl + '/v1/users/photo_session',
                    cache: false
                });
            }
        };
        this.init();
    }

    ViewModel.prototype.init = function init() {
        var _this = this;

        var setting = this.model.setting,
            model = this.model;
        if (model.type == 2) {
            if (setting.data.data_type() == 2) {
                model.items(model.window_data_list || []);
                model.selected_course(model.window_data_list || []);
            } else {
                setting.data.tag_name() && model.tag_name(setting.data.tag_name());
            }
        } else if (model.type == 6) {
            model.items(ko.mapping.toJS(model.rule_data_list) || []);
        }

        if (!setting.display.is_title_show()) {
            setting.data.title(model.type == 2 ? '橱窗推荐' : '为你推荐');
            setting.display.is_title_show(false);
        }
        model.update_course.subscribe(function () {
            this.model.type == 2 && this.create();
        }, this);
        model.rule_data_list.subscribe(function (nv) {
            this.model.items([]);
            this.model.items(nv);
            this.model.items.valueHasMutated();
            this.create();
        }, this);
        model.enableCount = ko.pureComputed(function () {
            return setting.display.web.column_num() * setting.display.web.row_num();
        }, this);
        model.title_remain = ko.pureComputed(function () {
            return 30 - _this.model.setting.data.title().length;
        }, this);
    };

    ViewModel.prototype.save = function save() {
        this.create();
    };

    // flag:1 返回文字; flag：0 返回bool


    ViewModel.prototype.formatStatus = function formatStatus($data, flag) {
        if ($data.resource_id) {
            var status = $data.enabled;
            if (flag) {
                return status ? '发布' : '禁用';
            } else {
                return status ? 1 : 0;
            }
        }
    };

    ViewModel.prototype.create = function create(items) {
        var that = this,
            s = this.model.setting;
        s.data.title($.trim(s.data.title()));
        if (s.display.is_title_show() && $.trim(s.data.title()) === '') {
            $.alert('保存失败，请先输入板块标题。');
            return;
        }
        if (this.model.type == 2) {
            if (s.data.data_type() === 2) {
                s.data.order_type(3); //排序类型 3：综合 1：最新 2：最热
                s.data.group_names(groupNames);
                s.data.tag_id('');
                s.data.channel_id('');
                this.model.tag_name('请选择标签');
            } else if (s.data.data_type() === 1) {
                s.data.resources([]);
                this.model.items([]);
                if (s.data.group_names().length === groupNames.length) s.data.group_names([]);
                that.model.selected_course([]);
            }
        }
        var setting = ko.mapping.toJS(this.model.setting),
            selected_course = items || ko.mapping.toJS(this.model.selected_course),
            rules = items || ko.mapping.toJS(this.model.rule_data_list);
        if (setting.data.data_type == 2) {
            setting.data.resources = _$6.arrayMap(selected_course, function (item) {
                if (item.resource_id) {
                    return {
                        resource_id: item.resource_id,
                        channel_id: item.channel_id
                    };
                }
            });
        }
        if (this.model.type == 6) {
            setting.data.rules = _$6.arrayMap(rules, function (item) {
                return {
                    rule_id: item.id,
                    status: item.status || 0
                };
            });
        }
        if (!setting.display.is_title_show) setting.data.title = this.model.type == 2 ? '橱窗推荐' : '为你推荐';

        return this.store.create({ setting: JSON.stringify(setting) }, this.model.id).pipe(function (_ref) {
            var id = _ref.id,
                setting = _ref.setting;

            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({ id: id, setting: setting });
            $('#sectionLayoutSetting2').modal('hide');
        });
    };

    ViewModel.prototype.get = function get$$1() {
        var that = this;
        this.store.get(this.model.id).done(function (res) {
            if (that.model.setting.data.data_type() === 2) {
                that.model.items(res || []);
                that.model.selected_course(res || []);
            }
        });
    };

    ViewModel.prototype._openDialog = function _openDialog() {
        var data_type = this.model.setting.data.data_type();
        this.model.modal.tag(false);
        this.model.modal.tab(false);
        if (this.model.type == 6) {
            this.model.modal.tab(true);
            $('#' + this.model.modal.tab_name()).modal('show');
        } else {
            if (data_type == 1) {
                this.model.modal.tag(true);
                $('#' + this.model.modal.tag_name()).modal('show');
            } else if (data_type == 2) {
                this.model.modal.tab(true);
                $('#' + this.model.modal.tab_name()).modal('show');
            }
        }
    };

    ViewModel.prototype.openRuleModal = function openRuleModal(id, index, status) {
        this.model.rule.id(id);
        this.model.rule.index(index);
        this.model.rule.status(status);
        this.model.isShow(false);
        this.model.isShow(true);
        $('#' + this.model.modal.rule_name()).modal('show');
    };

    ViewModel.prototype.updateRule = function updateRule($data) {
        var t = this,
            count = 0;

        function postAjax() {
            $.each(t.model.rule_data_list(), function (i, v) {
                if (v.id === $data.id) {
                    v.status = $data.status ? 0 : 1;
                    return false;
                }
            });
            t.create();
            t.model.items([]);
            t.model.items(ko.mapping.toJS(t.model.rule_data_list));
            $.simplyToast($data.status ? '停用成功！' : '应用成功！');
        }

        if (!$data.status) {
            $.each(this.model.rule_data_list(), function (i, v) {
                if (v.status) {
                    count = 1;
                    $.confirm({
                        content: t.htmlEscape("规则 “" + v.name + "” 正在应用中，是否替换？"),
                        title: '操作提示',
                        buttons: {
                            confirm: {
                                text: '替换',
                                btnClass: 'btn-primary',
                                action: function action() {
                                    v.status = 0;
                                    postAjax();
                                }
                            },
                            cancel: {
                                text: '取消'
                            }
                        }
                    });
                    return false;
                }
            });
            if (!count) postAjax();
        } else {
            postAjax();
        }
    };

    ViewModel.prototype.htmlEscape = function htmlEscape(text) {
        return text.replace(/[<>"'&]/g, function (match, pos, originalText) {
            switch (match) {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "\"":
                case "\'":
                    return "&quot;";
            }
        });
    };

    ViewModel.prototype.showAdDialog = function showAdDialog() {
        var self = this,
            display = this.model.setting.display;
        this.store.getUploadUrl().done($.proxy(function (res) {
            var size = CARD_SIZE_MAP$1[display.web.column_num()],
                ratio = 2;
            this.model.uploadParams = {
                web: {
                    image_width: size.w / ratio,
                    image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                    default_image: display.web.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo() : '',
                    id: this.model.advertisement.web.ad_logo,
                    url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo()),
                    api_url: channelUrl,
                    upload_info: res
                },
                mobile: {
                    image_width: size.w / ratio,
                    image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                    default_image: display.mobile.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo() : '',
                    id: this.model.advertisement.mobile.ad_logo,
                    url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo()),
                    api_url: channelUrl,
                    upload_info: res
                }
            };
            this.model.adUploadDialog(true);
            $('#window-modal-' + this.model.id).modal('show');
            $('#window-modal-' + this.model.id).one('hidden.bs.modal', function () {
                self.model.adUploadDialog(false);
            });
        }, this));
    };

    ViewModel.prototype.saveAd = function saveAd() {
        var web = this.model.setting.display.web,
            mobile = this.model.setting.display.mobile,
            webAd = this.model.advertisement.web,
            mobileAd = this.model.advertisement.mobile;
        web.ad_enable(webAd.ad_enable());
        webAd.ad_logo(webAd.ad_enable() ? webAd.ad_logo() : '');
        webAd.ad_url(webAd.ad_enable() ? webAd.ad_url() : '');
        web.ad_logo(webAd.ad_logo());
        web.ad_url(webAd.ad_url());
        mobile.ad_enable(mobileAd.ad_enable());
        mobileAd.ad_logo(mobileAd.ad_enable() ? mobileAd.ad_logo() : '');
        mobileAd.ad_url(mobileAd.ad_enable() ? mobileAd.ad_url() : '');
        mobile.ad_logo(mobileAd.ad_logo());
        mobile.ad_url(mobileAd.ad_url());
        $('#window-modal-' + this.model.id).modal('hide');
    };

    return ViewModel;
}();

ko.components.register('x-channel-admin-layout-manage-window', {
    viewModel: ViewModel$14,
    template: tpl$8
});

}(ko,$));
