import ko from 'knockout'
import tpl from './template.html'

class ViewModel {
    constructor(params) {
        let display = params.section.setting.display;
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
            $(`#sectionLayoutSetting3`).modal('hide');
        })
    }

}

ko.components.register('x-channel-admin-layout-manage-icon', {
    viewModel: ViewModel,
    template: tpl
});