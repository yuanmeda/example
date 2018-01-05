import ko from 'knockout'
import tpl from './template.html'

const EVENT_TYPE = 'GET_CHANGE_STATE';

class ViewModel {
    constructor(params) {
        let s = params.section.setting;
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
            update: (data) => {
                return $.ajax({
                    url: `${channelUrl}/v1/sections/${params.section.id}`,
                    type: 'put',
                    contentType: 'application/json;charset=uft-8',
                    data: JSON.stringify(data)
                });
            }
        };
    }

    save() {
        let data = ko.mapping.toJS(this.model.setting);
        this.store.update({setting: JSON.stringify(data)}).done(({id, setting}) => {
            ko.observable().publishOn('ON_LAYOUT_SET_SUCCESS')({id, setting});
            $(`#sectionLayoutSetting1`).modal('hide');
        })
    }
}

ko.components.register('x-channel-admin-layout-manage-banner', {
    viewModel: ViewModel,
    template: tpl
});