import ko from 'knockout';
import groupNames from '../../common/group_names';
import tpl from './template.html'

class ViewModel {
    constructor(params) {
        let s = params.section.setting;
        let model = {
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
                    is_sort_enabled: true,   //是否开启排序功能
                    order_type: 3,  //排序方式 1最新 2最热 3推荐
                    is_filter_enabled: true,   //是否开启资源筛选
                    filter_type: 2,  //排序方式 0全部 2进行中 1即将开始 3已结束
                    is_show_price_filter: false //是否显示付费筛选
                }
            },
            column_num: [
                {
                    value: 4,
                    text: '4'
                }, {
                    value: 5,
                    text: '5'
                }, {
                    value: 6,
                    text: '6'
                }
            ],
            tag_show_type: [
                {
                    value: 1,
                    text: '标签复选'
                }, {
                    value: 2,
                    text: '标签单选'
                }, {
                    value: 3,
                    text: '标签滑动展示'
                }
            ],
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
            create: function (data, section_id) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + section_id,
                    type: 'put',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                })
            },
            get: function (section_id) {
                return $.ajax({
                    url: '/' + projectCode + '/sections/' + section_id + '/windows',
                    cache: false,
                    data: {query_type: 1},
                    dataType: 'json'
                })
            },
            move: function (section_data_id, next_section_data_id) {
                return $.ajax({
                    url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
                    type: 'put'
                })
            },
            getUploadUrl: function () {
                return $.ajax({
                    url: channelUrl + '/v1/users/photo_session',
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
        if (!this.model.setting.data.group_names().length) this.model.setting.data.group_names(groupNames);
        if (!this.model.setting.data.title()) this.model.setting.data.title(this.params.type === 4 ? '频道资源' : '全部资源');
        var tag_name = this.params.setting.data.tag_name ? this.params.setting.data.tag_name : (this.params.type === 4 ? '频道标签' : '资源池标签');
        this.model.tag_name(tag_name);
        if (this.params.type === 5) this.model.tip_text('（该板块展示资源池中的所有资源，或资源池中选定标签下的资源）');
        this.model.remain_title = ko.pureComputed(()=>{
            return 30 - this.model.setting.data.title().length;
        }, this);
        this.model.modal_title = this.params.type === 4 ? '资源列表' : '全部资源';
    }

    create(showSuccess) {
        var s = this.model.setting;
        s.data.title($.trim(s.data.title()));
        var data = ko.mapping.toJS(this.model.setting), that = this;
        if (data.display.is_title_show && data.data.title === '') {
            $.alert('保存失败，请先输入板块标题。');
            return;
        } else if (!data.display.is_title_show) {
            data.data.title = this.params.type === 4 ? '频道资源' : '全部资源';
        }
        if (data.data.group_names.length === groupNames.length) data.data.group_names = [];
        this.store.create({setting: JSON.stringify(data)}, this.params.id).pipe(({id, setting}) => {
            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({id, setting});
            $(`#sectionLayoutSetting4`).modal('hide');
        });
    }
}

ko.components.register('x-channel-admin-layout-manage-other', {
    viewModel: ViewModel,
    template: tpl
});