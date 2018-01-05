import ko from 'knockout';
import $ from 'jquery';
import groupNames from '../common/group_names';
import template from './template.html';

function ViewModel({setting_type, static_host, channel_id, channel_host, project_code, portal_host}) {
    const vm = this;
    const section_type_list = [{
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
    const section_names = (list => {
        const map = {};
        list.forEach(item => {
            map[item.type] = item.section_name;
        });
        return map;
    })(section_type_list);
    const j_create_section_modal = $('#createSectionModal');
    const store = {
        get_channel_section: () => {
            return $.ajax({
                url: `/${project_code}/channels/${channel_id}/sections`,
                data: {query_type: 1},
                cache: false,
                dataType: 'json'
            });
        },
        create_section: (data) => {
            return $.ajax({
                url: `${channel_host}/v1/channels/${channel_id}/sections`,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        remove: (section_id) => {
            return $.ajax({
                url: `${channel_host}/v1/sections/${section_id}`,
                type: 'DELETE'
            });
        },
        move: (id, next_section_id) => {
            return $.ajax({
                url: `${channel_host}/v1/sections/${id}/actions/move?next_section_id=${next_section_id}`,
                type: 'PUT'
            })
        },
        get_change_state: () => {
            return $.ajax({
                url: `${channel_host}/v1/channels/${channel_id}/properties/sectionUpgrade`,
                cache: false,
                dataType: 'json'
            });
        },
        save_layout: () => {
            return $.ajax({
                url: `${channel_host}/v1/channels/${channel_id}/sections/actions/submit`,
                type: 'POST'
            });
        },
        revert_layout: () => {
            return $.ajax({
                url: `${channel_host}/v1/channels/${channel_id}/sections/actions/recover`,
                type: 'POST'
            });
        }
    };
    // add listener
    ko.observable().subscribeTo('GET_CHANGE_STATE', init, vm);
    ko.observable().subscribeTo('ON_LAYOUT_SET_SUCCESS', on_layout_set_success, vm);

    vm.preview_url = `${portal_host}/${project_code}/channel/${channel_id}?query_type=1`;
    vm.setting_type = setting_type;
    vm.static_host = static_host;
    vm.cmp_url = `${static_host}/auxo/component/js-channel-admin-layout-manage`;
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
        get_change_state()
            .pipe(() => {
                return get_channel_section();
            });
    }

    function get_channel_section() {
        return store.get_channel_section().pipe(function (res) {
            const length = res.length;
            res.forEach((section, i) => {
                section._name = section_names[section.type];
                section._is_fixed = section.type === 4 || section.type === 5;
                section._move_down_enable = (() => {
                    const next = res[i + 1];
                    // 没有下一个，不能向下
                    if (!next) {
                        return false;
                    }
                    if (next.type === 4 || next.type === 5) {
                        // 下一个是4、5类型，不能向下
                        return false;
                    }
                    return true;
                })();
                section._move_up_enable = (() => {
                    const prev = res[i - 1];
                    return !!prev;
                })();
            });
            vm.has_bottom_section(false);
            for (let i = 0; i < res.length; i++) {
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
        const type = $data.type;
        let data = {};
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
                    setting: JSON.stringify({"display": {"display_type": 1, "row_num": 2, "column_num": 4}})
                };
                break;
            case 4:
                data = {
                    setting: JSON.stringify({
                        "data": {"title": "频道资源", "group_names": groupNames, "tag_id": ""},
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
                        "data": {"title": "全部资源", "group_names": groupNames, "tag_id": ""},
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
                            "web": {"row_num": 3, "column_num": 4, "show_num": 3},
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
        $('.tooltip').remove();
        store.create_section($.extend({type: type}, data)).pipe(function (res) {
            j_create_section_modal.modal('hide');
            vm.is_change('true');
            vm.get_channel_section()
                .pipe(()=>{
                    scroll_to_bottom();
                });
        });
    }

    function remove_section() {
        const section = this;
        $.confirm({
            title: '系统提示',
            content: "确定删除吗？",
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: function () {
                        store
                            .remove(section.id)
                            .pipe(function () {
                                vm.is_change('true');
                                return vm.get_channel_section()
                            });
                    }
                },
                cancel: {
                    text: '取消',
                    action: $.noop()
                }
            }
        });

    }

    function move(index, section_id, next_idx) {
        const next_section = vm.sections()[index + next_idx];
        const next_section_id = next_section ? next_section.id : '';
        return store.move(section_id, next_section_id)
            .then(() => {
                vm.is_change('true');
                return vm.get_channel_section();
            });
    }

    function get_change_state() {
        return store.get_change_state().pipe(function (res) {
            if (res) vm.is_change(res.property_value || 'false');
        })
    }

    function open_layout_setting() {
        const section = this;
        vm.selected_section(section);
        ko.tasks.schedule(() => {
            $(`#sectionLayoutSetting${Math.min(4, section.type)}`).modal('show');
        });
    }

    function open_content_setting() {
        const section = this;
        vm.selected_section(section);
        ko.tasks.schedule(() => {
            $(`#sectionSetting${Math.min(4, section.type)}`).modal('show');
        });
    }

    function save_layout() {
        store.save_layout()
            .pipe(() => {
                vm.is_change('false');
                return get_channel_section();
            })
            .pipe(() => {
                $.simplyToast('保存成功！');
            });
    }

    function revert_layout() {
        $.confirm({
            title: '系统提示',
            content: "确定还原吗？",
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: () => {
                        store.revert_layout()
                            .pipe(() => {
                                vm.is_change('false');
                                return get_channel_section();
                            })
                            .pipe(()=>{
                                $.simplyToast('还原成功！');
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
        window.location.assign(`/${project_code}/channel`);
    }

    function on_layout_set_success({id, setting}) {
        const sections = vm.sections();
        let section;
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].id === id) {
                section = sections[i];
                break;
            }
        }
        if (!section) {
            return;
        }
        section.setting = JSON.parse(setting);
        get_change_state()
            .pipe(()=>{
                $.simplyToast('保存成功！')
            });
    }

    function scroll_to_bottom() {
        const html = $('html,body');
        const list = $('[data-id="section"]');
        const index = vm.has_bottom_section() ? list.length - 2 : list.length - 1;
        const oft = list.eq(index).offset().top;
        html.stop().animate({
            scrollTop: oft + 'px'
        });
    }
}

ko.components.register('x-channel-admin-layout-manage', {
    viewModel: ViewModel,
    template
});